import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameRecord, PlayerStats } from '../types/stats';

export interface StatsStoreState {
  gameRecords: GameRecord[];

  // Actions
  addGameRecord: (record: GameRecord) => void;
  getPlayerStats: (playerId: string) => PlayerStats | null;
  getAllPlayerStats: () => PlayerStats[];
  getModelStats: () => Record<string, { games: number; wins: number; winRate: number }>;
  clearStats: () => void;
}

export const useStatsStore = create<StatsStoreState>()(
  persist(
    (set, get) => ({
      gameRecords: [],

      addGameRecord: (record) => {
        set(state => ({
          gameRecords: [...state.gameRecords, record],
        }));
      },

      getPlayerStats: (playerId) => {
        const records = get().gameRecords;
        const playerRecords = records.flatMap(g =>
          g.players.filter(p => p.playerId === playerId).map(p => ({
            ...p,
            gameWinner: g.winner,
            totalDays: g.totalDays,
          }))
        );

        if (playerRecords.length === 0) return null;

        const wins = playerRecords.filter(r => r.wasOnWinningSide).length;
        const totalGames = playerRecords.length;

        const roleStats: Record<string, { games: number; wins: number; winRate: number }> = {};
        const modelStats: Record<string, { games: number; wins: number; winRate: number }> = {};

        for (const r of playerRecords) {
          // Role stats
          if (!roleStats[r.role]) roleStats[r.role] = { games: 0, wins: 0, winRate: 0 };
          roleStats[r.role].games++;
          if (r.wasOnWinningSide) roleStats[r.role].wins++;
          roleStats[r.role].winRate = (roleStats[r.role].wins / roleStats[r.role].games) * 100;

          // Model stats
          if (!modelStats[r.modelId]) modelStats[r.modelId] = { games: 0, wins: 0, winRate: 0 };
          modelStats[r.modelId].games++;
          if (r.wasOnWinningSide) modelStats[r.modelId].wins++;
          modelStats[r.modelId].winRate = (modelStats[r.modelId].wins / modelStats[r.modelId].games) * 100;
        }

        const survived = playerRecords.filter(r => r.survived).length;
        const avgSurvivalDay = playerRecords.reduce((sum, r) => {
          return sum + (r.eliminatedAt?.dayNumber || r.totalDays);
        }, 0) / totalGames;

        const lastRecord = playerRecords[playerRecords.length - 1];

        return {
          playerId,
          playerName: lastRecord.playerName,
          totalGames,
          wins,
          losses: totalGames - wins,
          winRate: (wins / totalGames) * 100,
          elo: lastRecord.eloAfter,
          peakElo: Math.max(...playerRecords.map(r => r.eloAfter)),
          avgSurvivalDay,
          survivalRate: (survived / totalGames) * 100,
          roleStats,
          modelStats,
          avgVotesReceivedPerGame: playerRecords.reduce((s, r) => s + r.votesReceivedAgainst, 0) / totalGames,
          avgSpeechesPerGame: playerRecords.reduce((s, r) => s + r.totalSpeeches, 0) / totalGames,
        };
      },

      getAllPlayerStats: () => {
        const records = get().gameRecords;
        const playerIds = new Set<string>();
        records.forEach(g => g.players.forEach(p => playerIds.add(p.playerId)));

        const stats: PlayerStats[] = [];
        for (const id of playerIds) {
          const s = get().getPlayerStats(id);
          if (s) stats.push(s);
        }

        return stats.sort((a, b) => b.elo - a.elo);
      },

      getModelStats: () => {
        const records = get().gameRecords;
        const stats: Record<string, { games: number; wins: number; winRate: number }> = {};

        for (const game of records) {
          for (const player of game.players) {
            if (!stats[player.modelId]) {
              stats[player.modelId] = { games: 0, wins: 0, winRate: 0 };
            }
            stats[player.modelId].games++;
            if (player.wasOnWinningSide) stats[player.modelId].wins++;
            stats[player.modelId].winRate =
              (stats[player.modelId].wins / stats[player.modelId].games) * 100;
          }
        }

        return stats;
      },

      clearStats: () => set({ gameRecords: [] }),
    }),
    {
      name: 'mafia-stats',
    }
  )
);
