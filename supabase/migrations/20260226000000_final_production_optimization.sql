-- Final Production Readiness: Performance & Security Hardening
-- Description: Adds critical indexes and finalizes RLS policies for maximum speed and robustness.

-- 1. Destinations Performance Indexes
-- Purpose: Speed up filtering and initial page loads on Destinations and Home pages.
CREATE INDEX IF NOT EXISTS idx_destinations_is_active_category ON public.destinations(is_active, category);
CREATE INDEX IF NOT EXISTS idx_destinations_is_featured ON public.destinations(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_destinations_has_group_discount ON public.destinations(has_group_discount) WHERE has_group_discount = true;

-- 2. Bookings Retrieval & Management Indexes
-- Purpose: Speed up customer booking history lookup and admin management queries.
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON public.bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id) WHERE user_id IS NOT NULL;

-- 3. Analytics & Logging Performance
-- Purpose: Support robust tracking without slowing down write operations.
CREATE INDEX IF NOT EXISTS idx_analytics_events_action ON public.analytics_events(action);
CREATE INDEX IF NOT EXISTS idx_pesapal_transactions_status ON public.pesapal_transactions(status);

-- 4. Robust RLS for Bookings
-- Purpose: Ensure customers can accurately retrieve their own data while maintaining strict privacy.
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
CREATE POLICY "Customers can view own bookings" 
ON public.bookings FOR SELECT 
USING (
    auth.uid() = user_id OR 
    (auth.jwt()->>'email' = customer_email)
);

-- 5. Data Integrity: Enforce unique merchant references for PesaPal
-- Purpose: Prevent duplicate tracking records or mission-critical collisions.
DO $$ 
BEGIN 
    -- ensure we check for the actual constraint name before creating it
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pesapal_transactions_order_tracking_id_key') THEN
        ALTER TABLE public.pesapal_transactions ADD CONSTRAINT pesapal_transactions_order_tracking_id_key UNIQUE (order_tracking_id);
    END IF;
END $$;

-- 6. Maintenance: Clean up old analytics logs (Optional but good for robustness)
-- This could be added as a cron job or a periodic function if needed, 
-- but for now we focus on query speed.
