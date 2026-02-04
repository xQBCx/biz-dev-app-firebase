-- Create partner team members table for managing engineers/staff under a partner organization
CREATE TABLE public.partner_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_integration_id UUID NOT NULL REFERENCES public.partner_integrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'engineer' CHECK (role IN ('owner', 'admin', 'engineer', 'viewer')),
  permissions JSONB DEFAULT '{"can_view_api_token": false, "can_use_api": true, "can_view_logs": true, "can_view_docs": true, "can_submit_feedback": true}'::jsonb,
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_integration_id, email)
);

-- Create index for fast lookups
CREATE INDEX idx_partner_team_members_partner ON public.partner_team_members(partner_integration_id);
CREATE INDEX idx_partner_team_members_user ON public.partner_team_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_partner_team_members_email ON public.partner_team_members(email);
CREATE INDEX idx_partner_team_members_invite_token ON public.partner_team_members(invite_token) WHERE invite_token IS NOT NULL;

-- Enable RLS
ALTER TABLE public.partner_team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all partner team members"
ON public.partner_team_members
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Partner owners can manage their team
CREATE POLICY "Partner owners can manage their team members"
ON public.partner_team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partner_team_members ptm
    WHERE ptm.partner_integration_id = partner_team_members.partner_integration_id
      AND ptm.user_id = auth.uid()
      AND ptm.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partner_team_members ptm
    WHERE ptm.partner_integration_id = partner_team_members.partner_integration_id
      AND ptm.user_id = auth.uid()
      AND ptm.role = 'owner'
  )
);

-- Policy: Partner admins can view and update (but not delete owner or add owners)
CREATE POLICY "Partner admins can manage non-owner team members"
ON public.partner_team_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partner_team_members ptm
    WHERE ptm.partner_integration_id = partner_team_members.partner_integration_id
      AND ptm.user_id = auth.uid()
      AND ptm.role = 'admin'
  )
  AND role != 'owner'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partner_team_members ptm
    WHERE ptm.partner_integration_id = partner_team_members.partner_integration_id
      AND ptm.user_id = auth.uid()
      AND ptm.role = 'admin'
  )
  AND role NOT IN ('owner', 'admin')
);

-- Policy: Team members can view their own record
CREATE POLICY "Team members can view their own record"
ON public.partner_team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add owner_user_id column to partner_integrations to track the primary partner owner
ALTER TABLE public.partner_integrations 
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- Enable realtime for partner team updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_team_members;