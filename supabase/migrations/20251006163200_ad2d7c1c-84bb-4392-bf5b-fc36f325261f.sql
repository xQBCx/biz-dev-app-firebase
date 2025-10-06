-- Create table for Lindy.ai integrations
CREATE TABLE public.lindy_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Lindy.ai webhook events
CREATE TABLE public.lindy_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.lindy_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  workflow_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lindy_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lindy_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for lindy_integrations
CREATE POLICY "Users can view their own Lindy integrations"
  ON public.lindy_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Lindy integrations"
  ON public.lindy_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Lindy integrations"
  ON public.lindy_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Lindy integrations"
  ON public.lindy_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for lindy_webhooks
CREATE POLICY "Users can view webhooks for their integrations"
  ON public.lindy_webhooks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lindy_integrations
      WHERE lindy_integrations.id = lindy_webhooks.integration_id
      AND lindy_integrations.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert webhook events"
  ON public.lindy_webhooks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all webhooks"
  ON public.lindy_webhooks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger for lindy_integrations
CREATE TRIGGER set_lindy_integrations_updated_at
  BEFORE UPDATE ON public.lindy_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_lindy_webhooks_integration_id ON public.lindy_webhooks(integration_id);
CREATE INDEX idx_lindy_webhooks_processed ON public.lindy_webhooks(processed);
CREATE INDEX idx_lindy_integrations_user_id ON public.lindy_integrations(user_id);