-- Migration: Add Child Pricing Columns
-- Description: Adds child-specific pricing to destinations and occupancy details to bookings.

-- 1. Update destinations table
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS citizen_child_price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS resident_child_price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS non_resident_child_price NUMERIC(10,2) DEFAULT 0;

-- 2. Update bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS adults_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0;

-- 3. Migrate existing data for bookings
-- Assuming 'participants' currently represents only adults or a mix, 
-- we'll treat them as adults by default to preserve the total count logic.
UPDATE public.bookings 
SET adults_count = participants, 
    children_count = 0 
WHERE adults_count IS NULL;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
