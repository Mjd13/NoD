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

  // Always-current refs — safe inside event handlers without stale-closure issues
  const displayScoreRef = useRef(displayScore);
  const isEditingRef = useRef(false);
  const inputValueRef = useRef(inputValue);
  displayScoreRef.current = displayScore;
  isEditingRef.current = isEditing;
  inputValueRef.current = inputValue;

  // Touch tracking refs
  const scoreTouchRef = useRef<{ y: number; x: number } | null>(null);
  const swipeOccurredRef = useRef(false);
  const playerTouchRef = useRef<{ x: number; y: number } | null>(null);
  const holeTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Hold-to-repeat
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFiredRef = useRef(false);

  // Fix 7: Lock body scroll — prevents Safari page bounce during gameplay
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Sync display when hole or player changes
  useEffect(() => {
    const s = currentPlayer.scores[currentHole];
    setDisplayScore(s);
    setInputValue(String(s));
    setIsEditing(false);
  }, [currentHole, currentPlayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts (not active while typing)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditingRef.current) return; // input handles its own keys
      switch (e.key) {
        case 'ArrowUp':   e.preventDefault(); applyDelta(1);             break;
        case 'ArrowDown': e.preventDefault(); applyDelta(-1);            break;
        case 'ArrowLeft': e.preventDefault(); onNavigatePlayer('prev');  break;
        case 'ArrowRight':e.preventDefault(); onNavigatePlayer('next');  break;
        case 'Enter':
          e.preventDefault();
          flash();
          onSetScore(displayScoreRef.current);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNavigatePlayer, onSetScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Score helpers ---

  const applyDelta = (delta: number) => {
    navigator.vibrate?.(8);
    setDisplayScore(s => {
      const next = s + delta;
      setInputValue(String(next));
      displayScoreRef.current = next;
      inputValueRef.current = String(next);
      return next;
    });
  };

  // Fix 5: flip the sign of the current score (iOS numpad has no minus key)
  const flipSign = () => {
    const flipped = -displayScoreRef.current;
    setDisplayScore(flipped);
    setInputValue(String(flipped));
    displayScoreRef.current = flipped;
    inputValueRef.current = String(flipped);
  };

  const flash = () => {
    navigator.vibrate?.(15);
    setScoreFlash(true);
    setTimeout(() => setScoreFlash(false), 300);
  };

  // Fix 9: fully synchronous Set Score — no rAF race
  const handleSetScore = () => {
    let score = displayScoreRef.current;
    if (isEditingRef.current) {
      const parsed = parseInt(inputValueRef.current, 10);
      if (!isNaN(parsed)) score = parsed;
      // Finalise state synchronously before advancing
      displayScoreRef.current = score;
      setDisplayScore(score);
      setInputValue(String(score));
      setIsEditing(false);
      inputRef.current?.blur();
    }
    flash();
    onSetScore(score);
  };

  // --- Hold-to-repeat on +/− ---

  const startHold = (delta: number) => {
    holdFiredRef.current = false;
    const schedule = (delay: number) => {
      holdTimerRef.current = setTimeout(() => {
        holdFiredRef.current = true;
        applyDelta(delta);
        schedule(Math.max(60, delay - 20));
      }, delay);
    };
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
    if (holdFiredRef.current) { holdFiredRef.current = false; return; }
    applyDelta(delta);
  };

  // --- Fix 2: Score circle — tap = keyboard, swipe ↕ = score change ---
  // touch-action: none on the circle div prevents browser scroll from consuming these events

  const handleScoreTouchStart = (e: React.TouchEvent) => {
    scoreTouchRef.current = { y: e.touches[0].clientY, x: e.touches[0].clientX };
    swipeOccurredRef.current = false;
  };

  const handleScoreTouchEnd = (e: React.TouchEvent) => {
    if (!scoreTouchRef.current) return;
    const dy = scoreTouchRef.current.y - e.changedTouches[0].clientY;
    const dx = Math.abs(scoreTouchRef.current.x - e.changedTouches[0].clientX);
    scoreTouchRef.current = null;
    // Fix 6: 40px threshold (standardised, was 28px)
    if (Math.abs(dy) > 40 && Math.abs(dy) > dx) {
      swipeOccurredRef.current = true;
      applyDelta(dy > 0 ? 1 : -1);
    }
  };

  // Fix 1: synchronous focus — input is always in DOM; no setTimeout needed
  const handleScoreCircleClick = () => {
    if (swipeOccurredRef.current) { swipeOccurredRef.current = false; return; }
    setIsEditing(true);
    inputRef.current?.focus();  // synchronous — iOS requires this inside a user gesture
    inputRef.current?.select();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    inputValueRef.current = raw;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      setDisplayScore(parsed);
      displayScoreRef.current = parsed;
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValueRef.current, 10);
    const final = isNaN(parsed) ? 0 : parsed;
    setDisplayScore(final);
    setInputValue(String(final));
    displayScoreRef.current = final;
    inputValueRef.current = String(final);
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Finalise then advance — use captured value to avoid async state read
      const parsed = parseInt(inputValueRef.current, 10);
      const final = isNaN(parsed) ? displayScoreRef.current : parsed;
      displayScoreRef.current = final;
      setDisplayScore(final);
      setInputValue(String(final));
      setIsEditing(false);
      inputRef.current?.blur();
      // rAF only for the advance, not for value capture
      requestAnimationFrame(() => { flash(); onSetScore(final); });
    }
  };

  // --- Fix 3/4: Player nav swipe ←/→ with pan-y touch-action ---

  const handlePlayerTouchStart = (e: React.TouchEvent) => {
    playerTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handlePlayerTouchEnd = (e: React.TouchEvent) => {
    if (!playerTouchRef.current) return;
    const dx = playerTouchRef.current.x - e.changedTouches[0].clientX;
    const dy = Math.abs(playerTouchRef.current.y - e.changedTouches[0].clientY);
    playerTouchRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy)
      onNavigatePlayer(dx > 0 ? 'next' : 'prev');
  };

  // --- Fix 4: Hole nav swipe ←/→ with pan-y touch-action ---

  const handleHoleTouchStart = (e: React.TouchEvent) => {
    holeTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleHoleTouchEnd = (e: React.TouchEvent) => {
    if (!holeTouchRef.current) return;
    const dx = holeTouchRef.current.x - e.changedTouches[0].clientX;
    const dy = Math.abs(holeTouchRef.current.y - e.changedTouches[0].clientY);
    holeTouchRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy)
      onNavigateHole(dx > 0 ? 'next' : 'prev');
  };

  const absScore = Math.abs(displayScore);
  const scoreDigits = absScore >= 100 ? 'text-5xl' : 'text-6xl';
  // Show '-' glyph as user types the minus before any digit
  const visibleScore = isEditing && inputValue === '-' ? '−' : String(displayScore);
  const progress = ((currentHole + 1) / holesPlayed) * 100;

  return (
    // Fix 8: overscrollBehavior none; h-screen + overflow-auto lets landscape scroll inside viewport
    <div
      className="h-screen bg-[#0f0f0f] flex flex-col"
      style={{ overflowY: 'auto', overscrollBehavior: 'none' }}
    >
      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-blue-400 text-sm font-medium active:opacity-60 touch-manipulation"
        >
          ← Back
        </button>
        <p className="text-gray-400 text-xs uppercase tracking-widest">
          Score<span className="text-red-500">CARDs</span>
        </p>
        <button
          onClick={() => setShowScoreboard(true)}
          className="flex items-center gap-1.5 text-gray-400 py-1 px-2 rounded-lg active:bg-[#2a2a2a] touch-manipulation"
        >
          <span className="text-sm">📊</span>
          <span className="text-xs font-medium">Board</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1a1a1a] mx-6 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Fix 4: Hole Navigation — swipe ←/→; pan-y lets vertical scroll pass through */}
      <div
        className="px-6 pt-5 pb-2 shrink-0"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleHoleTouchStart}
        onTouchEnd={handleHoleTouchEnd}
      >
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

      {/* Fix 3: Player Navigation — swipe ←/→; pan-y prevents vertical page scroll */}
      <div
        className="px-6 py-2 shrink-0"
        style={{ touchAction: 'pan-y' }}
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

      {/* Score section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">

        {/* Fix 1+2: Score circle — always-in-DOM hidden input + touch-action:none */}
        <div
          className={`w-44 h-44 rounded-full border-4 relative flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
            scoreFlash
              ? 'border-green-500 bg-green-500/10 scale-105'
              : isEditing
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-red-500 bg-[#1a1a1a]'
          }`}
          style={{ touchAction: 'none' }}   // Fix 2: browser can't scroll from here
          onTouchStart={handleScoreTouchStart}
          onTouchEnd={handleScoreTouchEnd}
          onClick={handleScoreCircleClick}
        >
          {/*
            Fix 1: input always mounted so iOS can focus() synchronously.
            Fix 10: autocorrect/autocapitalize off — prevents suggestions bar.
            font-size ≥16px — prevents iOS zoom on focus.
            opacity:0 + pointerEvents:none — invisible but focusable.
          */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 1,
              height: 1,
              fontSize: 16,
            }}
          />

          {/* Fix 12: colour changes — white → blue while editing, green on flash */}
          <span
            className={`font-bold tabular-nums select-none ${scoreDigits} ${
              scoreFlash ? 'text-green-400' : isEditing ? 'text-blue-400' : 'text-white'
            }`}
          >
            {visibleScore}
          </span>
        </div>

        {/* Fix 5/12: +/− sign-flip shown while editing; hint text otherwise */}
        <div className="flex items-center justify-center h-8">
          {isEditing ? (
            <button
              // onPointerDown + preventDefault keeps input focused (no blur on tap)
              onPointerDown={(e) => { e.preventDefault(); flipSign(); }}
              className="px-5 py-1.5 rounded-full bg-[#2a2a2a] text-gray-200 text-sm font-semibold active:bg-[#3a3a3a] touch-manipulation"
            >
              +/− flip sign
            </button>
          ) : (
            <p className="text-gray-700 text-xs select-none">
              tap · swipe ↕ · hold +/−
            </p>
          )}
        </div>

        {/* +/− Buttons with hold-to-repeat */}
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

      {/* Set Score */}
      <div className="px-6 pb-4 shrink-0">
        <button
          onClick={handleSetScore}
          className="w-full py-5 bg-red-500 text-white font-bold text-xl rounded-2xl active:bg-red-600 transition-colors select-none touch-manipulation"
        >
          Set Score
        </button>
      </div>

      {/* Mini hole snapshot */}
      <div className="px-6 pb-6 shrink-0">
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
