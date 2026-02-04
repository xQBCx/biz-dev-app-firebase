-- Create knowledge_base table for storing business information
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'services', 'pricing', 'service_areas', 'usp', 'about', 'faq'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Admins can manage knowledge base
CREATE POLICY "Admins can manage knowledge base"
ON public.knowledge_base
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read active knowledge base entries (for AI agents)
CREATE POLICY "Anyone can read active knowledge base"
ON public.knowledge_base
FOR SELECT
USING (is_active = true);

-- Create updated_at trigger
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create outreach_sequences table for automated email sequences
CREATE TABLE public.outreach_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_lead_types lead_type[] DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]', -- Array of {day: number, subject: string, content: string, type: 'email'|'sms'}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_sequences ENABLE ROW LEVEL SECURITY;

-- Admins can manage sequences
CREATE POLICY "Admins can manage outreach sequences"
ON public.outreach_sequences
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_outreach_sequences_updated_at
BEFORE UPDATE ON public.outreach_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add sequence tracking to leads
ALTER TABLE public.marketing_leads 
ADD COLUMN IF NOT EXISTS current_sequence_id UUID REFERENCES public.outreach_sequences(id),
ADD COLUMN IF NOT EXISTS sequence_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_outreach_date TIMESTAMP WITH TIME ZONE;