import { Game } from '../types';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface Props {
  games: Game[];
}

const achievementIcons: Record<string, string> = {
  'Biggest Win': '🏆',
  'Lowest Round': '🎯',
  'Highest Round': '🔥',
  'Most Double-Digit Holes': '💥',
};

export default function Analytics({ games }: Props) {
  const { leaderboard, achievements } = useLeaderboard(games);
  const completedCount = games.filter((g) => g.completed).length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white">
          Ana<span className="text-red-500">lytics</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {completedCount} completed game{completedCount !== 1 ? 's' : ''} tracked
        </p>
      </div>

      {completedCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400 text-lg font-medium">No data yet</p>
          <p className="text-gray-600 text-sm mt-1">Save a completed game to see analytics.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4">
          {/* Leaderboard */}
          <div className="border-2 border-red-500 rounded-2xl p-4 bg-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-500 text-xl">🏅</span>
              <h2 className="text-white font-bold text-lg">Leaderboard</h2>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-sm">No wins recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.playerName}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                      entry.rank === 1 ? 'bg-red-500/10 border border-red-500/30' : 'bg-[#111]'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        entry.rank === 1
                          ? 'bg-red-500 text-white'
                          : entry.rank === 2
                          ? 'bg-[#3a3a3a] text-gray-200'
                          : 'bg-[#2a2a2a] text-gray-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span className="flex-1 text-white font-semibold">{entry.playerName}</span>
                    <span className={`font-bold text-sm ${entry.rank === 1 ? 'text-red-400' : 'text-gray-400'}`}>
                      {entry.wins} win{entry.wins !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notable Achievements */}
          <div className="border-2 border-red-500 rounded-2xl p-4 bg-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-500 text-xl">⭐</span>
              <h2 className="text-white font-bold text-lg">Notable Achievements</h2>
            </div>
            {achievements.length === 0 ? (
              <p className="text-gray-500 text-sm">No achievements yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {achievements.map((a) => (
                  <div key={a.title} className="flex items-start gap-3 px-3 py-3 rounded-xl bg-[#111]">
                    <span className="text-2xl shrink-0">{achievementIcons[a.title] ?? '⭐'}</span>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest">{a.title}</p>
                      <p className="text-white font-bold text-base">{a.playerName}</p>
                      <p className="text-red-400 text-sm">{a.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          {leaderboard.length > 0 && (
            <div className="border border-[#2a2a2a] rounded-2xl p-4 bg-[#1a1a1a]">
              <h2 className="text-gray-400 font-semibold text-sm uppercase tracking-widest mb-3">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111] rounded-xl p-3">
                  <p className="text-gray-500 text-xs">Total Games</p>
                  <p className="text-white text-2xl font-bold">{completedCount}</p>
                </div>
                <div className="bg-[#111] rounded-xl p-3">
                  <p className="text-gray-500 text-xs">Unique Players</p>
                  <p className="text-white text-2xl font-bold">{leaderboard.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
