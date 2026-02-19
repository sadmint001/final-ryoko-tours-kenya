-- Migration: User Management Tools
-- Description: Creates secure functions and views for managing users and roles

-- 1. Function to safely fetch all users with their roles and basic profile info
-- Using SECURITY DEFINER to bypass RLS on auth.users for admins
CREATE OR REPLACE FUNCTION public.get_managed_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role public.user_role,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        p.full_name,
        p.role,
        u.created_at,
        u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    ORDER BY u.created_at DESC;
END;
$$;

-- 2. Function to safely update a user's admin status
-- Handles profiles, user_roles table, and auth metadata in one transaction
CREATE OR REPLACE FUNCTION public.set_user_admin_status(target_user_id UUID, is_admin_requested BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Self-protection: Don't allow an admin to remove their own admin status
    IF target_user_id = auth.uid() AND NOT is_admin_requested THEN
        RAISE EXCEPTION 'Self-protection: You cannot remove your own admin status.';
    END IF;

    -- Update public.profiles
    UPDATE public.profiles 
    SET role = (CASE WHEN is_admin_requested THEN 'admin'::public.user_role ELSE 'user'::public.user_role END),
        updated_at = now()
    WHERE user_id = target_user_id;

    -- Update public.user_roles (which is used by is_admin())
    IF is_admin_requested THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
        DELETE FROM public.user_roles
        WHERE user_id = target_user_id AND role = 'admin';
    END IF;

    -- Update auth.users metadata for redundancy and token claims
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'), 
        '{role}', 
        to_jsonb(CASE WHEN is_admin_requested THEN 'admin' ELSE 'user' END)
    )
    WHERE id = target_user_id;

END;
$$;

-- 3. Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_managed_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin_status(UUID, BOOLEAN) TO authenticated;
