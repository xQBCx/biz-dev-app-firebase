-- Create user_invitations table
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_name TEXT,
  invite_code TEXT UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  role TEXT DEFAULT 'user',
  message TEXT,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create invitations"
ON public.user_invitations
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can view their sent invitations"
ON public.user_invitations
FOR SELECT
USING (auth.uid() = inviter_id);

CREATE POLICY "Users can update their sent invitations"
ON public.user_invitations
FOR UPDATE
USING (auth.uid() = inviter_id);

CREATE POLICY "Anyone can view invitation by code"
ON public.user_invitations
FOR SELECT
USING (status = 'pending' AND expires_at > NOW());

-- Create user_connections table for business partners
CREATE TABLE public.user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'business_partner' CHECK (connection_type IN ('business_partner', 'team_member', 'advisor', 'investor')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_users CHECK (user_id != connected_user_id),
  UNIQUE(user_id, connected_user_id)
);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- Policies for user_connections
CREATE POLICY "Users can view their connections"
ON public.user_connections
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
ON public.user_connections
FOR INSERT
WITH CHECK (auth.uid() = created_by AND (auth.uid() = user_id OR auth.uid() = connected_user_id));

CREATE POLICY "Users can update their connections"
ON public.user_connections
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can delete their connections"
ON public.user_connections
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Create indexes
CREATE INDEX idx_user_invitations_inviter ON public.user_invitations(inviter_id);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(invitee_email);
CREATE INDEX idx_user_invitations_code ON public.user_invitations(invite_code);
CREATE INDEX idx_user_connections_user ON public.user_connections(user_id);
CREATE INDEX idx_user_connections_connected ON public.user_connections(connected_user_id);

-- Triggers
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();