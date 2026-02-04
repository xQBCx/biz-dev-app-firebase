-- =============================================
-- PHASE 1: Admin User Management
-- =============================================

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert user roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- PHASE 2: User Approval Workflow
-- =============================================

-- Add approval columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Allow admins to update profiles (for approval)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Admin function to get all users
-- =============================================

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  full_name text,
  is_admin boolean,
  is_approved boolean,
  approved_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    COALESCE(p.full_name, '')::text as full_name,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id AND ur.role = 'admin') as is_admin,
    COALESCE(p.is_approved, false) as is_approved,
    p.approved_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;