-- Create partner_feedback table for support and suggestions
CREATE TABLE public.partner_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_integration_id UUID REFERENCES public.partner_integrations(id) ON DELETE CASCADE,
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('issue', 'suggestion', 'praise', 'question')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  submitted_by_email TEXT NOT NULL,
  submitted_by_name TEXT,
  response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on partner_feedback
ALTER TABLE public.partner_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all feedback
CREATE POLICY "Admins can manage all partner feedback"
ON public.partner_feedback
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Partners can view and create their own feedback
CREATE POLICY "Partners can view own feedback"
ON public.partner_feedback
FOR SELECT
USING (
  submitted_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Anyone can submit feedback"
ON public.partner_feedback
FOR INSERT
WITH CHECK (true);

-- Add onboarding columns to partner_integrations
ALTER TABLE public.partner_integrations
ADD COLUMN IF NOT EXISTS onboarding_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS onboarding_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS partner_brief JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS primary_contact_email TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partner_feedback_partner_id ON public.partner_feedback(partner_integration_id);
CREATE INDEX IF NOT EXISTS idx_partner_feedback_status ON public.partner_feedback(status);
CREATE INDEX IF NOT EXISTS idx_partner_integrations_onboarding_token ON public.partner_integrations(onboarding_token);

-- Enable realtime for partner_feedback
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_feedback;