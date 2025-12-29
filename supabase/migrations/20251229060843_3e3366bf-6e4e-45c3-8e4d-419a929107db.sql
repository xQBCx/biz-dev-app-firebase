-- ============================================
-- BUSINESS SPAWNING SYSTEM
-- AGI-powered business creation and tracking
-- ============================================

-- Enum for business spawn status
CREATE TYPE public.business_spawn_status AS ENUM (
  'draft',
  'researching',
  'generating_erp',
  'generating_website',
  'generating_content',
  'pending_approval',
  'approved',
  'active',
  'suspended',
  'archived'
);

-- Enum for spawn request status
CREATE TYPE public.spawn_request_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Main spawned businesses table
CREATE TABLE public.spawned_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Business Identity
  business_name TEXT NOT NULL,
  business_slug TEXT UNIQUE,
  business_type TEXT,
  industry TEXT,
  description TEXT,
  mission_statement TEXT,
  
  -- Location & Contact
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  
  -- Generated Assets
  erp_structure JSONB DEFAULT '{}',
  website_data JSONB DEFAULT '{}',
  content_assets JSONB DEFAULT '{}',
  research_data JSONB DEFAULT '{}',
  
  -- Domain & Hosting
  custom_domain TEXT,
  subdomain TEXT,
  domain_status TEXT DEFAULT 'none',
  
  -- AI Learning & Embeddings
  business_embedding FLOAT8[],
  capabilities TEXT[],
  products_services TEXT[],
  target_market TEXT[],
  
  -- Network Matching Tags (for connecting businesses)
  offers_tags TEXT[],
  needs_tags TEXT[],
  
  -- Status & Tracking
  status business_spawn_status DEFAULT 'draft',
  spawn_progress INTEGER DEFAULT 0,
  spawn_log JSONB DEFAULT '[]',
  
  -- Cost Tracking
  total_ai_tokens_used INTEGER DEFAULT 0,
  total_storage_bytes BIGINT DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 2) DEFAULT 0,
  
  -- Ownership & Equity
  platform_equity_percent NUMERIC(5, 2) DEFAULT 0,
  equity_agreement_signed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  launched_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT now()
);

-- Request table for users wanting additional businesses
CREATE TABLE public.business_spawn_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Request Details
  business_name TEXT NOT NULL,
  business_type TEXT,
  industry TEXT,
  description TEXT,
  reason_for_additional TEXT,
  
  -- Review
  status spawn_request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- If approved, link to created business
  spawned_business_id UUID REFERENCES public.spawned_businesses(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business spawn conversation history (for AGI learning)
CREATE TABLE public.business_spawn_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spawned_business_id UUID REFERENCES public.spawned_businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  
  -- Learning metadata
  phase TEXT, -- 'discovery', 'research', 'erp_design', 'website', 'content'
  extracted_insights JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Business network connections (for matching businesses)
CREATE TABLE public.business_network_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_business_id UUID REFERENCES public.spawned_businesses(id) ON DELETE CASCADE NOT NULL,
  target_business_id UUID REFERENCES public.spawned_businesses(id) ON DELETE CASCADE NOT NULL,
  
  edge_type TEXT NOT NULL, -- 'supplier', 'customer', 'partner', 'competitor', 'referral'
  match_score NUMERIC(5, 4), -- AI-computed compatibility score
  match_reasons TEXT[],
  
  -- Interaction tracking
  interaction_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'suggested', -- 'suggested', 'connected', 'declined'
  connected_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(source_business_id, target_business_id, edge_type)
);

-- Platform resource usage tracking (for cost analysis)
CREATE TABLE public.platform_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spawned_business_id UUID REFERENCES public.spawned_businesses(id) ON DELETE CASCADE,
  
  resource_type TEXT NOT NULL, -- 'ai_tokens', 'storage', 'api_calls', 'embeddings'
  resource_subtype TEXT, -- e.g., 'gpt-5', 'gemini-3-pro', 'storage_upload'
  
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL, -- 'tokens', 'bytes', 'calls'
  
  estimated_cost_usd NUMERIC(10, 6),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spawned_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_spawn_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_spawn_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_network_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spawned_businesses
