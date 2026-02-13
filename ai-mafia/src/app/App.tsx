import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../components/themes/ThemeProvider';
import { MainMenu } from '../pages/MainMenu';
import { PlayerLibrary } from '../pages/PlayerLibrary';
import { GameLobby } from '../pages/GameLobby';
import { GameScreen } from '../pages/GameScreen';
import { GameOver } from '../pages/GameOver';
import { Statistics } from '../pages/Statistics';
import { Settings } from '../pages/Settings';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/players" element={<PlayerLibrary />} />
          <Route path="/lobby" element={<GameLobby />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
