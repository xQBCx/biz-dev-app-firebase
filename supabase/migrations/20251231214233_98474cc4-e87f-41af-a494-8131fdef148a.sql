-- Create business domains table for managing subdomains and custom domains
CREATE TABLE public.business_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.spawned_businesses(id) ON DELETE CASCADE,
  
  -- Auto-assigned subdomain (e.g., xcommodityx.bizdev.app)
  subdomain VARCHAR(63) NOT NULL UNIQUE,
  subdomain_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Custom domain (optional)
  custom_domain VARCHAR(255),
  custom_domain_status VARCHAR(50) DEFAULT 'pending' CHECK (custom_domain_status IN ('pending', 'verifying', 'verified', 'failed', 'active', 'offline')),
  
  -- DNS verification
  verification_token VARCHAR(64),
  verification_method VARCHAR(20) DEFAULT 'txt_record',
  dns_records_configured BOOLEAN DEFAULT false,
  last_dns_check TIMESTAMPTZ,
  dns_check_error TEXT,
  
  -- SSL status
  ssl_status VARCHAR(50) DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'failed', 'expired')),
  ssl_provisioned_at TIMESTAMPTZ,
  ssl_expires_at TIMESTAMPTZ,
  
  -- Primary domain selection
  is_primary BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Unique constraint for custom domains
CREATE UNIQUE INDEX idx_business_domains_custom_domain 
ON public.business_domains(custom_domain) 
WHERE custom_domain IS NOT NULL;

-- Index for quick subdomain lookups
CREATE INDEX idx_business_domains_subdomain ON public.business_domains(subdomain);
CREATE INDEX idx_business_domains_business_id ON public.business_domains(business_id);

-- Enable RLS
ALTER TABLE public.business_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Business owners can manage their domains
CREATE POLICY "Users can view domains for their businesses"
ON public.business_domains
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.spawned_businesses sb
    WHERE sb.id = business_domains.business_id
    AND sb.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert domains for their businesses"
ON public.business_domains
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.spawned_businesses sb
    WHERE sb.id = business_domains.business_id
    AND sb.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update domains for their businesses"
ON public.business_domains
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.spawned_businesses sb
    WHERE sb.id = business_domains.business_id
    AND sb.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete domains for their businesses"
ON public.business_domains
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.spawned_businesses sb
    WHERE sb.id = business_domains.business_id
    AND sb.user_id = auth.uid()
  )
);

-- Trigger to update updated_at
CREATE TRIGGER update_business_domains_updated_at
BEFORE UPDATE ON public.business_domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique subdomain from business name
CREATE OR REPLACE FUNCTION public.generate_business_subdomain(business_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_subdomain TEXT;
  final_subdomain TEXT;
  counter INTEGER := 0;
BEGIN
  -- Sanitize business name: lowercase, replace spaces with hyphens, remove special chars
  base_subdomain := lower(regexp_replace(business_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_subdomain := regexp_replace(base_subdomain, '^-+|-+$', '', 'g');
  base_subdomain := substring(base_subdomain, 1, 50); -- Keep it reasonable length
  
  final_subdomain := base_subdomain;
  
  -- Check for uniqueness, append number if needed
  WHILE EXISTS (SELECT 1 FROM public.business_domains WHERE subdomain = final_subdomain) LOOP
    counter := counter + 1;
    final_subdomain := base_subdomain || '-' || counter;
  END LOOP;
  
  RETURN final_subdomain;
END;
$$;

-- Function to auto-create domain record when business is spawned
CREATE OR REPLACE FUNCTION public.auto_create_business_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_subdomain TEXT;
  verification_token TEXT;
BEGIN
  -- Generate unique subdomain
  new_subdomain := generate_business_subdomain(NEW.business_name);
  
  -- Generate verification token
  verification_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create domain record
  INSERT INTO public.business_domains (
    business_id,
    subdomain,
    verification_token,
    created_by,
    is_primary
  ) VALUES (
    NEW.id,
    new_subdomain,
    verification_token,
    NEW.user_id,
    true
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create domain on business spawn
CREATE TRIGGER auto_create_business_domain_trigger
AFTER INSERT ON public.spawned_businesses
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_business_domain();

-- Enable realtime for domain updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_domains;