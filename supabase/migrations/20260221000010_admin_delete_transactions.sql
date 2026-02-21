-- Migration: Allow admins to delete pesapal transactions
-- Purpose: Enable clearing sandbox transactions before going live

-- Allow admins to delete transactions
DROP POLICY IF EXISTS "Admins can delete pesapal transactions" ON public.pesapal_transactions;
CREATE POLICY "Admins can delete pesapal transactions"
  ON public.pesapal_transactions FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Allow admins to delete bookings (for clearing sandbox data)
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
