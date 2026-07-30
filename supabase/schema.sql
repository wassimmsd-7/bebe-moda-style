-- Bébé Moda Style · Schéma PostgreSQL pour Supabase
-- Exécuter ce fichier UNE FOIS dans Supabase > SQL Editor.
-- La clé "anon" est autorisée côté navigateur; ne jamais mettre service_role dans le site.

create extension if not exists pgcrypto;

create type public.user_role as enum ('customer','cashier','preparer','courier','owner','super_admin');
create type public.order_status as enum ('pending_confirmation','confirmed','preparing','ready_for_delivery','out_for_delivery','delivered','cancelled','returned');
create type public.payment_method as enum ('cod','cash','card','transfer','credit','partial');
create type public.payment_status as enum ('unpaid','partial','paid','refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  locale text not null default 'fr' check (locale in ('fr','ar','en','dz')),
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.categories (id uuid primary key default gen_random_uuid(), slug text unique not null, name_fr text not null, name_ar text, name_en text, name_dz text, sort_order int default 0, active boolean default true);
create table public.suppliers (id uuid primary key default gen_random_uuid(), name text not null, contact_name text, phone text, email text, address text, notes text, active boolean default true, created_at timestamptz default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), sku text unique not null, barcode text unique, category_id uuid references public.categories(id), supplier_id uuid references public.suppliers(id),
 name_fr text not null, name_ar text, name_en text, name_dz text, description_fr text, image_url text, age_group text check (age_group in ('0-6','6-18','18-36','36+')),
 purchase_price numeric(12,2) not null default 0 check (purchase_price>=0), sale_price numeric(12,2) not null check (sale_price>=0), stock_quantity int not null default 0 check (stock_quantity>=0), reorder_level int not null default 5 check (reorder_level>=0), published boolean not null default false, seasonal boolean default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.customers (id uuid primary key default gen_random_uuid(), profile_id uuid unique references public.profiles(id), full_name text not null, phone text unique not null, email text, wilaya text, address text, marketing_consent boolean default false, created_at timestamptz default now());
create table public.orders (
 id uuid primary key default gen_random_uuid(), order_number text unique not null default ('BMS-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))), customer_id uuid references public.customers(id),
 status public.order_status not null default 'pending_confirmation', payment_method public.payment_method not null default 'cod', payment_status public.payment_status not null default 'unpaid', subtotal numeric(12,2) not null default 0, delivery_fee numeric(12,2) not null default 0, discount_amount numeric(12,2) not null default 0, total numeric(12,2) not null default 0, delivery_wilaya text, delivery_address text, customer_note text, source text not null default 'online', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id), product_name text not null, sku text, quantity int not null check(quantity>0), unit_price numeric(12,2) not null, purchase_price numeric(12,2) not null default 0);
create table public.inventory_movements (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id), quantity_delta int not null, reason text not null, reference_type text, reference_id uuid, created_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.payments (id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id), method public.payment_method not null, amount numeric(12,2) not null check(amount>0), status public.payment_status not null default 'paid', received_at timestamptz default now(), recorded_by uuid references public.profiles(id));
create table public.expenses (id uuid primary key default gen_random_uuid(), label text not null, amount numeric(12,2) not null check(amount>=0), expense_date date not null default current_date, category text not null, notes text, created_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.promotions (id uuid primary key default gen_random_uuid(), name text not null, code text unique, discount_percent numeric(5,2) check(discount_percent between 0 and 100), starts_at timestamptz not null, ends_at timestamptz not null, active boolean default true, check(ends_at>starts_at));
create table public.purchase_orders (id uuid primary key default gen_random_uuid(), supplier_id uuid references public.suppliers(id), status text not null default 'draft' check(status in ('draft','sent','received','cancelled')), created_at timestamptz default now());
create table public.purchase_order_items (id uuid primary key default gen_random_uuid(), purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade, product_id uuid references public.products(id), quantity int not null check(quantity>0), unit_cost numeric(12,2) not null check(unit_cost>=0));

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
create trigger products_updated before update on public.products for each row execute procedure public.set_updated_at();
create trigger orders_updated before update on public.orders for each row execute procedure public.set_updated_at();

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('owner','super_admin','cashier','preparer','courier')); $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('owner','super_admin')); $$;

alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.suppliers enable row level security; alter table public.products enable row level security; alter table public.customers enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.inventory_movements enable row level security; alter table public.payments enable row level security; alter table public.expenses enable row level security; alter table public.promotions enable row level security; alter table public.purchase_orders enable row level security; alter table public.purchase_order_items enable row level security;
create policy "own profile" on public.profiles for select using(auth.uid()=id); create policy "admins profiles" on public.profiles for all using(public.is_admin()) with check(public.is_admin());
create policy "public categories" on public.categories for select using(active); create policy "staff categories" on public.categories for all using(public.is_staff()) with check(public.is_staff());
create policy "staff products" on public.products for all using(public.is_staff()) with check(public.is_staff());
create policy "staff suppliers" on public.suppliers for all using(public.is_staff()) with check(public.is_staff());
create policy "staff customers" on public.customers for all using(public.is_staff()) with check(public.is_staff());
create policy "staff orders" on public.orders for all using(public.is_staff()) with check(public.is_staff());
create policy "staff order items" on public.order_items for all using(public.is_staff()) with check(public.is_staff());
create policy "staff movements" on public.inventory_movements for all using(public.is_staff()) with check(public.is_staff());
create policy "staff payments" on public.payments for all using(public.is_staff()) with check(public.is_staff());
create policy "staff expenses" on public.expenses for all using(public.is_staff()) with check(public.is_staff());
create policy "staff promos" on public.promotions for all using(public.is_staff()) with check(public.is_staff());
create policy "staff po" on public.purchase_orders for all using(public.is_staff()) with check(public.is_staff()); create policy "staff po items" on public.purchase_order_items for all using(public.is_staff()) with check(public.is_staff());

create view public.catalog_products with (security_invoker=false) as select id,sku,name_fr,name_ar,name_en,name_dz,description_fr,image_url,age_group,sale_price,stock_quantity,reorder_level,seasonal,category_id from public.products where published=true;
grant select on public.catalog_products to anon, authenticated;

-- Fonction sécurisée de commande COD publique : elle calcule les prix depuis la base, jamais depuis le navigateur.
create or replace function public.place_guest_order(p_name text,p_phone text,p_wilaya text,p_address text,p_note text,p_items jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_customer uuid; v_order uuid; v_item jsonb; v_product record; v_qty int; v_subtotal numeric:=0;
begin
 if length(trim(p_name))<2 or length(trim(p_phone))<7 or jsonb_array_length(p_items)=0 then raise exception 'Informations de commande invalides'; end if;
 insert into public.customers(full_name,phone,wilaya,address) values(trim(p_name),trim(p_phone),trim(p_wilaya),trim(p_address)) on conflict(phone) do update set full_name=excluded.full_name,wilaya=excluded.wilaya,address=excluded.address returning id into v_customer;
 insert into public.orders(customer_id,delivery_wilaya,delivery_address,customer_note) values(v_customer,trim(p_wilaya),trim(p_address),nullif(trim(p_note),'')) returning id into v_order;
 for v_item in select * from jsonb_array_elements(p_items) loop
   select * into v_product from public.products where id=(v_item->>'product_id')::uuid and published=true for update;
   v_qty:=(v_item->>'quantity')::int;
   if not found or v_qty<1 or v_product.stock_quantity<v_qty then raise exception 'Produit indisponible'; end if;
   insert into public.order_items(order_id,product_id,product_name,sku,quantity,unit_price,purchase_price) values(v_order,v_product.id,v_product.name_fr,v_product.sku,v_qty,v_product.sale_price,v_product.purchase_price);
   update public.products set stock_quantity=stock_quantity-v_qty where id=v_product.id;
   insert into public.inventory_movements(product_id,quantity_delta,reason,reference_type,reference_id) values(v_product.id,-v_qty,'Commande COD','order',v_order);
   v_subtotal:=v_subtotal+(v_product.sale_price*v_qty);
 end loop;
 update public.orders set subtotal=v_subtotal,total=v_subtotal where id=v_order;
 return (select jsonb_build_object('order_id',id,'order_number',order_number,'total',total) from public.orders where id=v_order);
end; $$;
grant execute on function public.place_guest_order(text,text,text,text,text,jsonb) to anon, authenticated;

-- Après votre première inscription dans Authentication > Users, promouvez-vous une seule fois :
-- update public.profiles set role='owner' where id='UUID_DE_VOTRE_UTILISATEUR';
