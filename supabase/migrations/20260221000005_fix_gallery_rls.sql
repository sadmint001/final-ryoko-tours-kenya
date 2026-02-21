-- Migration: Fix Gallery RLS and Storage
-- Description: Removes problematic pg_catalog checks and ensures robust access.

-- 1. Fix destination_media RLS
DROP POLICY IF EXISTS "Admins can manage destination_media" ON public.destination_media;
CREATE POLICY "Admins can manage destination_media"
  ON public.destination_media FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view media of active destinations" ON public.destination_media;
CREATE POLICY "Public can view media of active destinations"
  ON public.destination_media FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.destinations d
      WHERE d.id = destination_media.destination_id AND d.is_active = true
    )
  );

-- 2. Ensure storage bucket is public and has correct policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('destination-images', 'destination-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read for destination-images" ON storage.objects;
CREATE POLICY "Public read for destination-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'destination-images');

DROP POLICY IF EXISTS "Authenticated can upload destination-images" ON storage.objects;
CREATE POLICY "Authenticated can upload destination-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'destination-images');

DROP POLICY IF EXISTS "Authenticated can update destination-images" ON storage.objects;
CREATE POLICY "Authenticated can update destination-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'destination-images')
  WITH CHECK (bucket_id = 'destination-images');

DROP POLICY IF EXISTS "Authenticated can delete destination-images" ON storage.objects;
CREATE POLICY "Authenticated can delete destination-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'destination-images');
