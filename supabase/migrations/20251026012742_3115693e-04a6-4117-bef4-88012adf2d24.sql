-- Add draft field to communications table
ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

-- Create index for faster draft queries
CREATE INDEX IF NOT EXISTS idx_communications_draft ON public.communications(user_id, is_draft) WHERE is_draft = true;