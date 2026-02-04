-- Create clients table for multi-client workspace management
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  industry text,
  logo_url text,
  contact_email text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Add client_id to CRM tables for multi-client support
ALTER TABLE public.crm_contacts ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.crm_companies ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.crm_deals ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.crm_activities ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create indexes for performance on client_id lookups
CREATE INDEX idx_crm_contacts_client_id ON public.crm_contacts(client_id);
CREATE INDEX idx_crm_companies_client_id ON public.crm_companies(client_id);
CREATE INDEX idx_crm_deals_client_id ON public.crm_deals(client_id);
CREATE INDEX idx_crm_activities_client_id ON public.crm_activities(client_id);

-- Add updated_at trigger to clients table
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();