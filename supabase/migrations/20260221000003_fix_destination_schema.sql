-- Migration: Fix Destination Schema
-- Description: Changes duration type to NUMERIC and ensures robust RLS policies.

-- 1. Change duration column type to NUMERIC
-- This allows decimal days like 1.5
ALTER TABLE public.destinations 
ALTER COLUMN duration TYPE NUMERIC(4,1);

-- 2. Ensure highlights defaults to empty array and is not null
ALTER TABLE public.destinations
ALTER COLUMN highlights SET DEFAULT '{}'::TEXT[];

-- 3. Ensure is_admin is robust (SECURE DEFINER already set in previous migration, just ensuring it's available)
-- The is_admin function was fixed in 20260221000002_fix_rls_recursion.sql

-- 4. Re-apply or ensure proper RLS policies
-- Admins should have ALL access to destinations
DROP POLICY IF EXISTS "Admins can manage destinations" ON public.destinations;
CREATE POLICY "Admins can manage destinations" 
ON public.destinations FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. Public view policy
DROP POLICY IF EXISTS "Public can view active destinations" ON public.destinations;
CREATE POLICY "Public can view active destinations" 
ON public.destinations FOR SELECT 
TO public
USING (is_active = true);
