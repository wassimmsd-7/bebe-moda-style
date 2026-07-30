-- Exécuter UNE FOIS après schema.sql dans Supabase > SQL Editor.
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  alt_text text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.product_images enable row level security;
create policy "public product images" on public.product_images for select using(true);
create policy "staff manage product images" on public.product_images for all using(public.is_staff()) with check(public.is_staff());
insert into storage.buckets(id,name,public) values('product-images','product-images',true) on conflict(id) do update set public=true;
create policy "staff upload product images" on storage.objects for insert with check(bucket_id='product-images' and public.is_staff());
create policy "staff update product images" on storage.objects for update using(bucket_id='product-images' and public.is_staff());
create policy "staff delete product images" on storage.objects for delete using(bucket_id='product-images' and public.is_staff());
