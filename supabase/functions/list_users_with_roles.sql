-- Supabase Edge Function: list_users_with_roles
-- Returns all users and their roles from auth.users
select id, email, raw_user_meta_data->>'role' as role
from auth.users
order by email;
