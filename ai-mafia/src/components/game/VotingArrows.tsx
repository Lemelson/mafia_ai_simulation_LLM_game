import { motion } from 'framer-motion';

interface PlayerPosition {
  playerId: string;
  x: number;
  y: number;
}

interface VotingArrowsProps {
  playerPositions: PlayerPosition[];
  votes: Record<string, string>;
}

export function VotingArrows({ playerPositions, votes }: VotingArrowsProps) {
  const getPos = (id: string) => playerPositions.find(p => p.playerId === id);

  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#ff6b6b" />
        </marker>
      </defs>

      {Object.entries(votes).map(([voterId, targetId]) => {
        if (targetId === 'skip') return null;
        const from = getPos(voterId);
        const to = getPos(targetId);
        if (!from || !to) return null;

        return (
          <motion.line
            key={`${voterId}-${targetId}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.5 }}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#ff6b6b"
            strokeWidth="2"
            strokeDasharray="5,3"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </>
  );
}
