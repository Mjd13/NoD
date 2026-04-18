import { useMemo } from 'react';
import { ActiveGame } from '../types';
import { getTotal, getWinnerName } from '../utils/calculations';

interface Props {
  game: ActiveGame;
  onSave: () => void;
  onNewGame: () => void;
}

function TrophySVG() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 15v2m0 0H9m3 0h3" />
      <path d="M6 3h12v6a6 6 0 01-12 0V3z" />
      <path d="M6 6H4a2 2 0 000 5h2M18 6h2a2 2 0 010 5h-2" />
    </svg>
  );
}

export default function GameSummary({ game, onSave, onNewGame }: Props) {
  const { players, holesPlayed } = game;
  const winnerName = getWinnerName({ ...game, id: '', date: 0, completed: true });

  const sorted = [...players]
    .map((p) => ({ ...p, total: getTotal(p.scores) }))
    .sort((a, b) => a.total - b.total);

  const confetti = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      color: i % 3 === 0 ? '#EF4444' : i % 3 === 1 ? '#ffffff' : '#52525b',
      tx: `translateX(${(Math.random() - 0.5) * 180}px)`,
      ty: `translateY(${40 + Math.random() * 100}px)`,
      r: `rotate(${Math.random() * 360}deg)`,
      delay: `${Math.random() * 0.3}s`,
      size: `${4 + Math.random() * 5}px`,
    })), []
  );

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-4xl font-black text-ink-primary tracking-tight">Summary</h1>
        <p className="text-ink-tertiary text-sm mt-1">{holesPlayed} holes · {players.length} players</p>
      </div>

      {/* Winner Banner — featured card with glow + confetti */}
      <div className="mx-4 mb-4 card-featured p-5 relative overflow-hidden">
        {/* Radial red glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12)_0%,transparent_70%)] pointer-events-none" />
        {/* Confetti dots */}
        {confetti.map((dot) => (
          <div
            key={dot.id}
            className="absolute top-1/2 left-1/2 rounded-full animate-confetti-fall pointer-events-none"
            style={{
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
              '--tx': dot.tx,
              '--ty': dot.ty,
              '--r': dot.r,
              animationDelay: dot.delay,
            } as React.CSSProperties}
          />
        ))}
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center shrink-0 text-accent">
            <TrophySVG />
          </div>
          <div>
            <p className="label-caps text-accent mb-1">Winner</p>
            <p className="text-ink-primary text-2xl font-bold tracking-tight">{winnerName}</p>
            <p className="text-ink-secondary text-sm">
              {getTotal(players.find((p) => p.name === winnerName)!.scores)} strokes
            </p>
          </div>
        </div>
      </div>

      {/* Final Scores */}
      <div className="px-4 mb-4">
        <div className="card p-4">
          <h2 className="text-ink-primary font-semibold text-lg tracking-tight mb-4">Final Scores</h2>
          <div className="flex flex-col gap-2">
            {sorted.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                  p.name === winnerName ? 'bg-accent-muted border border-accent-strong' : 'bg-surface-3'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    i === 0 ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-ink-primary font-semibold">{p.name}</span>
                <span className={`text-lg font-bold tabular-nums ${i === 0 ? 'text-accent' : 'text-ink-secondary'}`}>
                  {p.total}
                </span>
              </div>
            ))}
          </div>

          {/* Hole-by-hole breakdown toggle */}
          <details className="mt-4">
            <summary className="text-ink-tertiary text-sm cursor-pointer select-none py-1">
              Show hole-by-hole scores
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="label-caps text-left pb-2 pr-2">Player</th>
                    {Array.from({ length: holesPlayed }, (_, i) => (
                      <th key={i} className="text-ink-muted font-medium pb-2 px-1 text-center w-8">
                        {i + 1}
                      </th>
                    ))}
                    <th className="text-ink-secondary font-bold pb-2 pl-2 text-center">Tot</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.name}>
                      <td className="text-ink-secondary pr-2 py-1 font-medium whitespace-nowrap">{p.name}</td>
                      {p.scores.map((s, i) => (
                        <td
                          key={i}
                          className={`text-center px-1 py-1 tabular-nums ${
                            s >= 10 ? 'text-accent font-bold' : 'text-ink-tertiary'
                          }`}
                        >
                          {s}
                        </td>
                      ))}
                      <td className="text-ink-primary font-bold text-center pl-2 py-1 tabular-nums">{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-auto pb-10 flex flex-col gap-3">
        <button
          onClick={onSave}
          className="w-full py-4 text-white font-semibold text-lg rounded-xl
                     active:bg-red-600 active:scale-[0.98] transition-all touch-manipulation btn-shimmer"
        >
          Save Game
        </button>
        <button
          onClick={onNewGame}
          className="w-full py-4 bg-surface-3 text-ink-secondary font-semibold text-base rounded-xl
                     active:bg-surface-4 active:scale-[0.97] transition-all border border-line-default touch-manipulation"
        >
          Start New Game
        </button>
      </div>
    </div>
  );
}
