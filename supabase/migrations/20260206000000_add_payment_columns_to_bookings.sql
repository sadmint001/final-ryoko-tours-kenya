-- Add missing columns to bookings table for PesaPal integration
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS residency_type TEXT CHECK (residency_type IN ('citizen', 'resident', 'non_resident')) DEFAULT 'citizen';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('pesapal', 'mpesa', 'bank_transfer', 'stripe')) DEFAULT 'pesapal';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS mpesa_reference TEXT;

-- Update existing bookings to have default values
UPDATE public.bookings SET residency_type = 'citizen' WHERE residency_type IS NULL;
UPDATE public.bookings SET payment_method = 'pesapal' WHERE payment_method IS NULL;
