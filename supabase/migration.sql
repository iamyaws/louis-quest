-- Ronki: Game state table for multi-user support
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.game_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  state jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint game_state_user_id_unique unique (user_id)
);

-- Enable Row Level Security
alter table public.game_state enable row level security;

-- Each user can only access their own state
create policy "Users read own state"
  on public.game_state for select
  using (auth.uid() = user_id);

create policy "Users insert own state"
  on public.game_state for insert
  with check (auth.uid() = user_id);

create policy "Users update own state"
  on public.game_state for update
  using (auth.uid() = user_id);
