-- ============================================
-- BizDev.news Media Platform Tables
-- ============================================

-- News Articles - Core content storage
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_id UUID REFERENCES public.crm_contacts(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  article_type TEXT NOT NULL DEFAULT 'interview' CHECK (article_type IN ('interview', 'tech_brief', 'partner_spotlight', 'business_news', 'podcast', 'video')),
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'member', 'internal')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  featured_image_url TEXT,
  magazine_cover_url TEXT,
  audio_url TEXT,
  video_url TEXT,
  entity_tags JSONB DEFAULT '[]'::jsonb,
  cta_type TEXT,
  cta_link TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News Interviews - Interview session management
CREATE TABLE public.news_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interviewer_context JSONB DEFAULT '{}'::jsonb,
  subject_name TEXT NOT NULL,
  subject_title TEXT,
  subject_company TEXT,
  subject_crm_contact_id UUID REFERENCES public.crm_contacts(id),
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  interview_status TEXT NOT NULL DEFAULT 'pending' CHECK (interview_status IN ('pending', 'questions_generated', 'in_progress', 'completed', 'published')),
  transcript TEXT,
  generated_article TEXT,
  generated_audio_url TEXT,
  generated_images JSONB DEFAULT '[]'::jsonb,
  learning_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News Media Assets - All generated media
CREATE TABLE public.news_media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  interview_id UUID REFERENCES public.news_interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('cover', 'inline', 'audio', 'video', 'thumbnail')),
  url TEXT NOT NULL,
  alt_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ai_prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News Distribution - Track where content goes
CREATE TABLE public.news_distribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('website', 'newsletter', 'linkedin', 'twitter', 'upn_broadcast')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_distribution ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_articles
CREATE POLICY "Users can view public articles" ON public.news_articles
  FOR SELECT USING (access_level = 'public' AND status = 'published');

CREATE POLICY "Users can manage own articles" ON public.news_articles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all articles" ON public.news_articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for news_interviews
CREATE POLICY "Users can manage own interviews" ON public.news_interviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all interviews" ON public.news_interviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for news_media_assets
CREATE POLICY "Users can manage own media assets" ON public.news_media_assets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view media for public articles" ON public.news_media_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.news_articles 
      WHERE id = news_media_assets.article_id 
      AND access_level = 'public' 
      AND status = 'published'
    )
  );

-- RLS Policies for news_distribution
CREATE POLICY "Users can manage distribution for own articles" ON public.news_distribution
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.news_articles WHERE id = news_distribution.article_id AND user_id = auth.uid())
  );

-- Create storage bucket for news media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-media', 'news-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for news-media bucket
CREATE POLICY "Anyone can view news media" ON storage.objects
  FOR SELECT USING (bucket_id = 'news-media');

CREATE POLICY "Authenticated users can upload news media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'news-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own news media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'news-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own news media" ON storage.objects
  FOR DELETE USING (bucket_id = 'news-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updating timestamps
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_interviews_updated_at
  BEFORE UPDATE ON public.news_interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();