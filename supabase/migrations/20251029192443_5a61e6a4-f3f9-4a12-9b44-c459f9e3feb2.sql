-- Create enum for platform modules
CREATE TYPE public.platform_module AS ENUM (
  'dashboard',
  'erp',
  'workflows',
  'xbuilderx',
  'xbuilderx_home',
  'xbuilderx_discovery',
  'xbuilderx_engineering',
  'xbuilderx_pipeline',
  'xbuilderx_construction',
  'xodiak',
  'xodiak_assets',
  'xodiak_compliance',
  'directory',
  'crm',
  'portfolio',
  'clients',
  'client_portal',
  'business_cards',
  'franchises',
  'franchise_applications',
  'team',
  'team_invitations',
  'tasks',
  'calendar',
  'activity',
  'tools',
  'messages',
  'ai_gift_cards',
  'iplaunch',
  'network',
  'integrations',
  'funding',
  'theme_harvester',
  'launchpad',
  'app_store',
  'my_apps',
  'white_label_portal',
  'earnings',
  'true_odds',
  'true_odds_explore',
  'true_odds_picks',
  'true_odds_signals'
);

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT,
  assigned_role app_role DEFAULT 'client_user',
  status TEXT DEFAULT 'pending',
  message TEXT,
  invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  default_permissions JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent or received
CREATE POLICY "Users can view their invitations"
  ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = inviter_id OR
    auth.email() = invitee_email OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins and team members can create invitations
CREATE POLICY "Admins and team members can create invitations"
  ON public.team_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'team_member')
    )
  );

-- Users can update invitations they received
CREATE POLICY "Users can update their invitations"
  ON public.team_invitations
  FOR UPDATE
  TO authenticated
  USING (
    auth.email() = invitee_email OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create user_permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module platform_module NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, module)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own permissions
CREATE POLICY "Users can view their own permissions"
  ON public.user_permissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all permissions
CREATE POLICY "Admins can manage all permissions"
  ON public.user_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to check module permission
CREATE OR REPLACE FUNCTION public.has_module_permission(
  _user_id UUID,
  _module platform_module,
  _permission_type TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND module = _module
      AND (
        (_permission_type = 'view' AND can_view = true) OR
        (_permission_type = 'create' AND can_create = true) OR
        (_permission_type = 'edit' AND can_edit = true) OR
        (_permission_type = 'delete' AND can_delete = true)
      )
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_permissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_permissions_updated_at();