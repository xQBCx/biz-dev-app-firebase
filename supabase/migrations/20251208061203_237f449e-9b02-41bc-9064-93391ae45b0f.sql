-- Create notebooks table for organizing research projects
CREATE TABLE public.notebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'book',
  color TEXT DEFAULT '#6366f1',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notebook sources table for uploaded/linked content
CREATE TABLE public.notebook_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'document', 'url', 'youtube', 'audio', 'text', 'crm_company', 'crm_contact', 'crm_deal', 'task', 'workflow')),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  source_url TEXT,
  platform_entity_id UUID,
  platform_entity_type TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notebook conversations for Q&A history
CREATE TABLE public.notebook_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notebook outputs for generated content
CREATE TABLE public.notebook_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  output_type TEXT NOT NULL CHECK (output_type IN ('audio_overview', 'flashcards', 'quiz', 'study_guide', 'briefing', 'report', 'slides', 'infographic', 'mind_map', 'video')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  audio_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_outputs ENABLE ROW LEVEL SECURITY;

-- Notebooks policies
CREATE POLICY "Users can view their own notebooks" ON public.notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notebooks" ON public.notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notebooks" ON public.notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebooks" ON public.notebooks FOR DELETE USING (auth.uid() = user_id);

-- Notebook sources policies
CREATE POLICY "Users can view their own notebook sources" ON public.notebook_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notebook sources" ON public.notebook_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notebook sources" ON public.notebook_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebook sources" ON public.notebook_sources FOR DELETE USING (auth.uid() = user_id);

-- Notebook conversations policies
CREATE POLICY "Users can view their own notebook conversations" ON public.notebook_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notebook conversations" ON public.notebook_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebook conversations" ON public.notebook_conversations FOR DELETE USING (auth.uid() = user_id);

-- Notebook outputs policies
CREATE POLICY "Users can view their own notebook outputs" ON public.notebook_outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notebook outputs" ON public.notebook_outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notebook outputs" ON public.notebook_outputs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notebook outputs" ON public.notebook_outputs FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notebook_sources_updated_at BEFORE UPDATE ON public.notebook_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notebook_outputs_updated_at BEFORE UPDATE ON public.notebook_outputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for notebook files
INSERT INTO storage.buckets (id, name, public) VALUES ('notebook-files', 'notebook-files', false);

-- Storage policies for notebook files
CREATE POLICY "Users can view their own notebook files" ON storage.objects FOR SELECT USING (bucket_id = 'notebook-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own notebook files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notebook-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own notebook files" ON storage.objects FOR UPDATE USING (bucket_id = 'notebook-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own notebook files" ON storage.objects FOR DELETE USING (bucket_id = 'notebook-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for faster lookups
CREATE INDEX idx_notebook_sources_notebook_id ON public.notebook_sources(notebook_id);
CREATE INDEX idx_notebook_sources_processing_status ON public.notebook_sources(processing_status);
CREATE INDEX idx_notebook_conversations_notebook_id ON public.notebook_conversations(notebook_id);
CREATE INDEX idx_notebook_outputs_notebook_id ON public.notebook_outputs(notebook_id);