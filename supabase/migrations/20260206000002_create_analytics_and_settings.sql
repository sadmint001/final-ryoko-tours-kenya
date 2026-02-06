-- Create page_views table for analytics
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    user_id UUID,
    session_id TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views
CREATE POLICY "Allow public to insert page views"
ON public.page_views FOR INSERT
TO public
WITH CHECK (true);

-- Admins can view all page views
CREATE POLICY "Admins can view all page views"
ON public.page_views FOR SELECT
TO authenticated
USING ( public.is_admin(auth.uid()) );

-- Ensure site_settings table exists (if not created by previous migrations)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Allow public read access to site settings"
ON public.site_settings FOR SELECT
TO public
USING (true);

-- Admins can manage site settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL
TO authenticated
USING ( public.is_admin(auth.uid()) );

-- Add trigger for updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns to bookings for comprehensive tracking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS residency_type TEXT DEFAULT 'citizen';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS mpesa_reference TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_details JSONB;
