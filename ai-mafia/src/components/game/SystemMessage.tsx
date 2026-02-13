import { useTheme } from '../themes/ThemeProvider';
import type { GameLogEntry } from '../../types/game';

interface SystemMessageProps {
  entry: GameLogEntry;
}

export function SystemMessage({ entry }: SystemMessageProps) {
  const { colors, theme } = useTheme();

  const isDeath = entry.type === 'death';

  return (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: theme.borderRadius,
        background: isDeath ? `${colors.danger}15` : colors.systemMessageBg,
        border: `1px solid ${isDeath ? `${colors.danger}33` : colors.border}`,
        textAlign: 'center',
      }}
    >
      <div style={{
        fontSize: '13px',
        color: isDeath ? colors.danger : colors.textSecondary,
        fontWeight: 500,
        lineHeight: 1.5,
      }}>
        {entry.content}
      </div>
    </div>
  );
}
