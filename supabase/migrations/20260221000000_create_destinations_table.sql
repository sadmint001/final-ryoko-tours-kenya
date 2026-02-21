-- Migration: Create Destinations Table
-- Description: Creates the destinations table with all required columns for admin and frontend.

CREATE TABLE IF NOT EXISTS public.destinations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}'::TEXT[],
    image TEXT,
    category TEXT,
    duration INT,
    max_participants INT,
    difficulty TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    featured_order INT DEFAULT 0,
    citizen_price NUMERIC(10,2) DEFAULT 0,
    resident_price NUMERIC(10,2) DEFAULT 0,
    non_resident_price NUMERIC(10,2) DEFAULT 0,
    activities JSONB DEFAULT '[]'::JSONB,
    best_time_to_visit JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public can view active destinations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'destinations' AND policyname = 'Public can view active destinations'
    ) THEN
        CREATE POLICY "Public can view active destinations" 
        ON public.destinations FOR SELECT 
        USING (is_active = true);
    END IF;
END $$;

-- 2. Admins can manage all destinations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'destinations' AND policyname = 'Admins can manage destinations'
    ) THEN
        CREATE POLICY "Admins can manage destinations" 
        ON public.destinations FOR ALL 
        TO authenticated
        USING (public.is_admin(auth.uid()))
        WITH CHECK (public.is_admin(auth.uid()));
    END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_destinations_updated_at ON public.destinations;
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
