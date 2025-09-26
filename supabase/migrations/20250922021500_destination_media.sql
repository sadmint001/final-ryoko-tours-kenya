-- Table to store multiple images per destination (gallery)
create table if not exists public.destination_media (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  destination_id bigint not null,
  url text not null,
  caption text,
  sort_order int not null default 0,
  constraint destination_media_destination_fk foreign key (destination_id) references public.destinations(id) on delete cascade
);

-- Indexes
create index if not exists destination_media_destination_idx on public.destination_media (destination_id);
create index if not exists destination_media_sort_idx on public.destination_media (destination_id, sort_order);

-- Enable RLS
alter table public.destination_media enable row level security;

-- Policies: only admins can manage, public can read if destination is_active
create policy if not exists "Admins can manage destination_media"
  on public.destination_media for all
  to authenticated
  using (exists (select 1 from pg_catalog.pg_proc p where p.proname = 'is_admin') and is_admin(auth.uid()))
  with check (exists (select 1 from pg_catalog.pg_proc p where p.proname = 'is_admin') and is_admin(auth.uid()));

-- Public read policy joined with active destinations
create policy if not exists "Public can view media of active destinations"
  on public.destination_media for select
  using (
    exists (
      select 1 from public.destinations d
      where d.id = destination_id and d.is_active = true
    )
  );
