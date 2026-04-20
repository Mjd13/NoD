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

function BarChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="1.5" y="8.5" width="3" height="5.5" rx="0.5" />
      <rect x="6.5" y="5" width="3" height="9" rx="0.5" />
      <rect x="11.5" y="2" width="3" height="12" rx="0.5" />
    </svg>
  );
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

  // Player slide animation state — purely visual, no logic
  const [playerDir, setPlayerDir] = useState<'left' | 'right' | null>(null);
  const [playerKey, setPlayerKey] = useState(0);

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

  // Lock body scroll — prevents Safari page bounce during gameplay
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
      if (isEditingRef.current) return;
      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); applyDelta(1);            break;
        case 'ArrowDown':  e.preventDefault(); applyDelta(-1);           break;
        case 'ArrowLeft':  e.preventDefault(); navigatePlayer('prev');   break;
        case 'ArrowRight': e.preventDefault(); navigatePlayer('next');   break;
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

  const handleSetScore = () => {
    let score = displayScoreRef.current;
    if (isEditingRef.current) {
      const parsed = parseInt(inputValueRef.current, 10);
      if (!isNaN(parsed)) score = parsed;
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

  // --- Score circle — tap = keyboard, swipe ↕ = score change ---

  const handleScoreTouchStart = (e: React.TouchEvent) => {
    scoreTouchRef.current = { y: e.touches[0].clientY, x: e.touches[0].clientX };
    swipeOccurredRef.current = false;
  };

  const handleScoreTouchEnd = (e: React.TouchEvent) => {
    if (!scoreTouchRef.current) return;
    const dy = scoreTouchRef.current.y - e.changedTouches[0].clientY;
    const dx = Math.abs(scoreTouchRef.current.x - e.changedTouches[0].clientX);
    scoreTouchRef.current = null;
    if (Math.abs(dy) > 40 && Math.abs(dy) > dx) {
      swipeOccurredRef.current = true;
      applyDelta(dy > 0 ? 1 : -1);
    }
  };

  // Synchronous focus — input is always in DOM; no setTimeout needed
  const handleScoreCircleClick = () => {
    if (swipeOccurredRef.current) { swipeOccurredRef.current = false; return; }
    setIsEditing(true);
    inputRef.current?.focus();
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
      const parsed = parseInt(inputValueRef.current, 10);
      const final = isNaN(parsed) ? displayScoreRef.current : parsed;
      displayScoreRef.current = final;
      setDisplayScore(final);
      setInputValue(String(final));
      setIsEditing(false);
      inputRef.current?.blur();
      requestAnimationFrame(() => { flash(); onSetScore(final); });
    }
  };

  // --- Player nav swipe ←/→ with slide animation ---

  const navigatePlayer = (dir: 'prev' | 'next') => {
    setPlayerDir(dir === 'next' ? 'left' : 'right');
    setPlayerKey(k => k + 1);
    onNavigatePlayer(dir);
  };

  const handlePlayerTouchStart = (e: React.TouchEvent) => {
    playerTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handlePlayerTouchEnd = (e: React.TouchEvent) => {
    if (!playerTouchRef.current) return;
    const dx = playerTouchRef.current.x - e.changedTouches[0].clientX;
    const dy = Math.abs(playerTouchRef.current.y - e.changedTouches[0].clientY);
    playerTouchRef.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy)
      navigatePlayer(dx > 0 ? 'next' : 'prev');
  };

  // --- Hole nav swipe ←/→ ---

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

  const dealerIdx = (game.startDealerIndex + currentHole) % players.length;
  const dealerName = players[dealerIdx].name;

  const absScore = Math.abs(displayScore);
  const scoreDigits = absScore >= 100 ? 'text-5xl' : 'text-6xl';
  const visibleScore = isEditing && inputValue === '-' ? '−' : String(displayScore);
  const progress = ((currentHole + 1) / holesPlayed) * 100;

  return (
    <div
      className="h-screen bg-surface-0 flex flex-col"
      style={{ overflowY: 'auto', overscrollBehavior: 'none' }}
    >
      {/* Header */}
      <div className="px-4 pt-safe pb-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => setShowConfirm(true)}
          className="text-ink-secondary text-sm font-medium active:opacity-60 touch-manipulation"
        >
          ← Back
        </button>
        <p className="label-caps">
          Score<span className="text-accent">CARDS</span>
        </p>
        <button
          onClick={() => setShowScoreboard(true)}
          className="flex items-center gap-1.5 text-ink-secondary py-1.5 px-2.5 rounded-lg
                     bg-surface-3 border border-line-default active:bg-surface-4 touch-manipulation"
        >
          <BarChartIcon />
          <span className="text-xs font-medium">Board</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-surface-2 mx-4 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hole Navigation */}
      <div
        className="px-4 pt-5 pb-2 shrink-0"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleHoleTouchStart}
        onTouchEnd={handleHoleTouchEnd}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigateHole('prev')}
            disabled={currentHole === 0}
            className="w-14 h-14 rounded-xl bg-surface-2 border border-line-default text-ink-primary text-xl font-bold
                       flex items-center justify-center disabled:opacity-30 active:bg-surface-3 touch-manipulation"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="label-caps mb-0.5">Hole</p>
            <p className="text-ink-primary text-3xl font-bold tabular-nums">
              {currentHole + 1}
              <span className="text-ink-muted text-xl">/{holesPlayed}</span>
            </p>
            <p className="text-ink-muted text-xs mt-1">
              🃏 <span className="text-ink-secondary">{dealerName}</span> draws
            </p>
          </div>
          <button
            onClick={() => onNavigateHole('next')}
            disabled={currentHole === holesPlayed - 1}
            className="w-14 h-14 rounded-xl bg-surface-2 border border-line-default text-ink-primary text-xl font-bold
                       flex items-center justify-center disabled:opacity-30 active:bg-surface-3 touch-manipulation"
          >
            ›
          </button>
        </div>
      </div>

      {/* Player Navigation */}
      <div
        className="px-4 py-2 shrink-0"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handlePlayerTouchStart}
        onTouchEnd={handlePlayerTouchEnd}
      >
        <div className="flex items-center justify-between bg-surface-2 border border-line-subtle rounded-2xl px-4 py-3">
          <button
            onClick={() => navigatePlayer('prev')}
            className="w-12 h-12 rounded-xl bg-surface-3 border border-line-default text-ink-primary text-lg font-bold
                       flex items-center justify-center active:bg-surface-4 touch-manipulation"
          >
            ‹
          </button>
          <div className="text-center flex-1 px-2 min-w-0 overflow-hidden">
            <p className="label-caps mb-0.5">Player</p>
            <div
              key={playerKey}
              className={playerDir === 'left' ? 'animate-slide-left' : playerDir === 'right' ? 'animate-slide-right' : ''}
            >
              <p className="text-ink-primary text-2xl font-bold tracking-tight truncate">{currentPlayer.name}</p>
            </div>
            <p className="text-ink-tertiary text-xs mt-0.5 tabular-nums">
              {currentPlayerIndex + 1} / {players.length}
              <span className="text-ink-muted mx-1">·</span>
              total <span className="text-ink-secondary">{getTotal(currentPlayer.scores)}</span>
            </p>
          </div>
          <button
            onClick={() => navigatePlayer('next')}
            className="w-12 h-12 rounded-xl bg-surface-3 border border-line-default text-ink-primary text-lg font-bold
                       flex items-center justify-center active:bg-surface-4 touch-manipulation"
          >
            ›
          </button>
        </div>
      </div>

      {/* Score section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">

        {/* Score circle — always-in-DOM hidden input */}
        <div
          className={`w-44 h-44 rounded-full relative flex items-center justify-center
                      transition-all duration-200 cursor-pointer select-none ring-2 ring-inset ring-white/5 ${
            scoreFlash
              ? 'border-2 border-success bg-success/10 scale-105 animate-flash-ring'
              : isEditing
              ? 'border-2 border-accent/60 bg-surface-3 animate-pulse-ring'
              : 'border border-line-default'
          }`}
          style={{
            touchAction: 'none',
            background: scoreFlash || isEditing
              ? undefined
              : 'radial-gradient(circle at center, #232326, #18181b)',
          }}
          onTouchStart={handleScoreTouchStart}
          onTouchEnd={handleScoreTouchEnd}
          onClick={handleScoreCircleClick}
        >
          {/* Hidden always-in-DOM input — iOS requires element to exist for sync focus */}
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

          <span
            className={`font-bold tabular-nums select-none ${scoreDigits} ${
              scoreFlash ? 'text-success' : isEditing ? 'text-accent' : 'text-ink-primary'
            }`}
          >
            {visibleScore}
          </span>
        </div>

        {/* +/− sign-flip shown while editing; hint text otherwise */}
        <div className="flex items-center justify-center h-8">
          {isEditing ? (
            <button
              onPointerDown={(e) => { e.preventDefault(); flipSign(); }}
              className="px-5 py-1.5 rounded-full bg-surface-3 border border-line-default
                         text-ink-secondary text-sm font-semibold active:bg-surface-4 touch-manipulation"
            >
              +/− flip sign
            </button>
          ) : (
            <p className="text-ink-muted text-xs select-none">
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
            className="w-20 h-20 rounded-xl bg-surface-3 border border-line-default text-ink-primary text-3xl font-bold
                       flex items-center justify-center active:bg-surface-4 active:scale-[0.95]
                       select-none touch-manipulation transition-transform"
          >
            −
          </button>
          <button
            onPointerDown={() => startHold(1)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onClick={() => handleButtonClick(1)}
            className="w-20 h-20 rounded-xl bg-accent text-white text-3xl font-bold
                       flex items-center justify-center active:bg-red-600 active:scale-[0.95]
                       select-none touch-manipulation transition-transform"
          >
            +
          </button>
        </div>
      </div>

      {/* Set Score */}
      <div className="px-4 pb-2 shrink-0">
        <button
          onClick={handleSetScore}
          className="w-full py-5 bg-accent text-white font-semibold text-xl rounded-xl
                     active:bg-red-600 active:scale-[0.98] transition-all select-none touch-manipulation"
        >
          Set Score
        </button>
      </div>

      {/* Mini hole snapshot */}
      <div className="px-4 pb-safe shrink-0">
        <div className="card p-3">
          <p className="label-caps mb-2">Hole {currentHole + 1}</p>
          <div className="flex gap-2 flex-wrap">
            {players.map((p, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs tabular-nums ${
                  i === currentPlayerIndex
                    ? 'bg-accent-muted text-accent font-semibold'
                    : 'text-ink-tertiary'
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
