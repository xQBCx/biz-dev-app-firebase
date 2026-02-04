-- Create leads table for email captures and lead magnets
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL, -- 'quiz', 'newsletter', 'free_program', 'pdf_guide', 'form_check'
  quiz_results JSONB, -- Store assessment quiz answers and score
  lead_magnet TEXT, -- Which lead magnet they signed up for
  subscribed_newsletter BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE, -- When they became a user
  user_id UUID, -- Link to user if they convert
  UNIQUE(email, source)
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public lead capture)
CREATE POLICY "Anyone can submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view leads" 
ON public.leads 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update leads
CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);