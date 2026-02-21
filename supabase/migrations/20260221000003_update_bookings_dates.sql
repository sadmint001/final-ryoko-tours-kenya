-- Migration: Add end_date to bookings
-- Description: Adds an end_date column to store the calculated end date of a tour.

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update RLS if necessary (usually ALTER TABLE doesn't require new policies unless specific columns are targeted)
-- Ensure public.profiles still works for is_admin to avoid recursion issues fixed in previous migration
