import { motion } from 'framer-motion';
import { useTheme } from '../themes/ThemeProvider';
import { withOpacity } from '../../utils/colors';

interface PlayerAvatarProps {
  name: string;
  avatar: string;
  color: string;
  isAlive: boolean;
  isSpeaking: boolean;
  isVotedFor?: boolean;
  size?: number;
  showName?: boolean;
  role?: string;
  showRole?: boolean;
  roleBadge?: string;
  modelLabel?: string;
}

export function PlayerAvatar({
  name, avatar, color, isAlive, isSpeaking,
  isVotedFor = false, size = 70, showName = true,
  role, showRole = false, roleBadge, modelLabel,
}: PlayerAvatarProps) {
  const { colors, isNight } = useTheme();
  const showRoleBadge = showRole && !!roleBadge;
  const roleBadgeSize = Math.min(52, Math.max(24, Math.round(size * 0.65)));
  const roleBadgeFontSize = Math.round(roleBadgeSize * 0.55);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <motion.div
        animate={
          isSpeaking
            ? {
              boxShadow: [
                `0 0 10px ${withOpacity(color, 0.5)}, 0 0 30px ${withOpacity(color, 0.3)}`,
                `0 0 20px ${withOpacity(color, 0.7)}, 0 0 50px ${withOpacity(color, 0.4)}`,
                `0 0 10px ${withOpacity(color, 0.5)}, 0 0 30px ${withOpacity(color, 0.3)}`,
              ],
            }
            : isVotedFor
              ? { boxShadow: `0 0 15px ${withOpacity(colors.danger, 0.5)}` }
              : { boxShadow: `0 0 5px ${withOpacity(color, 0.2)}` }
        }
        transition={isSpeaking ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          background: isAlive
            ? `linear-gradient(135deg, ${withOpacity(color, 0.3)}, ${withOpacity(color, 0.1)})`
            : colors.bgSecondary,
          border: `3px solid ${isAlive ? color : colors.textMuted}`,
          position: 'relative',
          filter: isAlive ? 'none' : 'grayscale(100%)',
          opacity: isAlive ? 1 : 0.4,
          transition: 'filter 0.5s, opacity 0.5s',
          cursor: 'default',
        }}
      >
        {avatar}

        {/* Role badge for observers */}
        {showRoleBadge && (
          <div
            style={{
              position: 'absolute',
              top: -Math.round(roleBadgeSize * 0.25),
              left: -Math.round(roleBadgeSize * 0.25),
              width: roleBadgeSize,
              height: roleBadgeSize,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: roleBadgeFontSize,
              background: colors.bgPrimary,
              border: `2px solid ${colors.border}`,
              boxShadow: colors.shadow,
              opacity: isAlive ? 1 : 0.6,
            }}
            title={role || ''}
          >
            {roleBadge}
          </div>
        )}

        {/* Death marker */}
        {!isAlive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.5,
              color: colors.danger,
              fontWeight: 'bold',
            }}
          >
            ✗
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && isAlive && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: color,
              border: `2px solid ${colors.bgPrimary}`,
            }}
          />
        )}

        {/* Night sleeping indicator */}
        {isAlive && isNight && !isSpeaking && (
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: -8,
              right: -4,
              fontSize: '14px',
            }}
          >
            💤
          </motion.span>
        )}
      </motion.div>

      {showName && (
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: isAlive ? color : colors.textMuted,
          textAlign: 'center',
          maxWidth: size + 20,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textDecoration: isAlive ? 'none' : 'line-through',
        }}>
          {name}
        </div>
      )}

      {(() => {
        const parts: string[] = [];
        if (showRole && role) parts.push(role);
        if (modelLabel) parts.push(modelLabel);
        if (parts.length === 0) return null;

        return (
        <div style={{
          fontSize: '10px',
          color: colors.textMuted,
          textAlign: 'center',
        }}>
          {parts.join(' • ')}
        </div>
        );
      })()}
    </div>
  );
}