CREATE POLICY "Users can view their own businesses"
ON public.spawned_businesses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own businesses"
ON public.spawned_businesses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
ON public.spawned_businesses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all businesses"
ON public.spawned_businesses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all businesses"
ON public.spawned_businesses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for business_spawn_requests
CREATE POLICY "Users can view their own requests"
ON public.business_spawn_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
ON public.business_spawn_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.business_spawn_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
ON public.business_spawn_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.business_spawn_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.business_spawn_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for network edges (users can see edges involving their businesses)
CREATE POLICY "Users can view their business network"
ON public.business_network_edges FOR SELECT
USING (
  source_business_id IN (SELECT id FROM spawned_businesses WHERE user_id = auth.uid())
  OR target_business_id IN (SELECT id FROM spawned_businesses WHERE user_id = auth.uid())
);

-- RLS Policies for usage logs
CREATE POLICY "Users can view their own usage"
ON public.platform_usage_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
ON public.platform_usage_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Function to count user's businesses
CREATE OR REPLACE FUNCTION public.get_user_business_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.spawned_businesses
  WHERE user_id = p_user_id
  AND status NOT IN ('archived', 'suspended')
$$;

-- Function to check if user can spawn new business
CREATE OR REPLACE FUNCTION public.can_spawn_business(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  business_count INTEGER;
  is_admin BOOLEAN;
BEGIN
  -- Admins can always create businesses
  SELECT public.has_role(p_user_id, 'admin') INTO is_admin;
  IF is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user already has a business
  SELECT get_user_business_count(p_user_id) INTO business_count;
  
  -- First business is always allowed
  RETURN business_count = 0;
END;
$$;

-- Function to log platform usage
CREATE OR REPLACE FUNCTION public.log_platform_usage(
  p_user_id UUID,
  p_business_id UUID,
  p_resource_type TEXT,
  p_resource_subtype TEXT,
  p_quantity INTEGER,
  p_unit TEXT,
  p_cost_usd NUMERIC DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO platform_usage_logs (
    user_id, spawned_business_id, resource_type, resource_subtype,
    quantity, unit, estimated_cost_usd, metadata
  ) VALUES (
    p_user_id, p_business_id, p_resource_type, p_resource_subtype,
    p_quantity, p_unit, p_cost_usd, p_metadata
  )
  RETURNING id INTO log_id;
  
  -- Update business total usage if applicable
  IF p_business_id IS NOT NULL THEN
    UPDATE spawned_businesses
    SET 
      total_ai_tokens_used = total_ai_tokens_used + CASE WHEN p_resource_type = 'ai_tokens' THEN p_quantity ELSE 0 END,
      total_storage_bytes = total_storage_bytes + CASE WHEN p_resource_type = 'storage' THEN p_quantity ELSE 0 END,
      estimated_cost_usd = estimated_cost_usd + COALESCE(p_cost_usd, 0),
      last_activity_at = now()
    WHERE id = p_business_id;
  END IF;
  
  RETURN log_id;
END;
$$;

-- Indexes for performance
CREATE INDEX idx_spawned_businesses_user_id ON public.spawned_businesses(user_id);
CREATE INDEX idx_spawned_businesses_status ON public.spawned_businesses(status);
CREATE INDEX idx_spawned_businesses_offers_tags ON public.spawned_businesses USING GIN(offers_tags);
CREATE INDEX idx_spawned_businesses_needs_tags ON public.spawned_businesses USING GIN(needs_tags);
CREATE INDEX idx_business_spawn_requests_user_id ON public.business_spawn_requests(user_id);
CREATE INDEX idx_business_spawn_requests_status ON public.business_spawn_requests(status);
CREATE INDEX idx_business_network_edges_source ON public.business_network_edges(source_business_id);
CREATE INDEX idx_business_network_edges_target ON public.business_network_edges(target_business_id);
CREATE INDEX idx_platform_usage_logs_user_id ON public.platform_usage_logs(user_id);
CREATE INDEX idx_platform_usage_logs_business_id ON public.platform_usage_logs(spawned_business_id);

-- Update trigger
CREATE TRIGGER update_spawned_businesses_updated_at
  BEFORE UPDATE ON public.spawned_businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_spawn_requests_updated_at
  BEFORE UPDATE ON public.business_spawn_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();