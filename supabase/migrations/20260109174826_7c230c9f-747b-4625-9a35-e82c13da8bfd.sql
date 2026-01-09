-- Create deal_room_integrations table for storing CRM connection settings
CREATE TABLE public.deal_room_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'hubspot', 'salesforce', etc.
  api_key_encrypted TEXT,
  sync_preferences JSONB DEFAULT '{"sync_meetings": true, "sync_emails": true, "sync_deals": true, "auto_sync": true}'::jsonb,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_room_id, integration_type)
);

-- Enable RLS
ALTER TABLE public.deal_room_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies - participants can view, creators/admins can manage
CREATE POLICY "Deal room participants can view integrations"
ON public.deal_room_integrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants drp
    WHERE drp.deal_room_id = deal_room_integrations.deal_room_id
    AND drp.user_id = auth.uid()
  )
);

CREATE POLICY "Deal room creators can manage integrations"
ON public.deal_room_integrations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms dr
    WHERE dr.id = deal_room_integrations.deal_room_id
    AND dr.created_by = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_deal_room_integrations_updated_at
BEFORE UPDATE ON public.deal_room_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();