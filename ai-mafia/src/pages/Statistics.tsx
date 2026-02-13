import { useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../components/themes/ThemeProvider';
import { useStatsStore } from '../stores/statsStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DEFAULT_MODELS } from '../types/player';

type Tab = 'players' | 'models' | 'games';

export function Statistics() {
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const [tab, setTab] = useState<Tab>('players');
  const allPlayerStats = useStatsStore(s => s.getAllPlayerStats());
  const modelStats = useStatsStore(s => s.getModelStats());
  const gameRecords = useStatsStore(s => s.gameRecords);

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: theme.borderRadius,
    background: tab === t ? colors.accent : 'transparent',
    color: tab === t ? colors.accentText : colors.textSecondary,
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: theme.fontFamily,
  });

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Button variant="ghost" onClick={() => navigate('/')}>← Назад</Button>
        <h1 style={{ margin: 0, fontSize: '28px', color: colors.textPrimary }}>
          📊 Статистика
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        <button style={tabStyle('players')} onClick={() => setTab('players')}>
          👥 Игроки ({allPlayerStats.length})
        </button>
        <button style={tabStyle('models')} onClick={() => setTab('models')}>
          🤖 Модели ({Object.keys(modelStats).length})
        </button>
        <button style={tabStyle('games')} onClick={() => setTab('games')}>
          🎮 Игры ({gameRecords.length})
        </button>
      </div>

      {/* Player stats */}
      {tab === 'players' && (
        <div>
          {allPlayerStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
              Пока нет статистики. Сыграйте хотя бы одну игру!
            </div>
          ) : (
            <div style={{
              borderRadius: theme.borderRadius,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 60px 60px 70px 60px 70px',
                padding: '12px 16px',
                background: colors.bgSecondary,
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textMuted,
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <span>Игрок</span>
                <span>ELO</span>
                <span>Игры</span>
                <span>Винрейт</span>
                <span>Выж.</span>
                <span>Пик ELO</span>
              </div>
              {allPlayerStats.map((stat, i) => (
                <motion.div
                  key={stat.playerId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 60px 60px 70px 60px 70px',
                    padding: '10px 16px',
                    borderBottom: `1px solid ${colors.border}`,
                    alignItems: 'center',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}{' '}
                    {stat.playerName}
                  </span>
                  <span style={{ fontWeight: 700, color: colors.accent }}>
                    {stat.elo}
                  </span>
                  <span>{stat.totalGames}</span>
                  <Badge color={stat.winRate >= 50 ? colors.success : colors.danger}>
                    {stat.winRate.toFixed(0)}%
                  </Badge>
                  <span style={{ color: colors.textMuted }}>
                    {stat.survivalRate.toFixed(0)}%
                  </span>
                  <span style={{ color: colors.textMuted }}>
                    {stat.peakElo}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Model stats */}
      {tab === 'models' && (
        <div>
          {Object.keys(modelStats).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
              Пока нет статистики по моделям.
            </div>
          ) : (
            <div style={{
              borderRadius: theme.borderRadius,
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}>
              {Object.entries(modelStats)
                .sort((a, b) => b[1].winRate - a[1].winRate)
                .map(([modelId, stat]) => (
                  <div
                    key={modelId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: colors.textPrimary, fontSize: '14px' }}>
                        {DEFAULT_MODELS.find(m => m.id === modelId)?.name || modelId}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textMuted }}>
                        {DEFAULT_MODELS.find(m => m.id === modelId)?.provider || ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: colors.textMuted }}>
                        {stat.games} игр
                      </span>
                      <Badge color={stat.winRate >= 50 ? colors.success : colors.danger}>
                        {stat.winRate.toFixed(0)}% побед
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Game records */}
      {tab === 'games' && (
        <div>
          {gameRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: colors.textMuted }}>
              Нет записанных игр.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...gameRecords].reverse().map((game, i) => (
                <div
                  key={game.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: theme.borderRadius,
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: colors.textPrimary, fontSize: '14px' }}>
                      Игра #{gameRecords.length - i}
                      <span style={{ marginLeft: '8px', fontWeight: 400, color: colors.textMuted, fontSize: '12px' }}>
                        {new Date(game.startedAt).toLocaleDateString('ru')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>
                      {game.playerCount} игроков • {game.totalDays} дней •{' '}
                      {Math.round(game.durationSeconds / 60)} мин
                    </div>
                  </div>
                  <Badge color={game.winner === 'town' ? colors.success : colors.danger}>
                    {game.winner === 'town' ? '🏆 Город' : '🔫 Мафия'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
