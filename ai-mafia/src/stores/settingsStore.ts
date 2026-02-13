import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  defaultModel: string;
  maxTokensPerReply: number;
  temperature: number;
  themeId: string;
  speechDelay: number; // ms delay after each speech bubble
  typingSpeed: number; // 1 = normal, 2 = fast, 0.5 = slow
  autoScroll: boolean;
  showNightActions: boolean; // show mafia chat to observer
  ttsProvider: string | null;
  ttsApiKey: string | null;
  ttsEnabled: boolean;

  // Actions
  setApiKey: (key: string) => void;
  setTheme: (id: string) => void;
  setSpeechDelay: (ms: number) => void;
  setTypingSpeed: (speed: number) => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openRouterApiKey: '',
      openRouterBaseUrl: 'https://openrouter.ai/api/v1/chat/completions',
      defaultModel: 'deepseek/deepseek-chat-v3.1:free',
      maxTokensPerReply: 300,
      temperature: 0.9,
      themeId: 'noir',
      speechDelay: 5000, // 5 seconds between speeches
      typingSpeed: 1,
      autoScroll: true,
      showNightActions: true,
      ttsProvider: null,
      ttsApiKey: null,
      ttsEnabled: false,

      setApiKey: (key) => set({ openRouterApiKey: key }),
      setTheme: (id) => set({ themeId: id }),
      setSpeechDelay: (ms) => set({ speechDelay: ms }),
      setTypingSpeed: (speed) => set({ typingSpeed: speed }),
      updateSettings: (partial) => set(partial),
    }),
    {
      name: 'mafia-settings',
    }
  )
);
