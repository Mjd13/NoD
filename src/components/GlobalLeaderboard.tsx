import { useGlobalLeaderboard } from '../hooks/useGlobalLeaderboard';
import { firebaseEnabled } from '../lib/firebase';
import { GlobalEntry } from '../lib/firebase';

interface Props {
  displayName: string | null;
  skippedAuth: boolean;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 2.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5" />
      <line x1="2.5" y1="10" x2="17.5" y2="10" />
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

// ─── Record tile ──────────────────────────────────────────────────────────────

function RecordTile({
  icon, label, name, value, accent = false,
}: {
  icon: string;
  label: string;
  name: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3.5 flex flex-col gap-1.5 ${accent ? 'bg-accent/10 border border-accent/25' : 'bg-surface-3 border border-line-default'}`}>
      <span className="text-xl leading-none">{icon}</span>
      <p className="label-caps text-ink-muted">{label}</p>
      <p className="text-ink-primary font-bold text-sm leading-tight truncate">{name}</p>
      <p className={`text-base font-black tabular-nums ${accent ? 'text-accent' : 'text-ink-secondary'}`}>{value}</p>
    </div>
  );
}

// ─── Player row ───────────────────────────────────────────────────────────────

function PlayerRow({
  entry, rank, isMe,
}: {
  entry: GlobalEntry;
  rank: number;
  isMe: boolean;
}) {
  const rankStyle =
    rank === 1 ? 'bg-accent text-white' :
    rank === 2 ? 'bg-zinc-500 text-white' :
    rank === 3 ? 'bg-amber-700 text-white' :
    'bg-surface-3 text-ink-tertiary';

  return (
    <div className={`flex items-center gap-3 py-3 ${rank < 50 ? 'border-b border-line-subtle' : ''} ${isMe ? 'opacity-100' : ''}`}>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankStyle}`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isMe ? 'text-accent' : 'text-ink-primary'}`}>
          {entry.displayName}
          {isMe && <span className="text-xs text-accent/60 ml-1.5 font-normal">you</span>}
        </p>
        <p className="text-ink-muted text-xs tabular-nums">
          {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''}
          {entry.avgScore ? ` · avg ${entry.avgScore}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-black text-base tabular-nums ${rank === 1 ? 'text-accent' : 'text-ink-primary'}`}>
          {entry.wins}
          <span className="text-ink-muted font-normal text-xs ml-0.5">W</span>
        </p>
        {entry.bestScore != null && (
          <p className="text-ink-muted text-xs tabular-nums">best {entry.bestScore}</p>
        )}
      </div>
    </div>
  );
}

// ─── Empty / setup states ─────────────────────────────────────────────────────

function SetupRequired() {
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

function EmptyBoard({ isGuest }: { isGuest: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-surface-3 flex items-center justify-center">
          <span className="text-5xl">🏆</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface-0 flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
      </div>
      <h2 className="text-ink-primary font-bold text-xl mb-2">No one's here yet</h2>
      <p className="text-ink-tertiary text-sm leading-relaxed max-w-xs">
        {isGuest
          ? 'Sign in and complete a game to claim the top spot — it could be yours.'
          : 'Be the first to finish a game and stake your claim at the top of the board.'}
      </p>
    </div>
  );
}

// ─── Record holders ───────────────────────────────────────────────────────────

function RecordHall({ entries }: { entries: GlobalEntry[] }) {
  if (entries.length === 0) return null;

  const champion = entries[0];
  const mostGames = [...entries].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0];
  const bestRound = [...entries].filter(e => e.bestScore != null).sort((a, b) => a.bestScore - b.bestScore)[0];
  const bestHoleHolder = [...entries].filter(e => e.bestHole != null).sort((a, b) => (a.bestHole ?? 99) - (b.bestHole ?? 99))[0];
  const worstHoleHolder = [...entries].filter(e => e.worstHole != null).sort((a, b) => (b.worstHole ?? 0) - (a.worstHole ?? 0))[0];

  const tiles = [
    {
      icon: '👑',
      label: 'Champion',
      name: champion.displayName,
      value: `${champion.wins} win${champion.wins !== 1 ? 's' : ''}`,
      accent: true,
    },
    bestRound ? {
      icon: '🎯',
      label: 'Best Round',
      name: bestRound.displayName,
      value: `${bestRound.bestScore} pts`,
      accent: false,
    } : null,
    bestHoleHolder ? {
      icon: '⚡',
      label: 'Best Hole',
      name: bestHoleHolder.displayName,
      value: `${bestHoleHolder.bestHole} on 1 hole`,
      accent: false,
    } : null,
    {
      icon: '🔥',
      label: 'Iron Man',
      name: mostGames.displayName,
      value: `${mostGames.gamesPlayed} game${mostGames.gamesPlayed !== 1 ? 's' : ''}`,
      accent: false,
    },
    worstHoleHolder ? {
      icon: '😬',
      label: 'Big Swing',
      name: worstHoleHolder.displayName,
      value: `${worstHoleHolder.worstHole} on 1 hole`,
      accent: false,
    } : null,
  ].filter(Boolean) as { icon: string; label: string; name: string; value: string; accent: boolean }[];

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-4 rounded-full bg-accent" />
        <h2 className="text-ink-primary font-semibold tracking-tight">Record Holders</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map((tile) => (
          <RecordTile key={tile.label} {...tile} />
        ))}
      </div>
    </div>
  );
}

// ─── Your stats card ──────────────────────────────────────────────────────────

function YourStats({ entry, rank }: { entry: GlobalEntry; rank: number }) {
  return (
    <div className="px-4 mb-4">
      <div className="card-featured p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="label-caps text-accent mb-0.5">Your Stats</p>
            <p className="text-ink-primary font-bold text-lg">{entry.displayName}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm">#{rank}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-accent text-xl font-black tabular-nums">{entry.wins}</p>
            <p className="text-ink-muted text-xs mt-0.5">Wins</p>
          </div>
          <div>
            <p className="text-ink-primary text-xl font-black tabular-nums">{entry.gamesPlayed}</p>
            <p className="text-ink-muted text-xs mt-0.5">Games</p>
          </div>
          <div>
            <p className="text-ink-primary text-xl font-black tabular-nums">{entry.bestScore ?? '—'}</p>
            <p className="text-ink-muted text-xs mt-0.5">Best</p>
          </div>
          <div>
            <p className="text-ink-primary text-xl font-black tabular-nums">{entry.avgScore ?? '—'}</p>
            <p className="text-ink-muted text-xs mt-0.5">Avg</p>
          </div>
        </div>
        {(entry.bestHole != null || entry.worstHole != null) && (
          <div className="mt-3 pt-3 border-t border-line-subtle flex gap-4 text-xs">
            {entry.bestHole != null && (
              <span className="text-ink-tertiary">⚡ Best hole: <span className="text-ink-primary font-semibold">{entry.bestHole}</span></span>
            )}
            {entry.worstHole != null && (
              <span className="text-ink-tertiary">😬 Biggest hole: <span className="text-ink-primary font-semibold">{entry.worstHole}</span></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Guest nudge ──────────────────────────────────────────────────────────────

function GuestNudge() {
  return (
    <div className="px-4 mb-4">
      <div className="card p-4 flex items-center gap-3">
        <span className="text-2xl shrink-0">🕵️</span>
        <div>
          <p className="text-ink-primary text-sm font-semibold">Playing as guest</p>
          <p className="text-ink-tertiary text-xs mt-0.5">Sign in to appear on the global board and track your stats across devices.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GlobalLeaderboard({ displayName, skippedAuth }: Props) {
  const { entries, loading, error, refetch } = useGlobalLeaderboard();

  if (!firebaseEnabled) return <SetupRequired />;

  const meIndex = displayName ? entries.findIndex(e => e.displayName === displayName) : -1;
  const meEntry = meIndex !== -1 ? entries[meIndex] : null;
  const isGuest = !displayName || skippedAuth;
  const totalGames = entries.reduce((sum, e) => sum + e.gamesPlayed, 0);

  return (
    <div className="min-h-screen bg-surface-0 pb-24">
      {/* Header */}
      <div className="px-4 pt-safe pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-ink-primary tracking-tight">Global</h1>
          <p className="text-ink-tertiary text-sm mt-1">
            {entries.length > 0
              ? `${entries.length} player${entries.length !== 1 ? 's' : ''} · ${totalGames} game${totalGames !== 1 ? 's' : ''} played`
              : 'Worldwide leaderboard'}
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="mt-3 w-9 h-9 rounded-xl bg-surface-3 border border-line-default text-ink-secondary
                     flex items-center justify-center active:bg-surface-4 touch-manipulation
                     disabled:opacity-40 transition-opacity"
          aria-label="Refresh"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="px-4 flex flex-col gap-3">
          {[120, 80, 100, 70, 90].map((w, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-surface-3 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-surface-3 rounded animate-pulse" style={{ width: w }} />
                <div className="h-2.5 bg-surface-3 rounded animate-pulse w-16" />
              </div>
              <div className="h-4 w-8 bg-surface-3 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="px-4">
          <div className="card p-6 text-center">
            <p className="text-2xl mb-3">📡</p>
            <p className="text-ink-tertiary text-sm">{error}</p>
            <button onClick={refetch} className="mt-3 text-accent text-sm font-semibold">
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Your stats (signed-in users only) */}
          {meEntry && <YourStats entry={meEntry} rank={meIndex + 1} />}

          {/* Guest nudge */}
          {isGuest && <GuestNudge />}

          {/* Empty state */}
          {entries.length === 0 && <EmptyBoard isGuest={isGuest} />}

          {/* Record Holders */}
          {entries.length > 0 && <RecordHall entries={entries} />}

          {/* Full leaderboard */}
          {entries.length > 0 && (
            <div className="px-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 rounded-full bg-accent" />
                <h2 className="text-ink-primary font-semibold tracking-tight">Full Board</h2>
                <span className="ml-auto label-caps">{entries.length} players</span>
              </div>
              <div className="card px-4">
                {entries.map((entry, i) => (
                  <PlayerRow
                    key={entry.uid}
                    entry={entry}
                    rank={i + 1}
                    isMe={entry.displayName === displayName}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
