-- Migration: Admin Role Management Fix
-- Description: Re-creates user_roles table, syncs with profiles, and fixes RPC functions

-- 1. Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Sync user_roles with profiles table for existing admins
-- This ensures that users marked as 'admin' in profiles also exist in user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Fix is_admin() function to be robust
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = is_admin.user_id
      AND ur.role = 'admin'
  );
$$;

-- 4. Fix get_managed_users() to use profiles.role correctly
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

-- 5. Fix set_user_admin_status() to sync both tables
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
        updated_at = NOW()
    WHERE user_id = target_user_id;

    -- Update public.user_roles
    IF is_admin_requested THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
        DELETE FROM public.user_roles
        WHERE user_id = target_user_id AND role = 'admin';
    END IF;

    -- Update auth.users metadata for redundancy
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'), 
        '{role}', 
        to_jsonb(CASE WHEN is_admin_requested THEN 'admin' ELSE 'user' END)
    )
    WHERE id = target_user_id;
END;
$$;

-- 6. Permissions and Policies
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_managed_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin_status(UUID, BOOLEAN) TO authenticated;

-- Policies for user_roles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage user_roles'
    ) THEN
        CREATE POLICY "Admins can manage user_roles"
          ON public.user_roles FOR ALL
          TO authenticated
          USING (public.is_admin(auth.uid()))
          WITH CHECK (public.is_admin(auth.uid()));
    END IF;
END $$;
