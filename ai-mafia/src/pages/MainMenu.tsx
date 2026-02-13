import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../components/themes/ThemeProvider';
import { Button } from '../components/ui/Button';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { THEMES } from '../components/themes/themes';

export function MainMenu() {
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const initializeDefaults = usePlayerStore(s => s.initializeDefaults);
  const themeId = useSettingsStore(s => s.themeId);
  const setTheme = useSettingsStore(s => s.setTheme);
  const players = usePlayerStore(s => s.players);

  React.useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <motion.div
          style={{ fontSize: '64px', marginBottom: '12px' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🎭
        </motion.div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          color: colors.textPrimary,
          margin: 0,
          letterSpacing: '2px',
          textShadow: `0 0 40px ${colors.glow}`,
        }}>
          AI MAFIA
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          marginTop: '8px',
        }}>
          Симулятор мафии с искусственным интеллектом
        </p>
      </motion.div>

      {/* Menu buttons */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <Button
          size="lg"
          onClick={() => navigate('/lobby')}
          style={{ width: '100%', fontSize: '18px' }}
        >
          🎮 Новая игра
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/players')}
          style={{ width: '100%' }}
        >
          🎭 Библиотека характеров ({players.length})
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/statistics')}
          style={{ width: '100%' }}
        >
          📊 Статистика
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/settings')}
          style={{ width: '100%' }}
        >
          ⚙️ Настройки
        </Button>
      </motion.div>

      {/* Theme switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '13px', color: colors.textMuted }}>Тема оформления</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {THEMES.map(t => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: theme.borderRadius,
                border: t.id === themeId
                  ? `2px solid ${colors.accent}`
                  : `1px solid ${colors.border}`,
                background: t.id === themeId ? `${colors.accent}22` : colors.bgCard,
                color: colors.textPrimary,
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{
        marginTop: '40px',
        fontSize: '12px',
        color: colors.textMuted,
        textAlign: 'center',
      }}>
        AI Mafia v1.0 — Powered by OpenRouter
      </div>
    </div>
  );
}
