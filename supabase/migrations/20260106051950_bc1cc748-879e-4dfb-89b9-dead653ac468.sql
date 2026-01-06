-- Deal Room Chat Messages (AI + Human)
CREATE TABLE deal_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES deal_room_participants(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('participant', 'admin', 'ai_agent', 'system')),
  message_type TEXT NOT NULL CHECK (message_type IN (
    'question', 'answer', 'comment', 'change_proposal', 
    'clarification', 'negotiation', 'approval', 'rejection',
    'system_notice', 'advisor_note'
  )),
  content TEXT NOT NULL,
  ai_response TEXT,
  parent_message_id UUID REFERENCES deal_room_messages(id),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN (
    'private', 'admin_only', 'visible_to_all', 'selected_participants'
  )),
  visible_to_participant_ids UUID[],
  requires_admin_approval BOOLEAN DEFAULT false,
  admin_approved BOOLEAN,
  admin_approved_at TIMESTAMPTZ,
  admin_approved_by UUID,
  unified_message_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Message Quality Ratings (for AGI learning filter)
CREATE TABLE deal_message_quality_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES deal_room_messages(id) ON DELETE CASCADE,
  rated_by UUID NOT NULL,
  quality_score INT NOT NULL CHECK (quality_score BETWEEN 1 AND 5),
  is_insightful BOOLEAN DEFAULT false,
  is_actionable BOOLEAN DEFAULT false,
  is_garbage BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Change Proposals (Smart Contract Amendments)
CREATE TABLE deal_room_change_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  proposed_by_participant_id UUID NOT NULL REFERENCES deal_room_participants(id),
  proposal_type TEXT NOT NULL CHECK (proposal_type IN (
    'formulation_change', 'participant_add', 'participant_remove',
    'terms_amendment', 'timeline_change', 'payout_structure', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  current_state JSONB,
  proposed_state JSONB,
  supporting_message_id UUID REFERENCES deal_room_messages(id),
  status TEXT NOT NULL DEFAULT 'pending_admin_review' CHECK (status IN (
    'pending_admin_review', 'visible_for_discussion', 'voting', 
    'approved', 'rejected', 'withdrawn'
  )),
  admin_visibility_decision TEXT,
  admin_visibility_decision_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proposal Votes
CREATE TABLE deal_proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES deal_room_change_proposals(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES deal_room_participants(id),
  vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, participant_id)
);

-- Deal Room Advisors (Lawyers, Accountants, Consultants)
CREATE TABLE deal_room_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  invited_by_participant_id UUID REFERENCES deal_room_participants(id),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  advisor_type TEXT NOT NULL CHECK (advisor_type IN (
    'legal_counsel', 'accountant', 'tax_advisor', 'technical_consultant',
    'financial_advisor', 'compliance_officer', 'mediator', 'other'
  )),
  firm_name TEXT,
  invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN (
    'pending', 'accepted', 'declined', 'revoked'
  )),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  permissions JSONB NOT NULL DEFAULT '{
    "can_view_deal_terms": true,
    "can_view_formulations": true,
    "can_view_participant_list": true,
    "can_view_chat": false,
    "can_participate_in_chat": false,
    "can_view_financial_details": false,
    "can_download_documents": false,
    "can_add_notes": true,
    "can_request_changes": false
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_room_id, email)
);

-- Advisor Notes
CREATE TABLE advisor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES deal_room_advisors(id) ON DELETE CASCADE,
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  note_type TEXT NOT NULL CHECK (note_type IN ('review', 'concern', 'recommendation', 'question', 'approval')),
  content TEXT NOT NULL,
  visible_to_participant_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal Room Roles
CREATE TABLE deal_room_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN (
    'initiator', 'smart_contract_auditor', 'admin', 'participant', 
    'observer', 'escrow_agent', 'arbiter'
  )),
  permissions JSONB NOT NULL DEFAULT '{}',
  assigned_by UUID,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(deal_room_id, user_id, role_type)
);

