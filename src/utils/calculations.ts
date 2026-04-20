import { Game, LeaderboardEntry, Achievement } from '../types';

export function getRecentPlayers(
  games: Game[],
  excludeUid?: string | null,
): { name: string; uid: string }[] {
  const seen = new Map<string, { name: string; uid: string; lastPlayed: number }>();
  for (const game of [...games].sort((a, b) => b.date - a.date)) {
    for (const player of game.players) {
      if (player.uid && player.uid !== excludeUid && !seen.has(player.uid)) {
        seen.set(player.uid, { name: player.name, uid: player.uid, lastPlayed: game.date });
      }
    }
  }
  return [...seen.values()].slice(0, 8).map(({ name, uid }) => ({ name, uid }));
}

export function getTotal(scores: number[]): number {
  return scores.reduce((sum, s) => sum + s, 0);
}

export function getWinnerName(game: Game): string {
  let winner = game.players[0];
  let min = getTotal(game.players[0].scores);
  for (const p of game.players) {
    const t = getTotal(p.scores);
    if (t < min) { min = t; winner = p; }
  }
  return winner.name;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${date} at ${time}`;
}

export function calculateLeaderboard(games: Game[]): LeaderboardEntry[] {
  const wins: Record<string, number> = {};
  for (const g of games) {
    if (!g.completed) continue;
    const w = getWinnerName(g);
    wins[w] = (wins[w] || 0) + 1;
  }
  return Object.entries(wins)
    .map(([playerName, winCount]) => ({ playerName, wins: winCount, rank: 0 }))
    .sort((a, b) => b.wins - a.wins)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function calculateAchievements(games: Game[]): Achievement[] {
  const completed = games.filter((g) => g.completed);
  if (completed.length === 0) return [];

  const achievements: Achievement[] = [];

  // Biggest Win (largest margin between 1st and 2nd place)
  let biggestMargin = 0;
  let biggestWinner = '';
  for (const g of completed) {
    const sorted = g.players
      .map((p) => ({ name: p.name, total: getTotal(p.scores) }))
      .sort((a, b) => a.total - b.total);
    if (sorted.length >= 2) {
      const margin = sorted[1].total - sorted[0].total;
      if (margin > biggestMargin) {
        biggestMargin = margin;
        biggestWinner = sorted[0].name;
      }
    }
  }
  if (biggestWinner) {
    achievements.push({ title: 'Biggest Win', playerName: biggestWinner, value: `by ${biggestMargin} strokes` });
  }

  // Lowest Round
  let lowestScore = Infinity;
  let lowestPlayer = '';
  for (const g of completed) {
    for (const p of g.players) {
      const t = getTotal(p.scores);
      if (t < lowestScore) { lowestScore = t; lowestPlayer = p.name; }
    }
  }
  if (lowestPlayer) {
    achievements.push({ title: 'Lowest Round', playerName: lowestPlayer, value: `${lowestScore} strokes` });
  }

  // Highest Round
  let highestScore = -Infinity;
  let highestPlayer = '';
  for (const g of completed) {
    for (const p of g.players) {
      const t = getTotal(p.scores);
      if (t > highestScore) { highestScore = t; highestPlayer = p.name; }
    }
  }
  if (highestPlayer) {
    achievements.push({ title: 'Highest Round', playerName: highestPlayer, value: `${highestScore} strokes` });
  }

  // Most Double-Digit Holes (score >= 10)
  let mostDD = 0;
  let ddPlayer = '';
  for (const g of completed) {
    for (const p of g.players) {
      const count = p.scores.filter((s) => s >= 10).length;
      if (count > mostDD) { mostDD = count; ddPlayer = p.name; }
    }
  }
  if (ddPlayer && mostDD > 0) {
    achievements.push({ title: 'Most Double-Digit Holes', playerName: ddPlayer, value: `${mostDD} hole${mostDD !== 1 ? 's' : ''} scored 10+` });
  }

  return achievements;
}
