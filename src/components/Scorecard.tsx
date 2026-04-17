import { useState, useEffect } from 'react';
import { ActiveGame } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  game: ActiveGame;
  onSetScore: (score: number) => void;
  onNavigateHole: (dir: 'prev' | 'next') => void;
  onNavigatePlayer: (dir: 'prev' | 'next') => void;
  onBack: () => void;
}

export default function Scorecard({ game, onSetScore, onNavigateHole, onNavigatePlayer, onBack }: Props) {
  const { players, holesPlayed, currentHole, currentPlayerIndex } = game;
  const currentPlayer = players[currentPlayerIndex];
  const storedScore = currentPlayer.scores[currentHole];

  const [displayScore, setDisplayScore] = useState(storedScore);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);

  // Reset display score when navigating to a different player/hole
  useEffect(() => {
    setDisplayScore(currentPlayer.scores[currentHole]);
  }, [currentHole, currentPlayerIndex, currentPlayer.scores]);

  const increment = () => {
    navigator.vibrate?.(8);
    setDisplayScore((s) => Math.min(s + 1, 999));
  };
  const decrement = () => {
    navigator.vibrate?.(8);
    setDisplayScore((s) => Math.max(s - 1, 0));
  };

  const handleSetScore = () => {
    setScoreFlash(true);
    setTimeout(() => setScoreFlash(false), 300);
    onSetScore(displayScore);
  };

  const progress = ((currentHole + 1) / holesPlayed) * 100;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-blue-400 text-sm font-medium active:opacity-60"
        >
          ← Back
        </button>
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest">Score<span className="text-red-500">CARDs</span></p>
        </div>
        <div className="w-16 text-right">
          <span className="text-gray-500 text-xs">{players.length} players</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a1a] mx-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hole Navigation */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateHole('prev')}
            disabled={currentHole === 0}
            className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 active:bg-[#2a2a2a]"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Hole</p>
            <p className="text-white text-3xl font-bold">
              {currentHole + 1}
              <span className="text-gray-600 text-xl">/{holesPlayed}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigateHole('next')}
            disabled={currentHole === holesPlayed - 1}
            className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 active:bg-[#2a2a2a]"
          >
            ›
          </button>
        </div>
      </div>

      {/* Player Navigation */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between bg-[#1a1a1a] rounded-2xl px-4 py-3">
          <button
            onClick={() => onNavigatePlayer('prev')}
            className="w-12 h-12 rounded-full bg-[#2a2a2a] text-white text-lg font-bold flex items-center justify-center active:bg-[#3a3a3a]"
          >
            ‹
          </button>
          <div className="text-center flex-1 px-2">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Player</p>
            <p className="text-white text-2xl font-bold truncate">{currentPlayer.name}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {currentPlayerIndex + 1} of {players.length}
            </p>
          </div>
          <button
            onClick={() => onNavigatePlayer('next')}
            className="w-12 h-12 rounded-full bg-[#2a2a2a] text-white text-lg font-bold flex items-center justify-center active:bg-[#3a3a3a]"
          >
            ›
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div
          className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${
            scoreFlash ? 'border-green-500 bg-green-500/10 scale-105' : 'border-red-500 bg-[#1a1a1a]'
          }`}
        >
          <span className="text-white text-6xl font-bold">{displayScore}</span>
        </div>

        {/* +/- Buttons */}
        <div className="flex gap-6">
          <button
            onClick={decrement}
            disabled={displayScore === 0}
            className="w-20 h-20 rounded-full bg-[#2a2a2a] text-white text-3xl font-bold flex items-center justify-center disabled:opacity-50 active:bg-[#3a3a3a] select-none"
          >
            −
          </button>
          <button
            onClick={increment}
            className="w-20 h-20 rounded-full bg-red-500 text-white text-3xl font-bold flex items-center justify-center active:bg-red-600 select-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Set Score Button */}
      <div className="px-6 pb-10">
        <button
          onClick={handleSetScore}
          className="w-full py-5 bg-red-500 text-white font-bold text-xl rounded-2xl active:bg-red-600 transition-colors select-none"
        >
          Set Score
        </button>
      </div>

      {/* Scoreboard mini-view */}
      <div className="px-6 pb-6">
        <div className="border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-2 uppercase tracking-widest">Hole {currentHole + 1} Scores</p>
          <div className="flex gap-3 flex-wrap">
            {players.map((p, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                  i === currentPlayerIndex ? 'bg-red-500/20 text-red-400' : 'text-gray-500'
                }`}
              >
                <span className="font-medium">{p.name}:</span>
                <span>{i === currentPlayerIndex ? displayScore : p.scores[currentHole]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message="Go back to setup? Your current game progress will be lost."
          confirmLabel="Leave Game"
          onConfirm={onBack}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
