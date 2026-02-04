-- Create prompt_library table for storing prompts and feature ideas
CREATE TABLE public.prompt_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'used', 'archived')),
  images JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own prompts" 
ON public.prompt_library 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts" 
ON public.prompt_library 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" 
ON public.prompt_library 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" 
ON public.prompt_library 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_prompt_library_user_id ON public.prompt_library(user_id);
CREATE INDEX idx_prompt_library_category ON public.prompt_library(category);
CREATE INDEX idx_prompt_library_status ON public.prompt_library(status);
CREATE INDEX idx_prompt_library_created_at ON public.prompt_library(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prompt_library_updated_at
BEFORE UPDATE ON public.prompt_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for prompt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-library-images', 'prompt-library-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for prompt images
CREATE POLICY "Users can view prompt images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'prompt-library-images');

CREATE POLICY "Users can upload prompt images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'prompt-library-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their prompt images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'prompt-library-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their prompt images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'prompt-library-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for prompt_library
ALTER PUBLICATION supabase_realtime ADD TABLE public.prompt_library;