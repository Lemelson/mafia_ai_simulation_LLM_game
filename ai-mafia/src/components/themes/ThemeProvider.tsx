/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useGameStore } from '../../stores/gameStore';
import { getThemeById, getActiveColors, type Theme, type ThemeColors } from './themes';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  isNight: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useSettingsStore(s => s.themeId);
  const phase = useGameStore(s => s.phase);

  const isNight = phase.startsWith('night_');

  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  const colors = useMemo(() => getActiveColors(theme, isNight), [theme, isNight]);

  const value = useMemo(() => ({ theme, colors, isNight }), [theme, colors, isNight]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={{
          background: colors.bgPrimary,
          color: colors.textPrimary,
          fontFamily: theme.fontFamily,
          minHeight: '100vh',
          transition: 'background 1s ease, color 0.5s ease',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
