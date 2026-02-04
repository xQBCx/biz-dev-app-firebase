-- Create table for contact notes history
CREATE TABLE public.crm_contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_contact_notes ENABLE ROW LEVEL SECURITY;

-- Users can view notes on their own contacts
CREATE POLICY "Users can view their contact notes"
ON public.crm_contact_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.crm_contacts c 
    WHERE c.id = contact_id AND c.user_id = auth.uid()
  )
);

-- Users can add notes to their own contacts
CREATE POLICY "Users can add notes to their contacts"
ON public.crm_contact_notes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.crm_contacts c 
    WHERE c.id = contact_id AND c.user_id = auth.uid()
  )
);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
ON public.crm_contact_notes
FOR DELETE
USING (auth.uid() = user_id);