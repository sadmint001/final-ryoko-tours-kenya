-- Supabase Edge Function: set_user_role
-- Usage: call set_user_role(user_id uuid, role text)
update auth.users set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{role}', to_jsonb(role), true)
where id = set_user_role.user_id;

-- Make sure RLS allows update by admin only
