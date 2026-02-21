-- Phase 3: Scalability & Data Integrity
-- Implementation: Database Indexing & RPC Hardening

-- 1. Indexing for Analytics Performance
-- These indexes speed up the dashboard queries significantly as the tables grow
CREATE INDEX IF NOT EXISTS idx_page_views_created_at_page_path ON public.page_views(created_at DESC, page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at_category ON public.analytics_events(created_at DESC, category);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at_status ON public.bookings(created_at DESC, payment_status);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_last_seen_at ON public.visitor_logs(last_seen_at DESC);

-- 2. Indexing for Core Data (Tours & Destinations)
CREATE INDEX IF NOT EXISTS idx_tours_destination_id ON public.tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations(slug);

-- 3. Hardening track_visit RPC
-- Purpose: Deduplicate visits and prevent inflation/spam
CREATE OR REPLACE FUNCTION public.track_visit(
    p_visitor_id UUID,
    p_region TEXT,
    p_is_new_session BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    is_new_visitor BOOLEAN := FALSE;
    last_visit_time TIMESTAMPTZ;
BEGIN
    -- Get last seen time for this visitor to prevent spamming
    SELECT last_seen_at INTO last_visit_time 
    FROM public.visitor_logs 
    WHERE visitor_id = p_visitor_id;

    -- SPAM PROTECTION: If seen within last 5 seconds, ignore this tracking request
    -- This prevents accidental double-logs or bot loops from inflating numbers
    IF last_visit_time IS NOT NULL AND (NOW() - last_visit_time) < INTERVAL '5 seconds' THEN
        RETURN;
    END IF;

    -- Update or Insert visitor log
    IF last_visit_time IS NULL THEN
        INSERT INTO public.visitor_logs (visitor_id) VALUES (p_visitor_id);
        is_new_visitor := TRUE;
    ELSE
        UPDATE public.visitor_logs SET last_seen_at = NOW() WHERE visitor_id = p_visitor_id;
    END IF;

    -- Update global stats
    UPDATE public.analytics_global_stats
    SET 
        total_impressions = total_impressions + 1,
        unique_visitors = unique_visitors + (CASE WHEN is_new_visitor THEN 1 ELSE 0 END),
        region_counts = (
            CASE 
                -- Only count regional hits if it's a NEW session AND region is known
                WHEN p_is_new_session AND p_region IS NOT NULL AND region_counts ? p_region 
                THEN jsonb_set(region_counts, ARRAY[p_region], (COALESCE((region_counts->>p_region)::int, 0) + 1)::text::jsonb)
                ELSE region_counts
            END
        ),
        updated_at = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
