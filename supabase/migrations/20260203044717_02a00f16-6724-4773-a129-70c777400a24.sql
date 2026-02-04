-- =============================================================================
-- Cloud Automation Sanity Check: Logging Table Only
-- =============================================================================

-- Create the test automation logs table
CREATE TABLE IF NOT EXISTS public.test_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  run_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  workflow_id UUID,
  agent_id UUID,
  execution_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.test_automation_logs IS 'Logs from automated workflow sanity checks to prove cloud execution';

-- Enable RLS
ALTER TABLE public.test_automation_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (edge functions) to insert
CREATE POLICY "Service role can insert logs"
  ON public.test_automation_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy for authenticated users to view logs
CREATE POLICY "Authenticated users can view logs"
  ON public.test_automation_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for service role to select
CREATE POLICY "Service role can select logs"
  ON public.test_automation_logs
  FOR SELECT
  TO service_role
  USING (true);