import { useState, useEffect, useRef } from 'react';
import { ActiveGame } from '../types';
import { getTotal } from '../utils/calculations';
import ConfirmDialog from './ConfirmDialog';
import ScoreboardModal from './ScoreboardModal';

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

  const [displayScore, setDisplayScore] = useState(currentPlayer.scores[currentHole]);
  const [inputValue, setInputValue] = useState(String(currentPlayer.scores[currentHole]));
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for latest values (used inside event listeners / intervals)
  const displayScoreRef = useRef(displayScore);
  const isEditingRef = useRef(false);
  displayScoreRef.current = displayScore;
  isEditingRef.current = isEditing;

  // Touch tracking
  const scoreTouchRef = useRef<{ y: number; x: number } | null>(null);
  const swipeOccurredRef = useRef(false);
  const playerTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Hold-to-repeat tracking
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFiredRef = useRef(false);

  // Sync display score when hole or player changes
  useEffect(() => {
    const s = currentPlayer.scores[currentHole];
    setDisplayScore(s);
    setInputValue(String(s));
    setIsEditing(false);
  }, [currentHole, currentPlayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts: arrows change score, Enter = Set Score (unless editing)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          applyDelta(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          applyDelta(-1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigatePlayer('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigatePlayer('next');
          break;
        case 'Enter':
          e.preventDefault();
          commitScore(displayScoreRef.current);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNavigatePlayer, onSetScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Score helpers ---

  const applyDelta = (delta: number) => {
    navigator.vibrate?.(8);
    setDisplayScore((s) => {
      const next = s + delta;
      setInputValue(String(next));
      displayScoreRef.current = next;
      return next;
    });
  };

  const commitScore = (score: number) => {
    navigator.vibrate?.(15);
    setScoreFlash(true);
    setTimeout(() => setScoreFlash(false), 300);
    onSetScore(score);
  };

  const handleSetScore = () => {
    if (isEditingRef.current) {
      // Finalize the input value first
      const parsed = parseInt(inputValue, 10);
      const final = isNaN(parsed) ? 0 : parsed;
      setDisplayScore(final);
      setInputValue(String(final));
      setIsEditing(false);
      displayScoreRef.current = final;
      inputRef.current?.blur();
      // Wait one frame for blur/state to settle before advancing
      requestAnimationFrame(() => commitScore(final));
      return;
    }
    commitScore(displayScore);
  };

  // --- Hold-to-repeat on +/- ---

  const startHold = (delta: number) => {
    holdFiredRef.current = false;
    const schedule = (delay: number) => {
      holdTimerRef.current = setTimeout(() => {
        holdFiredRef.current = true;
        applyDelta(delta);
        schedule(Math.max(60, delay - 20));
      }, delay);
    };
    // Initial delay before first repeat
    holdTimerRef.current = setTimeout(() => {
      holdFiredRef.current = true;
      applyDelta(delta);
      schedule(120);
    }, 450);
  };

  const stopHold = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleButtonClick = (delta: number) => {
    if (holdFiredRef.current) {
      holdFiredRef.current = false;
      return; // hold already fired, skip the click's single-fire
    }
    applyDelta(delta);
  };

  // --- Score circle: tap to type, swipe ↕ to adjust ---

  const handleScoreTouchStart = (e: React.TouchEvent) => {
    scoreTouchRef.current = { y: e.touches[0].clientY, x: e.touches[0].clientX };
    swipeOccurredRef.current = false;
  };

  const handleScoreTouchEnd = (e: React.TouchEvent) => {
    if (!scoreTouchRef.current) return;
    const dy = scoreTouchRef.current.y - e.changedTouches[0].clientY;
    const dx = Math.abs(scoreTouchRef.current.x - e.changedTouches[0].clientX);
    scoreTouchRef.current = null;

    // Vertical swipe: more Y movement than X, and threshold met
    if (Math.abs(dy) > 28 && Math.abs(dy) > dx) {
      swipeOccurredRef.current = true;
      applyDelta(dy > 0 ? 1 : -1);
    }
  };

  const handleScoreCircleClick = () => {
    if (swipeOccurredRef.current) {
      swipeOccurredRef.current = false;
      return; // don't open keyboard after a swipe
    }
    if (isEditing) return;
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      setDisplayScore(parsed);
      displayScoreRef.current = parsed;
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    const final = isNaN(parsed) ? 0 : parsed;
    setDisplayScore(final);
    setInputValue(String(final));
    displayScoreRef.current = final;
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur(); // triggers handleInputBlur which finalizes value
    }
  };

  // --- Player nav: swipe ‹ / › ---

  const handlePlayerTouchStart = (e: React.TouchEvent) => {
    playerTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handlePlayerTouchEnd = (e: React.TouchEvent) => {
    if (!playerTouchRef.current) return;
    const dx = playerTouchRef.current.x - e.changedTouches[0].clientX;
    const dy = Math.abs(playerTouchRef.current.y - e.changedTouches[0].clientY);
    playerTouchRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      onNavigatePlayer(dx > 0 ? 'next' : 'prev');
    }
  };

  const progress = ((currentHole + 1) / holesPlayed) * 100;
  const scoreDigits = Math.abs(displayScore) >= 100 ? 'text-5xl' : 'text-6xl';
  const inputSize = Math.abs(displayScore) >= 100 ? '2.8rem' : '3.5rem';

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
        <p className="text-gray-400 text-xs uppercase tracking-widest">
          Score<span className="text-red-500">CARDs</span>
        </p>
        <button
          onClick={() => setShowScoreboard(true)}
          className="flex items-center gap-1.5 text-gray-400 active:opacity-60 py-1 px-2 rounded-lg active:bg-[#2a2a2a]"
        >
          <span className="text-sm">📊</span>
          <span className="text-xs font-medium">Board</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a1a] mx-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hole Navigation */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateHole('prev')}
            disabled={currentHole === 0}
            className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 active:bg-[#2a2a2a] touch-manipulation"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Hole</p>
            <p className="text-white text-3xl font-bold tabular-nums">
              {currentHole + 1}
              <span className="text-gray-600 text-xl">/{holesPlayed}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigateHole('next')}
            disabled={currentHole === holesPlayed - 1}
            className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white text-xl font-bold flex items-center justify-center disabled:opacity-40 active:bg-[#2a2a2a] touch-manipulation"
          >
            ›
          </button>
        </div>
      </div>

      {/* Player Navigation — swipe left/right to switch players */}
      <div
        className="px-6 py-2"
        onTouchStart={handlePlayerTouchStart}
        onTouchEnd={handlePlayerTouchEnd}
      >
        <div className="flex items-center justify-between bg-[#1a1a1a] rounded-2xl px-4 py-3">
          <button
            onClick={() => onNavigatePlayer('prev')}
            className="w-12 h-12 rounded-full bg-[#2a2a2a] text-white text-lg font-bold flex items-center justify-center active:bg-[#3a3a3a] touch-manipulation"
          >
            ‹
          </button>
          <div className="text-center flex-1 px-2 min-w-0">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Player</p>
            <p className="text-white text-2xl font-bold truncate">{currentPlayer.name}</p>
            <p className="text-gray-400 text-xs mt-0.5 tabular-nums">
              {currentPlayerIndex + 1} / {players.length}
              <span className="text-gray-600 mx-1">·</span>
              total <span className="text-gray-300">{getTotal(currentPlayer.scores)}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigatePlayer('next')}
            className="w-12 h-12 rounded-full bg-[#2a2a2a] text-white text-lg font-bold flex items-center justify-center active:bg-[#3a3a3a] touch-manipulation"
          >
            ›
          </button>
        </div>
      </div>

      {/* Score Display — tap to type, swipe ↕ to adjust */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div
          className={`w-44 h-44 rounded-full border-4 flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
            scoreFlash
              ? 'border-green-500 bg-green-500/10 scale-105'
              : isEditing
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-red-500 bg-[#1a1a1a]'
          }`}
          onTouchStart={handleScoreTouchStart}
          onTouchEnd={handleScoreTouchEnd}
          onClick={handleScoreCircleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="-?[0-9]*"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="text-white font-bold bg-transparent text-center outline-none w-32 tabular-nums"
              style={{ fontSize: inputSize }}
            />
          ) : (
            <span className={`text-white font-bold tabular-nums ${scoreDigits}`}>
              {displayScore}
            </span>
          )}
        </div>

        <p className="text-gray-700 text-xs -mt-2 select-none">
          tap to type · swipe ↕ · hold +/− to fast-change
        </p>

        {/* +/- Buttons with hold-to-repeat */}
        <div className="flex gap-6">
          <button
            onPointerDown={() => startHold(-1)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onClick={() => handleButtonClick(-1)}
            className="w-20 h-20 rounded-full bg-[#2a2a2a] text-white text-3xl font-bold flex items-center justify-center active:bg-[#3a3a3a] select-none touch-manipulation"
          >
            −
          </button>
          <button
            onPointerDown={() => startHold(1)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onClick={() => handleButtonClick(1)}
            className="w-20 h-20 rounded-full bg-red-500 text-white text-3xl font-bold flex items-center justify-center active:bg-red-600 select-none touch-manipulation"
          >
            +
          </button>
        </div>
      </div>

      {/* Set Score Button */}
      <div className="px-6 pb-4">
        <button
          onClick={handleSetScore}
          className="w-full py-5 bg-red-500 text-white font-bold text-xl rounded-2xl active:bg-red-600 transition-colors select-none touch-manipulation"
        >
          Set Score
        </button>
      </div>

      {/* Mini scoreboard — current hole snapshot */}
      <div className="px-6 pb-6">
        <div className="border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-2 uppercase tracking-widest">Hole {currentHole + 1}</p>
          <div className="flex gap-2 flex-wrap">
            {players.map((p, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs tabular-nums ${
                  i === currentPlayerIndex
                    ? 'bg-red-500/20 text-red-400 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                <span>{p.name}:</span>
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

      {showScoreboard && (
        <ScoreboardModal
          game={game}
          displayScore={displayScore}
          onClose={() => setShowScoreboard(false)}
        />
      )}
    </div>
  );
}
