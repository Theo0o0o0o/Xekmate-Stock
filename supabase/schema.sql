-- XEKmate Stock - Supabase schema
-- Execute this full file in Supabase SQL Editor to create a new database from zero.
-- After this, configure Auth URL settings in Supabase and set the frontend env vars:
-- VITE_SUPABASE_URL
-- VITE_SUPABASE_PUBLISHABLE_KEY
--
-- Default access password before login/register: xstock
-- Stored below as SHA-256:
-- 519ad8418de4f18d6ebfbb02b525bb3cc3a35dede6018aeb7882ffe065fe6b5e

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  serial_number text not null,
  category text not null,
  status text not null default 'Disponível',
  location text,
  entry_date date,
  client_name text,
  supplier text,
  purchase_date date,
  warranty_end_date date,
  notes text,
  image text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consumables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reference_code text not null,
  brand text,
  type text,
  compatible_models text,
  quantity numeric not null default 0,
  minimum_stock numeric not null default 0,
  location text,
  supplier text,
  notes text,
  image text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reference_code text not null,
  compatible_models text,
  quantity numeric not null default 0,
  minimum_stock numeric not null default 0,
  location text,
  supplier text,
  notes text,
  image text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,
  item_id text,
  item_name text not null,
  movement_type text not null,
  previous_quantity numeric,
  new_quantity numeric,
  quantity_changed numeric,
  previous_status text,
  new_status text,
  reason text,
  user_id text,
  user_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_is_active()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active is true
  );
$$;

grant execute on function public.current_user_is_active() to authenticated;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_valid') then
    alter table public.profiles
      add constraint profiles_role_valid check (role in ('admin', 'employee'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'equipment_name_not_blank') then
    alter table public.equipment
      add constraint equipment_name_not_blank check (btrim(name) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'equipment_brand_not_blank') then
    alter table public.equipment
      add constraint equipment_brand_not_blank check (btrim(brand) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'equipment_serial_number_not_blank') then
    alter table public.equipment
      add constraint equipment_serial_number_not_blank check (btrim(serial_number) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'equipment_category_not_blank') then
    alter table public.equipment
      add constraint equipment_category_not_blank check (btrim(category) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'consumables_name_not_blank') then
    alter table public.consumables
      add constraint consumables_name_not_blank check (btrim(name) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'consumables_reference_code_not_blank') then
    alter table public.consumables
      add constraint consumables_reference_code_not_blank check (btrim(reference_code) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'consumables_quantity_nonnegative') then
    alter table public.consumables
      add constraint consumables_quantity_nonnegative check (quantity >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'consumables_minimum_stock_nonnegative') then
    alter table public.consumables
      add constraint consumables_minimum_stock_nonnegative check (minimum_stock >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'parts_name_not_blank') then
    alter table public.parts
      add constraint parts_name_not_blank check (btrim(name) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'parts_reference_code_not_blank') then
    alter table public.parts
      add constraint parts_reference_code_not_blank check (btrim(reference_code) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'parts_quantity_nonnegative') then
    alter table public.parts
      add constraint parts_quantity_nonnegative check (quantity >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'parts_minimum_stock_nonnegative') then
    alter table public.parts
      add constraint parts_minimum_stock_nonnegative check (minimum_stock >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'locations_name_not_blank') then
    alter table public.locations
      add constraint locations_name_not_blank check (btrim(name) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'locations_type_not_blank') then
    alter table public.locations
      add constraint locations_type_not_blank check (btrim(type) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'suppliers_name_not_blank') then
    alter table public.suppliers
      add constraint suppliers_name_not_blank check (btrim(name) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'stock_movements_item_type_not_blank') then
    alter table public.stock_movements
      add constraint stock_movements_item_type_not_blank check (btrim(item_type) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'stock_movements_item_name_not_blank') then
    alter table public.stock_movements
      add constraint stock_movements_item_name_not_blank check (btrim(item_name) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'stock_movements_movement_type_not_blank') then
    alter table public.stock_movements
      add constraint stock_movements_movement_type_not_blank check (btrim(movement_type) <> '');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'stock_movements_previous_quantity_nonnegative') then
    alter table public.stock_movements
      add constraint stock_movements_previous_quantity_nonnegative check (previous_quantity is null or previous_quantity >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'stock_movements_new_quantity_nonnegative') then
    alter table public.stock_movements
      add constraint stock_movements_new_quantity_nonnegative check (new_quantity is null or new_quantity >= 0);
  end if;
end;
$$;

