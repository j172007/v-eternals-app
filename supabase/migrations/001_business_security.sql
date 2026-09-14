-- Revisa los tipos existentes antes de aplicar esta migracion en un proyecto con datos.
-- El cliente anonimo debe poder leer productos publicados y crear cotizaciones,
-- pero nunca leer cotizaciones ajenas ni modificar productos o estados.

alter table public.products
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 0;

alter table public.quotes
  add column if not exists occasion text,
  add column if not exists notes text,
  add column if not exists delivery_date date,
  add column if not exists admin_notes text,
  add column if not exists status text not null default 'En proceso',
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

drop policy if exists "Anyone can create quotes" on public.quotes;
create policy "Anyone can create quotes"
  on public.quotes for insert
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Users read own quotes" on public.quotes;
create policy "Users read own quotes"
  on public.quotes for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins update quotes" on public.quotes;
create policy "Admins update quotes"
  on public.quotes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create index if not exists quotes_user_id_created_at_idx
  on public.quotes (user_id, created_at desc);

create index if not exists products_active_order_idx
  on public.products (is_active, sort_order, created_at desc);

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products-image' and public.is_admin());

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'products-image' and public.is_admin())
  with check (bucket_id = 'products-image' and public.is_admin());

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products-image' and public.is_admin());