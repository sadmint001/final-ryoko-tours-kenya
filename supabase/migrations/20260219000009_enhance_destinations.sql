-- Migration: Add activities and best_time_to_visit columns to destinations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'activities') THEN
        ALTER TABLE public.destinations ADD COLUMN activities JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'best_time_to_visit') THEN
        ALTER TABLE public.destinations ADD COLUMN best_time_to_visit JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Ensure RLS is enabled and policies exist for admins
DO $$
BEGIN
    -- Only add policy if it doesn't exist to avoid errors
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
