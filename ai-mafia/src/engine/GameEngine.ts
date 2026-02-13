import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePlayerStore } from '../stores/playerStore';
import { useStatsStore } from '../stores/statsStore';
import { OpenRouterService, getOpenRouterService } from '../services/llm/OpenRouterService';
import { parseJsonResponse, validatePlayerName, extractSpeechText } from '../services/llm/ResponseParser';
import { useLLMStatusStore } from '../stores/llmStatusStore';
import {
  buildSystemPrompt, buildDayDiscussionPrompt, buildVotingPrompt,
  buildMafiaChatPrompt, buildMafiaNightPrompt, buildDetectivePrompt,
  buildDoctorPrompt, buildLastWordsPrompt, buildIntroductionPrompt,
} from '../utils/prompts';
import { delay } from '../utils/timing';
import { ROLE_NAMES, ROLE_SIDES } from '../types/game';
import type { GameLogEntry, NightActions, PlayerInGame } from '../types/game';
import type { GameRecord, PlayerGameRecord } from '../types/stats';
import { calculateElo } from '../types/stats';
import { v4 as uuid } from 'uuid';

type VoteResponse = { vote: string };
type TargetResponse = { target: string };
type InvestigateResponse = { investigate: string };
type ProtectResponse = { protect: string };

class GameEngine {
  private aborted = false;
  private llm: OpenRouterService;

  constructor() {
    this.llm = getOpenRouterService();
  }

  abort() {
    this.aborted = true;
  }

  private get store() {
    return useGameStore.getState();
  }

  private get settings() {
    return useSettingsStore.getState();
  }

  private async waitIfPaused() {
    while (this.store.isPaused && !this.aborted) {
      await delay(200);
    }
  }

  private async speechDelay() {
    const baseDelay = this.settings.speechDelay;
    const speed = this.store.speed;
    await delay(baseDelay / speed);
  }

  private addLog(entry: Omit<GameLogEntry, 'id' | 'timestamp'>) {
    // Prevent late log writes after a user stop or engine abort.
    if (this.aborted) return;
    const s = useGameStore.getState();
    if (s.status !== 'playing' && entry.phase !== 'game_over') return;
    s.addLogEntry(entry);
  }

  private async generateLLMReply(
    player: PlayerInGame,
    userMessage: string,
    format: 'text' | 'json' = 'text',
  ): Promise<string> {
    // Update API key from settings
    this.llm.setApiKey(this.settings.openRouterApiKey);

    if (!this.llm.isAvailable()) {
      // Fallback: generate mock reply
      useLLMStatusStore.getState().markMockMissingKey(player.modelId);
      return this.mockReply(player, format);
    }

    const systemPrompt = buildSystemPrompt(player, this.store.rules);

    try {
      useLLMStatusStore.getState().startLLMCall(player.modelId);
      const reply = await this.llm.generateReply({
        systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        modelId: player.modelId,
        maxTokens: this.settings.maxTokensPerReply,
        temperature: this.settings.temperature,
        responseFormat: format,
      });
      useLLMStatusStore.getState().markLLMSuccess(player.modelId);
      return reply;
    } catch (error) {
      console.error(`LLM error for ${player.name}:`, error);
      useLLMStatusStore.getState().markLLMErrorAndFallback(player.modelId, error);
      return this.mockReply(player, format);
    }
  }

  private mockReply(_player: PlayerInGame, format: 'text' | 'json'): string {
    if (format === 'json') {
      return JSON.stringify({ vote: 'skip' });
    }
    const mockPhrases = [
      `Я внимательно наблюдаю за всеми. Пока рано делать выводы.`,
      `Мне кажется, что кто-то здесь ведёт себя подозрительно...`,
      `Давайте не будем спешить с обвинениями. Нужно больше информации.`,
      `Я доверяю своей интуиции, и она мне подсказывает...`,
      `Интересно, почему некоторые так активно защищаются?`,
    ];
    return mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
  }

  // ==================== MAIN GAME LOOP ====================

