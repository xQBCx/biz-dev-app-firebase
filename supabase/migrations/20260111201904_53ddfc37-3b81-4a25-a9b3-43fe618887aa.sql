-- Phase 1: Talent Network Intelligence Foundation

-- 1. Extend crm_contacts with talent/influencer fields
ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS talent_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS instagram_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tiktok_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS youtube_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS potential_match_score integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS research_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS perplexity_last_researched timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preferred_learning_style text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS talent_notes text DEFAULT NULL;

COMMENT ON COLUMN public.crm_contacts.talent_type IS 'Type: influencer, professional, executive, ambassador, advisor';
COMMENT ON COLUMN public.crm_contacts.potential_match_score IS 'AI-calculated match score 0-100';
COMMENT ON COLUMN public.crm_contacts.research_data IS 'Perplexity enrichment data';
COMMENT ON COLUMN public.crm_contacts.preferred_learning_style IS 'How they prefer to receive info: audio, video, slides, infographic, text, flashcards';

-- 2. Create talent_initiatives table (sinelabs.net, Infinity Force Grid OS, etc.)
CREATE TABLE IF NOT EXISTS public.talent_initiatives (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  website_url text,
  category text, -- clean_water, clean_energy, ai_tech, etc.
  status text DEFAULT 'active', -- active, paused, completed
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  target_roles text[], -- influencer, executive, advisor, etc.
  compensation_types text[], -- equity, revenue_share, salary, sweat_equity
  research_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their initiatives"
  ON public.talent_initiatives FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all initiatives"
  ON public.talent_initiatives FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 3. Create talent_initiative_matches table
CREATE TABLE IF NOT EXISTS public.talent_initiative_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id uuid NOT NULL REFERENCES public.talent_initiatives(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  match_score integer, -- 0-100 AI-calculated
  match_reason text, -- Why this person is a good fit
  proposed_role text, -- ambassador, advisor, partner, etc.
  proposed_compensation jsonb DEFAULT '{}'::jsonb, -- {type: 'revenue_share', percentage: 5}
  deal_room_id uuid REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  status text DEFAULT 'proposed', -- proposed, outreach_pending, negotiating, accepted, declined
  outreach_notes text,
  vision_format_preference text, -- audio, video, slides, infographic, text
  vision_materials_generated jsonb DEFAULT '{}'::jsonb, -- Track what materials were generated
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(initiative_id, contact_id)
);

ALTER TABLE public.talent_initiative_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their matches"
  ON public.talent_initiative_matches FOR ALL
  USING (auth.uid() = user_id);

-- 4. Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_talent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_talent_initiatives_updated_at
  BEFORE UPDATE ON public.talent_initiatives
  FOR EACH ROW EXECUTE FUNCTION public.update_talent_updated_at();

CREATE TRIGGER update_talent_initiative_matches_updated_at
  BEFORE UPDATE ON public.talent_initiative_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_talent_updated_at();