-- Create table to track terms acceptance
CREATE TABLE IF NOT EXISTS public.user_terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(user_id, terms_version)
);

-- Enable RLS
ALTER TABLE public.user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Users can view their own terms acceptance
CREATE POLICY "Users can view their own terms acceptance"
ON public.user_terms_acceptance
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own terms acceptance
CREATE POLICY "Users can insert their own terms acceptance"
ON public.user_terms_acceptance
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_terms_acceptance_user_id ON public.user_terms_acceptance(user_id);
CREATE INDEX idx_user_terms_acceptance_version ON public.user_terms_acceptance(terms_version);