
-- Drop existing policies on team_invitations
DROP POLICY IF EXISTS "Admins and team members can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON public.team_invitations;

-- Recreate policies using the has_role security definer function
CREATE POLICY "Admins and team members can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'team_member'::app_role)
);

CREATE POLICY "Users can view their invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  auth.uid() = inviter_id OR 
  auth.email() = invitee_email OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can update their invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (
  auth.email() = invitee_email OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);
