-- Temps réel : exécuter UNE FOIS après les migrations précédentes.
-- La vue catalog_products ne peut pas être écoutée par Supabase Realtime
-- (Realtime nécessite une table avec replica identity). On ajoute donc une
-- politique de lecture publique limitée aux produits publiés, en plus de la
-- politique "staff products" déjà en place (les politiques de SELECT se
-- combinent avec OR : le public ne voit que published=true, le staff voit tout).
drop policy if exists "public read published products" on public.products;
create policy "public read published products" on public.products
  for select using (published = true);

-- Active la réplication logique nécessaire à Realtime sur les tables suivies.
alter table public.products replica identity full;
alter table public.orders replica identity full;

-- Ajoute les tables à la publication Realtime de Supabase.
-- Si la table est déjà dans la publication, Supabase renverra une erreur bénigne :
-- dans ce cas, ignorez-la ou retirez la ligne correspondante.
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
