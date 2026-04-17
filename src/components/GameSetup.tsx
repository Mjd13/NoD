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

  // Sync playerNames array length with playerCount
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
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Score<span className="text-red-500">CARDs</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Golf Card Game Tracker</p>
      </div>

      <div className="flex-1 px-4 flex flex-col gap-4">
        {/* Quick Start */}
        {lastSetup && (
          <button
            onClick={handleQuickStart}
            className="w-full py-3 px-4 rounded-xl border-2 border-red-500/50 bg-red-500/10 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 active:opacity-70"
          >
            <span>⚡</span>
            Quick Start — {lastSetup.playerNames.join(', ')} · {lastSetup.holes} holes
          </button>
        )}

        {/* Game Settings */}
        <div className="border-2 border-red-500 rounded-2xl p-4 bg-[#1a1a1a]">
          <h2 className="text-white font-bold text-lg mb-4">Game Settings</h2>

          {/* Player Count */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Number of Players</p>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm transition-colors ${
                    playerCount === n
                      ? 'bg-red-500 text-white'
                      : 'bg-[#2a2a2a] text-gray-300 active:bg-[#3a3a3a]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Hole Count */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Game Length</p>
            <div className="flex gap-2">
              {([9, 18] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHoles(h)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                    holes === h
                      ? 'bg-red-500 text-white'
                      : 'bg-[#2a2a2a] text-gray-300 active:bg-[#3a3a3a]'
                  }`}
                >
                  {h} Holes
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Player Names */}
        <div className="border-2 border-red-500 rounded-2xl p-4 bg-[#1a1a1a]">
          <h2 className="text-white font-bold text-lg mb-4">Player Names</h2>
          <div className="flex flex-col gap-3">
            {playerNames.map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateName(i, e.target.value)}
                    placeholder={`Player ${i + 1}`}
                    className={`w-full bg-[#111] text-white px-3 py-2.5 rounded-xl text-base border ${
                      errors[i] ? 'border-red-500 bg-red-500/5' : 'border-[#444] focus:border-red-500'
                    } outline-none transition-colors`}
                  />
                  {errors[i] && <p className="text-red-500 text-sm mt-1">{errors[i]}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 active:opacity-80 transition-colors mt-2"
        >
          <span>▶</span>
          Start Game
        </button>
      </div>
    </div>
  );
}
