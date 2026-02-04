-- Create participant deliverables table (what each participant must contribute)
CREATE TABLE public.deal_room_participant_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  deliverable_name TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  verification_criteria TEXT,
  value_attribution DECIMAL(12,2),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'technical', 'financial', 'legal', 'operational')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.deal_room_participants(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create smart contract terms table (legal sections of the agreement)
CREATE TABLE public.deal_room_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('recitals', 'definitions', 'representations', 'covenants', 'conditions', 'payment_terms', 'ip_ownership', 'confidentiality', 'termination', 'dispute_resolution', 'miscellaneous')),
  section_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_editable BOOLEAN NOT NULL DEFAULT false,
  agreed_by JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clause library table (reusable legal clauses)
CREATE TABLE public.smart_contract_clause_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clause_name TEXT NOT NULL,
  clause_type TEXT NOT NULL CHECK (clause_type IN ('recitals', 'definitions', 'representations', 'covenants', 'conditions', 'payment_terms', 'ip_ownership', 'confidentiality', 'termination', 'dispute_resolution', 'miscellaneous')),
  content_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  description TEXT,
  is_standard BOOLEAN NOT NULL DEFAULT true,
  industry TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participant questions table (questions about deliverables/terms)
CREATE TABLE public.deal_room_participant_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  related_deliverable_id UUID REFERENCES public.deal_room_participant_deliverables(id) ON DELETE SET NULL,
  related_term_id UUID REFERENCES public.deal_room_terms(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'clarification' CHECK (question_type IN ('clarification', 'concern', 'suggestion', 'negotiation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'escalated', 'resolved')),
  answer TEXT,
  answered_by UUID REFERENCES public.deal_room_participants(id),
  answered_at TIMESTAMP WITH TIME ZONE,
  visibility TEXT NOT NULL DEFAULT 'admin_only' CHECK (visibility IN ('admin_only', 'all_participants', 'selected_participants')),
  visible_to_participants JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helper function to check if user is deal room admin (creator)
CREATE OR REPLACE FUNCTION public.is_deal_room_admin(p_deal_room_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM deal_rooms
    WHERE id = p_deal_room_id AND created_by = p_user_id
  ) OR has_role(p_user_id, 'admin'::app_role)
$$;

-- Enable RLS on all tables
ALTER TABLE public.deal_room_participant_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contract_clause_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_participant_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for participant deliverables
CREATE POLICY "Participants can view deliverables in their deal rooms"
ON public.deal_room_participant_deliverables FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_participant(deal_room_id, auth.uid())
);

CREATE POLICY "Admins can create deliverables"
ON public.deal_room_participant_deliverables FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_admin(deal_room_id, auth.uid())
);

CREATE POLICY "Participants can update their own deliverables"
ON public.deal_room_participant_deliverables FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_room_participants 
    WHERE id = deal_room_participant_deliverables.participant_id 
    AND user_id = auth.uid()
  )
  OR is_deal_room_admin(deal_room_id, auth.uid())
);

-- RLS policies for terms
CREATE POLICY "Participants can view terms in their deal rooms"
ON public.deal_room_terms FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_participant(deal_room_id, auth.uid())
);

CREATE POLICY "Admins can manage terms"
ON public.deal_room_terms FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_admin(deal_room_id, auth.uid())
);

-- RLS policies for clause library (readable by all authenticated users)
CREATE POLICY "Authenticated users can view clause library"
ON public.smart_contract_clause_library FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage clause library"
ON public.smart_contract_clause_library FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for participant questions
CREATE POLICY "Participants can view relevant questions"
ON public.deal_room_participant_questions FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM deal_room_participants 
    WHERE id = deal_room_participant_questions.participant_id 
    AND user_id = auth.uid()
  )
  OR (
    visibility = 'all_participants' 
    AND is_deal_room_participant(deal_room_id, auth.uid())
  )
  OR is_deal_room_admin(deal_room_id, auth.uid())
);

CREATE POLICY "Participants can create questions"
ON public.deal_room_participant_questions FOR INSERT
WITH CHECK (
  is_deal_room_participant(deal_room_id, auth.uid())
);

CREATE POLICY "Admins can update questions"
ON public.deal_room_participant_questions FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_deal_room_admin(deal_room_id, auth.uid())
);

-- Add indexes
CREATE INDEX idx_deliverables_deal_room ON public.deal_room_participant_deliverables(deal_room_id);
CREATE INDEX idx_deliverables_participant ON public.deal_room_participant_deliverables(participant_id);
CREATE INDEX idx_terms_deal_room ON public.deal_room_terms(deal_room_id);
CREATE INDEX idx_terms_section_type ON public.deal_room_terms(section_type);
CREATE INDEX idx_questions_deal_room ON public.deal_room_participant_questions(deal_room_id);
CREATE INDEX idx_questions_participant ON public.deal_room_participant_questions(participant_id);
CREATE INDEX idx_clause_library_type ON public.smart_contract_clause_library(clause_type);

