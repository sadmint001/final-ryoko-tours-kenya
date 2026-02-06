-- Fix tour_id column type to match destinations table (integer instead of UUID)
-- First, drop the foreign key constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_tour_id_fkey;

-- Change tour_id from UUID to TEXT (to store integer IDs as strings)
ALTER TABLE public.bookings ALTER COLUMN tour_id TYPE TEXT;

-- Note: We use TEXT instead of INTEGER to maintain compatibility with existing code
-- that converts the ID to string before inserting
