-- Add child_min_age to destinations table
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS child_min_age INTEGER DEFAULT 0;

-- Update existing destinations to have 0 if not set (though default handles it)
UPDATE public.destinations SET child_min_age = 0 WHERE child_min_age IS NULL;
