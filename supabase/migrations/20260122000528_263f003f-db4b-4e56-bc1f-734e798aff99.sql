-- Create entity_attachments table for tracking files attached to various entities
CREATE TABLE public.entity_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id),
  
  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'proposal', 'deal_room', 'contact', 'company', 
    'deal', 'task', 'initiative', 'knowledge_item'
  )),
  entity_id UUID NOT NULL,
  
  -- File storage (path-based, not URL)
  storage_bucket TEXT NOT NULL DEFAULT 'entity-attachments',
  storage_path TEXT NOT NULL,
  
  -- File metadata
  filename TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  
  -- Provenance tracking
  attached_via_chat BOOLEAN DEFAULT true,
  ai_conversation_id UUID REFERENCES ai_conversations(id),
  ai_suggested BOOLEAN DEFAULT false,
  
  -- Additional context
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX idx_entity_attachments_entity ON entity_attachments(entity_type, entity_id);
CREATE INDEX idx_entity_attachments_user ON entity_attachments(user_id);
CREATE INDEX idx_entity_attachments_created ON entity_attachments(created_at DESC);

-- Enable RLS
ALTER TABLE entity_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own attachments"
  ON entity_attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attachments"
  ON entity_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attachments"
  ON entity_attachments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON entity_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_entity_attachments_updated_at
  BEFORE UPDATE ON entity_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for entity attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('entity-attachments', 'entity-attachments', false);

-- Storage RLS policies
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'entity-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'entity-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'entity-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'entity-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );