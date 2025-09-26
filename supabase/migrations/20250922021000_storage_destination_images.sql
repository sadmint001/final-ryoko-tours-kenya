-- Create public storage bucket for destination images
insert into storage.buckets (id, name, public)
values ('destination-images', 'destination-images', true)
on conflict (id) do nothing;

-- RLS policies for storage.objects limited to this bucket
-- Allow public read of objects in destination-images
create policy if not exists "Public read for destination-images"
  on storage.objects for select
  using (bucket_id = 'destination-images');

-- Allow authenticated users to upload to destination-images
create policy if not exists "Authenticated can upload destination-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'destination-images');

-- Allow authenticated users to update (replace) their objects if needed (optional)
create policy if not exists "Authenticated can update destination-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'destination-images')
  with check (bucket_id = 'destination-images');

-- Allow authenticated users to delete objects (admin app handles authorization)
create policy if not exists "Authenticated can delete destination-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'destination-images');
