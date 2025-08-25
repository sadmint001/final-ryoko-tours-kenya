-- Update the existing user to have admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '4479a955-d4ed-4c7d-8bde-f5ff567b6739';