import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_NAME_POOL: string[] = [
  'Алексей', 'Алина', 'Андрей', 'Антон', 'Артур', 'Борис', 'Вадим', 'Валерия',
  'Виктор', 'Виктория', 'Виталий', 'Галина', 'Георгий', 'Даниил', 'Дарья', 'Денис',
  'Дмитрий', 'Евгений', 'Екатерина', 'Елена', 'Иван', 'Игорь', 'Илья', 'Ирина',
  'Кирилл', 'Ксения', 'Леонид', 'Лилия', 'Максим', 'Мария', 'Матвей', 'Михаил',
  'Наталья', 'Никита', 'Нина', 'Ольга', 'Павел', 'Пётр', 'Роман', 'Светлана',
  'Сергей', 'София', 'Станислав', 'Татьяна', 'Тимур', 'Фёдор', 'Юлия', 'Ярослав',
];

function normalizeNames(names: string[]): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of names) {
    const n = (raw ?? '').trim();
    if (!n) continue;
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(n);
  }
  return unique;
}

export interface NamePoolStoreState {
  initialized: boolean;
  names: string[];

  initializeDefaults: () => void;
  resetDefaults: () => void;
  setNames: (names: string[]) => void;
  addName: (name: string) => void;
  updateName: (index: number, name: string) => void;
  deleteName: (index: number) => void;
}

export const useNamePoolStore = create<NamePoolStoreState>()(
  persist(
    (set, get) => ({
      initialized: true,
      names: normalizeNames(DEFAULT_NAME_POOL),

      initializeDefaults: () => {
        const state = get();
        if (state.initialized && state.names.length > 0) return;
        set({ initialized: true, names: normalizeNames(DEFAULT_NAME_POOL) });
      },

      resetDefaults: () => set({ initialized: true, names: normalizeNames(DEFAULT_NAME_POOL) }),

      setNames: (names) => set({ names: normalizeNames(names), initialized: true }),

      addName: (name) => {
        const n = (name ?? '').trim();
        if (!n) return;
        set(state => ({ names: normalizeNames([...state.names, n]), initialized: true }));
      },

      updateName: (index, name) => {
        const n = (name ?? '').trim();
        set(state => {
          const next = [...state.names];
          if (index < 0 || index >= next.length) return state;
          next[index] = n;
          return { names: normalizeNames(next), initialized: true };
        });
      },

      deleteName: (index) => {
        set(state => {
          const next = state.names.filter((_, i) => i !== index);
          return { names: normalizeNames(next), initialized: true };
        });
      },
    }),
    { name: 'mafia-name-pool' }
  )
);
