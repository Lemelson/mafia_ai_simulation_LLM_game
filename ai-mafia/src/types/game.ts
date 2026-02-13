export type Role = 'civilian' | 'mafia' | 'detective' | 'doctor';
export type Side = 'town' | 'mafia';
export type GamePhase =
  | 'lobby'
  | 'role_assignment'
  | 'night_mafia'
  | 'night_detective'
  | 'night_doctor'
  | 'day_announcement'
  | 'day_discussion'
  | 'day_voting'
  | 'vote_result'
  | 'last_words'
  | 'check_win'
  | 'game_over';

export type GameStatus = 'lobby' | 'playing' | 'finished';

export interface NightActions {
  mafiaTarget: string | null;
  mafiaChat: GameLogEntry[];
  detectiveTarget: string | null;
  detectiveResult: 'mafia' | 'innocent' | null;
  doctorTarget: string | null;
  killed: string | null; // resolved after all actions
}

export interface VotingState {
  votes: Record<string, string>; // voterId -> targetId
  voteCounts: Record<string, number>; // targetId -> count
  result: string | null; // eliminated player ID or null (tie)
  skipCount: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  type: 'system' | 'speech' | 'vote' | 'action' | 'death' | 'night_chat' | 'phase_change';
  phase: GamePhase;
  dayNumber: number;
  playerId?: string;
  playerName?: string;
  playerColor?: string;
  content: string;
  isHidden?: boolean;
  metadata?: {
    voteTarget?: string;
    actionTarget?: string;
    actionResult?: string;
  };
}

export interface PlayerInGame {
  playerId: string;
  characterId: string;
  characterLabel: string; // label from library (character/persona name)
  name: string;
  avatar: string;
  color: string;
  publicColor: string; // randomized color when roles are hidden
  role: Role;
  isAlive: boolean;
  systemPrompt: string;
  modelId: string;
  seatIndex: number;
  privateKnowledge: {
    allies?: string[]; // mafia allies (names)
    investigationResults?: {
      target: string;
      result: 'mafia' | 'innocent';
      night: number;
    }[];
    healHistory?: string[];
    selfHealCount?: number;
  };
}

export interface GameRules {
  rulesText: string;
  maxSpeechesPerDay: number;
  discussionRounds: number;
  allowLastWords: boolean;
  revealRoleOnDeath: boolean;
  firstNightKill: boolean;
  doctorSelfHealLimit: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  phase: GamePhase;
  dayNumber: number;
  players: PlayerInGame[];
  log: GameLogEntry[];
  nightActions: NightActions | null;
  votingState: VotingState | null;
  winner: 'town' | 'mafia' | 'stopped' | null;
  rules: GameRules;
  startedAt: string;
  finishedAt: string | null;
  currentSpeakerIndex: number;
  currentDiscussionRound: number;
  speakingOrder: string[]; // player IDs in order
  isProcessing: boolean;
  isPaused: boolean;
  speed: number; // multiplier: 1 = normal, 2 = fast, 0.5 = slow
}

export const DEFAULT_RULES: GameRules = {
  rulesText: `Ты участвуешь в игре «Мафия». Вот правила:

СУТЬ ИГРЫ:
В городе живут мирные жители и мафия. Мафия пытается убить всех мирных,
мирные пытаются вычислить и казнить всех мафиози.

ФАЗЫ:
- НОЧЬ: мафия выбирает жертву, комиссар проверяет одного игрока, доктор лечит одного игрока.
- ДЕНЬ: все обсуждают, кто может быть мафией, затем голосуют за казнь.

РОЛИ:
- Мирный житель: нет особых способностей, голосует днём.
- Мафия: ночью выбирает жертву. Знает других мафиози.
- Комиссар: ночью проверяет одного игрока (узнаёт, мафия или нет).
- Доктор: ночью защищает одного игрока от убийства.

ПОБЕДА:
- Город побеждает, если все мафиози казнены.
- Мафия побеждает, если мафиози >= мирных.

ВАЖНО:
- Отвечай КРАТКО (2–4 предложения в обсуждении).
- Играй в характере своего персонажа.
- Если ты мафия — скрывай это, обвиняй других, создавай алиби.
- Если ты мирный — анализируй поведение других, ищи противоречия.
- Не раскрывай свою роль напрямую (если только это не стратегический ход).`,
  maxSpeechesPerDay: 1,
  discussionRounds: 2,
  allowLastWords: true,
  revealRoleOnDeath: true,
  firstNightKill: true,
  doctorSelfHealLimit: 1,
};

export const ROLE_DISTRIBUTION: Record<number, { mafia: number; detective: number; doctor: number; civilian: number }> = {
  6: { mafia: 2, detective: 1, doctor: 1, civilian: 2 },
  7: { mafia: 2, detective: 1, doctor: 1, civilian: 3 },
  8: { mafia: 2, detective: 1, doctor: 1, civilian: 4 },
  9: { mafia: 3, detective: 1, doctor: 1, civilian: 4 },
  10: { mafia: 3, detective: 1, doctor: 1, civilian: 5 },
  11: { mafia: 3, detective: 1, doctor: 1, civilian: 6 },
  12: { mafia: 4, detective: 1, doctor: 1, civilian: 6 },
};

export const ROLE_NAMES: Record<Role, string> = {
  civilian: 'Мирный житель',
  mafia: 'Мафия',
  detective: 'Комиссар',
  doctor: 'Доктор',
};

export const ROLE_SIDES: Record<Role, Side> = {
  civilian: 'town',
  mafia: 'mafia',
  detective: 'town',
  doctor: 'town',
};

export const ROLE_EMOJI: Record<Role, string> = {
  civilian: '🏘️',
  mafia: '🔫',
  detective: '🔍',
  doctor: '💉',
};
