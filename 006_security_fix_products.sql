-- Correctif de sécurité : la politique "public read published products" (005_realtime.sql)
-- autorise n'importe quel visiteur anonyme à lire TOUTE la ligne de la table products
-- (y compris purchase_price = votre prix d'achat/coût, et barcode).
-- Ce correctif restreint l'accès anonyme aux seules colonnes nécessaires à la boutique
-- et au temps réel. Il ne touche pas aux droits du staff (rôle "authenticated"),
-- qui garde un accès complet via la politique "staff products" déjà en place.
-- Exécuter UNE FOIS, après 005_realtime.sql, dans Supabase > SQL Editor.

revoke select on public.products from anon;

grant select (
  id, sku, name_fr, name_ar, name_en, name_dz, description_fr, image_url,
  age_group, sale_price, stock_quantity, reorder_level, published, seasonal,
  category_id, created_at, updated_at
) on public.products to anon;

-- Vérification rapide après exécution (à lancer séparément, avec la clé anon,
-- jamais avec service_role) : une requête "select purchase_price from products limit 1"
-- doit désormais échouer avec une erreur de permission pour un visiteur anonyme.
