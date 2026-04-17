import { useMemo } from 'react';
import { Game } from '../types';
import { calculateLeaderboard, calculateAchievements } from '../utils/calculations';

export function useLeaderboard(games: Game[]) {
  const leaderboard = useMemo(() => calculateLeaderboard(games), [games]);
  const achievements = useMemo(() => calculateAchievements(games), [games]);
  return { leaderboard, achievements };
}
