-- Enterprise Workflow Automation Schema
-- Workflow Marketplace Listings (monetization)
CREATE TABLE IF NOT EXISTS public.workflow_marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL DEFAULT 'operations',
  tags TEXT[] DEFAULT '{}',
  pricing_model TEXT NOT NULL DEFAULT 'free' CHECK (pricing_model IN ('free', 'one_time', 'subscription', 'usage_based')),
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  subscription_interval TEXT CHECK (subscription_interval IN ('monthly', 'yearly', 'quarterly')),
  usage_rate_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'suspended', 'archived')),
  compliance_level TEXT DEFAULT 'standard' CHECK (compliance_level IN ('standard', 'enterprise', 'government')),
  security_classification TEXT DEFAULT 'public',
  version TEXT NOT NULL DEFAULT '1.0.0',
  icon_url TEXT,
  preview_images TEXT[] DEFAULT '{}',
  documentation_url TEXT,
  support_email TEXT,
  total_installs INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Subscriptions (purchases/access)
CREATE TABLE IF NOT EXISTS public.workflow_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.workflow_marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  workspace_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  payment_method TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Versions (enterprise versioning)
CREATE TABLE IF NOT EXISTS public.workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  changelog TEXT,
  is_published BOOLEAN DEFAULT false,
  deployment_state TEXT DEFAULT 'draft' CHECK (deployment_state IN ('draft', 'staging', 'production', 'deprecated')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workflow_id, version)
);

-- Workflow Execution Runs (enhanced audit trail)
CREATE TABLE IF NOT EXISTS public.workflow_execution_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  version_id UUID REFERENCES public.workflow_versions(id),
  run_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'waiting_approval', 'completed', 'failed', 'cancelled', 'timed_out')),
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_data JSONB DEFAULT '{}',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  error_stack TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  node_count INTEGER DEFAULT 0,
  nodes_completed INTEGER DEFAULT 0,
  nodes_failed INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  parent_run_id UUID REFERENCES public.workflow_execution_runs(id),
  correlation_id TEXT,
  priority INTEGER DEFAULT 5,
  resource_usage JSONB DEFAULT '{}',
  credits_consumed NUMERIC(10,4) DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Node Executions (detailed step logging)
CREATE TABLE IF NOT EXISTS public.workflow_node_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_execution_runs(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  node_name TEXT,
  execution_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'waiting')),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  error_code TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  retry_attempt INTEGER DEFAULT 0,
  external_call_logs JSONB DEFAULT '[]',
  ai_model_used TEXT,
  tokens_consumed INTEGER,
  cost_cents NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Approvals (human-in-the-loop)
CREATE TABLE IF NOT EXISTS public.workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_execution_runs(id) ON DELETE CASCADE,
  node_execution_id UUID REFERENCES public.workflow_node_executions(id),
  approval_type TEXT NOT NULL DEFAULT 'continue' CHECK (approval_type IN ('continue', 'review', 'authorize', 'sign_off', 'escalate')),
  title TEXT NOT NULL,
  description TEXT,
  context_data JSONB DEFAULT '{}',
  required_role TEXT,
  assigned_to UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'escalated')),
  decision_reason TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  escalate_to UUID,
  escalated_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Schedules (cron-based scheduling)
CREATE TABLE IF NOT EXISTS public.workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  input_data JSONB DEFAULT '{}',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  max_consecutive_failures INTEGER DEFAULT 3,
  retry_on_failure BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Webhooks (incoming triggers)
CREATE TABLE IF NOT EXISTS public.workflow_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  webhook_key TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  secret_key TEXT,
  is_active BOOLEAN DEFAULT true,
  allowed_ips TEXT[],
  rate_limit INTEGER DEFAULT 100,
  rate_limit_window_seconds INTEGER DEFAULT 60,
  validation_schema JSONB,
  transform_script TEXT,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extend workflow_node_types with execution metadata
