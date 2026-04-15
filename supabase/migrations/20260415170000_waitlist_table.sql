-- Waitlist table for Ronki website pre-launch signups.
-- Parent-facing only. No child data. Delete 30 days after drop-day email unless converted.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text,
  locale text not null default 'de',
  notified_at timestamptz
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Public (anon) can insert new entries, but nothing else.
create policy "public insert waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- Only service_role can read / update / delete.
-- (No explicit select/update/delete policies for anon → all denied by RLS default.)

comment on table public.waitlist is 'Ronki website pre-launch waitlist. Parent emails only. GDPR-K compliant.';
comment on column public.waitlist.source is 'Optional referrer or utm_source, for understanding where signups come from.';
comment on column public.waitlist.notified_at is 'Set when the single drop-day email has been sent.';
