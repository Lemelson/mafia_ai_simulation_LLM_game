import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  GameState, GamePhase, GameLogEntry, PlayerInGame,
  NightActions, Role,
} from '../types/game';
import { DEFAULT_RULES, ROLE_DISTRIBUTION, ROLE_SIDES } from '../types/game';
import type { Player } from '../types/player';
import { useNamePoolStore } from './namePoolStore';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUniqueNamesFromPool(namePool: string[], count: number): string[] {
  const cleaned = (namePool ?? []).map(n => (n ?? '').trim()).filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const n of cleaned) {
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(n);
  }

  const shuffled = shuffleArray(unique);
  const chosen = shuffled.slice(0, count);

  // Fallback if pool is too small.
  let i = 1;
  while (chosen.length < count) {
    const fallback = `Игрок ${i++}`;
    const key = fallback.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    chosen.push(fallback);
  }

  return chosen;
}

export interface LobbySeat {
  seatId: string;      // unique per game seat/instance
  characterId: string; // reference to library character
}

export interface GameStoreState extends GameState {
  // Lobby
  selectedSeats: LobbySeat[];
  customRoles: { mafia: number; detective: number; doctor: number; civilian: number } | null;

  // Pre-generated replies buffer
  replyBuffer: Map<string, string>;

  // Actions
  // Lobby
  addCharacterToLobby: (characterId: string) => void;
  removeSeatFromLobby: (seatId: string) => void;
  setCustomRoles: (roles: { mafia: number; detective: number; doctor: number; civilian: number } | null) => void;

  // Game flow
  startGame: (libraryPlayers: Player[]) => void;
  setPhase: (phase: GamePhase) => void;
  addLogEntry: (entry: Omit<GameLogEntry, 'id' | 'timestamp'>) => void;
  setCurrentSpeaker: (index: number) => void;
  advanceDiscussionRound: () => void;

  // Night
  setNightActions: (actions: Partial<NightActions>) => void;
  resolveNight: () => { killed: string | null };

  // Voting
  initVoting: () => void;
  addVote: (voterId: string, targetId: string) => void;
  resolveVoting: () => { eliminated: string | null };

  // Player state
  killPlayer: (playerId: string) => void;
  eliminatePlayer: (playerId: string) => void;

  // Win check
  checkWinCondition: () => 'town' | 'mafia' | null;

  // Game controls
  setProcessing: (val: boolean) => void;
  setPaused: (val: boolean) => void;
  setSpeed: (speed: number) => void;
  endGame: (winner: 'town' | 'mafia' | 'stopped') => void;
  stopGame: () => void;
  resetGame: () => void;

  // Buffer
  addToReplyBuffer: (playerId: string, reply: string) => void;
  getFromReplyBuffer: (playerId: string) => string | undefined;
  clearReplyBuffer: () => void;

  // Get helpers
  getAlivePlayers: () => PlayerInGame[];
  getAlivePlayersByRole: (role: Role) => PlayerInGame[];
  getPlayerByName: (name: string) => PlayerInGame | undefined;
  getPlayerById: (id: string) => PlayerInGame | undefined;
  getTodayLog: () => GameLogEntry[];
}

const initialState: Omit<GameState, 'id'> & { selectedSeats: LobbySeat[]; customRoles: null; replyBuffer: Map<string, string> } = {
  status: 'lobby',
  phase: 'lobby',
  dayNumber: 0,
  players: [],
  log: [],
  nightActions: null,
  votingState: null,
  winner: null,
  rules: DEFAULT_RULES,
  startedAt: '',
  finishedAt: null,
  currentSpeakerIndex: 0,
  currentDiscussionRound: 1,
  speakingOrder: [],
  isProcessing: false,
  isPaused: false,
  speed: 1,
  selectedSeats: [],
  customRoles: null,
  replyBuffer: new Map(),
};

