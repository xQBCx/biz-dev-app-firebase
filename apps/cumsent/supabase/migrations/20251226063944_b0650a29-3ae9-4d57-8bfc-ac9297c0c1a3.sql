-- Add RLS policy to allow anyone to view pending sessions by share_token (for joining)
CREATE POLICY "Anyone can view pending sessions by share token" 
ON public.consent_sessions 
FOR SELECT 
USING (share_token IS NOT NULL AND status = 'pending');

-- Allow partners to update sessions they've joined (to add themselves)
CREATE POLICY "Partners can update sessions they join" 
ON public.consent_sessions 
FOR UPDATE 
USING (status = 'pending' AND partner_id IS NULL)
WITH CHECK (partner_id = auth.uid());