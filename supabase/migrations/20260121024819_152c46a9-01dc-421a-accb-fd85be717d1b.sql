-- Create partner_integrations table for secure API token management
CREATE TABLE public.partner_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name TEXT NOT NULL,
  partner_slug TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_email TEXT,
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL, -- Store first 8 chars for identification
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,
  allowed_deal_room_ids UUID[] DEFAULT '{}',
  allowed_hubspot_accounts JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create partner_api_logs table for audit trail
CREATE TABLE public.partner_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partner_integrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  request_payload JSONB,
  response_status INTEGER,
  response_summary TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_integrations (admin only)
CREATE POLICY "Admins can view partner integrations"
  ON public.partner_integrations
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create partner integrations"
  ON public.partner_integrations
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partner integrations"
  ON public.partner_integrations
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partner integrations"
  ON public.partner_integrations
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_api_logs (admin only)
CREATE POLICY "Admins can view partner API logs"
  ON public.partner_api_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_partner_integrations_slug ON public.partner_integrations(partner_slug);
CREATE INDEX idx_partner_integrations_active ON public.partner_integrations(is_active);
CREATE INDEX idx_partner_api_logs_partner_id ON public.partner_api_logs(partner_id);
CREATE INDEX idx_partner_api_logs_created_at ON public.partner_api_logs(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_partner_integrations_updated_at
  BEFORE UPDATE ON public.partner_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_construction_updated_at();