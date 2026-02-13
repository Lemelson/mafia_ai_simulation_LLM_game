import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../themes/ThemeProvider';
import { ChatMessage } from './ChatMessage';
import { SystemMessage } from './SystemMessage';

export function ChatLog() {
  const { colors, theme } = useTheme();
  const log = useGameStore(s => s.log);
  const showNightActions = useSettingsStore(s => s.showNightActions);
  const autoScroll = useSettingsStore(s => s.autoScroll);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length, autoScroll]);

  const filteredLog = log.filter(entry => {
    if (entry.isHidden && !showNightActions) return false;
    return true;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: colors.chatBg,
        borderRadius: theme.borderRadius,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: colors.bgSecondary,
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
          💬 Чат-лог
        </span>
        <span style={{ fontSize: '12px', color: colors.textMuted }}>
          {filteredLog.length} сообщений
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <AnimatePresence initial={false}>
          {filteredLog.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {entry.type === 'system' || entry.type === 'phase_change' || entry.type === 'death' ? (
                <SystemMessage entry={entry} />
              ) : (
                <ChatMessage entry={entry} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLog.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textMuted,
            fontSize: '14px',
          }}>
            Игра ещё не началась...
          </div>
        )}
      </div>
    </div>
  );
}
