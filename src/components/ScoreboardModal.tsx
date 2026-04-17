import { ActiveGame } from '../types';
import { getTotal } from '../utils/calculations';

interface Props {
  game: ActiveGame;
  displayScore: number;
  onClose: () => void;
}

export default function ScoreboardModal({ game, displayScore, onClose }: Props) {
  const { players, holesPlayed, currentHole, currentPlayerIndex } = game;

  // Build live scores — substitute the current editing value for the active cell
  const liveScores = players.map((p, origIndex) => {
    const scores = p.scores.map((s, hIdx) =>
      origIndex === currentPlayerIndex && hIdx === currentHole ? displayScore : s
    );
    return { name: p.name, origIndex, scores, total: getTotal(scores) };
  });

  const standings = [...liveScores].sort((a, b) => a.total - b.total);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/97 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between shrink-0">
        <h2 className="text-white text-2xl font-bold">
          Live <span className="text-red-500">Board</span>
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#2a2a2a] text-gray-300 text-lg flex items-center justify-center active:bg-[#3a3a3a]"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        {/* Standings */}
        <div className="border-2 border-red-500 rounded-2xl p-4 bg-[#1a1a1a]">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Current Standings</p>
          {standings.map((p, rank) => (
            <div
              key={p.name}
              className={`flex items-center gap-3 py-2.5 ${rank < standings.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  rank === 0 ? 'bg-red-500 text-white' : 'bg-[#2a2a2a] text-gray-400'
                }`}
              >
                {rank + 1}
              </span>
              <span
                className={`flex-1 font-semibold text-base ${
                  p.origIndex === currentPlayerIndex ? 'text-red-400' : 'text-white'
                }`}
              >
                {p.name}
                {p.origIndex === currentPlayerIndex && (
                  <span className="text-xs text-red-500/70 ml-2">now</span>
                )}
              </span>
              <span
                className={`font-bold text-lg tabular-nums ${rank === 0 ? 'text-red-400' : 'text-gray-200'}`}
              >
                {p.total}
              </span>
            </div>
          ))}
        </div>

        {/* Hole-by-hole table */}
        <div className="border border-[#2a2a2a] rounded-2xl p-4 bg-[#1a1a1a]">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
            Hole by Hole — through hole {currentHole + 1}
          </p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="text-gray-500 font-medium text-left pb-2 pr-3 sticky left-0 bg-[#1a1a1a] min-w-[56px]">
                    Player
                  </th>
                  {Array.from({ length: holesPlayed }, (_, i) => (
                    <th
                      key={i}
                      className={`pb-2 px-1.5 text-center font-medium min-w-[26px] ${
                        i === currentHole
                          ? 'text-red-500'
                          : i < currentHole
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </th>
                  ))}
                  <th className="pb-2 pl-2 text-center text-gray-300 font-bold whitespace-nowrap">Tot</th>
                </tr>
              </thead>
              <tbody>
                {liveScores.map((p) => (
                  <tr key={p.name}>
                    <td
                      className={`pr-3 py-1.5 font-medium whitespace-nowrap sticky left-0 bg-[#1a1a1a] ${
                        p.origIndex === currentPlayerIndex ? 'text-red-400' : 'text-gray-300'
                      }`}
                    >
                      {p.name}
                    </td>
                    {p.scores.map((s, hIdx) => {
                      const isActiveCell =
                        p.origIndex === currentPlayerIndex && hIdx === currentHole;
                      const isFuture = hIdx > currentHole;
                      return (
                        <td
                          key={hIdx}
                          className={`text-center py-1.5 px-1.5 tabular-nums ${
                            isActiveCell
                              ? 'bg-red-500/20 text-red-400 font-bold rounded'
                              : isFuture
                              ? 'text-gray-700'
                              : s < 0
                              ? 'text-green-400 font-bold'
                              : s >= 10
                              ? 'text-red-400 font-bold'
                              : 'text-gray-300'
                          }`}
                        >
                          {isFuture ? '—' : s}
                        </td>
                      );
                    })}
                    <td
                      className={`text-center py-1.5 pl-2 font-bold tabular-nums ${
                        p.origIndex === currentPlayerIndex ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {p.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-4 pb-10 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-4 bg-red-500 text-white font-bold text-lg rounded-2xl active:bg-red-600"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
}
