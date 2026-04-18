import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && key);

export const supabase = supabaseEnabled
  ? createClient(url!, key!)
  : null;

export interface GlobalEntry {
  device_id: string;
  display_name: string;
  games_played: number;
  wins: number;
  best_score: number;
  avg_score: number;
}

export interface GameResult {
  id: string;
  device_id: string;
  display_name: string;
  holes_played: number;
  player_count: number;
  total_score: number;
  won: boolean;
}
