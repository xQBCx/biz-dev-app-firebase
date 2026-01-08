-- Create deal agreement audit log table for legal defensibility
CREATE TABLE public.deal_agreement_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE,
  term_id UUID REFERENCES deal_room_terms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  participant_id UUID REFERENCES deal_room_participants(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'agreed', 'revoked', 'viewed', 'downloaded', 'signed'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create email account history table for fraud detection
CREATE TABLE public.email_account_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID,
  action TEXT NOT NULL, -- 'registered', 'deleted', 'flagged', 'reactivated'
  reason TEXT,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on both tables
ALTER TABLE public.deal_agreement_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_account_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_agreement_audit_log
-- Participants can view audit logs for their deal rooms
CREATE POLICY "Participants can view deal agreement audit logs"
ON public.deal_agreement_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM deal_room_participants drp
    WHERE drp.deal_room_id = deal_agreement_audit_log.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

-- Users can insert their own audit log entries
CREATE POLICY "Users can insert their own audit logs"
ON public.deal_agreement_audit_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for email_account_history
-- Only admins can view email history (via service role in edge functions)
CREATE POLICY "Admins can view email history"
ON public.email_account_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create index for email lookups
CREATE INDEX idx_email_account_history_email ON public.email_account_history(email);
CREATE INDEX idx_deal_agreement_audit_log_deal_room ON public.deal_agreement_audit_log(deal_room_id);
CREATE INDEX idx_deal_agreement_audit_log_term ON public.deal_agreement_audit_log(term_id);