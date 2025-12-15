-- Allow public read access to invitations by token (needed for accepting invitations)
CREATE POLICY "Anyone can view invitations by token"
ON public.team_invitations
FOR SELECT
USING (true);

-- Allow public UPDATE for accepting invitations (status change)
CREATE POLICY "Anyone can accept pending invitations"
ON public.team_invitations
FOR UPDATE
USING (status = 'pending' AND expires_at > now());