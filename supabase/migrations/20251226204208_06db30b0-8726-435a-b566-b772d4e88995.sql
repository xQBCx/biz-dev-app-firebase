-- Knowledge Hub: Enhanced knowledge capture and learning system
-- ============================================================

-- Main knowledge items table (universal content store)
CREATE TABLE public.knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE SET NULL,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'text', -- text, url, youtube, pdf, image, audio, voice_memo, screenshot, call_recording
  source_platform TEXT, -- twitter, linkedin, youtube, instagram, etc.
  
  -- File storage
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  
  -- Transcription for audio/video
  transcription TEXT,
  transcription_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- AI processing
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  ai_tags TEXT[] DEFAULT '{}',
  ai_categories TEXT[] DEFAULT '{}',
  key_points JSONB DEFAULT '[]',
  entities JSONB DEFAULT '[]', -- named entities extracted
  
  -- Vector embedding stored as JSONB (array of floats)
  embedding JSONB,
  
  -- Learning/review
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  ease_factor NUMERIC DEFAULT 2.5, -- for spaced repetition
  interval_days INTEGER DEFAULT 1,
  mastery_level INTEGER DEFAULT 0, -- 0-5
  
  -- Flashcards generated from this item
  flashcards JSONB DEFAULT '[]',
  
  -- Sharing
  is_template BOOLEAN DEFAULT false,
  shared_with UUID[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge connections (knowledge graph edges)
CREATE TABLE public.knowledge_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_item_id UUID NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  target_item_id UUID NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL DEFAULT 'related', -- related, builds_on, contradicts, supports, references
  strength NUMERIC DEFAULT 1.0,
  ai_generated BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_item_id, target_item_id, connection_type)
);

-- Call/meeting recordings
CREATE TABLE public.knowledge_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_item_id UUID REFERENCES public.knowledge_items(id) ON DELETE SET NULL,
  
  -- Recording details
  title TEXT NOT NULL,
  recording_type TEXT NOT NULL DEFAULT 'call', -- call, meeting, voice_memo, conversation
  file_path TEXT,
  duration_seconds INTEGER,
  
  -- Transcription
  transcription TEXT,
  transcription_status TEXT DEFAULT 'pending',
  speaker_labels JSONB DEFAULT '[]', -- [{speaker: "A", name: "John"}, ...]
  
  -- AI analysis
  summary TEXT,
  action_items JSONB DEFAULT '[]',
  key_decisions JSONB DEFAULT '[]',
  insights JSONB DEFAULT '[]',
  sentiment TEXT, -- positive, negative, neutral
  topics TEXT[] DEFAULT '{}',
  
  -- Participants
  participants JSONB DEFAULT '[]',
  
  -- Metadata
  recorded_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Review history for spaced repetition
CREATE TABLE public.knowledge_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_item_id UUID NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  quality_rating INTEGER NOT NULL, -- 0-5 (0=complete blackout, 5=perfect response)
  time_spent_seconds INTEGER,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- Quick capture inbox (for items that haven't been processed yet)
CREATE TABLE public.knowledge_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Raw capture
  content TEXT,
  file_path TEXT,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'text',
  source_platform TEXT,
  
  -- Status
  status TEXT DEFAULT 'inbox', -- inbox, processing, processed, archived
  knowledge_item_id UUID REFERENCES public.knowledge_items(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_inbox ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_items
CREATE POLICY "Users can view their own knowledge items" 
ON public.knowledge_items FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can create their own knowledge items" 
ON public.knowledge_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge items" 
ON public.knowledge_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge items" 
ON public.knowledge_items FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for knowledge_connections
CREATE POLICY "Users can view their own knowledge connections" 
ON public.knowledge_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge connections" 
ON public.knowledge_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge connections" 
ON public.knowledge_connections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge connections" 
ON public.knowledge_connections FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for knowledge_recordings
CREATE POLICY "Users can view their own knowledge recordings" 
ON public.knowledge_recordings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge recordings" 
ON public.knowledge_recordings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge recordings" 
ON public.knowledge_recordings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge recordings" 
ON public.knowledge_recordings FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for knowledge_reviews
CREATE POLICY "Users can view their own reviews" 
ON public.knowledge_reviews FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews" 
ON public.knowledge_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for knowledge_inbox
CREATE POLICY "Users can view their own inbox" 
ON public.knowledge_inbox FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create in their own inbox" 
ON public.knowledge_inbox FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox items" 
ON public.knowledge_inbox FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inbox items" 
ON public.knowledge_inbox FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_recordings_updated_at
  BEFORE UPDATE ON public.knowledge_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-hub', 'knowledge-hub', false);

-- Storage policies for knowledge-hub bucket
CREATE POLICY "Users can view their own knowledge files"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-hub' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own knowledge files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'knowledge-hub' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own knowledge files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'knowledge-hub' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own knowledge files"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge-hub' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes for performance
CREATE INDEX idx_knowledge_items_user_id ON public.knowledge_items(user_id);
CREATE INDEX idx_knowledge_items_processing_status ON public.knowledge_items(processing_status);
CREATE INDEX idx_knowledge_items_source_type ON public.knowledge_items(source_type);
CREATE INDEX idx_knowledge_items_next_review ON public.knowledge_items(next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX idx_knowledge_items_ai_tags ON public.knowledge_items USING GIN(ai_tags);
CREATE INDEX idx_knowledge_inbox_user_status ON public.knowledge_inbox(user_id, status);
CREATE INDEX idx_knowledge_recordings_user_id ON public.knowledge_recordings(user_id);