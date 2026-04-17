import { useState, useCallback } from 'react';
import { Game } from '../types';
import { loadGames, saveGames } from '../utils/storage';

export function useHistory() {
  const [games, setGames] = useState<Game[]>(() => loadGames());

  const addGame = useCallback((game: Game) => {
    setGames((prev) => {
      const updated = [game, ...prev];
      saveGames(updated);
      return updated;
    });
  }, []);

  const deleteGame = useCallback((id: string) => {
    setGames((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      saveGames(updated);
      return updated;
    });
  }, []);

  return { games, addGame, deleteGame };
}
