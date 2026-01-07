-- Add default_permissions to deal_room_participants for pre-invite permission configuration
ALTER TABLE public.deal_room_participants 
ADD COLUMN IF NOT EXISTS default_permissions JSONB DEFAULT '{}'::jsonb;

-- Add visibility_config for per-participant visibility overrides
ALTER TABLE public.deal_room_participants 
ADD COLUMN IF NOT EXISTS visibility_config JSONB DEFAULT '{}'::jsonb;

-- Add role_type for simple role assignment (hybrid approach)
ALTER TABLE public.deal_room_participants 
ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'participant';

COMMENT ON COLUMN public.deal_room_participants.default_permissions IS 'Pre-configured permissions for this participant. Applied when user joins. Can be overridden individually.';
COMMENT ON COLUMN public.deal_room_participants.visibility_config IS 'What this participant can see: financials, participants, documents, deal_terms. Each key maps to scope: own_only, role_based, all, none';
COMMENT ON COLUMN public.deal_room_participants.role_type IS 'Role in this deal room: creator, admin, investor, advisor, vendor, partner, participant, observer';

-- Create deal_room_role_templates table for reusable role definitions per deal
CREATE TABLE IF NOT EXISTS public.deal_room_role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  role_description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_system_role BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '[]'::jsonb,
  visibility_config JSONB DEFAULT '{"financials": "own_only", "participants": "all", "documents": "role_based", "deal_terms": "all"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_room_id, role_name)
);

-- Create deal_room_permission_overrides for per-participant overrides
CREATE TABLE IF NOT EXISTS public.deal_room_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.deal_room_participants(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  UNIQUE(participant_id, permission_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deal_room_role_templates_deal ON public.deal_room_role_templates(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_deal_room_permission_overrides_participant ON public.deal_room_permission_overrides(participant_id);

-- Enable RLS
ALTER TABLE public.deal_room_role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_permission_overrides ENABLE ROW LEVEL SECURITY;

-- RLS for role templates
CREATE POLICY "Participants can view role templates in their deal rooms"
ON public.deal_room_role_templates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants p
    WHERE p.deal_room_id = deal_room_role_templates.deal_room_id
    AND p.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Creators and admins can manage role templates"
ON public.deal_room_role_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms dr
    WHERE dr.id = deal_room_role_templates.deal_room_id
    AND dr.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS for permission overrides
CREATE POLICY "Participants can view their own permission overrides"
ON public.deal_room_permission_overrides FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_room_participants p
    WHERE p.id = deal_room_permission_overrides.participant_id
    AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.deal_rooms dr
    WHERE dr.id = deal_room_permission_overrides.deal_room_id
    AND dr.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Creators and admins can manage permission overrides"
ON public.deal_room_permission_overrides FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.deal_rooms dr
    WHERE dr.id = deal_room_permission_overrides.deal_room_id
    AND dr.created_by = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_deal_room_role_templates_updated_at
BEFORE UPDATE ON public.deal_room_role_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();