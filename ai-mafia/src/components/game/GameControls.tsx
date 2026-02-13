import type React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../themes/ThemeProvider';
import { Button } from '../ui/Button';
import { stopGameEngine } from '../../engine/GameEngine';
import { LLMStatusBadge } from './LLMStatusBadge';

export function GameControls() {
  const { colors, theme } = useTheme();
  const isPaused = useGameStore(s => s.isPaused);
  const speed = useGameStore(s => s.speed);
  const status = useGameStore(s => s.status);
  const revealRoles = useGameStore(s => s.revealRoles);
  const setPaused = useGameStore(s => s.setPaused);
  const setSpeed = useGameStore(s => s.setSpeed);
  const setRevealRoles = useGameStore(s => s.setRevealRoles);
  const speechDelay = useSettingsStore(s => s.speechDelay);
  const setSpeechDelay = useSettingsStore(s => s.setSpeechDelay);
  const typingSpeed = useSettingsStore(s => s.typingSpeed);
  const setTypingSpeed = useSettingsStore(s => s.setTypingSpeed);
  const showNightActions = useSettingsStore(s => s.showNightActions);
  const updateSettings = useSettingsStore(s => s.updateSettings);

  if (status !== 'playing') return null;

  const rangeStyle: React.CSSProperties = {
    accentColor: colors.accent,
    ['--range-accent' as never]: colors.accent,
    ['--range-track' as never]: colors.border,
    ['--range-thumb-border' as never]: colors.bgSecondary,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: colors.bgSecondary,
        borderRadius: theme.borderRadius,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Pause / Play */}
      <Button
        variant={isPaused ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setPaused(!isPaused)}
      >
        {isPaused ? '▶️ Продолжить' : '⏸️ Пауза'}
      </Button>

      {/* Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '12px', color: colors.textMuted }}>Скорость:</span>
        {[0.5, 1, 2, 3].map(s => (
          <Button
            key={s}
            variant={speed === s ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSpeed(s)}
            style={{ minWidth: '36px', padding: '4px 8px', fontSize: '12px' }}
          >
            {s}x
          </Button>
        ))}
      </div>

      {/* Delay slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '12px', color: colors.textMuted }}>Задержка:</span>
        <input
          type="range"
          min={0}
          max={20000}
          step={250}
          value={speechDelay}
          onChange={(e) => setSpeechDelay(Number(e.target.value))}
          style={{ width: '90px', ...rangeStyle }}
        />
        <span style={{ fontSize: '11px', color: colors.textMuted }}>
          {speechDelay === 0 ? 'RT' : `${(speechDelay / 1000).toFixed(1)}с`}
        </span>
      </div>

      {/* Typing speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '12px', color: colors.textMuted }}>Печать:</span>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={typingSpeed}
          onChange={(e) => setTypingSpeed(Number(e.target.value))}
          style={{ width: '90px', ...rangeStyle }}
        />
        <span style={{ fontSize: '11px', color: colors.textMuted }}>
          {typingSpeed}x
        </span>
      </div>

      {/* Show night actions toggle */}
      <Button
        variant={showNightActions ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => updateSettings({ showNightActions: !showNightActions })}
      >
        {showNightActions ? '🌙 Ночь: видна' : '🌙 Ночь: скрыта'}
      </Button>

      {/* Reveal roles toggle */}
      <Button
        variant={revealRoles ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setRevealRoles(!revealRoles)}
      >
        {revealRoles ? '🎴 Роли: видны' : '🎴 Роли: скрыты'}
      </Button>

      <LLMStatusBadge />

      {/* Stop game */}
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          stopGameEngine();
          // Don't invent a winner: this is a user stop.
          useGameStore.getState().stopGame();
        }}
      >
        ⏹ Завершить
      </Button>
    </div>
  );
}
