-- Migration: Standardize Site Settings
-- Description: Aligns site_settings keys with frontend expectations and ensures required defaults.

-- 1. Ensure keys expected by SiteSettingsManagement and other components exist
INSERT INTO public.site_settings (key, value)
VALUES 
    ('site_title', 'Ryoko Tours Africa'),
    ('site_description', 'Experience the magic of Africa with Ryoko Tours Africa'),
    ('contact_email', 'info@ryokotoursafrica.com'),
    ('contact_phone', '0797758216'),
    ('business_address', 'Nairobi, Kenya'),
    ('social_facebook', 'https://facebook.com/ryokotoursafrica'),
    ('social_instagram', 'https://instagram.com/ryokotoursafrica'),
    ('social_twitter', 'https://twitter.com/ryokotoursafrica'),
    ('google_analytics_id', 'UA-XXXXXXXX-X'),
    ('emergency_contact', '0797758216')
ON CONFLICT (key) DO NOTHING;

-- 2. Sync values from old keys if they exist and new keys are empty/default
UPDATE public.site_settings s
SET value = os.value
FROM public.site_settings os
WHERE s.key = 'contact_email' AND os.key = 'company_email' AND (s.value = '' OR s.value IS NULL OR s.value = 'info@ryokotoursafrica.com');

UPDATE public.site_settings s
SET value = os.value
FROM public.site_settings os
WHERE s.key = 'contact_phone' AND os.key = 'company_phone' AND (s.value = '' OR s.value IS NULL OR s.value = '0797758216');

UPDATE public.site_settings s
SET value = os.value
FROM public.site_settings os
WHERE s.key = 'social_instagram' AND os.key = 'instagram_url' AND (s.value = '' OR s.value IS NULL OR s.value = 'https://instagram.com/ryokotoursafrica');
