import { useState } from 'react';
import { Game } from '../types';
import { formatDate, getTotal } from '../utils/calculations';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  games: Game[];
  onDeleteGame: (id: string) => void;
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
    <div className="min-h-screen bg-[#0f0f0f] pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white">
          Game <span className="text-red-500">HISTORY</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {games.length} game{games.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-400 text-lg font-medium">No games yet</p>
          <p className="text-gray-600 text-sm mt-1">Complete and save a game to see it here.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {games.map((game) => {
            const isOpen = expanded.has(game.id);
            const sortedPlayers = [...game.players]
              .map((p) => ({ ...p, total: getTotal(p.scores) }))
              .sort((a, b) => a.total - b.total);
            const winner = sortedPlayers[0];

            return (
              <div key={game.id} className="border-2 border-red-500 rounded-2xl bg-[#1a1a1a] overflow-hidden">
                {/* Card header */}
                <button
                  onClick={() => toggle(game.id)}
                  className="w-full p-4 flex items-start justify-between gap-3 active:bg-[#222] transition-colors"
                >
                  <div className="text-left flex-1">
                    <p className="text-red-500 text-sm font-semibold">{formatDate(game.date)}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{game.holesPlayed} Holes · {game.players.length} Players</p>
                    <p className="text-white text-sm mt-1.5 font-medium">
                      🏆 {winner.name} — {winner.total} pts
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(game.id); }}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-xs active:bg-red-500/20"
                    >
                      ✕
                    </button>
                    <span className="text-gray-500 text-lg">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-[#2a2a2a] p-4">
                    <div className="flex flex-col gap-2 mb-3">
                      {sortedPlayers.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              i === 0 ? 'bg-red-500 text-white' : 'bg-[#2a2a2a] text-gray-400'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="flex-1 text-gray-200 text-sm">{p.name}</span>
                          <span className={`font-bold text-sm ${i === 0 ? 'text-red-400' : 'text-gray-300'}`}>
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
                            <th className="text-gray-600 font-medium text-left pr-2 pb-1">Hole</th>
                            {Array.from({ length: game.holesPlayed }, (_, i) => (
                              <th key={i} className="text-gray-600 font-medium text-center w-7 pb-1">{i + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {game.players.map((p) => (
                            <tr key={p.name}>
                              <td className="text-gray-400 pr-2 py-0.5 whitespace-nowrap">{p.name}</td>
                              {p.scores.map((s, i) => (
                                <td
                                  key={i}
                                  className={`text-center py-0.5 ${s >= 10 ? 'text-red-400 font-bold' : 'text-gray-400'}`}
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
