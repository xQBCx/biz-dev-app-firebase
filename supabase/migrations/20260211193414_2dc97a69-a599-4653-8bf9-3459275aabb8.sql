
-- Add HubSpot sync tracking columns to external_agent_activities
ALTER TABLE public.external_agent_activities
  ADD COLUMN IF NOT EXISTS synced_to_hubspot boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hubspot_sync_id text,
  ADD COLUMN IF NOT EXISTS hubspot_sync_error text;

-- Index for querying unsynced activities
CREATE INDEX IF NOT EXISTS idx_external_agent_activities_hubspot_sync
  ON public.external_agent_activities (synced_to_hubspot)
  WHERE synced_to_hubspot = false;
