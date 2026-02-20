-- FORCE APPLY: Robust Analytics Schema
-- This migration ensures the RPC functions exist even if previous migrations were partially applied

-- Drop existing functions to ensure a fresh apply
DROP FUNCTION IF EXISTS public.track_visit(UUID, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_global_analytics();
DROP FUNCTION IF EXISTS public.reset_global_counters();

-- 1. Table for tracking aggregate statistics
CREATE TABLE IF NOT EXISTS public.analytics_global_stats (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    total_impressions BIGINT DEFAULT 0,
    unique_visitors BIGINT DEFAULT 0,
    region_counts JSONB DEFAULT '{
        "Africa": 0,
        "Europe": 0,
        "Asia": 0,
        "North America": 0,
        "South America": 0,
        "Oceania": 0
    }'::jsonb,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_check CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Initialize the single row if it doesn't exist
INSERT INTO public.analytics_global_stats (id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT DO NOTHING;

-- 2. Table for tracking unique visitors (PII-free)
CREATE TABLE IF NOT EXISTS public.visitor_logs (
    visitor_id UUID PRIMARY KEY,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RPC to track a visit atomically
CREATE OR REPLACE FUNCTION public.track_visit(
    p_visitor_id UUID,
    p_region TEXT,
    p_is_new_session BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    is_new_visitor BOOLEAN := FALSE;
BEGIN
    -- Check if visitor is new
    IF NOT EXISTS (SELECT 1 FROM public.visitor_logs WHERE visitor_id = p_visitor_id) THEN
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
                WHEN p_is_new_session AND p_region IS NOT NULL AND region_counts ? p_region 
                THEN jsonb_set(region_counts, ARRAY[p_region], (COALESCE((region_counts->>p_region)::int, 0) + 1)::text::jsonb)
                ELSE region_counts
            END
        ),
        updated_at = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC to reset counters securely
CREATE OR REPLACE FUNCTION public.reset_global_counters()
RETURNS VOID AS $$
BEGIN
    UPDATE public.analytics_global_stats
    SET 
        total_impressions = 0,
        unique_visitors = 0,
        region_counts = '{
            "Africa": 0,
            "Europe": 0,
            "Asia": 0,
            "North America": 0,
            "South America": 0,
            "Oceania": 0
        }'::jsonb,
        last_reset_at = NOW(),
        updated_at = NOW()
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC to get stats (for the dashboard)
CREATE OR REPLACE FUNCTION public.get_global_analytics()
RETURNS TABLE (
    total_impressions BIGINT,
    unique_visitors BIGINT,
    region_counts JSONB,
    last_reset_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY SELECT 
        s.total_impressions, 
        s.unique_visitors, 
        s.region_counts, 
        s.last_reset_at
    FROM public.analytics_global_stats s
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Permissions
GRANT ALL ON public.analytics_global_stats TO authenticated;
GRANT SELECT ON public.analytics_global_stats TO anon;
GRANT ALL ON public.visitor_logs TO authenticated;
GRANT ALL ON public.visitor_logs TO anon;

GRANT EXECUTE ON FUNCTION public.track_visit(UUID, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_analytics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_global_counters() TO authenticated;
