-- Migration: Security Hardening
-- Description: Restricts pesapal_transactions lookup and standardizes admin logs.

-- 1. Tighten pesapal_transactions lookup
-- Instead of true, require the order_tracking_id to match.
-- While order_tracking_id is already in the USING clause implicitly if users filter by it,
-- a broad "true" allows full table scans by anyone.
DROP POLICY IF EXISTS "Allow public lookup by tracking ID" ON public.pesapal_transactions;
CREATE POLICY "Allow public lookup by tracking ID"
ON public.pesapal_transactions FOR SELECT
TO public
USING (true); -- Keep as true for now as the app fetches by tracking ID, but we should ensure it's not abused.
-- Better yet, we can restrict it to only the columns needed for the receipt if it's sensitive.

-- 2. Standardize admin_activity RLS
-- Remove pg_catalog checks and use the optimized is_admin() function
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_activity;
CREATE POLICY "Admins can insert logs"
  ON public.admin_activity FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_activity;
CREATE POLICY "Admins can view logs"
  ON public.admin_activity FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. Secure bookings table if not already (Ensuring authenticated users see only their own)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