ALTER TABLE public.workflow_node_types 
ADD COLUMN IF NOT EXISTS execution_handler TEXT,
ADD COLUMN IF NOT EXISTS timeout_seconds INTEGER DEFAULT 300,
ADD COLUMN IF NOT EXISTS retry_config JSONB DEFAULT '{"max_retries": 3, "backoff_ms": 1000}',
ADD COLUMN IF NOT EXISTS cost_per_execution NUMERIC(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS supported_integrations TEXT[] DEFAULT '{}';

-- Marketplace Reviews
CREATE TABLE IF NOT EXISTS public.workflow_marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.workflow_marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON public.workflow_execution_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON public.workflow_execution_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created ON public.workflow_execution_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_node_executions_run ON public.workflow_node_executions(run_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_status ON public.workflow_node_executions(status);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.workflow_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_assigned ON public.workflow_approvals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.workflow_marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.workflow_marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.workflow_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON public.workflow_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhooks_key ON public.workflow_webhooks(webhook_key);

-- RLS Policies
ALTER TABLE public.workflow_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_node_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Marketplace listings: publishers can manage, everyone can view published
CREATE POLICY "Publishers can manage own listings" ON public.workflow_marketplace_listings
  FOR ALL USING (publisher_id = auth.uid());

CREATE POLICY "Anyone can view published listings" ON public.workflow_marketplace_listings
  FOR SELECT USING (status = 'published');

-- Subscriptions: users can view and manage their own
CREATE POLICY "Users can view own subscriptions" ON public.workflow_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subscriptions" ON public.workflow_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Versions: workflow owners can manage
CREATE POLICY "Workflow owners can manage versions" ON public.workflow_versions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

-- Execution runs: workflow owners can view
CREATE POLICY "Workflow owners can view runs" ON public.workflow_execution_runs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

CREATE POLICY "Workflow owners can manage runs" ON public.workflow_execution_runs
  FOR ALL USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

-- Node executions: accessible via run ownership
CREATE POLICY "Run owners can view node executions" ON public.workflow_node_executions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.workflow_execution_runs r 
    JOIN public.workflows w ON w.id = r.workflow_id 
    WHERE r.id = run_id AND w.user_id = auth.uid()
  ));

-- Approvals: assigned users and workflow owners
CREATE POLICY "Assigned users can view approvals" ON public.workflow_approvals
  FOR SELECT USING (assigned_to = auth.uid() OR EXISTS (
    SELECT 1 FROM public.workflow_execution_runs r 
    JOIN public.workflows w ON w.id = r.workflow_id 
    WHERE r.id = run_id AND w.user_id = auth.uid()
  ));

CREATE POLICY "Assigned users can update approvals" ON public.workflow_approvals
  FOR UPDATE USING (assigned_to = auth.uid());

-- Schedules: workflow owners
CREATE POLICY "Workflow owners can view schedules" ON public.workflow_schedules
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

CREATE POLICY "Workflow owners can manage schedules" ON public.workflow_schedules
  FOR ALL USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

-- Webhooks: workflow owners
CREATE POLICY "Workflow owners can view webhooks" ON public.workflow_webhooks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

CREATE POLICY "Workflow owners can manage webhooks" ON public.workflow_webhooks
  FOR ALL USING (EXISTS (SELECT 1 FROM public.workflows w WHERE w.id = workflow_id AND w.user_id = auth.uid()));

-- Reviews: anyone can view, users can manage own
CREATE POLICY "Anyone can view reviews" ON public.workflow_marketplace_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON public.workflow_marketplace_reviews
  FOR ALL USING (user_id = auth.uid());

-- Helper function to get next run number
CREATE OR REPLACE FUNCTION public.get_next_workflow_run_number(p_workflow_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(run_number), 0) + 1 INTO next_num
  FROM public.workflow_execution_runs
  WHERE workflow_id = p_workflow_id;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-update marketplace stats
CREATE OR REPLACE FUNCTION public.update_marketplace_listing_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.workflow_marketplace_listings
  SET 
    total_runs = total_runs + 1,
    updated_at = now()
  WHERE workflow_id = NEW.workflow_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_marketplace_stats ON public.workflow_execution_runs;
CREATE TRIGGER trigger_update_marketplace_stats
  AFTER INSERT ON public.workflow_execution_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_listing_stats();

-- Update review stats on listing
CREATE OR REPLACE FUNCTION public.update_listing_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.workflow_marketplace_listings
  SET 
    average_rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.workflow_marketplace_reviews WHERE listing_id = NEW.listing_id),
    review_count = (SELECT COUNT(*) FROM public.workflow_marketplace_reviews WHERE listing_id = NEW.listing_id),
    updated_at = now()
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_update_review_stats ON public.workflow_marketplace_reviews;
CREATE TRIGGER trigger_update_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.workflow_marketplace_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_listing_review_stats();