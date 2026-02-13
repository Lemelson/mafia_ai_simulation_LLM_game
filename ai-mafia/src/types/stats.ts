import type { Role } from './game';

export interface GameRecord {
  id: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  totalDays: number;
  totalNights: number;
  winner: 'town' | 'mafia';
  playerCount: number;
  players: PlayerGameRecord[];
}

export interface PlayerGameRecord {
  playerId: string;
  playerName: string;
  modelId: string;
  role: Role;
  survived: boolean;
  eliminatedAt: {
    phase: 'day_voting' | 'night_mafia';
    dayNumber: number;
  } | null;
  wasOnWinningSide: boolean;
  totalSpeeches: number;
  totalVotesCast: number;
  votesReceivedAgainst: number;
  correctInvestigations?: number;
  totalInvestigations?: number;
  successfulHeals?: number;
  totalHeals?: number;
  mafiaKills?: number;
  eloChange: number;
  eloBefore: number;
  eloAfter: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  elo: number;
  peakElo: number;
  avgSurvivalDay: number;
  survivalRate: number;
  roleStats: Record<string, {
    games: number;
    wins: number;
    winRate: number;
  }>;
  modelStats: Record<string, {
    games: number;
    wins: number;
    winRate: number;
  }>;
  avgVotesReceivedPerGame: number;
  avgSpeechesPerGame: number;
}

// ELO calculation constants
export const ELO_K_FACTOR = 32;
export const ELO_DEFAULT = 1000;

/**
 * Calculate new ELO rating after a game.
 * @param currentElo - Player's current ELO
 * @param opponentAvgElo - Average ELO of opponents
 * @param won - Whether the player won
 * @param survivalBonus - Extra 0-0.2 bonus for surviving longer (0 = died first, 0.2 = survived)
 */
export function calculateElo(
  currentElo: number,
  opponentAvgElo: number,
  won: boolean,
  survivalBonus: number = 0,
): { newElo: number; change: number } {
  const expected = 1 / (1 + Math.pow(10, (opponentAvgElo - currentElo) / 400));
  const actual = won ? 1 : 0;
  const change = Math.round(ELO_K_FACTOR * (actual - expected + survivalBonus));
  const newElo = Math.max(100, currentElo + change); // floor at 100
  return { newElo, change };
}
