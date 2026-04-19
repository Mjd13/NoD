import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseEnabled, GlobalEntry, GameResult } from '../lib/firebase';

export function useGlobalLeaderboard() {
  const [entries, setEntries] = useState<GlobalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!firebaseEnabled || !db) return;
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'leaderboard'));
      const raw = snap.docs.map(d => d.data() as GlobalEntry);
      // Sort client-side to avoid requiring a Firestore composite index
      raw.sort((a, b) => b.wins - a.wins || a.avgScore - b.avgScore);
      setEntries(raw);
    } catch {
      setError('Could not load leaderboard. Check your connection.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, error, refetch: fetch };
}

export async function syncGameToFirebase(result: GameResult): Promise<void> {
  if (!firebaseEnabled || !db) return;

  await setDoc(doc(db, 'gameResults', result.id), {
    ...result,
    createdAt: serverTimestamp(),
  });

  const lbRef = doc(db, 'leaderboard', result.uid);
  const scores = result.scores ?? [];
  const nonZeroScores = scores.filter(s => s > 0);
  const gameHigh = nonZeroScores.length ? Math.max(...scores) : null;
  const gameLow = nonZeroScores.length ? Math.min(...nonZeroScores) : null;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(lbRef);
    if (!snap.exists()) {
      tx.set(lbRef, {
        uid: result.uid,
        displayName: result.displayName,
        gamesPlayed: 1,
        wins: result.won ? 1 : 0,
        bestScore: result.totalScore,
        avgScore: result.totalScore,
        bestHole: gameLow ?? null,
        worstHole: gameHigh ?? null,
        lastUpdated: serverTimestamp(),
      });
    } else {
      const d = snap.data();
      const gamesPlayed = d.gamesPlayed + 1;
      const wins = d.wins + (result.won ? 1 : 0);
      const bestScore = Math.min(d.bestScore, result.totalScore);
      const avgScore = Math.round((d.avgScore * d.gamesPlayed + result.totalScore) / gamesPlayed);
      const bestHole = gameLow !== null
        ? (d.bestHole != null ? Math.min(d.bestHole, gameLow) : gameLow)
        : d.bestHole ?? null;
      const worstHole = gameHigh !== null
        ? (d.worstHole != null ? Math.max(d.worstHole, gameHigh) : gameHigh)
        : d.worstHole ?? null;
      tx.update(lbRef, {
        gamesPlayed,
        wins,
        bestScore,
        avgScore,
        bestHole,
        worstHole,
        lastUpdated: serverTimestamp(),
      });
    }
  });
}