  async runGame() {
    this.aborted = false;
    useLLMStatusStore.getState().reset();

    // Phase: Role Assignment
    await this.phaseRoleAssignment();
    if (this.aborted) return;

    // Introduction round
    await this.phaseIntroduction();
    if (this.aborted) return;

    // Main game loop
    while (!this.aborted) {
      // Night
      await this.phaseNight();
      if (this.aborted) return;

      // Day announcement
      await this.phaseDayAnnouncement();
      if (this.aborted) return;

      // Check win after night
      const winAfterNight = this.store.checkWinCondition();
      if (winAfterNight) {
        this.store.endGame(winAfterNight);
        await this.phaseGameOver();
        return;
      }

      // Day discussion
      await this.phaseDayDiscussion();
      if (this.aborted) return;

      // Day voting
      await this.phaseDayVoting();
      if (this.aborted) return;

      // Check win after voting
      const winAfterVote = this.store.checkWinCondition();
      if (winAfterVote) {
        this.store.endGame(winAfterVote);
        await this.phaseGameOver();
        return;
      }
    }
  }

  // ==================== PHASES ====================

  private async phaseRoleAssignment() {
    useGameStore.getState().setPhase('role_assignment');
    useGameStore.getState().setProcessing(true);

    this.addLog({
      type: 'system',
      phase: 'role_assignment',
      dayNumber: 0,
      content: '🎴 Роли распределены! Игра начинается...',
    });

    // Observer-friendly: reveal all roles in the chat log.
    const roleList = this.store.players
      .map(p => `- ${p.name} — ${ROLE_NAMES[p.role]}`)
      .join('\n');

    this.addLog({
      type: 'system',
      phase: 'role_assignment',
      dayNumber: 0,
      content: `🧾 Роли за столом:\n${roleList}`,
    });

    await delay(2000 / this.store.speed);
    useGameStore.getState().setProcessing(false);
  }

  private async phaseIntroduction() {
    useGameStore.getState().setPhase('day_discussion');
    useGameStore.getState().setProcessing(true);

    const dayNum = 1;
    useGameStore.setState({ dayNumber: dayNum });

    this.addLog({
      type: 'system',
      phase: 'day_discussion',
      dayNumber: dayNum,
      content: '☀️ День 1. Город просыпается. Игроки представляются.',
    });

    await this.speechDelay();

    // Each player introduces themselves
    const order = this.store.speakingOrder;

    for (let i = 0; i < order.length; i++) {
      if (this.aborted) return;
      await this.waitIfPaused();

      const player = this.store.getPlayerById(order[i]);
      if (!player || !player.isAlive) continue;

      useGameStore.getState().setCurrentSpeaker(i);

      const prompt = buildIntroductionPrompt(player);
      const reply = await this.generateLLMReply(player, prompt);
      const speech = extractSpeechText(reply);

      this.addLog({
        type: 'speech',
        phase: 'day_discussion',
        dayNumber: dayNum,
        playerId: player.playerId,
        playerName: player.name,
        playerColor: player.color,
        content: speech,
      });

      await this.speechDelay();
    }

    useGameStore.getState().setProcessing(false);
  }

  private async phaseNight() {
    const store = useGameStore.getState();
    const dayNumber = store.dayNumber;

    // Init night
    useGameStore.getState().setPhase('night_mafia');
    useGameStore.getState().setProcessing(true);

    const nightActions: NightActions = {
      mafiaTarget: null,
      mafiaChat: [],
      detectiveTarget: null,
      detectiveResult: null,
      doctorTarget: null,
      killed: null,
    };
    useGameStore.setState({ nightActions });

    this.addLog({
      type: 'phase_change',
      phase: 'night_mafia',
      dayNumber,
      content: `🌙 Наступает ночь ${dayNumber}. Город засыпает...`,
    });

    await delay(2000 / this.store.speed);

    // --- Mafia phase ---
    const mafiaPlayers = this.store.getAlivePlayersByRole('mafia');
    if (mafiaPlayers.length > 0) {
      // Mafia chat (2 rounds if multiple mafia)
      const mafiaChat: GameLogEntry[] = [];

      if (mafiaPlayers.length > 1) {
        for (const mafioso of mafiaPlayers) {
          if (this.aborted) return;
          await this.waitIfPaused();

          const prompt = buildMafiaChatPrompt(mafioso, this.store.getAlivePlayers(), mafiaChat);
          const reply = await this.generateLLMReply(mafioso, prompt);
          const speech = extractSpeechText(reply);

          const entry: GameLogEntry = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            type: 'night_chat',
            phase: 'night_mafia',
            dayNumber,
            playerId: mafioso.playerId,
            playerName: mafioso.name,
            playerColor: mafioso.color,
            content: speech,
            isHidden: true,
          };
          mafiaChat.push(entry);
          useGameStore.getState().addLogEntry({
            ...entry,
            type: 'night_chat',
          });

          await delay(1000 / this.store.speed);
        }
      }

      // Mafia votes for target
      const alivePlayers = this.store.getAlivePlayers();
      const lastMafioso = mafiaPlayers[mafiaPlayers.length - 1];
      const targetPrompt = buildMafiaNightPrompt(lastMafioso, alivePlayers, mafiaChat);
      const targetReply = await this.generateLLMReply(lastMafioso, targetPrompt, 'json');

      const parsed = parseJsonResponse<TargetResponse>(targetReply);
      if (parsed?.target) {
        const validName = validatePlayerName(
          parsed.target,
          alivePlayers.filter(p => p.role !== 'mafia').map(p => p.name)
        );
        if (validName) {
          const targetPlayer = this.store.getPlayerByName(validName);
          if (targetPlayer) {
            useGameStore.getState().setNightActions({ mafiaTarget: targetPlayer.playerId, mafiaChat });
            this.addLog({
              type: 'action',
              phase: 'night_mafia',
              dayNumber,
              content: `🔫 Мафия выбрала жертву: ${targetPlayer.name}`,
              isHidden: true,
              metadata: { actionTarget: targetPlayer.name },
            });
          }
        }
      }
    }

