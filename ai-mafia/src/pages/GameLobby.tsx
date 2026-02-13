import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/themes/ThemeProvider';
import { usePlayerStore } from '../stores/playerStore';
import { useGameStore } from '../stores/gameStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PlayerAvatar } from '../components/game/PlayerAvatar';
import { ROLE_DISTRIBUTION } from '../types/game';
import { DEFAULT_MODELS } from '../types/player';
import { startGameEngine } from '../engine/GameEngine';

export function GameLobby() {
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const libraryPlayers = usePlayerStore(s => s.players);
  const initializeDefaults = usePlayerStore(s => s.initializeDefaults);
  const selectedSeats = useGameStore(s => s.selectedSeats);
  const addCharacterToLobby = useGameStore(s => s.addCharacterToLobby);
  const removeSeatFromLobby = useGameStore(s => s.removeSeatFromLobby);
  const startGame = useGameStore(s => s.startGame);

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  const selectedPlayers = selectedSeats
    .map(seat => ({ seatId: seat.seatId, character: libraryPlayers.find(p => p.id === seat.characterId) }))
    .filter((x): x is { seatId: string; character: NonNullable<typeof x.character> } => !!x.character);
  const availablePlayers = libraryPlayers;
  const count = selectedSeats.length;
  const dist = ROLE_DISTRIBUTION[count];
  const canStart = count >= 6 && count <= 12;

  const handleStartGame = () => {
    startGame(libraryPlayers);
    startGameEngine();
    navigate('/game');
  };

  // Calculate seat positions for preview
  const previewPositions = selectedPlayers.map((_, i) => {
    const angle = (2 * Math.PI * i) / Math.max(selectedPlayers.length, 1) - Math.PI / 2;
    return {
      x: 50 + 38 * Math.cos(angle),
      y: 50 + 38 * Math.sin(angle),
    };
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="ghost" onClick={() => navigate('/')}>← Меню</Button>
          <h1 style={{ margin: 0, fontSize: '28px', color: colors.textPrimary }}>
            🎮 Лобби
          </h1>
        </div>
        <Button
          size="lg"
          onClick={handleStartGame}
          disabled={!canStart}
        >
          🎬 Начать игру ({count} игроков)
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left: Table Preview */}
        <div style={{ flex: '1 1 400px', minWidth: '350px' }}>
          <div style={{
            padding: '20px',
            borderRadius: theme.borderRadius,
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}>
            <h3 style={{ margin: '0 0 12px', color: colors.textSecondary, fontSize: '14px' }}>
              🪑 Стол ({count}/6-12)
            </h3>

            {/* Table oval preview */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1.5',
              borderRadius: '50%',
              background: colors.tableDay,
              border: `2px solid ${colors.tableBorder}`,
              marginBottom: '16px',
            }}>
              <AnimatePresence>
                {selectedPlayers.map(({ seatId, character }, i) => (
                  <motion.div
                    key={seatId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      position: 'absolute',
                      left: `${previewPositions[i].x}%`,
                      top: `${previewPositions[i].y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      onClick={() => removeSeatFromLobby(seatId)}
                      style={{ cursor: 'pointer' }}
                      title="Убрать из игры"
                    >
                      <PlayerAvatar
                        name={character.name}
                        avatar={character.avatar}
                        color={character.color}
                        isAlive={true}
                        isSpeaking={false}
                        size={48}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {count === 0 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textMuted,
                  fontSize: '14px',
                }}>
                  Добавьте игроков →
                </div>
              )}
            </div>

            {/* Role distribution */}
            {dist && (
              <div style={{
                display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
              }}>
                <Badge color="#e74c3c">🔫 Мафия: {dist.mafia}</Badge>
                <Badge color="#3498db">🔍 Комиссар: {dist.detective}</Badge>
                <Badge color="#2ecc71">💉 Доктор: {dist.doctor}</Badge>
                <Badge color="#95a5a6">🏘️ Мирные: {dist.civilian}</Badge>
              </div>
            )}

            {!canStart && count > 0 && (
              <div style={{
                marginTop: '12px', textAlign: 'center',
                fontSize: '13px', color: colors.warning,
              }}>
                {count < 6 ? `Нужно ещё ${6 - count} игроков` : 'Максимум 12 игроков'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Available players */}
        <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
          <div style={{
            padding: '20px',
            borderRadius: theme.borderRadius,
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <h3 style={{ margin: 0, color: colors.textSecondary, fontSize: '14px' }}>
                🎭 Доступные характеры
              </h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/players')}>
                Управление
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflow: 'auto' }}>
              {availablePlayers.map(player => (
                <motion.div
                  key={player.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => addCharacterToLobby(player.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: theme.borderRadius,
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.border}`,
                    cursor: count >= 12 ? 'not-allowed' : 'pointer',
                    opacity: count >= 12 ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{player.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: player.color }}>
                      {player.name}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>
                      {DEFAULT_MODELS.find(m => m.id === player.modelId)?.name || 'Неизвестная модель'} • ELO {player.elo}
                    </div>
                  </div>
                  <span style={{ fontSize: '20px', color: colors.accent }}>+</span>
                </motion.div>
              ))}

              <div style={{ textAlign: 'center', padding: '10px 0', color: colors.textMuted, fontSize: '12px' }}>
                Имена игроков в игре будут назначены случайно из пула имён (без повторов).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
