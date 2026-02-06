-- Update RLS policies for SOPs to allow public viewing
DROP POLICY IF EXISTS "Authenticated users can view SOPs" ON public.sops;

-- Create new policy that allows everyone to view SOPs
CREATE POLICY "Everyone can view SOPs" 
ON public.sops 
FOR SELECT 
USING (true);