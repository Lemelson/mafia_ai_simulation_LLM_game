import { useTheme } from '../themes/ThemeProvider';
import type { GameLogEntry } from '../../types/game';
import { withOpacity } from '../../utils/colors';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ROLE_EMOJI, ROLE_NAMES } from '../../types/game';
import { useEffect, useMemo, useState } from 'react';
import { TypewriterController } from '../../utils/timing';

interface ChatMessageProps {
  entry: GameLogEntry;
}

export function ChatMessage({ entry }: ChatMessageProps) {
  const { colors, theme } = useTheme();
  const typingSpeed = useSettingsStore(s => s.typingSpeed);
  const role = useGameStore(s => {
    if (!entry.playerId) return null;
    const p = s.players.find(pp => pp.playerId === entry.playerId);
    return p ? p.role : null;
  });
  const lastEntryId = useGameStore(s => s.log[s.log.length - 1]?.id);

  const isNightChat = entry.type === 'night_chat';
  const isVote = entry.type === 'vote';

  const roleLabel = role ? `${ROLE_EMOJI[role]} ${ROLE_NAMES[role]}` : null;

  const shouldTypewrite = useMemo(() => {
    if (typingSpeed >= 8) return false; // effectively instant
    if (entry.id !== lastEntryId) return false;
    if (entry.type !== 'speech' && entry.type !== 'night_chat') return false;
    if (!entry.content) return false;
    return true;
  }, [entry.content, entry.id, entry.type, lastEntryId, typingSpeed]);

  const [displayText, setDisplayText] = useState<string>(() => (shouldTypewrite ? '' : entry.content));

  useEffect(() => {
    if (!shouldTypewrite) {
      // This is intentional: we switch the rendered text source between typed and full.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayText(entry.content);
      return;
    }

    const ctrl = new TypewriterController();
    setDisplayText('');
    void ctrl.typewrite(entry.content, setDisplayText, typingSpeed);
    return () => {
      ctrl.abort();
    };
  }, [entry.content, shouldTypewrite, typingSpeed]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: theme.borderRadius,
        background: isNightChat
          ? withOpacity(entry.playerColor || colors.accent, 0.08)
          : colors.chatMessageBg,
        border: `1px solid ${isNightChat ? withOpacity(entry.playerColor || colors.accent, 0.15) : colors.border}`,
        opacity: isNightChat ? 0.85 : 1,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: withOpacity(entry.playerColor || colors.accent, 0.2),
          border: `2px solid ${entry.playerColor || colors.accent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          flexShrink: 0,
        }}
      >
        {isVote ? '🗳️' : isNightChat ? '🌙' : '💬'}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: entry.playerColor || colors.textPrimary,
          }}>
            {entry.playerName}{role ? ` (${ROLE_NAMES[role]})` : ''}
          </span>
          {roleLabel && <span style={{ fontSize: '10px', color: colors.textMuted }}>{ROLE_EMOJI[role!]}</span>}
          {isNightChat && (
            <span style={{ fontSize: '10px', color: colors.textMuted }}>
              🌙 ночь
            </span>
          )}
        </div>
        <div style={{
          fontSize: '14px',
          color: colors.textPrimary,
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}>
          {displayText}
        </div>
      </div>
    </div>
  );
}
