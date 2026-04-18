import { useState, useEffect } from 'react';
import { loadLastSetup, saveLastSetup } from '../utils/storage';

interface Props {
  onStartGame: (playerNames: string[], holes: 9 | 18) => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

export default function GameSetup({ onStartGame }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [holes, setHoles] = useState<9 | 18>(9);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<string[]>([]);
  const lastSetup = loadLastSetup();

  useEffect(() => {
    setPlayerNames((prev) => {
      if (prev.length === playerCount) return prev;
      if (playerCount > prev.length) {
        return [...prev, ...new Array(playerCount - prev.length).fill('')];
      }
      return prev.slice(0, playerCount);
    });
  }, [playerCount]);

  const handleQuickStart = () => {
    if (!lastSetup) return;
    setPlayerCount(lastSetup.playerNames.length);
    setHoles(lastSetup.holes);
    setPlayerNames(lastSetup.playerNames);
  };

  const handleStart = () => {
    const trimmed = playerNames.map((n) => n.trim());
    const errs = trimmed.map((n) => (n.length === 0 ? 'Name required' : ''));
    setErrors(errs);
    if (errs.some((e) => e)) return;
    saveLastSetup({ playerNames: trimmed, holes });
    onStartGame(trimmed, holes);
  };

  const updateName = (i: number, val: string) => {
    setPlayerNames((prev) => prev.map((n, idx) => (idx === i ? val : n)));
    setErrors((prev) => prev.map((e, idx) => (idx === i ? '' : e)));
  };

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-4xl font-black text-ink-primary tracking-tight">
          Scorecards<sup className="text-accent text-lg font-bold ml-0.5 align-super">PRO</sup>
        </h1>
        <p className="text-ink-tertiary text-sm mt-1">Golf Card Game Tracker</p>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4">
        {/* Quick Start */}
        {lastSetup && (
          <button
            onClick={handleQuickStart}
            className="w-full p-4 card-featured text-left active:brightness-110 active:scale-[0.98] transition-all touch-manipulation"
          >
            <p className="label-caps text-accent mb-1">Quick Start</p>
            <p className="text-ink-primary text-sm font-medium">
              {lastSetup.playerNames.join(', ')} · {lastSetup.holes} holes
            </p>
          </button>
        )}

        {/* Game Settings */}
        <div className="card p-4">
          <h2 className="text-ink-primary font-semibold text-lg tracking-tight mb-4">Game Settings</h2>

          {/* Player Count */}
          <div className="mb-4">
            <p className="label-caps mb-2">Number of Players</p>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`w-12 h-12 rounded-xl font-semibold text-sm transition-all touch-manipulation ${
                    playerCount === n
                      ? 'bg-accent text-white active:bg-red-600'
                      : 'bg-surface-3 text-ink-secondary border border-line-default active:bg-surface-4'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Hole Count — segmented control */}
          <div>
            <p className="label-caps mb-2">Game Length</p>
            <div className="flex bg-surface-3 rounded-xl p-1 gap-1">
              {([9, 18] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHoles(h)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all touch-manipulation ${
                    holes === h
                      ? 'bg-accent text-white'
                      : 'text-ink-secondary active:text-ink-primary'
                  }`}
                >
                  {h} Holes
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Player Names */}
        <div className="card p-4">
          <h2 className="text-ink-primary font-semibold text-lg tracking-tight mb-4">Player Names</h2>
          <div className="flex flex-col gap-3">
            {playerNames.map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-4 flex items-center justify-center shrink-0">
                  <span className="text-ink-secondary text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateName(i, e.target.value)}
                    placeholder={`Player ${i + 1}`}
                    className={`w-full bg-surface-3 text-ink-primary px-3 py-2.5 rounded-xl text-base border ${
                      errors[i]
                        ? 'border-accent bg-accent-muted'
                        : 'border-line-default focus:border-accent'
                    } outline-none transition-colors`}
                  />
                  {errors[i] && <p className="text-accent text-sm mt-1">{errors[i]}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game */}
        <button
          onClick={handleStart}
          className="w-full py-4 text-white font-semibold text-lg rounded-xl
                     active:bg-red-600 active:scale-[0.98] transition-all mt-2 touch-manipulation btn-shimmer"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
