-- Phase 2: Add multi-email identity support to crm_contacts
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS alternate_emails TEXT[] DEFAULT '{}';
ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS primary_email_for_outreach TEXT;

COMMENT ON COLUMN public.crm_contacts.alternate_emails IS 'Additional email addresses for this contact (e.g., work email, personal email)';
COMMENT ON COLUMN public.crm_contacts.primary_email_for_outreach IS 'Which email to use for outreach (if null, use main email)';

-- Phase 3: Add asset linking and redirect support to team_invitations
ALTER TABLE public.team_invitations ADD COLUMN IF NOT EXISTS redirect_to TEXT;
ALTER TABLE public.team_invitations ADD COLUMN IF NOT EXISTS linked_proposal_id UUID REFERENCES public.generated_proposals(id) ON DELETE SET NULL;
ALTER TABLE public.team_invitations ADD COLUMN IF NOT EXISTS linked_deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL;
ALTER TABLE public.team_invitations ADD COLUMN IF NOT EXISTS from_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL;
ALTER TABLE public.team_invitations ADD COLUMN IF NOT EXISTS introduction_note TEXT;

COMMENT ON COLUMN public.team_invitations.redirect_to IS 'Custom redirect path after user accepts invitation';
COMMENT ON COLUMN public.team_invitations.linked_proposal_id IS 'Proposal to show user after they accept invitation';
COMMENT ON COLUMN public.team_invitations.linked_deal_room_id IS 'Deal room to add user to after they accept invitation';
COMMENT ON COLUMN public.team_invitations.from_contact_id IS 'CRM contact who facilitated this introduction (for attribution)';
COMMENT ON COLUMN public.team_invitations.introduction_note IS 'Note about the introduction/relationship context';

-- Phase 4: Create XODIAK relationship anchoring table
CREATE TABLE IF NOT EXISTS public.xodiak_relationship_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anchor_type TEXT NOT NULL CHECK (anchor_type IN ('introduction', 'asset_share', 'meeting', 'idea_disclosure', 'connection')),
  source_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  target_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  facilitator_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  linked_proposal_id UUID REFERENCES public.generated_proposals(id) ON DELETE SET NULL,
  linked_deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  linked_invitation_id UUID REFERENCES public.team_invitations(id) ON DELETE SET NULL,
  description TEXT,
  transaction_hash TEXT,
  block_number INTEGER,
  anchored_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on xodiak_relationship_anchors
ALTER TABLE public.xodiak_relationship_anchors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xodiak_relationship_anchors
CREATE POLICY "Users can view their own relationship anchors"
  ON public.xodiak_relationship_anchors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own relationship anchors"
  ON public.xodiak_relationship_anchors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all relationship anchors"
  ON public.xodiak_relationship_anchors
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_xodiak_anchors_user_id ON public.xodiak_relationship_anchors(user_id);
CREATE INDEX IF NOT EXISTS idx_xodiak_anchors_target_contact ON public.xodiak_relationship_anchors(target_contact_id);
CREATE INDEX IF NOT EXISTS idx_xodiak_anchors_invitation ON public.xodiak_relationship_anchors(linked_invitation_id);