0-- Ensure an is_admin(user_id uuid) function exists used by the app
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = is_admin.user_id
      and ur.role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- Optional: create user_roles table if it doesn't exist
create table if not exists public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Policies: only admins can manage roles; bootstrap requires manual insert by a superuser
create policy if not exists "Admins can manage user_roles"
  on public.user_roles for all
  to authenticated
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));
