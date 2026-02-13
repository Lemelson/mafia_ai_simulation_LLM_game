import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useTheme } from '../themes/ThemeProvider';
import { PlayerAvatar } from './PlayerAvatar';
import { PhaseIndicator } from './PhaseIndicator';
import { VotingArrows } from './VotingArrows';
import { ROLE_EMOJI, ROLE_NAMES } from '../../types/game';
import { DEFAULT_MODELS } from '../../types/player';

export function GameTable() {
  const { colors, isNight } = useTheme();
  const players = useGameStore(s => s.players);
  const phase = useGameStore(s => s.phase);
  const revealRoles = useGameStore(s => s.revealRoles);
  const speakingOrder = useGameStore(s => s.speakingOrder);
  const currentSpeakerIndex = useGameStore(s => s.currentSpeakerIndex);
  const votingState = useGameStore(s => s.votingState);
  const status = useGameStore(s => s.status);

  const currentSpeakerId = speakingOrder[currentSpeakerIndex];

  // Calculate positions around an ellipse
  const tableWidth = 500;
  const tableHeight = 350;
  const canvasHeight = tableHeight + 80;
  const centerX = tableWidth / 2;
  const centerY = tableHeight / 2;
  const radiusX = tableWidth / 2 - 50;
  const radiusY = tableHeight / 2 - 50;

  const playerPositions = useMemo(() => {
    return players.map((player, index) => {
      const angle = (2 * Math.PI * index) / players.length - Math.PI / 2;
      return {
        player,
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
      };
    });
  }, [players, centerX, centerY, radiusX, radiusY]);

  const tableBg = isNight ? colors.tableNight : colors.tableDay;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        aspectRatio: `${tableWidth}/${canvasHeight}`,
        margin: '0 auto',
      }}
    >
      {/* Phase indicator in center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}>
        <PhaseIndicator />
      </div>

      {/* Table surface */}
      <motion.div
        animate={{ background: tableBg }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '80%',
          borderRadius: '50%',
          border: `2px solid ${colors.tableBorder}`,
          boxShadow: `inset 0 0 60px rgba(0,0,0,0.3), ${colors.shadow}`,
        }}
      />

      {/* Voting arrows */}
      {votingState && phase === 'day_voting' && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
          viewBox={`0 0 ${tableWidth} ${canvasHeight}`}
        >
          <VotingArrows
            playerPositions={playerPositions.map(pp => ({
              playerId: pp.player.playerId,
              x: pp.x,
              y: pp.y,
            }))}
            votes={votingState.votes}
          />
        </svg>
      )}

      {/* Players around the table */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
        <AnimatePresence>
          {playerPositions.map(({ player, x, y }) => (
            <motion.div
              key={player.playerId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{ type: 'spring', duration: 0.5 }}
              style={{
                position: 'absolute',
                left: `${(x / tableWidth) * 100}%`,
                top: `${(y / canvasHeight) * 100}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: player.playerId === currentSpeakerId ? 20 : 10,
              }}
            >
              <PlayerAvatar
                name={player.name}
                avatar={player.avatar}
                color={revealRoles ? player.color : player.publicColor}
                isAlive={player.isAlive}
                isSpeaking={player.playerId === currentSpeakerId && status === 'playing'}
                size={60}
                showName={true}
                role={revealRoles ? ROLE_NAMES[player.role] : undefined}
                roleBadge={revealRoles ? ROLE_EMOJI[player.role] : undefined}
                showRole={revealRoles}
                modelLabel={
                  revealRoles
                    ? (DEFAULT_MODELS.find(m => m.id === player.modelId)?.name || player.modelId)
                    : undefined
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
