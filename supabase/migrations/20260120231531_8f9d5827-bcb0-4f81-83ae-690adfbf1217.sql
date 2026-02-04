-- Create hubspot_webhook_events table for audit trail
CREATE TABLE public.hubspot_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id BIGINT NOT NULL,
  subscription_type TEXT NOT NULL,
  object_id BIGINT NOT NULL,
  portal_id BIGINT NOT NULL,
  property_name TEXT,
  property_value TEXT,
  occurred_at TIMESTAMPTZ,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processing_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_hubspot_webhook_events_event_id ON public.hubspot_webhook_events(event_id);
CREATE INDEX idx_hubspot_webhook_events_object_id ON public.hubspot_webhook_events(object_id);
CREATE INDEX idx_hubspot_webhook_events_subscription ON public.hubspot_webhook_events(subscription_type);
CREATE INDEX idx_hubspot_webhook_events_processed ON public.hubspot_webhook_events(processed);

-- Enable RLS
ALTER TABLE public.hubspot_webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role full access"
ON public.hubspot_webhook_events
FOR ALL
USING (true)
WITH CHECK (true);