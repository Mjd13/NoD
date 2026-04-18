import { ActiveGame } from '../types';
import { getTotal } from '../utils/calculations';

interface Props {
  game: ActiveGame;
  displayScore: number;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
    </svg>
  );
}

export default function ScoreboardModal({ game, displayScore, onClose }: Props) {
  const { players, holesPlayed, currentHole, currentPlayerIndex } = game;

  const liveScores = players.map((p, origIndex) => {
    const scores = p.scores.map((s, hIdx) =>
      origIndex === currentPlayerIndex && hIdx === currentHole ? displayScore : s
    );
    return { name: p.name, origIndex, scores, total: getTotal(scores) };
  });

  const standings = [...liveScores].sort((a, b) => a.total - b.total);

  return (
    <div className="fixed inset-0 bg-surface-0/95 backdrop-blur-sm z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-10 pb-3 flex items-center justify-between shrink-0">
        <h2 className="text-ink-primary text-2xl font-bold tracking-tight">
          Live <span className="text-accent">Board</span>
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-surface-3 border border-line-default text-ink-secondary
                     flex items-center justify-center active:bg-surface-4 touch-manipulation"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        {/* Standings — featured card */}
        <div className="card-featured p-4">
          <p className="label-caps mb-3">Current Standings</p>
          {standings.map((p, rank) => (
            <div
              key={p.name}
              className={`flex items-center gap-3 py-2.5 ${rank < standings.length - 1 ? 'border-b border-line-subtle' : ''}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  rank === 0 ? 'bg-accent text-white' : 'bg-surface-4 text-ink-secondary'
                }`}
              >
                {rank + 1}
              </span>
              <span
                className={`flex-1 font-semibold text-base ${
                  p.origIndex === currentPlayerIndex ? 'text-accent' : 'text-ink-primary'
                }`}
              >
                {p.name}
                {p.origIndex === currentPlayerIndex && (
                  <span className="text-xs text-accent/60 ml-2">now</span>
                )}
              </span>
              <span
                className={`font-bold text-lg tabular-nums ${rank === 0 ? 'text-accent' : 'text-ink-secondary'}`}
              >
                {p.total}
              </span>
            </div>
          ))}
        </div>

        {/* Hole-by-hole table */}
        <div className="card p-4">
          <p className="label-caps mb-3">
            Hole by Hole — through hole {currentHole + 1}
          </p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="label-caps text-left pb-2 pr-3 sticky left-0 bg-surface-2 min-w-[56px]">
                    Player
                  </th>
                  {Array.from({ length: holesPlayed }, (_, i) => (
                    <th
                      key={i}
                      className={`pb-2 px-1.5 text-center font-medium min-w-[26px] ${
                        i === currentHole
                          ? 'text-accent'
                          : i < currentHole
                          ? 'text-ink-secondary'
                          : 'text-ink-muted'
                      }`}
                    >
                      {i + 1}
                    </th>
                  ))}
                  <th className="pb-2 pl-2 text-center text-ink-secondary font-bold whitespace-nowrap">Tot</th>
                </tr>
              </thead>
              <tbody>
                {liveScores.map((p) => (
                  <tr key={p.name}>
                    <td
                      className={`pr-3 py-1.5 font-medium whitespace-nowrap sticky left-0 bg-surface-2 ${
                        p.origIndex === currentPlayerIndex ? 'text-accent' : 'text-ink-secondary'
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
                              ? 'bg-accent-muted text-accent font-bold rounded'
                              : isFuture
                              ? 'text-ink-muted'
                              : s < 0
                              ? 'text-success font-bold'
                              : s >= 10
                              ? 'text-accent font-bold'
                              : 'text-ink-secondary'
                          }`}
                        >
                          {isFuture ? '—' : s}
                        </td>
                      );
                    })}
                    <td
                      className={`text-center py-1.5 pl-2 font-bold tabular-nums ${
                        p.origIndex === currentPlayerIndex ? 'text-accent' : 'text-ink-primary'
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
          className="w-full py-4 bg-accent text-white font-semibold text-lg rounded-xl
                     active:bg-red-600 active:scale-[0.98] transition-all touch-manipulation"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
}