-- Audit Actions Log
CREATE TABLE deal_audit_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  auditor_user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'terms_review', 'fairness_check', 'risk_assessment', 
    'compliance_verification', 'signature_validation',
    'funds_verification', 'final_approval', 'concern_raised',
    'hold_placed', 'hold_released'
  )),
  action_details JSONB NOT NULL DEFAULT '{}',
  result TEXT CHECK (result IN ('passed', 'failed', 'needs_attention', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External Wallet Connections
CREATE TABLE external_wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN (
    'metamask', 'phantom', 'coinbase_wallet', 'walletconnect',
    'ledger', 'trezor', 'trust_wallet', 'rainbow', 
    'argent', 'gnosis_safe', 'bank_account', 'stripe', 'paypal', 'other'
  )),
  wallet_address TEXT,
  wallet_chain TEXT,
  wallet_name TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
    'unverified', 'pending_verification', 'verified', 'failed'
  )),
  verification_signature TEXT,
  verified_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal Room Escrow Accounts
CREATE TABLE deal_room_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  escrow_type TEXT NOT NULL CHECK (escrow_type IN (
    'platform_wallet', 'smart_contract', 'multisig', 'custodial'
  )),
  escrow_address TEXT,
  escrow_chain TEXT,
  total_deposited NUMERIC DEFAULT 0,
  total_released NUMERIC DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'active', 'releasing', 'released', 'disputed', 'refunded'
  )),
  release_conditions JSONB,
  signers UUID[],
  required_signatures INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Escrow Transactions
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES deal_room_escrow(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES deal_room_participants(id),
  external_wallet_id UUID REFERENCES external_wallet_connections(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'deposit', 'release', 'refund', 'fee', 'distribution'
  )),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  blockchain_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'failed', 'cancelled'
  )),
  confirmed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal Room Clarifications
CREATE TABLE deal_room_clarifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  target_participant_id UUID REFERENCES deal_room_participants(id),
  response_options JSONB,
  response_value TEXT,
  response_text TEXT,
  answered_by UUID,
  answered_at TIMESTAMPTZ,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participant Wallet Connections
CREATE TABLE participant_wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deal_room_id UUID REFERENCES deal_rooms(id),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  auto_distribute_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, deal_room_id)
);

-- Deal Room Inflows
CREATE TABLE deal_room_inflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  payer_participant_id UUID REFERENCES deal_room_participants(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deal_commission', 'meeting_fee', 'retainer', 'bonus', 'other')),
  payment_reference TEXT,
  external_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'distributed', 'failed')),
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal Room Distributions
CREATE TABLE deal_room_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inflow_id UUID NOT NULL REFERENCES deal_room_inflows(id),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  formulation_id UUID,
  recipient_participant_id UUID NOT NULL REFERENCES deal_room_participants(id),
  recipient_wallet_id UUID NOT NULL REFERENCES wallets(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  percentage_share NUMERIC NOT NULL,
  distribution_rule TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  completed_at TIMESTAMPTZ,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Candidates
CREATE TABLE deal_room_learning_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES deal_room_messages(id) ON DELETE CASCADE,
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  extracted_pattern TEXT,
  pattern_category TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0,
  is_approved_for_learning BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External Agent Activities
CREATE TABLE external_agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES instincts_agents(id),
  agent_slug TEXT NOT NULL,
  external_platform TEXT NOT NULL CHECK (external_platform IN ('lindy_ai', 'airia', 'zapier', 'make', 'n8n', 'custom')),
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}',
  target_contact_id UUID REFERENCES crm_contacts(id),
  target_company_id UUID REFERENCES crm_companies(id),
  target_deal_id UUID REFERENCES crm_deals(id),
  outcome_type TEXT CHECK (outcome_type IN ('meeting_set', 'reply_received', 'trigger_detected', 'enrichment_complete', 'draft_created', 'other')),
  outcome_value NUMERIC,
  attributed_to_user_id UUID,
  deal_room_id UUID REFERENCES deal_rooms(id),
  synced_to_hubspot BOOLEAN DEFAULT false,
  hubspot_sync_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Attribution Rules
