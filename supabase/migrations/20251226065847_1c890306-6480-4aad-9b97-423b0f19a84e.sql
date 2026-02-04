-- Deal Room Module Schema

-- Enum for deal categories
CREATE TYPE public.deal_category AS ENUM (
  'sales',
  'platform_build',
  'joint_venture',
  'licensing',
  'services',
  'infrastructure',
  'ip_creation'
);

-- Enum for deal time horizon
CREATE TYPE public.deal_time_horizon AS ENUM (
  'one_time',
  'recurring',
  'perpetual'
);

-- Enum for contribution types
CREATE TYPE public.contribution_type AS ENUM (
  'time',
  'technical',
  'capital',
  'network',
  'risk_exposure'
);

-- Enum for compensation types
CREATE TYPE public.compensation_type AS ENUM (
  'cash',
  'commission',
  'revenue_share',
  'royalty',
  'equity',
  'licensing_fee'
);

-- Enum for participant roles
CREATE TYPE public.deal_participant_role AS ENUM (
  'builder',
  'seller',
  'strategist',
  'operator',
  'investor',
  'advisor'
);

-- Enum for deal room status
CREATE TYPE public.deal_room_status AS ENUM (
  'draft',
  'active',
  'voting',
  'approved',
  'executed',
  'cancelled',
  'archived'
);

-- Enum for vote types
CREATE TYPE public.deal_vote_type AS ENUM (
  'approve',
  'reject',
  'modify'
);

-- Enum for voting rules
CREATE TYPE public.voting_rule AS ENUM (
  'unanimous',
  'majority',
  'weighted',
  'founder_override'
);

-- Main Deal Rooms table
CREATE TABLE public.deal_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category deal_category NOT NULL,
  expected_deal_size_min NUMERIC(15,2),
  expected_deal_size_max NUMERIC(15,2),
  time_horizon deal_time_horizon NOT NULL DEFAULT 'one_time',
  status deal_room_status NOT NULL DEFAULT 'draft',
  voting_rule voting_rule NOT NULL DEFAULT 'unanimous',
  ai_analysis_enabled BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal Room Participants (companies and individuals)
CREATE TABLE public.deal_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.crm_companies(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  is_company BOOLEAN NOT NULL DEFAULT false,
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  has_submitted_contribution BOOLEAN NOT NULL DEFAULT false,
  contribution_visible_to_others BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_room_id, email)
);

-- Contribution Submissions
CREATE TABLE public.deal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  -- Time contribution
  time_hours_per_month NUMERIC(6,1),
  time_percentage NUMERIC(5,2),
  time_description TEXT,
  -- Technical contribution
  technical_contribution TEXT,
  technical_ip_involved BOOLEAN NOT NULL DEFAULT false,
  technical_ip_description TEXT,
  -- Capital contribution
  capital_amount NUMERIC(15,2),
  capital_resources TEXT,
  -- Network contribution
  network_clients TEXT,
  network_partners TEXT,
  network_distribution TEXT,
  -- Risk exposure
  risk_legal TEXT,
  risk_reputational TEXT,
  risk_financial TEXT,
  -- Role and compensation
  expected_role deal_participant_role,
  desired_compensations compensation_type[] NOT NULL DEFAULT '{}',
  additional_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Analysis Results
CREATE TABLE public.deal_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'contribution_map', 'risk_analysis', 'precedent', 'fairness'
  analysis_data JSONB NOT NULL DEFAULT '{}',
  fairness_score NUMERIC(3,2), -- 0-1 scale
  flags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generated Deal Structures
CREATE TABLE public.deal_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  structure_type TEXT, -- 'conservative', 'aggressive', 'ip_heavy', 'cash_light'
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  -- Structure details
  allocation_rules JSONB NOT NULL DEFAULT '[]',
  payment_terms JSONB NOT NULL DEFAULT '{}',
  exit_terms JSONB NOT NULL DEFAULT '{}',
  ip_terms JSONB NOT NULL DEFAULT '{}',
  expansion_terms JSONB NOT NULL DEFAULT '{}',
  plain_english_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Votes on Structures
CREATE TABLE public.deal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID NOT NULL REFERENCES public.deal_structures(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  vote_type deal_vote_type NOT NULL,
  reasoning TEXT,
  proposed_modifications JSONB,
  vote_weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(structure_id, participant_id)
);

-- Comments/Discussion
CREATE TABLE public.deal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  structure_id UUID REFERENCES public.deal_structures(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.deal_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_voice_note BOOLEAN NOT NULL DEFAULT false,
  voice_note_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exit Records
CREATE TABLE public.deal_exits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id),
  exit_reason TEXT,
  ai_exit_summary TEXT,
  ip_boundaries JSONB,
  non_usage_confirmed BOOLEAN NOT NULL DEFAULT false,
  exited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Executed Agreements
CREATE TABLE public.deal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES public.deal_structures(id),
  plain_english_text TEXT,
  legal_contract_text TEXT,
  smart_contract_logic JSONB,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agreement Signatures
