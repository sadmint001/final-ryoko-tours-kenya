-- Migration: General Site Settings
-- Description: Adds keys for contact info, social links, and footer brand description to site_settings.

INSERT INTO public.site_settings (key, value)
VALUES 
    ('contact_email', 'info@ryokotoursafrica.com'),
    ('contact_phone', '+254797758216'),
    ('contact_whatsapp', '254797758216'),
    ('contact_address', 'Nairobi, Kenya'),
    ('social_instagram', 'https://instagram.com/ryokotoursafrica'),
    ('social_facebook', 'https://facebook.com/ryokotoursafrica'),
    ('footer_description', 'Curating exotic African journeys that transcend traditional travel. Immerse yourself in the soul of Kenya through our authentic, high-end experiences.'),
    ('form_submit_email', 'info@ryokotoursafrica.com')
ON CONFLICT (key) DO NOTHING;