    // --- Detective phase ---
    useGameStore.getState().setPhase('night_detective');
    const detectives = this.store.getAlivePlayersByRole('detective');
    if (detectives.length > 0) {
      const detective = detectives[0];
      const prompt = buildDetectivePrompt(detective, this.store.getAlivePlayers());
      const reply = await this.generateLLMReply(detective, prompt, 'json');

      const parsed = parseJsonResponse<InvestigateResponse>(reply);
      if (parsed?.investigate) {
        const validName = validatePlayerName(
          parsed.investigate,
          this.store.getAlivePlayers().filter(p => p.playerId !== detective.playerId).map(p => p.name)
        );
        if (validName) {
          const target = this.store.getPlayerByName(validName);
          if (target) {
            const result = target.role === 'mafia' ? 'mafia' as const : 'innocent' as const;
            useGameStore.getState().setNightActions({ detectiveTarget: target.playerId, detectiveResult: result });

            // Update detective's private knowledge
            useGameStore.setState(state => ({
              players: state.players.map(p => {
                if (p.playerId === detective.playerId) {
                  return {
                    ...p,
                    privateKnowledge: {
                      ...p.privateKnowledge,
                      investigationResults: [
                        ...(p.privateKnowledge.investigationResults || []),
                        { target: target.name, result, night: dayNumber },
                      ],
                    },
                  };
                }
                return p;
              }),
            }));

            this.addLog({
              type: 'action',
              phase: 'night_detective',
              dayNumber,
              playerId: detective.playerId,
              playerName: detective.name,
              content: `🔍 Комиссар проверил ${target.name}: ${result === 'mafia' ? '🔴 МАФИЯ' : '🟢 Невиновен'}`,
              isHidden: true,
              metadata: { actionTarget: target.name, actionResult: result },
            });
          }
        }
      }
    }

    // --- Doctor phase ---
    useGameStore.getState().setPhase('night_doctor');
    const doctors = this.store.getAlivePlayersByRole('doctor');
    if (doctors.length > 0) {
      const doctor = doctors[0];
      const prompt = buildDoctorPrompt(doctor, this.store.getAlivePlayers());
      const reply = await this.generateLLMReply(doctor, prompt, 'json');

      const parsed = parseJsonResponse<ProtectResponse>(reply);
      if (parsed?.protect) {
        const canHealSelf = (doctor.privateKnowledge.selfHealCount ?? 0) < this.store.rules.doctorSelfHealLimit;
        const validNames = this.store.getAlivePlayers()
          .filter(p => canHealSelf || p.playerId !== doctor.playerId)
          .map(p => p.name);

        const validName = validatePlayerName(parsed.protect, validNames);
        if (validName) {
          const target = this.store.getPlayerByName(validName);
          if (target) {
            useGameStore.getState().setNightActions({ doctorTarget: target.playerId });

            // Update doctor's private knowledge
            useGameStore.setState(state => ({
              players: state.players.map(p => {
                if (p.playerId === doctor.playerId) {
                  return {
                    ...p,
                    privateKnowledge: {
                      ...p.privateKnowledge,
                      healHistory: [...(p.privateKnowledge.healHistory || []), target.name],
                      selfHealCount: target.playerId === doctor.playerId
                        ? (p.privateKnowledge.selfHealCount ?? 0) + 1
                        : p.privateKnowledge.selfHealCount,
                    },
                  };
                }
                return p;
              }),
            }));

            this.addLog({
              type: 'action',
              phase: 'night_doctor',
              dayNumber,
              playerId: doctor.playerId,
              playerName: doctor.name,
              content: `💉 Доктор защитил ${target.name}`,
              isHidden: true,
              metadata: { actionTarget: target.name },
            });
          }
        }
      }
    }

