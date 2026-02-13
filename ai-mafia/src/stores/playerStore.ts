import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Player } from '../types/player';
import { DEFAULT_PLAYERS } from '../types/player';

export interface PlayerStoreState {
  players: Player[];
  initialized: boolean;

  // Actions
  initializeDefaults: () => void;
  addPlayer: (player: Omit<Player, 'id' | 'createdAt'>) => Player;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;
  updateElo: (id: string, newElo: number) => void;
}

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => ({
      players: [],
      initialized: false,

      initializeDefaults: () => {
        if (get().initialized) return;
        const defaultPlayers: Player[] = DEFAULT_PLAYERS.map(p => ({
          ...p,
          id: uuid(),
          createdAt: new Date().toISOString(),
        }));
        set({ players: defaultPlayers, initialized: true });
      },

      addPlayer: (playerData) => {
        const player: Player = {
          ...playerData,
          id: uuid(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ players: [...state.players, player] }));
        return player;
      },

      updatePlayer: (id, updates) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePlayer: (id) => {
        set(state => ({
          players: state.players.filter(p => p.id !== id),
        }));
      },

      getPlayer: (id) => {
        return get().players.find(p => p.id === id);
      },

      updateElo: (id, newElo) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === id ? { ...p, elo: newElo } : p
          ),
        }));
      },
    }),
    {
      name: 'mafia-players',
    }
  )
);
