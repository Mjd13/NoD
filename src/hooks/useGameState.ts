import { useState, useCallback } from 'react';
import { ActiveGame, AdvanceResult } from '../types';

export function useGameState() {
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);

  const startGame = useCallback((players: { name: string; uid?: string }[], holes: 9 | 18, dealerIndex = 0) => {
    setActiveGame({
      players: players.map((p) => ({ name: p.name, uid: p.uid, scores: new Array(holes).fill(0) as number[] })),
      holesPlayed: holes,
      currentHole: 0,
      currentPlayerIndex: 0,
      startDealerIndex: dealerIndex,
    });
  }, []);

  // Saves score for current player/hole and advances to next player/hole.
  // Returns synchronously what happened so the caller can react (e.g. navigate to summary).
  const setScoreAndAdvance = useCallback((score: number): AdvanceResult => {
    let result: AdvanceResult = 'nextPlayer';

    setActiveGame((prev) => {
      if (!prev) return prev;

      const updatedPlayers = prev.players.map((p, i) => {
        if (i !== prev.currentPlayerIndex) return p;
        const scores = [...p.scores];
        scores[prev.currentHole] = score;
        return { ...p, scores };
      });

      const nextPlayerIndex = prev.currentPlayerIndex + 1;

      if (nextPlayerIndex < prev.players.length) {
        result = 'nextPlayer';
        return { ...prev, players: updatedPlayers, currentPlayerIndex: nextPlayerIndex };
      }

      const nextHole = prev.currentHole + 1;

      if (nextHole >= prev.holesPlayed) {
        result = 'complete';
        return { ...prev, players: updatedPlayers };
      }

      result = 'nextHole';
      return { ...prev, players: updatedPlayers, currentHole: nextHole, currentPlayerIndex: 0 };
    });

    return result;
  }, []);

  const navigateHole = useCallback((direction: 'prev' | 'next') => {
    setActiveGame((prev) => {
      if (!prev) return prev;
      const newHole =
        direction === 'prev'
          ? Math.max(0, prev.currentHole - 1)
          : Math.min(prev.holesPlayed - 1, prev.currentHole + 1);
      return { ...prev, currentHole: newHole, currentPlayerIndex: 0 };
    });
  }, []);

  const navigatePlayer = useCallback((direction: 'prev' | 'next') => {
    setActiveGame((prev) => {
      if (!prev) return prev;
      const len = prev.players.length;
      const newIndex =
        direction === 'prev'
          ? (prev.currentPlayerIndex - 1 + len) % len
          : (prev.currentPlayerIndex + 1) % len;
      return { ...prev, currentPlayerIndex: newIndex };
    });
  }, []);

  const resetGame = useCallback(() => {
    setActiveGame(null);
  }, []);

  return { activeGame, startGame, setScoreAndAdvance, navigateHole, navigatePlayer, resetGame };
}
