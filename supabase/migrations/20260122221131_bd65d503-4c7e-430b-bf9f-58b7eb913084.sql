-- Add initiative_id to generated_proposals to link proposals to initiatives
ALTER TABLE public.generated_proposals 
ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES public.initiatives(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_generated_proposals_initiative_id ON public.generated_proposals(initiative_id);

-- Add initiative_id to deal_rooms to link deal rooms to initiatives
ALTER TABLE public.deal_rooms
ADD COLUMN IF NOT EXISTS initiative_id uuid REFERENCES public.initiatives(id);

-- Add index for performance  
CREATE INDEX IF NOT EXISTS idx_deal_rooms_initiative_id ON public.deal_rooms(initiative_id);

-- Create initiative_documents table for uploaded PDFs and attachments
CREATE TABLE IF NOT EXISTS public.initiative_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  storage_bucket text NOT NULL DEFAULT 'initiative-documents',
  file_type text,
  file_size_bytes bigint,
  parsed_content text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.initiative_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for initiative_documents
CREATE POLICY "Users can view own initiative documents" ON public.initiative_documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own initiative documents" ON public.initiative_documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own initiative documents" ON public.initiative_documents
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own initiative documents" ON public.initiative_documents
  FOR DELETE USING (user_id = auth.uid());

-- Create storage bucket for initiative documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('initiative-documents', 'initiative-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for initiative-documents bucket
CREATE POLICY "Users can upload initiative documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'initiative-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own initiative documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'initiative-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own initiative documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'initiative-documents' AND auth.uid()::text = (storage.foldername(name))[1]);