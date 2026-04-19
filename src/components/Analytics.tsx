import { Game } from '../types';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface Props {
  games: Game[];
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 13v2m0 0H7m3 0h3" />
      <path d="M5 3h10v5a5 5 0 01-10 0V3z" />
      <path d="M5 5H3a2 2 0 000 4h2M15 5h2a2 2 0 010 4h-2" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5">
      <circle cx="10" cy="10" r="7.5" /><circle cx="10" cy="10" r="4" /><circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 18c-4 0-6-2.5-6-5 0-2 1-3.5 2.5-5C7.5 10 8 11 8 11s.5-3 3-5.5c0 0 0 2 2 3.5 1 .8 3 2 3 4.5 0 2.5-2 4.5-6 4.5z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" />
    </svg>
  );
}

const achievementIconComponents: Record<string, React.ReactNode> = {
  'Biggest Win':             <TrophyIcon />,
  'Lowest Round':            <TargetIcon />,
  'Highest Round':           <FlameIcon />,
  'Most Double-Digit Holes': <BoltIcon />,
};

export default function Analytics({ games }: Props) {
  const { leaderboard, achievements } = useLeaderboard(games);
  const completedCount = games.filter((g) => g.completed).length;

  return (
    <div className="min-h-screen bg-surface-0 pb-24">
      {/* Header */}
      <div className="px-4 pt-safe pb-6">
        <h1 className="text-4xl font-black text-ink-primary tracking-tight">Stats</h1>
        <p className="text-ink-tertiary text-sm mt-1">
          {completedCount} completed game{completedCount !== 1 ? 's' : ''} tracked
        </p>
      </div>

      {completedCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-5 text-ink-muted">
            <rect x="8"  y="38" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="26" y="26" width="12" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="44" y="14" width="12" height="42" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-ink-primary text-base font-semibold">No data yet</p>
          <p className="text-ink-tertiary text-sm mt-1">Save a completed game to see analytics.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4">
          {/* Leaderboard — featured card (primary content on this screen) */}
          <div className="card-featured p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-accent" />
              <h2 className="text-ink-primary font-semibold text-lg tracking-tight">Leaderboard</h2>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-ink-tertiary text-sm">No wins recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.playerName}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                      entry.rank === 1 ? 'bg-accent-muted border border-accent-strong' : 'bg-surface-3'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        entry.rank === 1
                          ? 'bg-accent text-white'
                          : entry.rank === 2
                          ? 'bg-surface-4 text-ink-secondary'
                          : 'bg-surface-3 text-ink-tertiary'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span className="flex-1 text-ink-primary font-semibold">{entry.playerName}</span>
                    <span className={`font-bold text-sm tabular-nums ${entry.rank === 1 ? 'text-accent' : 'text-ink-secondary'}`}>
                      {entry.wins} win{entry.wins !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notable Achievements */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-accent" />
              <h2 className="text-ink-primary font-semibold text-lg tracking-tight">Notable Achievements</h2>
            </div>
            {achievements.length === 0 ? (
              <p className="text-ink-tertiary text-sm">No achievements yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {achievements.map((a) => (
                  <div key={a.title} className="flex items-start gap-3 px-3 py-3 rounded-xl bg-surface-3">
                    <div className="text-ink-secondary shrink-0 mt-0.5">
                      {achievementIconComponents[a.title] ?? <TrophyIcon />}
                    </div>
                    <div>
                      <p className="label-caps mb-0.5">{a.title}</p>
                      <p className="text-ink-primary font-bold text-base">{a.playerName}</p>
                      <p className="text-accent text-sm">{a.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {leaderboard.length > 0 && (
            <div className="card p-4">
              <h2 className="label-caps mb-3">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-3 rounded-xl p-3">
                  <p className="text-ink-tertiary text-xs mb-1">Total Games</p>
                  <p className="text-ink-primary text-2xl font-bold tabular-nums">{completedCount}</p>
                </div>
                <div className="bg-surface-3 rounded-xl p-3">
                  <p className="text-ink-tertiary text-xs mb-1">Unique Players</p>
                  <p className="text-ink-primary text-2xl font-bold tabular-nums">{leaderboard.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
