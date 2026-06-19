create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('access_password_hash', '519ad8418de4f18d6ebfbb02b525bb3cc3a35dede6018aeb7882ffe065fe6b5e')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists app_settings_read_access_password on public.app_settings;
drop policy if exists app_settings_manage_authenticated on public.app_settings;

create policy app_settings_read_access_password
on public.app_settings
for select
to anon, authenticated
using (key = 'access_password_hash');

create policy app_settings_manage_authenticated
on public.app_settings
for all
to authenticated
using (true)
with check (true);