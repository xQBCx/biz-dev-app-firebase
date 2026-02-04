-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Partners can manage their business members" ON public.business_members;

-- Create a new INSERT policy that allows:
-- 1. Users to add themselves to a business they own
-- 2. Partners to add members to businesses where they're already partners
CREATE POLICY "Allow business creation and partner management"
ON public.business_members
FOR INSERT
WITH CHECK (
  -- Allow if user is adding themselves to a business they own
  (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  ))
  OR
  -- Allow if user is already a partner in this business
  (get_user_business_role(auth.uid(), business_id) = 'partner'::app_role)
);