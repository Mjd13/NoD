import { useState } from 'react';
import { Game } from '../types';
import { formatDate, getTotal } from '../utils/calculations';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  games: Game[];
  onDeleteGame: (id: string) => void;
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export default function GameHistory({ games, onDeleteGame }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteGame(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 pb-24">
      {/* Header */}
      <div className="px-4 pt-safe pb-6">
        <h1 className="text-4xl font-black text-ink-primary tracking-tight">History</h1>
        <p className="text-ink-tertiary text-sm mt-1">
          {games.length} game{games.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-5 text-ink-muted">
            <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="22" x2="44" y2="22" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="30" x2="44" y2="30" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="38" x2="36" y2="38" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-ink-primary text-base font-semibold">No games yet</p>
          <p className="text-ink-tertiary text-sm mt-1">Complete and save a game to see it here.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {games.map((game, gameIndex) => {
            const isOpen = expanded.has(game.id);
            const isMostRecent = gameIndex === 0;
            const sortedPlayers = [...game.players]
              .map((p) => ({ ...p, total: getTotal(p.scores) }))
              .sort((a, b) => a.total - b.total);
            const winner = sortedPlayers[0];

            return (
              <div key={game.id} className={`${isMostRecent ? 'card-featured' : 'card'} overflow-hidden`}>
                {/* Card header */}
                <button
                  onClick={() => toggle(game.id)}
                  className="w-full p-4 flex items-start justify-between gap-3 active:brightness-110 transition-all"
                >
                  <div className="text-left flex-1">
                    <p className="text-ink-secondary text-sm font-medium">{formatDate(game.date)}</p>
                    <p className="text-ink-tertiary text-xs mt-0.5">{game.holesPlayed} Holes · {game.players.length} Players</p>
                    <p className="text-ink-primary text-sm mt-1.5 font-semibold">
                      {winner.name}
                      <span className="text-ink-tertiary font-normal"> — {winner.total} pts</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(game.id); }}
                      className="w-8 h-8 rounded-lg bg-surface-3 text-ink-tertiary flex items-center justify-center
                                 active:bg-accent-muted active:text-accent transition-colors touch-manipulation"
                    >
                      <CloseIcon />
                    </button>
                    <span className="text-ink-muted"><ChevronIcon open={isOpen} /></span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-line-subtle p-4">
                    <div className="flex flex-col gap-2 mb-3">
                      {sortedPlayers.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              i === 0 ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="flex-1 text-ink-secondary text-sm">{p.name}</span>
                          <span className={`font-bold text-sm tabular-nums ${i === 0 ? 'text-accent' : 'text-ink-secondary'}`}>
                            {p.total}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Hole scores table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="label-caps text-left pr-2 pb-1">Hole</th>
                            {Array.from({ length: game.holesPlayed }, (_, i) => (
                              <th key={i} className="text-ink-muted font-medium text-center w-7 pb-1">{i + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {game.players.map((p) => (
                            <tr key={p.name}>
                              <td className="text-ink-tertiary pr-2 py-0.5 whitespace-nowrap">{p.name}</td>
                              {p.scores.map((s, i) => (
                                <td
                                  key={i}
                                  className={`text-center py-0.5 tabular-nums ${s >= 10 ? 'text-accent font-bold' : 'text-ink-secondary'}`}
                                >
                                  {s}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Delete this game from history? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
