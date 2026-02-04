-- Create IP applications table
CREATE TABLE public.ip_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('patent', 'trademark')),
  sub_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'pending_review', 'filed', 'office_action', 'approved', 'rejected')),
  payment_model TEXT NOT NULL CHECK (payment_model IN ('pay', 'equity')),
  
  -- Applicant Info
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  
  -- Patent Fields
  invention_title TEXT,
  invention_description TEXT,
  
  -- Trademark Fields
  mark_text TEXT,
  mark_type TEXT,
  tm_classes TEXT,
  goods_services_description TEXT,
  
  -- AI Analysis Results
  ai_analysis JSONB,
  
  -- USPTO Filing
  uspto_confirmation_number TEXT,
  uspto_filing_date TIMESTAMPTZ,
  
  -- Equity Deal Fields
  equity_percentage DECIMAL,
  royalty_percentage DECIMAL,
  deal_terms JSONB,
  deal_signed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own applications"
ON public.ip_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.ip_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.ip_applications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create documents table for storing PDFs, contracts, etc.
CREATE TABLE public.ip_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.ip_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('provisional_patent', 'utility_patent', 'trademark_application', 'nda', 'equity_agreement', 'uspto_response', 'office_action')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own documents"
ON public.ip_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
ON public.ip_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create payments table
CREATE TABLE public.ip_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.ip_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payments"
ON public.ip_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ip_applications_updated_at
BEFORE UPDATE ON public.ip_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();