// Storage Service - uses Zustand persist (localStorage) for v1
// This file serves as the abstraction layer for future migration to IndexedDB or Supabase

export interface StorageService {
  // Players
  getPlayers(): Promise<unknown[]>;
  savePlayer(player: unknown): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  // Games
  getGames(): Promise<unknown[]>;
  saveGame(game: unknown): Promise<void>;

  // Settings
  getSettings(): Promise<unknown>;
  saveSettings(settings: unknown): Promise<void>;
}

// For v1, all storage is handled by Zustand's persist middleware
// which uses localStorage automatically.
// This file is a placeholder for v2 migration to IndexedDB/Supabase.

export class LocalStorageService implements StorageService {
  async getPlayers() {
    const data = localStorage.getItem('mafia-players');
    return data ? JSON.parse(data)?.state?.players || [] : [];
  }

  async savePlayer() {
    // Handled by Zustand persist
  }

  async deletePlayer() {
    // Handled by Zustand persist
  }

  async getGames() {
    const data = localStorage.getItem('mafia-stats');
    return data ? JSON.parse(data)?.state?.gameRecords || [] : [];
  }

  async saveGame() {
    // Handled by Zustand persist
  }

  async getSettings() {
    const data = localStorage.getItem('mafia-settings');
    return data ? JSON.parse(data)?.state || {} : {};
  }

  async saveSettings() {
    // Handled by Zustand persist
  }
}
