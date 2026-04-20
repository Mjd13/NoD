import { useState } from 'react';
import GameSetup from './components/GameSetup';
import Scorecard from './components/Scorecard';
import GameSummary from './components/GameSummary';
import GameHistory from './components/GameHistory';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';
import SplashScreen from './components/SplashScreen';
import PhoneAuthModal from './components/PhoneAuthModal';
import GlobalLeaderboard from './components/GlobalLeaderboard';
import { useGameState } from './hooks/useGameState';
import { useHistory } from './hooks/useHistory';
import { useAuth } from './hooks/useAuth';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import InstallPrompt from './components/InstallPrompt';
import { syncGameToFirebase } from './hooks/useGlobalLeaderboard';
import { Screen } from './types';
import { generateId } from './utils/uuid';
import { getTotal, getWinnerName, getRecentPlayers } from './utils/calculations';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splash_seen')
  );
  const { activeGame, startGame, setScoreAndAdvance, navigateHole, navigatePlayer, resetGame } = useGameState();
  const { games, addGame, deleteGame } = useHistory();
  const { uid, displayName, stage, codeSent, busy, authError, sendCode, verifyCode, saveName, skipAuth, skippedAuth, needsOnboarding } = useAuth();
  const { showPrompt: showInstall, canNativeInstall, triggerInstall, dismiss: dismissInstall } = useInstallPrompt();

  const handleSplashDone = () => {
    sessionStorage.setItem('splash_seen', '1');
    setShowSplash(false);
  };

  const handleStartGame = (players: { name: string; uid?: string }[], holes: 9 | 18, dealerIndex: number) => {
    startGame(players, holes, dealerIndex);
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

    const winnerName = getWinnerName({ ...activeGame, id, date: Date.now(), completed: true });

    // Sync every registered player (those with a uid) — guests are skipped
    for (const player of activeGame.players) {
      if (player.uid) {
        syncGameToFirebase({
          id: `${id}_${player.uid}`,
          uid: player.uid,
          displayName: player.name,
          holesPlayed: activeGame.holesPlayed,
          playerCount: activeGame.players.length,
          totalScore: getTotal(player.scores),
          won: player.name.toLowerCase() === winnerName.toLowerCase(),
          scores: player.scores,
        });
      }
    }

    resetGame();
    setScreen('history');
  };

  const handleNewGame = () => {
    resetGame();
    setScreen('setup');
  };

  const showNav = ['setup', 'history', 'analytics', 'global'].includes(screen);
  const showOnboarding = !showSplash && !showInstall && stage !== 'loading' && needsOnboarding && !skippedAuth;

  return (
    <div className="min-h-screen bg-surface-0 text-ink-primary">
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {!showSplash && showInstall && (
        <InstallPrompt
          canNativeInstall={canNativeInstall}
          onInstall={triggerInstall}
          onDismiss={dismissInstall}
        />
      )}
      {!showSplash && !showInstall && showOnboarding && (
        <PhoneAuthModal
          stage={stage}
          codeSent={codeSent}
          busy={busy}
          error={authError}
          onSendCode={sendCode}
          onVerifyCode={verifyCode}
          onSaveName={saveName}
          onSkip={skipAuth}
        />
      )}

      <div key={screen} className="screen-enter">
        {screen === 'setup' && (
          <GameSetup
            onStartGame={handleStartGame}
            currentUser={uid && displayName ? { name: displayName, uid } : null}
            recentPlayers={getRecentPlayers(games, uid)}
          />
        )}

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
          <GlobalLeaderboard displayName={displayName} skippedAuth={skippedAuth} />
        )}
      </div>

      {showNav && <Navigation currentScreen={screen} onNavigate={setScreen} />}
    </div>
  );
}
