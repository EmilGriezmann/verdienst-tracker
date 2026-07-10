-- ============================================================
--  Verdienste-Tracker — Datenbank-Schema für Supabase
--  So benutzt du es:
--   1. Supabase-Projekt öffnen -> linkes Menü "SQL Editor"
--   2. "New query", diesen ganzen Text hier einfügen
--   3. "Run" klicken. Fertig.
-- ============================================================

-- Tabelle: Personen (deine Freunde + du)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Tabelle: einzelne Einkünfte
create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  category text not null,
  amount numeric(12, 2) not null,   -- immer der Gesamtbetrag in Euro
  hourly_rate numeric(12, 2),        -- gesetzt, wenn nach Stundensatz eingetragen
  hours numeric(8, 2),               -- gesetzt, wenn nach Stundensatz eingetragen
  note text,
  earned_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- Schneller nach Monat filtern
create index if not exists earnings_earned_on_idx on public.earnings (earned_on);

-- ============================================================
--  Zugriffsrechte (Row Level Security)
--  Die App nutzt keine echten Logins (nur Namensauswahl),
--  daher erlauben wir dem öffentlichen "anon"-Key Lesen und
--  Schreiben. Für einen privaten Freundeskreis ist das ok.
-- ============================================================

alter table public.users enable row level security;
alter table public.earnings enable row level security;

-- users: jeder darf lesen und neue Namen anlegen
drop policy if exists "users_read" on public.users;
create policy "users_read" on public.users for select using (true);

drop policy if exists "users_insert" on public.users;
create policy "users_insert" on public.users for insert with check (true);

-- earnings: jeder darf lesen, eintragen, bearbeiten und löschen
drop policy if exists "earnings_read" on public.earnings;
create policy "earnings_read" on public.earnings for select using (true);

drop policy if exists "earnings_insert" on public.earnings;
create policy "earnings_insert" on public.earnings for insert with check (true);

drop policy if exists "earnings_update" on public.earnings;
create policy "earnings_update" on public.earnings for update using (true) with check (true);

drop policy if exists "earnings_delete" on public.earnings;
create policy "earnings_delete" on public.earnings for delete using (true);
