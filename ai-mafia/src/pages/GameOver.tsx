import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../components/themes/ThemeProvider';
import { useGameStore } from '../stores/gameStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ROLE_NAMES, ROLE_EMOJI, ROLE_SIDES } from '../types/game';
import { DEFAULT_MODELS } from '../types/player';
import { useStatsStore } from '../stores/statsStore';
import type { GameLogEntry } from '../types/game';

export function GameOver() {
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const winner = useGameStore(s => s.winner);
  const players = useGameStore(s => s.players);
  const dayNumber = useGameStore(s => s.dayNumber);
  const log = useGameStore(s => s.log);
  const resetGame = useGameStore(s => s.resetGame);
  const gameRecords = useStatsStore(s => s.gameRecords);
  const lastRecord = gameRecords[gameRecords.length - 1];

  const timeline = buildTimeline(log);

  const handleNewGame = () => {
    resetGame();
    navigate('/lobby');
  };

  const handleMainMenu = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      {/* Winner banner */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '72px', marginBottom: '12px' }}
        >
          {winner === 'stopped' ? '⏹' : winner === 'town' ? '🏆' : '🔫'}
        </motion.div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: winner === 'stopped' ? colors.warning : winner === 'town' ? colors.success : colors.danger,
          margin: 0,
          textShadow: `0 0 30px ${winner === 'stopped' ? colors.warning : winner === 'town' ? colors.success : colors.danger}44`,
        }}>
          {winner === 'stopped' ? 'ИГРА ДОСРОЧНО ОТМЕНЕНА' : winner === 'town' ? 'ГОРОД ПОБЕДИЛ!' : 'МАФИЯ ПОБЕДИЛА!'}
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '16px', marginTop: '8px' }}>
          Игра длилась {dayNumber} дней
        </p>
      </motion.div>

      {/* Players table */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 100px 80px 80px 80px',
          gap: '0',
          fontSize: '12px',
          fontWeight: 600,
          color: colors.textMuted,
          padding: '12px 16px',
          background: colors.bgSecondary,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <span></span>
          <span>Игрок</span>
          <span>Роль</span>
          <span>Статус</span>
          <span>Модель</span>
          <span>ELO</span>
        </div>

        {players.map((player, i) => {
          const won = winner === 'stopped' ? false : ROLE_SIDES[player.role] === winner;
          const eloRecord = winner === 'stopped'
            ? undefined
            : lastRecord?.players.find(p => p.playerId === player.characterId);

          return (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px 80px 80px 80px',
                gap: '0',
                padding: '12px 16px',
                background: winner === 'stopped' ? colors.bgCard : (won ? `${colors.success}0a` : `${colors.danger}0a`),
                borderBottom: `1px solid ${colors.border}`,
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '20px' }}>{player.avatar}</span>
              <span style={{
                fontWeight: 600,
                color: player.color,
                textDecoration: player.isAlive ? 'none' : 'line-through',
              }}>
                {player.name}
              </span>
              <Badge color={ROLE_SIDES[player.role] === 'mafia' ? colors.danger : colors.success}>
                {ROLE_EMOJI[player.role]} {ROLE_NAMES[player.role]}
              </Badge>
              <span style={{
                fontSize: '12px',
                color: player.isAlive ? colors.success : colors.danger,
              }}>
                {player.isAlive ? '✅ Жив' : '💀 Убит'}
              </span>
              <span style={{ fontSize: '11px', color: colors.textMuted }}>
                {DEFAULT_MODELS.find(m => m.id === player.modelId)?.name?.split(' ')[0] || '?'}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: winner === 'stopped' ? colors.textMuted : (eloRecord?.eloChange ?? 0) >= 0 ? colors.success : colors.danger,
              }}>
                {eloRecord ? (
                  <>
                    {eloRecord.eloAfter}
                    <span style={{ fontSize: '10px' }}>
                      {' '}({eloRecord.eloChange >= 0 ? '+' : ''}{eloRecord.eloChange})
                    </span>
                  </>
                ) : '—'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Timeline */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        background: colors.bgCard,
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '12px 16px',
          background: colors.bgSecondary,
          borderBottom: `1px solid ${colors.border}`,
          fontWeight: 700,
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>🧭 Таймлайн</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textMuted }}>
            {timeline.length} событий
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {timeline.length === 0 ? (
            <div style={{ padding: '16px', color: colors.textMuted, fontSize: '13px' }}>
              Пока нет событий.
            </div>
          ) : (
            timeline.map((e, idx) => (
              <div
                key={`${e.timestamp}-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  background: idx % 2 === 0 ? 'transparent' : `${colors.bgSecondary}55`,
                }}
              >
                <div style={{
                  width: 72,
                  flexShrink: 0,
                  fontSize: '11px',
                  color: colors.textMuted,
                  lineHeight: 1.2,
                }}>
                  <div>{e.dayLabel}</div>
                  <div>{formatTime(e.timestamp)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: 1.45, wordBreak: 'break-word' }}>
                    {e.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button size="lg" onClick={handleNewGame}>
          🎮 Играть снова
        </Button>
        <Button variant="secondary" size="lg" onClick={handleMainMenu}>
          🏠 Главное меню
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/statistics')}>
          📊 Статистика
        </Button>
      </div>
    </div>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

function buildTimeline(log: GameLogEntry[]) {
  const entries = [...log].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));

  // Keep "race-style" key events: phase changes, announcements, actions, deaths, vote results.
  const filtered = entries.filter(e => {
    if (e.type === 'speech' || e.type === 'night_chat') return false;
    // Drop the long role list spam from the timeline; players table already has roles.
    if (e.type === 'system' && e.content.startsWith('🧾 Роли за столом:')) return false;
    return true;
  });

  return filtered.map(e => ({
    timestamp: e.timestamp,
    dayLabel: e.dayNumber === 0 ? 'Старт' : `День ${e.dayNumber}`,
    text: e.content,
  }));
}
