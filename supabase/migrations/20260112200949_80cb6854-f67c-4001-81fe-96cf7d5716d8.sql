-- =====================================================
-- PROSPECT SYSTEM: Tables for prospect pages & media
-- =====================================================

-- 1. Prospects table - Track companies/individuals receiving custom materials
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE SET NULL,
  crm_contact_id UUID,
  crm_company_id UUID,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Prospect Media - Materials generated for each prospect
CREATE TABLE public.prospect_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('deck', 'video', 'audio', 'infographic', 'flashcards', 'data_table', 'quiz', 'study_guide', 'briefing', 'slides', 'mind_map')),
  title TEXT NOT NULL,
  description TEXT,
  storage_key TEXT,
  external_url TEXT,
  content JSONB,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'teaser', 'locked')),
  display_order INTEGER DEFAULT 0,
  notebook_output_id UUID REFERENCES public.notebook_outputs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Prospect Actions - Track engagement analytics
CREATE TABLE public.prospect_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'media_view', 'media_play', 'cta_click', 'meeting_request', 'biz_dev_entry', 'download')),
  media_id UUID REFERENCES public.prospect_media(id) ON DELETE SET NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prospects
CREATE POLICY "Users can view their own prospects"
  ON public.prospects FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create prospects"
  ON public.prospects FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own prospects"
  ON public.prospects FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own prospects"
  ON public.prospects FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Public access to active prospects by slug (for prospect pages)
CREATE POLICY "Anyone can view active prospects by slug"
  ON public.prospects FOR SELECT
  USING (status = 'active');

-- RLS Policies for prospect_media
CREATE POLICY "Users can manage their prospect media"
  ON public.prospect_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.prospects 
      WHERE prospects.id = prospect_media.prospect_id 
      AND prospects.owner_user_id = auth.uid()
    )
  );

-- Public can view public media for active prospects
CREATE POLICY "Anyone can view public prospect media"
  ON public.prospect_media FOR SELECT
  USING (
    visibility IN ('public', 'teaser') AND
    EXISTS (
      SELECT 1 FROM public.prospects 
      WHERE prospects.id = prospect_media.prospect_id 
      AND prospects.status = 'active'
    )
  );

-- RLS Policies for prospect_actions
CREATE POLICY "Users can view actions on their prospects"
  ON public.prospect_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prospects 
      WHERE prospects.id = prospect_actions.prospect_id 
      AND prospects.owner_user_id = auth.uid()
    )
  );

-- Anyone can create actions (for analytics tracking)
CREATE POLICY "Anyone can log prospect actions"
  ON public.prospect_actions FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger for prospects
CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_prospects_slug ON public.prospects(slug);
CREATE INDEX idx_prospects_owner ON public.prospects(owner_user_id);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospect_media_prospect_id ON public.prospect_media(prospect_id);
CREATE INDEX idx_prospect_actions_prospect_id ON public.prospect_actions(prospect_id);
CREATE INDEX idx_prospect_actions_created_at ON public.prospect_actions(created_at DESC);

-- Create storage bucket for prospect media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prospect-media',
  'prospect-media',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'audio/mpeg', 'audio/mp3', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for prospect-media bucket
CREATE POLICY "Users can upload prospect media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prospect-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their prospect media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prospect-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their prospect media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prospect-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );