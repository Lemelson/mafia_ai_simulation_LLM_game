import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useTheme } from '../themes/ThemeProvider';

const PHASE_LABELS: Record<string, { label: string; emoji: string }> = {
  lobby: { label: 'Лобби', emoji: '🏠' },
  role_assignment: { label: 'Раздача ролей', emoji: '🎴' },
  night_mafia: { label: 'Ночь — Мафия', emoji: '🔫' },
  night_detective: { label: 'Ночь — Комиссар', emoji: '🔍' },
  night_doctor: { label: 'Ночь — Доктор', emoji: '💉' },
  day_announcement: { label: 'Утро', emoji: '☀️' },
  day_discussion: { label: 'Обсуждение', emoji: '💬' },
  day_voting: { label: 'Голосование', emoji: '🗳️' },
  vote_result: { label: 'Результат', emoji: '⚖️' },
  last_words: { label: 'Последнее слово', emoji: '💀' },
  check_win: { label: 'Проверка', emoji: '🏆' },
  game_over: { label: 'Игра окончена', emoji: '🏆' },
};

export function PhaseIndicator() {
  const { colors } = useTheme();
  const phase = useGameStore(s => s.phase);
  const dayNumber = useGameStore(s => s.dayNumber);
  const isProcessing = useGameStore(s => s.isProcessing);

  const phaseInfo = PHASE_LABELS[phase] || { label: phase, emoji: '❓' };
  const isNight = phase.startsWith('night_');

  return (
    <motion.div
      key={phase}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '12px 20px',
        borderRadius: '16px',
        background: `${colors.bgCard}cc`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.border}`,
        minWidth: '120px',
      }}
    >
      <span style={{ fontSize: '24px' }}>{phaseInfo.emoji}</span>
      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        color: colors.textPrimary,
        textAlign: 'center',
      }}>
        {isNight ? `Ночь ${dayNumber}` : dayNumber > 0 ? `День ${dayNumber}` : ''}
      </span>
      <span style={{
        fontSize: '11px',
        color: colors.textSecondary,
        textAlign: 'center',
      }}>
        {phaseInfo.label}
      </span>
      {isProcessing && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 14,
            height: 14,
            border: `2px solid ${colors.accent}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
          }}
        />
      )}
    </motion.div>
  );
}
