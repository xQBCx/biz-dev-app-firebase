-- Commercial Projects table
CREATE TABLE public.commercial_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Commercial',
  script_text TEXT NOT NULL,
  parsed_scenes JSONB,
  voiceover_url TEXT,
  voiceover_duration_seconds NUMERIC,
  final_video_url TEXT,
  watermarked_video_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'parsing', 'generating', 'assembling', 'preview', 'purchased', 'failed')),
  price_cents INTEGER NOT NULL DEFAULT 2999,
  total_duration_seconds INTEGER,
  voice_id TEXT DEFAULT 'pNInz6obpgDQGcFmaJgB',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Commercial Scenes table
CREATE TABLE public.commercial_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.commercial_projects(id) ON DELETE CASCADE,
  scene_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  visual_prompt TEXT,
  duration_seconds NUMERIC NOT NULL DEFAULT 3,
  video_clip_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Commercial Purchases table
CREATE TABLE public.commercial_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.commercial_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  download_count INTEGER DEFAULT 0,
  last_download_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commercial_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commercial_projects
CREATE POLICY "Users can view their own commercial projects"
  ON public.commercial_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own commercial projects"
  ON public.commercial_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commercial projects"
  ON public.commercial_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commercial projects"
  ON public.commercial_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for commercial_scenes
CREATE POLICY "Users can view scenes of their projects"
  ON public.commercial_scenes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.commercial_projects
    WHERE id = commercial_scenes.project_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create scenes for their projects"
  ON public.commercial_scenes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.commercial_projects
    WHERE id = commercial_scenes.project_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update scenes of their projects"
  ON public.commercial_scenes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.commercial_projects
    WHERE id = commercial_scenes.project_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete scenes of their projects"
  ON public.commercial_scenes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.commercial_projects
    WHERE id = commercial_scenes.project_id AND user_id = auth.uid()
  ));

-- RLS Policies for commercial_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.commercial_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON public.commercial_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for commercial assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'commercial-assets',
  'commercial-assets',
  false,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for commercial-assets bucket
CREATE POLICY "Users can upload their own commercial assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'commercial-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own commercial assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'commercial-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own commercial assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'commercial-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own commercial assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'commercial-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Updated_at trigger for commercial_projects
CREATE TRIGGER update_commercial_projects_updated_at
  BEFORE UPDATE ON public.commercial_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_construction_updated_at();