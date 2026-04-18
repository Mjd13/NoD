import { useState } from 'react';
import GameSetup from './components/GameSetup';
import Scorecard from './components/Scorecard';
import GameSummary from './components/GameSummary';
import GameHistory from './components/GameHistory';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';
import SplashScreen from './components/SplashScreen';
import OnboardingModal from './components/OnboardingModal';
import GlobalLeaderboard from './components/GlobalLeaderboard';
import { useGameState } from './hooks/useGameState';
import { useHistory } from './hooks/useHistory';
import { useProfile } from './hooks/useProfile';
import { syncGameToSupabase } from './hooks/useGlobalStats';
import { Screen } from './types';
import { generateId } from './utils/uuid';
import { getTotal, getWinnerName } from './utils/calculations';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splash_seen')
  );
  const { activeGame, startGame, setScoreAndAdvance, navigateHole, navigatePlayer, resetGame } = useGameState();
  const { games, addGame, deleteGame } = useHistory();
  const { displayName, deviceId, setDisplayName, needsOnboarding } = useProfile();

  const handleSplashDone = () => {
    sessionStorage.setItem('splash_seen', '1');
    setShowSplash(false);
  };

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
    const id = generateId();
    addGame({
      id,
      date: Date.now(),
      players: activeGame.players,
      holesPlayed: activeGame.holesPlayed,
      completed: true,
    });

    // Sync to global leaderboard if the device owner is one of the players
    if (displayName) {
      const winnerName = getWinnerName({ ...activeGame, id, date: Date.now(), completed: true });
      // Find the device owner's score (match by display name, case-insensitive)
      const ownerPlayer = activeGame.players.find(
        (p) => p.name.toLowerCase() === displayName.toLowerCase()
      );
      const totalScore = ownerPlayer
        ? getTotal(ownerPlayer.scores)
        : getTotal(activeGame.players.reduce(
            (best, p) => getTotal(p.scores) < getTotal(best.scores) ? p : best
          ).scores);
      const won = winnerName.toLowerCase() === displayName.toLowerCase();

      syncGameToSupabase({
        id,
        device_id: deviceId,
        display_name: displayName,
        holes_played: activeGame.holesPlayed,
        player_count: activeGame.players.length,
        total_score: totalScore,
        won,
      });
    }

    resetGame();
    setScreen('history');
  };

  const handleNewGame = () => {
    resetGame();
    setScreen('setup');
  };

  const showNav = ['setup', 'history', 'analytics', 'global'].includes(screen);
  const showOnboarding = !showSplash && needsOnboarding;

  return (
    <div className="min-h-screen bg-surface-0 text-ink-primary">
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {showOnboarding && <OnboardingModal onDone={setDisplayName} />}

      <div key={screen} className="screen-enter">
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

        {screen === 'global' && (
          <GlobalLeaderboard displayName={displayName} />
        )}
      </div>

      {showNav && <Navigation currentScreen={screen} onNavigate={setScreen} />}
    </div>
  );
}
