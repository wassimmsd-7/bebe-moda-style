-- Caisse POS : exécuter UNE FOIS après les migrations précédentes.
create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  opened_by uuid not null references public.profiles(id),
  opening_amount numeric(12,2) not null default 0,
  closing_amount numeric(12,2),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text
);
alter table public.cash_sessions enable row level security;
create policy "staff cash sessions" on public.cash_sessions for all using(public.is_staff()) with check(public.is_staff());

create or replace function public.record_pos_sale(p_items jsonb,p_method public.payment_method,p_received numeric,p_customer_name text default null,p_customer_phone text default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_customer uuid; v_order uuid; v_item jsonb; v_product record; v_qty int; v_total numeric:=0; v_status public.payment_status;
begin
 if not public.is_staff() then raise exception 'Accès caisse refusé'; end if;
 if jsonb_array_length(p_items)=0 then raise exception 'Panier vide'; end if;
 if p_received<0 then raise exception 'Montant invalide'; end if;
 if nullif(trim(coalesce(p_customer_phone,'')),'') is not null then
   insert into public.customers(full_name,phone) values(coalesce(nullif(trim(p_customer_name),''),'Client caisse'),trim(p_customer_phone)) on conflict(phone) do update set full_name=excluded.full_name returning id into v_customer;
 end if;
 if p_method='credit' then v_status:='unpaid'; elsif p_received=0 then v_status:='unpaid'; else v_status:='partial'; end if;
 insert into public.orders(customer_id,status,payment_method,payment_status,source) values(v_customer,'delivered',p_method,v_status,'pos') returning id into v_order;
 for v_item in select * from jsonb_array_elements(p_items) loop
   select * into v_product from public.products where id=(v_item->>'product_id')::uuid for update;
   v_qty:=(v_item->>'quantity')::int;
   if not found or v_qty<1 or v_product.stock_quantity<v_qty then raise exception 'Produit indisponible'; end if;
   insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,purchase_price) values(v_order,v_product.id,v_product.name_fr,v_product.sku,v_qty,v_product.sale_price,v_product.purchase_price);
   update public.products set stock_quantity=stock_quantity-v_qty where id=v_product.id;
   insert into public.inventory_movements(product_id,quantity_delta,reason,reference_type,reference_id,created_by) values(v_product.id,-v_qty,'Vente caisse','pos',v_order,auth.uid());
   v_total:=v_total+(v_product.sale_price*v_qty);
 end loop;
 if p_received>v_total then raise exception 'Montant reçu supérieur au total'; end if;
 if p_received>=v_total then v_status:='paid'; elsif p_received>0 then v_status:='partial'; end if;
 update public.orders set subtotal=v_total,total=v_total,payment_status=v_status where id=v_order;
 if p_received>0 then insert into public.payments(order_id,method,amount,status,recorded_by) values(v_order,p_method,p_received,case when p_received>=v_total then 'paid'::public.payment_status else 'partial'::public.payment_status end,auth.uid()); end if;
 return (select jsonb_build_object('order_number',order_number,'total',total,'received',p_received,'remaining',total-p_received,'payment_status',payment_status) from public.orders where id=v_order);
end; $$;
grant execute on function public.record_pos_sale(jsonb,public.payment_method,numeric,text,text) to authenticated;
