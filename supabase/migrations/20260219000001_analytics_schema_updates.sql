-- Migration: Analytics Schema Updates
-- Description: Adds missing columns to page_views and creates analytics_events table

-- 1. Update tables
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS anon_id TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS screen_resolution TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS language TEXT;

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anon_id TEXT,
    session_id TEXT,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    label TEXT,
    value NUMERIC,
    page_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. Allow anyone to insert analytics events
CREATE POLICY "Allow public to insert analytics events"
ON public.analytics_events FOR INSERT
TO public
WITH CHECK (true);

-- 5. Admins can view all analytics events
CREATE POLICY "Admins can view all analytics events"
ON public.analytics_events FOR SELECT
TO authenticated
USING ( public.is_admin(auth.uid()) );

-- 6. RPC for daily page views chart
CREATE OR REPLACE FUNCTION public.daily_page_views()
RETURNS TABLE (date DATE, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    created_at::date as date,
    count(*)::bigint
  FROM public.page_views
  GROUP BY date
  ORDER BY date DESC
  LIMIT 30;
$$;

GRANT EXECUTE ON FUNCTION public.daily_page_views() TO authenticated;
