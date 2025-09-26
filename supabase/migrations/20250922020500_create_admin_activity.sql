-- Create admin_activity audit table
create table if not exists public.admin_activity (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  action text not null,
  entity text not null,
  entity_id bigint,
  details jsonb,
  constraint admin_activity_action_check check (
    action in (
      'destination_create',
      'destination_update',
      'destination_delete',
      'destination_duplicate',
      'destination_toggle_active',
      'destination_bulk_delete',
      'destination_bulk_toggle_active'
    )
  )
);

-- Link to auth.users
alter table public.admin_activity
  add constraint admin_activity_user_fk
  foreign key (user_id) references auth.users(id) on delete set null;

-- Indexes
create index if not exists admin_activity_created_at_idx on public.admin_activity (created_at desc);
create index if not exists admin_activity_action_idx on public.admin_activity (action);
create index if not exists admin_activity_entity_idx on public.admin_activity (entity);
create index if not exists admin_activity_entity_id_idx on public.admin_activity (entity_id);

-- Enable RLS
alter table public.admin_activity enable row level security;

-- Policies
-- Allow only admins to insert/select logs; no updates/deletes
create policy if not exists "Admins can insert logs"
  on public.admin_activity for insert
  to authenticated
  with check (exists (select 1 from pg_catalog.pg_proc p where p.proname = 'is_admin') and is_admin(auth.uid()));

create policy if not exists "Admins can view logs"
  on public.admin_activity for select
  to authenticated
  using (exists (select 1 from pg_catalog.pg_proc p where p.proname = 'is_admin') and is_admin(auth.uid()));

-- Optional: block update/delete explicitly by not creating policies for them
