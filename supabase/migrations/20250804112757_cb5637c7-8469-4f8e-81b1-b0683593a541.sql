-- Create admin roles enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'user';

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND profiles.role = 'admin'
  );
$$;

-- RLS policies for blogs
CREATE POLICY "Blogs are viewable by everyone" 
ON public.blogs FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can manage all blogs" 
ON public.blogs FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS policies for testimonials
CREATE POLICY "Visible testimonials are viewable by everyone" 
ON public.testimonials FOR SELECT 
USING (visible = true);

CREATE POLICY "Admins can manage all testimonials" 
ON public.testimonials FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS policies for newsletter subscribers
CREATE POLICY "Admins can manage newsletter subscribers" 
ON public.newsletter_subscribers FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS policies for site settings
CREATE POLICY "Settings are viewable by everyone" 
ON public.site_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings FOR ALL 
USING (public.is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('company_email', 'info@ryokotoursafrica.com'),
  ('company_phone', '0797758216'),
  ('company_address', 'Nairobi, Kenya'),
  ('instagram_url', 'https://instagram.com/ryokotoursafrica'),
  ('whatsapp_url', 'https://wa.me/254797758216');

-- Insert sample testimonials
INSERT INTO public.testimonials (name, location, content, rating) VALUES
  ('Sarah M.', 'Canada', 'More than a tour — it was a connection. The cultural experiences were authentic and deeply moving.', 5),
  ('Brian K.', 'Nairobi', 'Professional, flexible, and unforgettable. RTA showed me sides of Kenya I never knew existed.', 5),
  ('Alina R.', 'Germany', 'A seamless blend of adventure and insight. Every moment was carefully curated and meaningful.', 5);