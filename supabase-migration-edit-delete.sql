-- ============================================================
--  Nachtrag: Bearbeiten & Löschen von Einträgen erlauben
--  Nur nötig, wenn du das Schema schon VOR dieser Änderung
--  eingespielt hast. So benutzt du es:
--   1. Supabase -> SQL Editor -> New query
--   2. Diesen Text einfügen -> Run
-- ============================================================

drop policy if exists "earnings_update" on public.earnings;
create policy "earnings_update" on public.earnings for update using (true) with check (true);

drop policy if exists "earnings_delete" on public.earnings;
create policy "earnings_delete" on public.earnings for delete using (true);
