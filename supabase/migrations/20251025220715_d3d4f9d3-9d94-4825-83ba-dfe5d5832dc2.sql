-- Add RLS policies for access_requests table
-- Allow anyone (including anonymous users) to submit access requests
CREATE POLICY "Anyone can submit access requests"
ON public.access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to view all access requests
CREATE POLICY "Admins can view all access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow admins to update access requests
CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create trigger to notify admin when new access request is submitted
DROP TRIGGER IF EXISTS on_access_request_created ON public.access_requests;

CREATE TRIGGER on_access_request_created
  AFTER INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_access_request();