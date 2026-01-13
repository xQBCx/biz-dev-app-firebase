-- Create table for storing network matches and opportunities
CREATE TABLE IF NOT EXISTS public.crm_network_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_entity_type text NOT NULL CHECK (source_entity_type IN ('contact', 'company')),
  source_entity_id uuid NOT NULL,
  matched_entity_type text NOT NULL CHECK (matched_entity_type IN ('contact', 'company', 'deal_room', 'business')),
  matched_entity_id uuid NOT NULL,
  match_score numeric NOT NULL DEFAULT 0,
  match_reason text NOT NULL,
  opportunity_type text CHECK (opportunity_type IN ('partnership', 'client', 'vendor', 'advisor', 'investor', 'talent', 'referral')),
  is_dismissed boolean DEFAULT false,
  is_actioned boolean DEFAULT false,
  actioned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX idx_crm_network_matches_user_id ON public.crm_network_matches(user_id);
CREATE INDEX idx_crm_network_matches_source ON public.crm_network_matches(source_entity_type, source_entity_id);
CREATE INDEX idx_crm_network_matches_matched ON public.crm_network_matches(matched_entity_type, matched_entity_id);
CREATE INDEX idx_crm_network_matches_not_dismissed ON public.crm_network_matches(user_id, is_dismissed) WHERE is_dismissed = false;

-- Enable RLS
ALTER TABLE public.crm_network_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see their own matches
CREATE POLICY "Users can view their own network matches"
  ON public.crm_network_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own network matches"
  ON public.crm_network_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own network matches"
  ON public.crm_network_matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own network matches"
  ON public.crm_network_matches FOR DELETE
  USING (auth.uid() = user_id);

-- Add research tracking columns to crm_contacts if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_contacts' AND column_name = 'perplexity_last_researched') THEN
    ALTER TABLE public.crm_contacts ADD COLUMN perplexity_last_researched timestamptz;
  END IF;
END $$;

-- Enable realtime for network matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_network_matches;