-- Migration: Fix RLS Recursion and Schema Gaps
-- Description: Resolves infinite loop in is_admin and adds missing columns/policies.

-- 1. Fix is_admin() to use a non-recursive approach
-- We point it back to profiles as the source of truth for the RLS check itself
-- to avoid the infinite loop with user_roles.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.user_id = $1 AND public.profiles.role = 'admin'
  );
$$;

-- 2. Fix user_roles policy to avoid recursion
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE public.profiles.user_id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 3. Add missing 'rating' column to destinations and ensure consistency
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'rating') THEN
        ALTER TABLE public.destinations ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
    END IF;
END $$;

-- 4. Ensure site_settings has required keys for the dashboard to avoid 406
INSERT INTO public.site_settings (key, value)
VALUES 
    ('partners', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. Grant permissions again just in case
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