-- Seed the clause library with standard operating agreement clauses
INSERT INTO public.smart_contract_clause_library (clause_name, clause_type, content_template, variables, description, is_standard, industry) VALUES
('Standard Recital - Business Purpose', 'recitals', 'WHEREAS, the Parties desire to enter into a mutually beneficial business arrangement for the purpose of {{business_purpose}}, and wish to set forth the terms and conditions governing their relationship;', '["business_purpose"]', 'Standard opening recital establishing business purpose', true, NULL),
('Revenue Share Recital', 'recitals', 'WHEREAS, {{party_a}} possesses expertise in {{expertise_a}} and {{party_b}} possesses capabilities in {{expertise_b}}, and the Parties wish to collaborate and share revenues according to the terms set forth herein;', '["party_a", "expertise_a", "party_b", "expertise_b"]', 'Recital for revenue sharing arrangements', true, NULL),
('Gross Revenue Definition', 'definitions', '"Gross Revenue" shall mean all revenue received by or on behalf of the Business from the sale of products or services, before deduction of any costs, expenses, or charges.', '[]', 'Standard definition of Gross Revenue for commission calculations', true, NULL),
('Qualified Meeting Definition', 'definitions', '"Qualified Meeting" shall mean a scheduled meeting or call with a prospective client that meets ALL of the following criteria: (a) the prospect has decision-making authority, (b) the meeting lasts a minimum of {{min_duration}} minutes, (c) genuine interest was expressed, and (d) documented in CRM.', '["min_duration"]', 'Definition for sales meeting qualification', true, 'sales'),
('Authority to Enter Agreement', 'representations', 'Each Party represents and warrants that: (a) it has full power and authority to enter into this Agreement; (b) execution does not conflict with any other agreement; and (c) this Agreement constitutes a binding obligation.', '[]', 'Standard representation of authority', true, NULL),
('Confidentiality Covenant', 'covenants', 'Each Party agrees to maintain in strict confidence all Confidential Information received from the other Party and shall not disclose to any third party without prior written consent.', '[]', 'Standard confidentiality covenant', true, NULL),
('Non-Circumvention Covenant', 'covenants', 'For a period of {{restriction_period}} following termination, no Party shall directly or indirectly contact or engage in business with any client introduced by another Party, except with written consent.', '["restriction_period"]', 'Non-circumvention clause to protect business relationships', true, NULL),
('Commission Payment Terms', 'payment_terms', 'Commissions shall be calculated on {{commission_basis}} and paid within {{payment_days}} days following the end of each {{payment_period}}. Payments shall be made via {{payment_method}}.', '["commission_basis", "payment_days", "payment_period", "payment_method"]', 'Standard commission payment terms', true, NULL),
('Escrow Distribution Terms', 'payment_terms', 'All funds shall be held in a designated escrow account managed by {{escrow_manager}}. Funds shall be distributed automatically upon verification of trigger events as defined in the Distribution Schedule.', '["escrow_manager"]', 'Escrow-based payment distribution terms', true, NULL),
('Work Product Ownership', 'ip_ownership', 'All work product created by {{creator_party}} in connection with this Agreement shall be owned by {{owner_party}}. {{creator_party}} hereby assigns all rights to {{owner_party}}.', '["creator_party", "owner_party"]', 'Work product ownership assignment', true, 'technology'),
('Joint IP Ownership', 'ip_ownership', 'Any intellectual property developed jointly ("Joint IP") shall be owned jointly by the Parties in equal shares. Each Party may use and license Joint IP without accounting to the others.', '[]', 'Joint IP ownership for collaborative work', true, NULL),
('Termination for Convenience', 'termination', 'Either Party may terminate for any reason upon {{notice_period}} written notice. Upon termination: (a) outstanding commissions shall be paid within {{final_payment_days}} days, (b) Confidential Information returned.', '["notice_period", "final_payment_days"]', 'Termination for convenience with wind-down provisions', true, NULL),
('Termination for Cause', 'termination', 'Either Party may terminate immediately if: (a) material breach not cured within {{cure_period}} days, (b) insolvency or bankruptcy, (c) fraud or gross negligence, or (d) violation of applicable law.', '["cure_period"]', 'Termination for cause provisions', true, NULL),
('Mediation First', 'dispute_resolution', 'Any dispute shall first be submitted to mediation by {{mediation_body}}. If unsuccessful within {{mediation_period}} days, either Party may proceed to binding arbitration.', '["mediation_body", "mediation_period"]', 'Mediation-first dispute resolution', true, NULL),
('Binding Arbitration', 'dispute_resolution', 'Disputes not resolved through mediation shall be resolved by binding arbitration administered by {{arbitration_body}} in {{arbitration_location}}.', '["arbitration_body", "arbitration_location"]', 'Binding arbitration clause', true, NULL),
('Entire Agreement', 'miscellaneous', 'This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations and agreements. No modification shall be effective unless in writing signed by all Parties.', '[]', 'Entire agreement / integration clause', true, NULL),
('Governing Law', 'miscellaneous', 'This Agreement shall be governed by the laws of {{governing_state}}, without regard to conflicts of law. The Parties consent to exclusive jurisdiction of courts in {{jurisdiction_location}}.', '["governing_state", "jurisdiction_location"]', 'Governing law and jurisdiction clause', true, NULL),
('Severability', 'miscellaneous', 'If any provision is held invalid or unenforceable, the remaining provisions shall not be affected. Such provision shall be modified to the minimum extent necessary to be enforceable.', '[]', 'Standard severability clause', true, NULL),
('Smart Contract Amendment', 'miscellaneous', 'This Agreement may only be amended by written instrument signed by all Parties. All amendments shall be recorded and anchored via the smart contract verification system.', '[]', 'Amendment clause for smart contracts', true, NULL);