    // Resolve night
    const { killed } = useGameStore.getState().resolveNight();
    // If mafia picked someone but no one died, doctor saved the target.
    const naAfter = useGameStore.getState().nightActions;
    if (naAfter?.mafiaTarget && !killed && naAfter.doctorTarget === naAfter.mafiaTarget) {
      const saved = this.store.getPlayerById(naAfter.mafiaTarget);
      if (saved) {
        this.addLog({
          type: 'action',
          phase: 'night_doctor',
          dayNumber,
          content: `💉 Доктор спас ${saved.name}`,
          isHidden: true,
          metadata: { actionTarget: saved.name },
        });
      }
    }
    if (killed) {
      useGameStore.getState().killPlayer(killed);
    }

    useGameStore.getState().setProcessing(false);
  }

  private async phaseDayAnnouncement() {
    const newDay = this.store.dayNumber + 1;
    useGameStore.setState({ dayNumber: newDay });
    useGameStore.getState().setPhase('day_announcement');
    useGameStore.getState().setProcessing(true);

    const na = this.store.nightActions;
    let announcement: string;

    if (na?.killed) {
      const killedPlayer = this.store.getPlayerById(na.killed);
      if (killedPlayer) {
        const roleName = this.store.rules.revealRoleOnDeath ? ` — ${ROLE_NAMES[killedPlayer.role]}` : '';
        announcement = `☀️ Город просыпается. День ${newDay}. Этой ночью был убит ${killedPlayer.name}${roleName}. 💀`;
      } else {
        announcement = `☀️ Город просыпается. День ${newDay}. Этой ночью никто не пострадал.`;
      }
    } else {
      if (na?.mafiaTarget) {
        announcement = `☀️ Город просыпается. День ${newDay}. Этой ночью никто не пострадал. Доктор спас жизнь!`;
      } else {
        announcement = `☀️ Город просыпается. День ${newDay}. Этой ночью никто не пострадал.`;
      }
    }

    this.addLog({
      type: 'system',
      phase: 'day_announcement',
      dayNumber: newDay,
      content: announcement,
    });

    await this.speechDelay();

    // Rotate speaking order for new day
    const alive = this.store.getAlivePlayers();
    const prevOrder = this.store.speakingOrder.filter(id =>
      alive.some(p => p.playerId === id)
    );
    // Shift by 1 for each new day
    const shifted = [...prevOrder];
    const first = shifted.shift();
    if (first) shifted.push(first);

    useGameStore.setState({
      speakingOrder: shifted,
      currentSpeakerIndex: 0,
      currentDiscussionRound: 1,
    });

    useGameStore.getState().setProcessing(false);
  }

  private async phaseDayDiscussion() {
    useGameStore.getState().setPhase('day_discussion');
    useGameStore.getState().setProcessing(true);

    const rules = this.store.rules;
    const dayNumber = this.store.dayNumber;

    for (let round = 1; round <= rules.discussionRounds; round++) {
      if (this.aborted) return;

      if (round > 1) {
        useGameStore.getState().advanceDiscussionRound();
      }

      this.addLog({
        type: 'system',
        phase: 'day_discussion',
        dayNumber,
        content: `💬 Раунд обсуждения ${round} из ${rules.discussionRounds}`,
      });

      const order = useGameStore.getState().speakingOrder;
      const alive = this.store.getAlivePlayers();

      // Pre-generate replies for next speakers in parallel
      const pregenPromises: Map<string, Promise<string>> = new Map();

      for (let i = 0; i < order.length; i++) {
        if (this.aborted) return;
        await this.waitIfPaused();

        const playerId = order[i];
        const player = this.store.getPlayerById(playerId);
        if (!player || !player.isAlive) continue;

        useGameStore.getState().setCurrentSpeaker(i);

        // Check if we have a pre-generated reply
        let reply: string;
        const pregenPromise = pregenPromises.get(playerId);
        if (pregenPromise) {
          try {
            reply = await pregenPromise;
          } catch {
            reply = this.mockReply(player, 'text');
          }
        } else {
          // Build dead players list
          const deadPlayers = this.store.players
            .filter(p => !p.isAlive)
            .map(p => ({
              name: p.name,
              role: this.store.rules.revealRoleOnDeath ? ROLE_NAMES[p.role] : '???',
              day: this.store.log.find(e => e.type === 'death' && e.playerId === p.playerId)?.dayNumber || 0,
              cause: this.store.log.find(e => e.type === 'death' && e.playerId === p.playerId)?.content || 'неизвестно',
            }));

          const prompt = buildDayDiscussionPrompt(
            player, dayNumber, alive, deadPlayers,
            this.store.getTodayLog(), round,
          );
          reply = await this.generateLLMReply(player, prompt);
        }

        const speech = extractSpeechText(reply, this.settings.maxTokensPerReply * 4);

        this.addLog({
          type: 'speech',
          phase: 'day_discussion',
          dayNumber,
          playerId: player.playerId,
          playerName: player.name,
          playerColor: player.color,
          content: speech,
        });

        // Start pre-generating next player's reply
        const nextIdx = i + 1;
        if (nextIdx < order.length) {
          const nextPlayerId = order[nextIdx];
          const nextPlayer = this.store.getPlayerById(nextPlayerId);
          if (nextPlayer && nextPlayer.isAlive && this.llm.isAvailable()) {
            const deadPlayers = this.store.players
              .filter(p => !p.isAlive)
              .map(p => ({
                name: p.name,
                role: this.store.rules.revealRoleOnDeath ? ROLE_NAMES[p.role] : '???',
                day: 0,
                cause: 'неизвестно',
              }));

            const nextPrompt = buildDayDiscussionPrompt(
              nextPlayer, dayNumber, alive, deadPlayers,
              this.store.getTodayLog(), round,
            );
            pregenPromises.set(nextPlayerId, this.generateLLMReply(nextPlayer, nextPrompt));
          }
        }

        await this.speechDelay();
      }
    }

    useGameStore.getState().setProcessing(false);
  }

  private async phaseDayVoting() {
    useGameStore.getState().setPhase('day_voting');
    useGameStore.getState().setProcessing(true);

    const dayNumber = this.store.dayNumber;
    useGameStore.getState().initVoting();

    this.addLog({
      type: 'system',
      phase: 'day_voting',
      dayNumber,
      content: '🗳️ Голосование! Кого казнить?',
    });

    await delay(1000 / this.store.speed);

    const alive = this.store.getAlivePlayers();

    for (const player of alive) {
      if (this.aborted) return;
      await this.waitIfPaused();

      const prompt = buildVotingPrompt(player, alive, this.store.getTodayLog());
      const reply = await this.generateLLMReply(player, prompt, 'json');

      let votedFor = 'skip';
      const parsed = parseJsonResponse<VoteResponse>(reply);
      if (parsed?.vote && parsed.vote !== 'skip') {
        const validName = validatePlayerName(
          parsed.vote,
          alive.filter(p => p.playerId !== player.playerId).map(p => p.name)
        );
        if (validName) {
          const target = this.store.getPlayerByName(validName);
          if (target) {
            votedFor = target.playerId;
          }
        }
      }

      useGameStore.getState().addVote(player.playerId, votedFor);

      const targetName = votedFor === 'skip' ? 'пропуск' :
        this.store.getPlayerById(votedFor)?.name || 'пропуск';

      this.addLog({
        type: 'vote',
        phase: 'day_voting',
        dayNumber,
        playerId: player.playerId,
        playerName: player.name,
        playerColor: player.color,
        content: `голосует за: ${targetName}`,
        metadata: { voteTarget: targetName },
      });

      await delay(800 / this.store.speed);
    }

    // Resolve
    useGameStore.getState().setPhase('vote_result');
    const { eliminated } = useGameStore.getState().resolveVoting();

    if (eliminated) {
      const player = this.store.getPlayerById(eliminated);
      if (player) {
        const roleName = this.store.rules.revealRoleOnDeath ? ` — ${ROLE_NAMES[player.role]}` : '';

        this.addLog({
          type: 'death',
          phase: 'vote_result',
          dayNumber,
          playerId: player.playerId,
          playerName: player.name,
          playerColor: player.color,
          content: `⚖️ Большинством голосов казнён ${player.name}${roleName}.`,
        });

        // Last words
        if (this.store.rules.allowLastWords) {
          useGameStore.getState().setPhase('last_words');
          const lastWordsPrompt = buildLastWordsPrompt(player.name);
          const lastWords = await this.generateLLMReply(player, lastWordsPrompt);
          const speech = extractSpeechText(lastWords);

          this.addLog({
            type: 'speech',
            phase: 'last_words',
            dayNumber,
            playerId: player.playerId,
            playerName: player.name,
            playerColor: player.color,
            content: `💀 ${speech}`,
          });

          await this.speechDelay();
        }

        useGameStore.getState().eliminatePlayer(eliminated);
      }
    } else {
      this.addLog({
        type: 'system',
        phase: 'vote_result',
        dayNumber,
        content: '🤝 Голосование не определило виновного. Никто не казнён.',
      });
    }

    await delay(2000 / this.store.speed);
    useGameStore.getState().setProcessing(false);
  }

  private async phaseGameOver() {
    const state = this.store;

    const endMessage =
      state.winner === 'stopped'
        ? '⏹ Игра остановлена зрителем.'
        : state.winner === 'town'
          ? '🏆 ГОРОД ПОБЕДИЛ! Все мафиози раскрыты!'
          : '🔫 МАФИЯ ПОБЕДИЛА! Город пал!';

    this.addLog({
      type: 'system',
      phase: 'game_over',
      dayNumber: state.dayNumber,
      content: endMessage,
    });

    // Record stats
    await this.recordGameStats();
  }

  private async recordGameStats() {
    const state = this.store;
    if (!state.winner || state.winner === 'stopped') return;

    const allPlayers = state.players;
    const opponentAvgElo = allPlayers.reduce((sum, p) => {
      const libPlayer = usePlayerStore.getState().getPlayer(p.characterId);
      return sum + (libPlayer?.elo ?? 1000);
    }, 0) / allPlayers.length;

    const playerRecords: PlayerGameRecord[] = allPlayers.map(p => {
      const won = (ROLE_SIDES[p.role] === state.winner);
      const libPlayer = usePlayerStore.getState().getPlayer(p.characterId);
      const currentElo = libPlayer?.elo ?? 1000;

      // Survival bonus: 0 if died first day, 0.2 if survived
      const maxDay = state.dayNumber;
      const eliminatedEntry = state.log.find(
        e => e.type === 'death' && e.playerId === p.playerId
      );
      const eliminatedDay = eliminatedEntry?.dayNumber ?? maxDay;
      const survivalBonus = p.isAlive ? 0.15 : (eliminatedDay / maxDay) * 0.1;

      const { newElo, change } = calculateElo(currentElo, opponentAvgElo, won, survivalBonus);

      // Update player's ELO in library
      usePlayerStore.getState().updateElo(p.characterId, newElo);

      const speeches = state.log.filter(e => e.type === 'speech' && e.playerId === p.playerId).length;
      const votes = state.log.filter(e => e.type === 'vote' && e.playerId === p.playerId).length;
      const votesAgainst = state.log.filter(
        e => e.type === 'vote' && e.metadata?.voteTarget === p.name
      ).length;

      return {
        playerId: p.characterId,
        playerName: p.characterLabel,
        modelId: p.modelId,
        role: p.role,
        survived: p.isAlive,
        eliminatedAt: eliminatedEntry ? {
          phase: eliminatedEntry.phase === 'vote_result' ? 'day_voting' as const : 'night_mafia' as const,
          dayNumber: eliminatedEntry.dayNumber,
        } : null,
        wasOnWinningSide: won,
        totalSpeeches: speeches,
        totalVotesCast: votes,
        votesReceivedAgainst: votesAgainst,
        eloChange: change,
        eloBefore: currentElo,
        eloAfter: newElo,
      };
    });

    const startTime = new Date(state.startedAt).getTime();
    const endTime = state.finishedAt ? new Date(state.finishedAt).getTime() : Date.now();

    const record: GameRecord = {
      id: state.id,
      startedAt: state.startedAt,
      finishedAt: state.finishedAt || new Date().toISOString(),
      durationSeconds: Math.round((endTime - startTime) / 1000),
      totalDays: state.dayNumber,
      totalNights: state.dayNumber,
      winner: state.winner,
      playerCount: allPlayers.length,
      players: playerRecords,
    };

    useStatsStore.getState().addGameRecord(record);
  }
}

// Singleton game engine instance
let currentEngine: GameEngine | null = null;

export function startGameEngine(): GameEngine {
  if (currentEngine) {
    currentEngine.abort();
  }
  currentEngine = new GameEngine();
  currentEngine.runGame();
  return currentEngine;
}

export function stopGameEngine() {
  if (currentEngine) {
    currentEngine.abort();
    currentEngine = null;
  }
}

export function getGameEngine(): GameEngine | null {
  return currentEngine;
}
