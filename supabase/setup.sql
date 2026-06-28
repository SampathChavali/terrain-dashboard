-- Run this once in Supabase → SQL Editor

create table if not exists public.terrain_users (
  username text primary key,
  password text not null,
  created_at timestamptz not null default now()
);

alter table public.terrain_users enable row level security;

create policy "Allow public read terrain_users"
  on public.terrain_users for select
  using (true);

create policy "Allow public insert terrain_users"
  on public.terrain_users for insert
  with check (true);

create policy "Allow public delete terrain_users"
  on public.terrain_users for delete
  using (true);

-- Optional seed accounts
insert into public.terrain_users (username, password) values
  ('admin', 'admin123'),
  ('sampath', 'donezo123')
on conflict (username) do nothing;
