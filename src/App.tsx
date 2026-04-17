import { useState } from 'react';
import GameSetup from './components/GameSetup';
import Scorecard from './components/Scorecard';
import GameSummary from './components/GameSummary';
import GameHistory from './components/GameHistory';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';
import { useGameState } from './hooks/useGameState';
import { useHistory } from './hooks/useHistory';
import { Screen } from './types';
import { generateId } from './utils/uuid';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const { activeGame, startGame, setScoreAndAdvance, navigateHole, navigatePlayer, resetGame } = useGameState();
  const { games, addGame, deleteGame } = useHistory();

  const handleStartGame = (playerNames: string[], holes: 9 | 18) => {
    startGame(playerNames, holes);
    setScreen('scorecard');
  };

  const handleSetScore = (score: number) => {
    const result = setScoreAndAdvance(score);
    if (result === 'complete') {
      setScreen('summary');
    }
  };

  const handleSaveGame = () => {
    if (!activeGame) return;
    addGame({
      id: generateId(),
      date: Date.now(),
      players: activeGame.players,
      holesPlayed: activeGame.holesPlayed,
      completed: true,
    });
    resetGame();
    setScreen('history');
  };

  const handleNewGame = () => {
    resetGame();
    setScreen('setup');
  };

  const showNav = screen === 'setup' || screen === 'history' || screen === 'analytics';

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {screen === 'setup' && <GameSetup onStartGame={handleStartGame} />}

      {screen === 'scorecard' && activeGame && (
        <Scorecard
          game={activeGame}
          onSetScore={handleSetScore}
          onNavigateHole={navigateHole}
          onNavigatePlayer={navigatePlayer}
          onBack={() => { resetGame(); setScreen('setup'); }}
        />
      )}

      {screen === 'summary' && activeGame && (
        <GameSummary game={activeGame} onSave={handleSaveGame} onNewGame={handleNewGame} />
      )}

      {screen === 'history' && (
        <GameHistory games={games} onDeleteGame={deleteGame} />
      )}

      {screen === 'analytics' && (
        <Analytics games={games} />
      )}

      {showNav && <Navigation currentScreen={screen} onNavigate={setScreen} />}
    </div>
  );
}
