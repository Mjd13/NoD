import { ActiveGame } from '../types';
import { getTotal, getWinnerName } from '../utils/calculations';

interface Props {
  game: ActiveGame;
  onSave: () => void;
  onNewGame: () => void;
}

export default function GameSummary({ game, onSave, onNewGame }: Props) {
  const { players, holesPlayed } = game;
  const winnerName = getWinnerName({ ...game, id: '', date: 0, completed: true });

  const sorted = [...players]
    .map((p) => ({ ...p, total: getTotal(p.scores) }))
    .sort((a, b) => a.total - b.total);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white">
          Game <span className="text-red-500">Summary</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">{holesPlayed} holes · {players.length} players</p>
      </div>

      {/* Winner Banner */}
      <div className="mx-4 mb-4 bg-red-500/15 border-2 border-red-500 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-4xl">🏆</div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest">Winner</p>
          <p className="text-white text-2xl font-bold">{winnerName}</p>
          <p className="text-red-400 text-sm">
            {getTotal(players.find((p) => p.name === winnerName)!.scores)} strokes
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 mb-4">
        <div className="border-2 border-red-500 rounded-2xl p-4 bg-[#1a1a1a]">
          <h2 className="text-white font-bold text-lg mb-4">Final Scores</h2>
          <div className="flex flex-col gap-2">
            {sorted.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                  p.name === winnerName ? 'bg-red-500/10 border border-red-500/30' : 'bg-[#111]'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    i === 0 ? 'bg-red-500 text-white' : 'bg-[#2a2a2a] text-gray-400'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-white font-semibold">{p.name}</span>
                <span className={`text-lg font-bold ${i === 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {p.total}
                </span>
              </div>
            ))}
          </div>

          {/* Hole-by-hole breakdown toggle */}
          <details className="mt-4">
            <summary className="text-gray-500 text-sm cursor-pointer select-none py-1">
              Show hole-by-hole scores
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-gray-500 font-medium text-left pb-2 pr-2">Player</th>
                    {Array.from({ length: holesPlayed }, (_, i) => (
                      <th key={i} className="text-gray-500 font-medium pb-2 px-1 text-center w-8">
                        {i + 1}
                      </th>
                    ))}
                    <th className="text-gray-400 font-bold pb-2 pl-2 text-center">Tot</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.name}>
                      <td className="text-gray-300 pr-2 py-1 font-medium whitespace-nowrap">{p.name}</td>
                      {p.scores.map((s, i) => (
                        <td
                          key={i}
                          className={`text-center px-1 py-1 ${
                            s >= 10 ? 'text-red-400 font-bold' : 'text-gray-400'
                          }`}
                        >
                          {s}
                        </td>
                      ))}
                      <td className="text-white font-bold text-center pl-2 py-1">{p.total}</td>
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
          className="w-full py-4 bg-red-500 text-white font-bold text-lg rounded-2xl active:bg-red-600 flex items-center justify-center gap-2"
        >
          <span>💾</span>
          Save Game
        </button>
        <button
          onClick={onNewGame}
          className="w-full py-4 bg-[#1a1a1a] text-gray-300 font-semibold text-base rounded-2xl active:bg-[#2a2a2a] border border-[#2a2a2a]"
        >
          Start New Game
        </button>
      </div>
    </div>
  );
}
