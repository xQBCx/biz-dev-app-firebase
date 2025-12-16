-- Drop the problematic policy and recreate using the security definer function
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Recreate using has_role function to avoid recursion
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR user_id = auth.uid()
);