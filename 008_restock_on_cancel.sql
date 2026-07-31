-- Correctif : annuler une commande en ligne (statut "cancelled" dans le panneau
-- Commandes) ne remettait jamais le stock réservé en inventaire. Ce trigger
-- restaure automatiquement le stock des articles d'une commande dès qu'elle
-- passe au statut "cancelled" (une seule fois par commande, même si le statut
-- est modifié plusieurs fois par erreur). Ne s'applique pas aux ventes caisse
-- (source='pos'), qui ont déjà leur propre circuit de retour (record_pos_return).
-- Exécuter UNE FOIS, après schema.sql, dans Supabase > SQL Editor.

create or replace function public.restock_on_order_cancel() returns trigger language plpgsql security definer set search_path=public as $$
declare v_item record;
begin
  if new.status='cancelled' and old.status is distinct from 'cancelled' and new.source<>'pos'
     and not exists(select 1 from public.inventory_movements where reference_type='order_cancel' and reference_id=new.id) then
    for v_item in select product_id, quantity, product_name from public.order_items where order_id=new.id and product_id is not null loop
      update public.products set stock_quantity=stock_quantity+v_item.quantity where id=v_item.product_id;
      insert into public.inventory_movements(product_id,quantity_delta,reason,reference_type,reference_id)
        values(v_item.product_id,v_item.quantity,'Commande annulée : '||coalesce(v_item.product_name,''),'order_cancel',new.id);
    end loop;
  end if;
  return new;
end; $$;

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel after update of status on public.orders
  for each row execute procedure public.restock_on_order_cancel();

-- Note : les commandes en ligne passées au statut "returned" (retour après
-- livraison) ne sont pas encore couvertes par un circuit de restockage
-- automatique — seules les ventes caisse le sont via record_pos_return.
-- À traiter séparément si vous gérez des retours de commandes en ligne.
