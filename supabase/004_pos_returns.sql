-- Historique & retours de caisse : exécuter UNE FOIS après 003_pos.sql.
create table if not exists public.pos_returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reason text,
  restocked boolean not null default true,
  refund_amount numeric(12,2) not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.pos_returns enable row level security;
drop policy if exists "staff pos returns" on public.pos_returns;
create policy "staff pos returns" on public.pos_returns for all using(public.is_staff()) with check(public.is_staff());

create table if not exists public.pos_return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.pos_returns(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id),
  quantity int not null check (quantity>0)
);
alter table public.pos_return_items enable row level security;
drop policy if exists "staff pos return items" on public.pos_return_items;
create policy "staff pos return items" on public.pos_return_items for all using(public.is_staff()) with check(public.is_staff());

create or replace function public.record_pos_return(p_order_id uuid,p_items jsonb,p_restock boolean default true,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_return uuid; v_item jsonb; v_line record; v_qty int; v_already int; v_refund numeric:=0;
 v_ordered int; v_returned_total int; v_full boolean;
begin
 if not public.is_staff() then raise exception 'Accès caisse refusé'; end if;
 if jsonb_array_length(p_items)=0 then raise exception 'Aucun article sélectionné'; end if;
 if not exists(select 1 from public.orders where id=p_order_id) then raise exception 'Vente introuvable'; end if;
 insert into public.pos_returns(order_id,reason,restocked,created_by) values(p_order_id,nullif(trim(coalesce(p_reason,'')),''),p_restock,auth.uid()) returning id into v_return;
 for v_item in select * from jsonb_array_elements(p_items) loop
   select * into v_line from public.order_items where id=(v_item->>'order_item_id')::uuid and order_id=p_order_id for update;
   if not found then raise exception 'Article introuvable sur cette vente'; end if;
   v_qty:=(v_item->>'quantity')::int;
   select coalesce(sum(ri.quantity),0) into v_already from public.pos_return_items ri where ri.order_item_id=v_line.id;
   if v_qty<1 or v_qty>(v_line.quantity-v_already) then raise exception 'Quantité de retour invalide pour %',v_line.product_name; end if;
   insert into public.pos_return_items(return_id,order_item_id,quantity) values(v_return,v_line.id,v_qty);
   if p_restock and v_line.product_id is not null then
     update public.products set stock_quantity=stock_quantity+v_qty where id=v_line.product_id;
     insert into public.inventory_movements(product_id,quantity_delta,reason,reference_type,reference_id,created_by) values(v_line.product_id,v_qty,coalesce(nullif(trim(p_reason),''),'Retour caisse'),'pos_return',v_return,auth.uid());
   end if;
   v_refund:=v_refund+(v_line.unit_price*v_qty);
 end loop;
 update public.pos_returns set refund_amount=v_refund where id=v_return;
 select coalesce(sum(quantity),0) into v_ordered from public.order_items where order_id=p_order_id;
 select coalesce(sum(ri.quantity),0) into v_returned_total from public.pos_return_items ri join public.order_items oi on oi.id=ri.order_item_id where oi.order_id=p_order_id;
 v_full:=v_returned_total>=v_ordered;
 if v_refund>0 then insert into public.payments(order_id,method,amount,status,recorded_by) values(p_order_id,'cash',v_refund,'refunded',auth.uid()); end if;
 update public.orders set payment_status=(case when v_full then 'refunded'::public.payment_status else payment_status end),status=(case when v_full then 'returned'::public.order_status else status end) where id=p_order_id;
 return jsonb_build_object('return_id',v_return,'refund_amount',v_refund,'full_return',v_full);
end; $$;
grant execute on function public.record_pos_return(uuid,jsonb,boolean,text) to authenticated;
