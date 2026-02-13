import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useGameStore } from '../stores/gameStore';
import { GameTable } from '../components/game/GameTable';
import { ChatLog } from '../components/game/ChatLog';
import { GameControls } from '../components/game/GameControls';

export function GameScreen() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const status = useGameStore(s => s.status);
  const winner = useGameStore(s => s.winner);

  useEffect(() => {
    if (status === 'lobby') {
      navigate('/lobby');
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status === 'finished' && winner) {
      navigate('/gameover');
    }
  }, [status, winner, navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.bgSecondary,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary }}>
          🎭 AI Mafia
        </span>
        <GameControls />
      </div>

      {/* Main area */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Left: Game Table */}
        <div style={{
          flex: '0 0 65%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'hidden',
        }}>
          <GameTable />
        </div>

        {/* Right: Chat Log */}
        <div style={{
          flex: '0 0 35%',
          borderLeft: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <ChatLog />
        </div>
      </div>
    </div>
  );
}