CREATE TABLE public.deal_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.deal_agreements(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id),
  signed_at TIMESTAMPTZ,
  signature_method TEXT, -- 'in_app', 'docusign', 'crypto'
  signature_data JSONB,
  UNIQUE(agreement_id, participant_id)
);

-- Payout Preferences
CREATE TABLE public.deal_payout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  bank_account_connected BOOLEAN NOT NULL DEFAULT false,
  crypto_wallet_connected BOOLEAN NOT NULL DEFAULT false,
  preferred_method TEXT, -- 'bank', 'crypto', 'paypal'
  tax_entity_type TEXT, -- 'individual', 'llc', 'corp'
  tax_jurisdiction TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_id)
);

-- Performance Reports
CREATE TABLE public.deal_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_revenue NUMERIC(15,2),
  attribution_breakdown JSONB NOT NULL DEFAULT '{}',
  payout_summary JSONB NOT NULL DEFAULT '{}',
  ip_usage_log JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_exits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_payout_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Deal Rooms: Admin can do everything, participants can view their rooms
CREATE POLICY "Admins can manage all deal rooms"
ON public.deal_rooms FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view their deal rooms"
ON public.deal_rooms FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT deal_room_id FROM public.deal_room_participants
    WHERE user_id = auth.uid()
  )
);

-- Participants: Admin full access, users see their own participation
CREATE POLICY "Admins can manage all participants"
ON public.deal_room_participants FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view participants in their rooms"
ON public.deal_room_participants FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own participation"
ON public.deal_room_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Contributions: Users manage their own, see others if toggled visible
CREATE POLICY "Admins can manage all contributions"
ON public.deal_contributions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own contributions"
ON public.deal_contributions FOR ALL
TO authenticated
USING (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view visible contributions in their rooms"
ON public.deal_contributions FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
  AND (
    participant_id IN (SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid())
    OR participant_id IN (
      SELECT id FROM public.deal_room_participants WHERE contribution_visible_to_others = true
    )
  )
);

-- AI Analyses: Viewable by room participants
CREATE POLICY "Admins can manage AI analyses"
ON public.deal_ai_analyses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view AI analyses"
ON public.deal_ai_analyses FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Structures: Admin and participants can view, admin can manage
CREATE POLICY "Admins can manage structures"
ON public.deal_structures FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view structures"
ON public.deal_structures FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Participants can propose structures"
ON public.deal_structures FOR INSERT
TO authenticated
WITH CHECK (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Votes: Users manage their own votes
CREATE POLICY "Admins can manage all votes"
ON public.deal_votes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own votes"
ON public.deal_votes FOR ALL
TO authenticated
USING (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Participants can view all votes in their rooms"
ON public.deal_votes FOR SELECT
TO authenticated
USING (
  structure_id IN (
    SELECT id FROM public.deal_structures WHERE deal_room_id IN (
      SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
    )
  )
);

-- Comments: Participants can add and view
CREATE POLICY "Admins can manage all comments"
ON public.deal_comments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can add comments"
ON public.deal_comments FOR INSERT
TO authenticated
WITH CHECK (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Participants can view comments"
ON public.deal_comments FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Exits: Admin and self
CREATE POLICY "Admins can manage exits"
ON public.deal_exits FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own exit"
ON public.deal_exits FOR INSERT
TO authenticated
WITH CHECK (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Participants can view exits in their rooms"
ON public.deal_exits FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Agreements: Participants can view
CREATE POLICY "Admins can manage agreements"
ON public.deal_agreements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view agreements"
ON public.deal_agreements FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Signatures: Users manage their own
CREATE POLICY "Admins can manage signatures"
ON public.deal_signatures FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own signatures"
ON public.deal_signatures FOR ALL
TO authenticated
USING (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Participants can view all signatures"
ON public.deal_signatures FOR SELECT
TO authenticated
USING (
  agreement_id IN (
    SELECT id FROM public.deal_agreements WHERE deal_room_id IN (
      SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
    )
  )
);

-- Payout Preferences: Users manage their own
CREATE POLICY "Admins can view payout preferences"
ON public.deal_payout_preferences FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own payout preferences"
ON public.deal_payout_preferences FOR ALL
TO authenticated
USING (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  participant_id IN (
    SELECT id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Reports: Participants can view
CREATE POLICY "Admins can manage reports"
ON public.deal_reports FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Participants can view reports"
ON public.deal_reports FOR SELECT
TO authenticated
USING (
  deal_room_id IN (
    SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_deal_rooms_updated_at
BEFORE UPDATE ON public.deal_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_room_participants_updated_at
BEFORE UPDATE ON public.deal_room_participants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_contributions_updated_at
BEFORE UPDATE ON public.deal_contributions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_structures_updated_at
BEFORE UPDATE ON public.deal_structures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_votes_updated_at
BEFORE UPDATE ON public.deal_votes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deal_payout_preferences_updated_at
BEFORE UPDATE ON public.deal_payout_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();