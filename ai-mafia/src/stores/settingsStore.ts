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
  revealRolesByDefault: boolean; // observer UI: show/hide roles and true colors
  rulesText: string; // editable rules passed into system prompt
  systemPromptTemplate: string; // template used to build the LLM system prompt
  freeModelIds: string[]; // optional imported list (e.g., from OpenRouter/Puter docs)
  hiddenModelIds: string[]; // locally hidden models in dropdowns
  ttsProvider: string | null;
  ttsApiKey: string | null;
  ttsEnabled: boolean;

  // Actions
  setApiKey: (key: string) => void;
  setTheme: (id: string) => void;
  setSpeechDelay: (ms: number) => void;
  setTypingSpeed: (speed: number) => void;
  setFreeModelIds: (ids: string[]) => void;
  hideModelIds: (ids: string[]) => void;
  clearHiddenModelIds: () => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openRouterApiKey: '',
      openRouterBaseUrl: 'https://openrouter.ai/api/v1/chat/completions',
      // Use OpenRouter's free router by default to avoid hardcoding a specific :free model
      // that may disappear or have no endpoints.
      defaultModel: 'openrouter/free',
      maxTokensPerReply: 300,
      temperature: 0.9,
      themeId: 'noir',
      speechDelay: 5000, // 5 seconds between speeches
      typingSpeed: 1,
      autoScroll: true,
      // Default off: observer doesn't see hidden night info unless explicitly enabled.
      showNightActions: false,
      revealRolesByDefault: false,
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
      systemPromptTemplate: `{character_prompt}

{rules_text}

Контекст:
- Тебя зовут: {name}
- Твоя роль: {role}

Если ты мафия, то твои союзники: {mafia_allies}
Если ты комиссар, то результаты проверок:
{investigation_results}
Если ты доктор, то история лечений: {heal_history}

Формат ответов:
- В обсуждении отвечай только репликой от первого лица.
- Если тебя просят голосовать или выбрать цель, отвечай строго JSON (как указано в сообщении пользователя), без текста вокруг.`,
      freeModelIds: [],
      hiddenModelIds: [],
      ttsProvider: null,
      ttsApiKey: null,
      ttsEnabled: false,

      setApiKey: (key) => set({ openRouterApiKey: (key ?? '').trim() }),
      setTheme: (id) => set({ themeId: id }),
      setSpeechDelay: (ms) => set({ speechDelay: ms }),
      setTypingSpeed: (speed) => set({ typingSpeed: speed }),
      setFreeModelIds: (ids) => set({ freeModelIds: ids }),
      hideModelIds: (ids) => set(state => ({ hiddenModelIds: Array.from(new Set([...(state.hiddenModelIds ?? []), ...(ids ?? [])])) })),
      clearHiddenModelIds: () => set({ hiddenModelIds: [] }),
      updateSettings: (partial) => set(partial),
    }),
    {
      name: 'mafia-settings',
    }
  )
);
