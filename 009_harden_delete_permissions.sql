-- Durcissement : les politiques "for all using(is_staff())" (schema.sql / 003_pos.sql)
-- permettaient à N'IMPORTE QUEL membre du staff (même un simple vendeur caisse)
-- de SUPPRIMER des lignes dans les tables financières et d'audit (sessions de
-- caisse, paiements, mouvements de stock). Un caissier pourrait ainsi effacer
-- la trace d'un écart de caisse. Ce correctif réserve la suppression aux
-- comptes admin (owner/super_admin) ; le reste (lecture/ajout/modification)
-- reste inchangé pour le staff. Exécuter UNE FOIS, après 003_pos.sql et
-- 004_pos_returns.sql, dans Supabase > SQL Editor.

drop policy if exists "staff cash sessions" on public.cash_sessions;
create policy "staff cash sessions rw" on public.cash_sessions for select using(public.is_staff());
create policy "staff cash sessions insert" on public.cash_sessions for insert with check(public.is_staff());
create policy "staff cash sessions update" on public.cash_sessions for update using(public.is_staff()) with check(public.is_staff());
create policy "admin cash sessions delete" on public.cash_sessions for delete using(public.is_admin());

drop policy if exists "staff payments" on public.payments;
create policy "staff payments rw" on public.payments for select using(public.is_staff());
create policy "staff payments insert" on public.payments for insert with check(public.is_staff());
create policy "staff payments update" on public.payments for update using(public.is_staff()) with check(public.is_staff());
create policy "admin payments delete" on public.payments for delete using(public.is_admin());

drop policy if exists "staff movements" on public.inventory_movements;
create policy "staff movements rw" on public.inventory_movements for select using(public.is_staff());
create policy "staff movements insert" on public.inventory_movements for insert with check(public.is_staff());
create policy "staff movements update" on public.inventory_movements for update using(public.is_staff()) with check(public.is_staff());
create policy "admin movements delete" on public.inventory_movements for delete using(public.is_admin());
