import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
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
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('wins', 'desc'),
        orderBy('avgScore', 'asc'),
        limit(50)
      );
      const snap = await getDocs(q);
      setEntries(snap.docs.map(d => d.data() as GlobalEntry));
    } catch {
      setError('Could not load leaderboard.');
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
        lastUpdated: serverTimestamp(),
      });
    } else {
      const d = snap.data();
      const gamesPlayed = d.gamesPlayed + 1;
      const wins = d.wins + (result.won ? 1 : 0);
      const bestScore = Math.min(d.bestScore, result.totalScore);
      const avgScore = Math.round((d.avgScore * d.gamesPlayed + result.totalScore) / gamesPlayed);
      tx.update(lbRef, { gamesPlayed, wins, bestScore, avgScore, lastUpdated: serverTimestamp() });
    }
  });
}
