-- Add message_type to connection_messages to support different content types
ALTER TABLE public.connection_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'connection_messages_message_type_check'
  ) THEN
    ALTER TABLE public.connection_messages 
    ADD CONSTRAINT connection_messages_message_type_check 
    CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'voice_memo', 'link'));
  END IF;
END $$;

-- Add metadata for link previews and other info
ALTER TABLE public.connection_messages 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create dm_attachments table for storing media attachments
CREATE TABLE IF NOT EXISTS public.dm_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.connection_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  duration_seconds INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add messaging_preference to profiles for configurable access
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS messaging_preference TEXT DEFAULT 'connections_only';

-- Enable RLS on dm_attachments
ALTER TABLE public.dm_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for messages in their conversations
CREATE POLICY "Users can view their conversation attachments"
ON public.dm_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connection_messages cm
    JOIN public.connections c ON cm.connection_id = c.id
    WHERE cm.id = dm_attachments.message_id
    AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
  )
);

-- Users can insert attachments for messages they send
CREATE POLICY "Users can insert their own attachments"
ON public.dm_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.connection_messages cm
    WHERE cm.id = dm_attachments.message_id
    AND cm.sender_id = auth.uid()
  )
);

-- Create storage bucket for DM attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dm-attachments',
  'dm-attachments', 
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create index for faster message queries
CREATE INDEX IF NOT EXISTS idx_connection_messages_connection_id ON public.connection_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_connection_messages_created_at ON public.connection_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_attachments_message_id ON public.dm_attachments(message_id);

-- Enable realtime for connection_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_messages;