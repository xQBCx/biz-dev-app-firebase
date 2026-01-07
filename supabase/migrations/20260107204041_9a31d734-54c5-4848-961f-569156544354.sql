-- Create storage bucket for voice narrations
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-narrations', 'voice-narrations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to voice narrations
CREATE POLICY "Public read access for voice narrations"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-narrations');

-- Allow authenticated users to upload voice narrations
CREATE POLICY "Authenticated users can upload voice narrations"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-narrations' AND auth.role() = 'authenticated');

-- Create cache tracking table
CREATE TABLE public.voice_narration_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  audio_url TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'biz',
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_narration_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can check cache)
CREATE POLICY "Public read access for voice cache"
ON public.voice_narration_cache FOR SELECT
USING (true);

-- Only authenticated users can insert/update cache entries
CREATE POLICY "Authenticated users can manage cache"
ON public.voice_narration_cache FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');