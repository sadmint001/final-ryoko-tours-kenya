-- Migration: Ensure Destination Schema Integrity
-- Description: Adds any missing columns and forces a schema cache reload.

DO $$ 
BEGIN
    -- Ensure 'activities' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'activities') THEN
        ALTER TABLE public.destinations ADD COLUMN activities JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure 'best_time_to_visit' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'best_time_to_visit') THEN
        ALTER TABLE public.destinations ADD COLUMN best_time_to_visit JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure 'rating' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'rating') THEN
        ALTER TABLE public.destinations ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
    END IF;

    -- Ensure 'duration' is NUMERIC to support decimals
    ALTER TABLE public.destinations ALTER COLUMN duration TYPE NUMERIC(4,1);
    
    -- Ensure 'max_participants' exists as snake_case in DB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'max_participants') THEN
        ALTER TABLE public.destinations ADD COLUMN max_participants INT DEFAULT 10;
    END IF;
END $$;

-- Force a reload of the PostgREST schema cache
-- Note: This is a Supabase specific trick that works in many environments 
-- by making a trivial change or using the NOTIFY command if supported.
NOTIFY pgrst, 'reload schema';

-- Re-verify RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage destinations" ON public.destinations;
CREATE POLICY "Admins can manage destinations" 
ON public.destinations FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view active destinations" ON public.destinations;
CREATE POLICY "Public can view active destinations" 
ON public.destinations FOR SELECT 
TO public
USING (is_active = true);
