-- Drop the current INSERT policy that has a complex EXISTS check
DROP POLICY IF EXISTS "Allow business creation and partner management" ON public.business_members;

-- Create a simpler INSERT policy:
-- 1. Users can add themselves as members (for initial business owner setup)
-- 2. Existing partners can add new members to their business
CREATE POLICY "Users can add themselves or partners can add members"
ON public.business_members
FOR INSERT
WITH CHECK (
  -- Allow users to add themselves
  (user_id = auth.uid())
  OR
  -- Allow existing partners to add members to their business
  (get_user_business_role(auth.uid(), business_id) = 'partner'::app_role)
);