create unique index if not exists equipment_serial_number_unique_idx
on public.equipment (lower(btrim(serial_number)));

create index if not exists equipment_created_at_idx on public.equipment (created_at desc);
create index if not exists consumables_created_at_idx on public.consumables (created_at desc);
create index if not exists parts_created_at_idx on public.parts (created_at desc);
create index if not exists stock_movements_created_at_idx on public.stock_movements (created_at desc);
create index if not exists stock_movements_item_id_idx on public.stock_movements (item_id);
create index if not exists stock_movements_user_id_idx on public.stock_movements (user_id);

insert into public.app_settings (key, value)
values ('access_password_hash', '519ad8418de4f18d6ebfbb02b525bb3cc3a35dede6018aeb7882ffe065fe6b5e')
on conflict (key) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'admin',
    true
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = 'admin',
    active = true,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists equipment_touch_updated_at on public.equipment;
create trigger equipment_touch_updated_at before update on public.equipment
for each row execute function public.touch_updated_at();

drop trigger if exists consumables_touch_updated_at on public.consumables;
create trigger consumables_touch_updated_at before update on public.consumables
for each row execute function public.touch_updated_at();

drop trigger if exists parts_touch_updated_at on public.parts;
create trigger parts_touch_updated_at before update on public.parts
for each row execute function public.touch_updated_at();

drop trigger if exists locations_touch_updated_at on public.locations;
create trigger locations_touch_updated_at before update on public.locations
for each row execute function public.touch_updated_at();

drop trigger if exists suppliers_touch_updated_at on public.suppliers;
create trigger suppliers_touch_updated_at before update on public.suppliers
for each row execute function public.touch_updated_at();

drop trigger if exists stock_movements_touch_updated_at on public.stock_movements;
create trigger stock_movements_touch_updated_at before update on public.stock_movements
for each row execute function public.touch_updated_at();

drop trigger if exists app_settings_touch_updated_at on public.app_settings;
create trigger app_settings_touch_updated_at before update on public.app_settings
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.equipment enable row level security;
alter table public.consumables enable row level security;
alter table public.parts enable row level security;
alter table public.locations enable row level security;
alter table public.suppliers enable row level security;
alter table public.stock_movements enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists authenticated_read_all on public.profiles;
drop policy if exists authenticated_insert_all on public.profiles;
drop policy if exists authenticated_update_all on public.profiles;
drop policy if exists authenticated_delete_all on public.profiles;
drop policy if exists profiles_read_self_or_active_user on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_active_users on public.profiles;

create policy profiles_read_self_or_active_user
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.current_user_is_active());

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy profiles_update_active_users
on public.profiles
for update
to authenticated
using (public.current_user_is_active())
with check (public.current_user_is_active());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'equipment',
    'consumables',
    'parts',
    'locations',
    'suppliers',
    'stock_movements'
  ] loop
    execute format('drop policy if exists authenticated_read_all on public.%I', table_name);
    execute format('drop policy if exists authenticated_insert_all on public.%I', table_name);
    execute format('drop policy if exists authenticated_update_all on public.%I', table_name);
    execute format('drop policy if exists authenticated_delete_all on public.%I', table_name);
    execute format('drop policy if exists active_users_read_all on public.%I', table_name);
    execute format('drop policy if exists active_users_insert_all on public.%I', table_name);
    execute format('drop policy if exists active_users_update_all on public.%I', table_name);
    execute format('drop policy if exists active_users_delete_all on public.%I', table_name);

    execute format('create policy active_users_read_all on public.%I for select to authenticated using (public.current_user_is_active())', table_name);
    execute format('create policy active_users_insert_all on public.%I for insert to authenticated with check (public.current_user_is_active())', table_name);
    execute format('create policy active_users_update_all on public.%I for update to authenticated using (public.current_user_is_active()) with check (public.current_user_is_active())', table_name);
    execute format('create policy active_users_delete_all on public.%I for delete to authenticated using (public.current_user_is_active())', table_name);
  end loop;
end;
$$;

drop policy if exists app_settings_read_access_password on public.app_settings;
drop policy if exists app_settings_manage_authenticated on public.app_settings;
drop policy if exists app_settings_manage_active_users on public.app_settings;

create policy app_settings_read_access_password
on public.app_settings
for select
to anon, authenticated
using (key = 'access_password_hash');

create policy app_settings_manage_active_users
on public.app_settings
for all
to authenticated
using (public.current_user_is_active())
with check (public.current_user_is_active());
