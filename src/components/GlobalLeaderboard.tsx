import { useGlobalLeaderboard } from '../hooks/useGlobalLeaderboard';
import { firebaseEnabled } from '../lib/firebase';

interface Props {
  displayName: string | null;
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="10" cy="12" r="5" />
      <path d="M7 7.5L5 2h10l-2 5.5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4 4a8 8 0 0112 0M16 16a8 8 0 01-12 0" />
      <path d="M16 4v4h-4M4 16v-4h4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 2.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5" />
      <line x1="2.5" y1="10" x2="17.5" y2="10" />
    </svg>
  );
}

export default function GlobalLeaderboard({ displayName }: Props) {
  const { entries, loading, error, refetch } = useGlobalLeaderboard();

  if (!firebaseEnabled) {
    return (
      <div className="min-h-screen bg-surface-0 pb-24">
        <div className="px-4 pt-safe pb-6">
          <h1 className="text-4xl font-black text-ink-primary tracking-tight">Global</h1>
          <p className="text-ink-tertiary text-sm mt-1">Worldwide leaderboard</p>
        </div>
        <div className="px-4">
          <div className="card-featured p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center mx-auto mb-4 text-accent">
              <GlobeIcon />
            </div>
            <h2 className="text-ink-primary font-bold text-lg mb-2">Setup Required</h2>
            <p className="text-ink-tertiary text-sm leading-relaxed mb-4">
              Add your Firebase keys to <span className="text-ink-secondary font-mono text-xs">.env</span> to enable the global leaderboard.
            </p>
            <div className="bg-surface-3 rounded-xl p-4 text-left">
              <p className="label-caps text-accent mb-2">3 steps</p>
              <ol className="text-ink-secondary text-sm space-y-2">
                <li>1. Create a project at <span className="text-ink-primary font-medium">console.firebase.google.com</span></li>
                <li>2. Enable Phone Auth + Firestore</li>
                <li>3. Add your config to <span className="text-ink-primary font-mono text-xs">.env</span></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 pb-24">
      <div className="px-4 pt-safe pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-ink-primary tracking-tight">Global</h1>
          <p className="text-ink-tertiary text-sm mt-1">
            {displayName
              ? <>Playing as <span className="text-ink-primary font-semibold">{displayName}</span></>
              : 'Worldwide leaderboard'}
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="mt-3 w-9 h-9 rounded-xl bg-surface-3 border border-line-default text-ink-secondary
                     flex items-center justify-center active:bg-surface-4 touch-manipulation
                     disabled:opacity-40 transition-opacity"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Your rank highlight */}
        {displayName && (() => {
          const me = entries.findIndex(e => e.displayName === displayName);
          if (me === -1) return null;
          const entry = entries[me];
          return (
            <div className="card-featured p-4">
              <p className="label-caps text-accent mb-3">Your Ranking</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-black text-white text-sm shrink-0">
                  #{me + 1}
                </div>
                <div className="flex-1">
                  <p className="text-ink-primary font-bold text-base">{entry.displayName}</p>
                  <p className="text-ink-tertiary text-xs">
                    {entry.wins} win{entry.wins !== 1 ? 's' : ''} · {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-ink-primary font-bold tabular-nums">{entry.bestScore}</p>
                  <p className="text-ink-muted text-xs">best</p>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 rounded-full bg-accent" />
            <h2 className="text-ink-primary font-semibold text-lg tracking-tight">Leaderboard</h2>
            {!loading && (
              <span className="ml-auto label-caps">{entries.length} players</span>
            )}
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-surface-3 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-surface-3 rounded animate-pulse w-1/2" />
                    <div className="h-2.5 bg-surface-3 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="h-3 w-8 bg-surface-3 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <p className="text-ink-tertiary text-sm">{error}</p>
              <button onClick={refetch} className="mt-3 text-accent text-sm font-medium">Try again</button>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center py-8">
              <div className="text-ink-muted mx-auto mb-3 flex justify-center"><MedalIcon /></div>
              <p className="text-ink-primary text-sm font-semibold">No games yet</p>
              <p className="text-ink-tertiary text-xs mt-1">Be the first on the global board!</p>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="flex flex-col">
              {entries.map((entry, i) => {
                const isMe = entry.displayName === displayName;
                const isFirst = i === 0;
                return (
                  <div
                    key={`${entry.uid}-${i}`}
                    className={`flex items-center gap-3 py-3 ${
                      i < entries.length - 1 ? 'border-b border-line-subtle' : ''
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isFirst ? 'bg-accent text-white'
                      : i === 1 ? 'bg-surface-4 text-ink-secondary'
                      : 'bg-surface-3 text-ink-tertiary'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isMe ? 'text-accent' : 'text-ink-primary'}`}>
                        {entry.displayName}
                        {isMe && <span className="text-xs text-accent/60 ml-1.5">you</span>}
                      </p>
                      <p className="text-ink-muted text-xs tabular-nums">
                        {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm tabular-nums ${isFirst ? 'text-accent' : 'text-ink-primary'}`}>
                        {entry.wins} <span className="text-ink-muted font-normal text-xs">wins</span>
                      </p>
                      <p className="text-ink-muted text-xs tabular-nums">best {entry.bestScore}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="text-ink-tertiary text-xs mb-1">Total Players</p>
              <p className="text-ink-primary text-2xl font-bold tabular-nums">{entries.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-ink-tertiary text-xs mb-1">Total Games</p>
              <p className="text-ink-primary text-2xl font-bold tabular-nums">
                {entries.reduce((sum, e) => sum + e.gamesPlayed, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