export const useGameStore = create<GameStoreState>()((set, get) => ({
  id: uuid(),
  ...initialState,

  // --- Lobby ---
  addCharacterToLobby: (characterId) => {
    set(state => {
      if (state.selectedSeats.length >= 12) return state;
      const seat: LobbySeat = { seatId: uuid(), characterId };
      return { selectedSeats: [...state.selectedSeats, seat] };
    });
  },

  removeSeatFromLobby: (seatId) => {
    set(state => ({
      selectedSeats: state.selectedSeats.filter(s => s.seatId !== seatId),
    }));
  },

  setCustomRoles: (roles) => set({ customRoles: roles }),

  // --- Start Game ---
  startGame: (libraryPlayers) => {
    const state = get();
    const count = state.selectedSeats.length;
    if (count < 6 || count > 12) return;

    // Get role distribution
    const dist = state.customRoles || ROLE_DISTRIBUTION[count] || ROLE_DISTRIBUTION[6];

    // Build roles array
    const roles: Role[] = [
      ...Array(dist.mafia).fill('mafia'),
      ...Array(dist.detective).fill('detective'),
      ...Array(dist.doctor).fill('doctor'),
      ...Array(dist.civilian).fill('civilian'),
    ];

    // Shuffle roles
    const shuffledRoles = shuffleArray(roles);

    // Build players from library, assign roles and seats
    const shuffledSeats = shuffleArray(state.selectedSeats);
    const randomNames = pickUniqueNamesFromPool(useNamePoolStore.getState().names, count);

    const gamePlayers: PlayerInGame[] = shuffledSeats.map((seat, index) => {
      const libPlayer = libraryPlayers.find(p => p.id === seat.characterId)!;
      const role = shuffledRoles[index];
      return {
        playerId: seat.seatId,
        characterId: libPlayer.id,
        characterLabel: libPlayer.name,
        name: randomNames[index],
        avatar: libPlayer.avatar,
        color: libPlayer.color,
        role,
        isAlive: true,
        systemPrompt: libPlayer.systemPrompt,
        modelId: libPlayer.modelId,
        seatIndex: index,
        privateKnowledge: {
          allies: [],
          investigationResults: [],
          healHistory: [],
          selfHealCount: 0,
        },
      };
    });

    // Set mafia allies
    const mafiaNames = gamePlayers.filter(p => p.role === 'mafia').map(p => p.name);
    for (const p of gamePlayers) {
      if (p.role === 'mafia') {
        p.privateKnowledge.allies = mafiaNames.filter(n => n !== p.name);
      }
    }

    // Speaking order for first day
    const speakingOrder = gamePlayers.map(p => p.playerId);

    set({
      id: uuid(),
      status: 'playing',
      phase: 'role_assignment',
      dayNumber: 0,
      players: gamePlayers,
      log: [],
      nightActions: null,
      votingState: null,
      winner: null,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      currentSpeakerIndex: 0,
      currentDiscussionRound: 1,
      speakingOrder,
      isProcessing: false,
      isPaused: false,
      replyBuffer: new Map(),
    });
  },

  // --- Phase management ---
  setPhase: (phase) => set({ phase }),

  addLogEntry: (entry) => {
    const full: GameLogEntry = {
      ...entry,
      id: uuid(),
      timestamp: new Date().toISOString(),
    };
    set(state => ({ log: [...state.log, full] }));
  },

  setCurrentSpeaker: (index) => set({ currentSpeakerIndex: index }),

  advanceDiscussionRound: () => {
    set(state => {
      const nextRound = state.currentDiscussionRound + 1;
      // Rotate speaking order
      const newOrder = [...state.speakingOrder];
      const first = newOrder.shift();
      if (first) newOrder.push(first);
      return {
        currentDiscussionRound: nextRound,
        currentSpeakerIndex: 0,
        speakingOrder: newOrder,
      };
    });
  },

  // --- Night actions ---
  setNightActions: (actions) => {
    set(state => ({
      nightActions: { ...state.nightActions!, ...actions } as NightActions,
    }));
  },

  resolveNight: () => {
    const state = get();
    const na = state.nightActions;
    if (!na) return { killed: null };

    let killed: string | null = null;

    if (na.mafiaTarget) {
      // Check if doctor saved the target
      if (na.doctorTarget === na.mafiaTarget) {
        killed = null; // saved!
      } else {
        killed = na.mafiaTarget;
      }
    }

    set(state => ({
      nightActions: { ...state.nightActions!, killed } as NightActions,
    }));

    return { killed };
  },

  // --- Voting ---
  initVoting: () => {
    set({
      votingState: {
        votes: {},
        voteCounts: {},
        result: null,
        skipCount: 0,
      },
    });
  },

  addVote: (voterId, targetId) => {
    set(state => {
      if (!state.votingState) return state;
      const newVotes = { ...state.votingState.votes, [voterId]: targetId };
      const newCounts: Record<string, number> = {};
      let skipCount = 0;

      for (const target of Object.values(newVotes)) {
        if (target === 'skip') {
          skipCount++;
        } else {
          newCounts[target] = (newCounts[target] || 0) + 1;
        }
      }

      return {
        votingState: {
          ...state.votingState,
          votes: newVotes,
          voteCounts: newCounts,
          skipCount,
        },
      };
    });
  },

  resolveVoting: () => {
    const state = get();
    if (!state.votingState) return { eliminated: null };

    const { voteCounts, skipCount } = state.votingState;
    const entries = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0 || (entries[0] && entries[0][1] <= skipCount)) {
      // Nobody eliminated (skip wins or no votes)
      set(state => ({
        votingState: { ...state.votingState!, result: null },
      }));
      return { eliminated: null };
    }

    // Check for tie
    if (entries.length > 1 && entries[0][1] === entries[1][1]) {
      set(state => ({
        votingState: { ...state.votingState!, result: null },
      }));
      return { eliminated: null };
    }

    const eliminatedId = entries[0][0];
    set(state => ({
      votingState: { ...state.votingState!, result: eliminatedId },
    }));
    return { eliminated: eliminatedId };
  },

  // --- Player state ---
  killPlayer: (playerId) => {
    set(state => ({
      players: state.players.map(p =>
        p.playerId === playerId ? { ...p, isAlive: false } : p
      ),
    }));
  },

  eliminatePlayer: (playerId) => {
    set(state => ({
      players: state.players.map(p =>
        p.playerId === playerId ? { ...p, isAlive: false } : p
      ),
    }));
  },

  // --- Win check ---
  checkWinCondition: () => {
    const state = get();
    const alive = state.players.filter(p => p.isAlive);
    const mafiaCount = alive.filter(p => p.role === 'mafia').length;
    const townCount = alive.filter(p => ROLE_SIDES[p.role] === 'town').length;

    if (mafiaCount === 0) return 'town';
    if (mafiaCount >= townCount) return 'mafia';
    return null;
  },

  // --- Controls ---
  setProcessing: (val) => set({ isProcessing: val }),
  setPaused: (val) => set({ isPaused: val }),
  setSpeed: (speed) => set({ speed }),

  endGame: (winner) => {
    set({
      winner,
      status: 'finished',
      phase: 'game_over',
      finishedAt: new Date().toISOString(),
      isProcessing: false,
    });
  },

  stopGame: () => {
    const entry: GameLogEntry = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      type: 'system',
      phase: 'game_over',
      dayNumber: get().dayNumber,
      content: '⏹ Игра досрочно отменена.',
    };

    set(state => ({
      winner: 'stopped',
      status: 'finished',
      phase: 'game_over',
      finishedAt: new Date().toISOString(),
      isProcessing: false,
      log: [...state.log, entry],
    }));
  },

  resetGame: () => {
    set({
      ...initialState,
      id: uuid(),
    });
  },

  // --- Reply buffer ---
  addToReplyBuffer: (playerId, reply) => {
    set(state => {
      const buf = new Map(state.replyBuffer);
      buf.set(playerId, reply);
      return { replyBuffer: buf };
    });
  },

  getFromReplyBuffer: (playerId) => {
    return get().replyBuffer.get(playerId);
  },

  clearReplyBuffer: () => set({ replyBuffer: new Map() }),

  // --- Helpers ---
  getAlivePlayers: () => get().players.filter(p => p.isAlive),
  getAlivePlayersByRole: (role) => get().players.filter(p => p.isAlive && p.role === role),
  getPlayerByName: (name) => get().players.find(p => p.name.toLowerCase() === name.toLowerCase()),
  getPlayerById: (id) => get().players.find(p => p.playerId === id),
  getTodayLog: () => {
    const state = get();
    return state.log.filter(e => e.dayNumber === state.dayNumber);
  },
}));
