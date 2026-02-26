-- Migration: Add Destination-Level Discount and Age Configuration
-- Description: Adds configuration for child ages and group discounts directly to the destinations table

ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS child_age_limit INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS has_group_discount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_threshold INTEGER DEFAULT 0;

-- Reload postgREST schema cache
NOTIFY pgrst, 'reload schema';
