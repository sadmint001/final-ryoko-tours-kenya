-- Add geolocation columns to page_views table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_views' AND column_name = 'country_name') THEN
        ALTER TABLE public.page_views ADD COLUMN country_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_views' AND column_name = 'country_code') THEN
        ALTER TABLE public.page_views ADD COLUMN country_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_views' AND column_name = 'continent_name') THEN
        ALTER TABLE public.page_views ADD COLUMN continent_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_views' AND column_name = 'continent_code') THEN
        ALTER TABLE public.page_views ADD COLUMN continent_code TEXT;
    END IF;
END $$;
