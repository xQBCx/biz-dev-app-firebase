-- Fix security issue: Restrict leads table access to authorized roles only
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

CREATE POLICY "Authorized users can view leads"
ON public.leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('manager', 'owner', 'regional')
  )
);

-- Fix security issue: Restrict job_applications table access to authorized roles only
DROP POLICY IF EXISTS "Authenticated users can view job applications" ON public.job_applications;

CREATE POLICY "Authorized users can view job applications"
ON public.job_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('manager', 'owner', 'regional')
  )
);