CREATE TABLE agent_attribution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  agent_id UUID REFERENCES instincts_agents(id),
  agent_slug TEXT,
  outcome_type TEXT NOT NULL,
  base_amount NUMERIC,
  percentage_of_deal NUMERIC,
  split_rules JSONB NOT NULL DEFAULT '{}',
  conditions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Company Relationships
CREATE TABLE crm_company_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_company_id UUID NOT NULL REFERENCES crm_companies(id) ON DELETE CASCADE,
  child_company_id UUID NOT NULL REFERENCES crm_companies(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('subsidiary', 'division', 'brand', 'partner', 'affiliate')),
  billing_entity TEXT CHECK (billing_entity IN ('parent', 'child', 'separate')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_company_id, child_company_id)
);

-- Participant Data Requests
CREATE TABLE participant_data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id),
  participant_id UUID NOT NULL REFERENCES deal_room_participants(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('export_data', 'remove_from_deal', 'archive_participation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'denied')),
  reason TEXT,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  export_file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participant Consent Tracking
CREATE TABLE deal_participant_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES deal_room_participants(id),
  formulation_id UUID,
  consent_status TEXT NOT NULL CHECK (consent_status IN ('pending', 'approved', 'rejected', 'negotiating')),
  consent_notes TEXT,
  consented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_room_id, participant_id)
);

-- Enable RLS on all tables
ALTER TABLE deal_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_message_quality_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_change_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_audit_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_clarifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_inflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_learning_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_attribution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_company_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participant_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_room_messages
CREATE POLICY "Users can view messages in their deal rooms" ON deal_room_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_messages.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their deal rooms" ON deal_room_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_messages.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS Policies for external_wallet_connections
CREATE POLICY "Users can view their own wallet connections" ON external_wallet_connections
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wallet connections" ON external_wallet_connections
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet connections" ON external_wallet_connections
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own wallet connections" ON external_wallet_connections
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for deal_room_escrow
CREATE POLICY "Users can view escrow for their deal rooms" ON deal_room_escrow
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_escrow.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS Policies for escrow_transactions
CREATE POLICY "Users can view escrow transactions for their deal rooms" ON escrow_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_escrow dre
      JOIN deal_room_participants drp ON drp.deal_room_id = dre.deal_room_id
      WHERE dre.id = escrow_transactions.escrow_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS Policies for deal_room_advisors
CREATE POLICY "Users can view advisors in their deal rooms" ON deal_room_advisors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_advisors.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can invite advisors to their deal rooms" ON deal_room_advisors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_advisors.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS Policies for deal_room_change_proposals
CREATE POLICY "Users can view proposals in their deal rooms" ON deal_room_change_proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_change_proposals.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create proposals in their deal rooms" ON deal_room_change_proposals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_change_proposals.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS Policies for deal_room_roles
CREATE POLICY "Users can view roles in their deal rooms" ON deal_room_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_roles.deal_room_id 
      AND drp.user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- RLS Policies for deal_participant_consents
CREATE POLICY "Users can view consents in their deal rooms" ON deal_participant_consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_participant_consents.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own consent" ON deal_participant_consents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.id = deal_participant_consents.participant_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS Policies for external_agent_activities
CREATE POLICY "Users can view agent activities in their deal rooms" ON external_agent_activities
  FOR SELECT USING (
    deal_room_id IS NULL OR EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = external_agent_activities.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- RLS for crm_company_relationships
CREATE POLICY "Users can view company relationships" ON crm_company_relationships
  FOR SELECT USING (true);

CREATE POLICY "Users can manage company relationships" ON crm_company_relationships
  FOR ALL USING (auth.uid() IS NOT NULL);