-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create tours table
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  gallery_urls TEXT[],
  includes TEXT[],
  itinerary JSONB,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tours
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Tours are viewable by everyone
CREATE POLICY "Tours are viewable by everyone" 
ON public.tours 
FOR SELECT 
USING (is_active = true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  participants INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  special_requests TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can insert their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample tours
INSERT INTO public.tours (title, description, short_description, price, duration_days, max_participants, location, difficulty_level, includes) VALUES
('Mount Kenya Safari Adventure', 'Experience the breathtaking beauty of Mount Kenya with guided hiking, wildlife viewing, and cultural encounters. This adventure combines the thrill of mountain climbing with authentic African safari experiences.', 'Epic Mount Kenya adventure with hiking and safari', 1299.00, 7, 12, 'Mount Kenya National Park', 'moderate', ARRAY['Professional guide', 'All meals', 'Accommodation', 'Transportation', 'Park fees']),
('Serengeti Wildlife Expedition', 'Witness the Great Migration and discover the incredible wildlife of Serengeti National Park. This expedition offers unparalleled game viewing opportunities and luxury camping experiences.', 'Luxury Serengeti safari with migration viewing', 2199.00, 5, 8, 'Serengeti National Park', 'easy', ARRAY['Luxury tented accommodation', 'All meals and drinks', 'Game drives', 'Professional guide', 'Airport transfers']),
('Kilimanjaro Summit Challenge', 'Conquer Africa''s highest peak with our expert guides. This challenging expedition takes you through diverse ecosystems to the summit of Mount Kilimanjaro via the Machame route.', 'Ultimate Kilimanjaro climbing experience', 2799.00, 8, 10, 'Mount Kilimanjaro', 'challenging', ARRAY['Professional mountain guides', 'All camping equipment', 'All meals on mountain', 'Porters', 'National park fees']);