import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseEnabled, GlobalEntry, GameResult } from '../lib/supabase';

export function useGlobalStats() {
  const [entries, setEntries] = useState<GlobalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!supabaseEnabled || !supabase) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('global_leaderboard')
      .select('*')
      .limit(50);
    setLoading(false);
    if (err) { setError('Could not load leaderboard.'); return; }
    setEntries((data as GlobalEntry[]) ?? []);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, error, refetch: fetch };
}

export async function syncGameToSupabase(result: GameResult): Promise<void> {
  if (!supabaseEnabled || !supabase) return;
  await supabase.from('game_results').upsert(result, { onConflict: 'id' });
}
