-- Scorecards Pro — Supabase Schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New Query

-- ─── Tables ────────────────────────────────────────────────────────────────

create table if not exists profiles (
  device_id    text primary key,
  display_name text not null,
  created_at   timestamptz default now()
);

create table if not exists game_results (
  id           text primary key,
  device_id    text not null references profiles(device_id) on delete cascade,
  display_name text not null,
  holes_played int  not null,
  player_count int  not null,
  total_score  int  not null,
  won          boolean not null default false,
  created_at   timestamptz default now()
);

-- ─── Leaderboard view ──────────────────────────────────────────────────────

create or replace view global_leaderboard as
select
  device_id,
  display_name,
  count(*)::int                                   as games_played,
  sum(case when won then 1 else 0 end)::int       as wins,
  min(total_score)                                as best_score,
  round(avg(total_score))::int                    as avg_score
from game_results
group by device_id, display_name
order by wins desc, avg_score asc;

-- ─── Row Level Security ────────────────────────────────────────────────────

alter table profiles    enable row level security;
alter table game_results enable row level security;

-- Public read
create policy "public_read_profiles"
  on profiles for select using (true);

create policy "public_read_game_results"
  on game_results for select using (true);

-- Anyone can insert/upsert (device_id is the identity; no auth required)
create policy "public_insert_profiles"
  on profiles for insert with check (true);

create policy "public_update_profiles"
  on profiles for update using (true);

create policy "public_insert_game_results"
  on game_results for insert with check (true);
