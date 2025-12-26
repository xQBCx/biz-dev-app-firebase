-- Universal Value Registry (UVR) - Core Tables
-- Tracks all identifiable assets, their classifications, values, and history

-- Main asset registry table
CREATE TABLE public.value_registry_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL, -- 'physical', 'digital', 'financial', 'service', 'infrastructure', 'ip'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  hs_code TEXT, -- Harmonized System code for physical goods
  gpc_code TEXT, -- Global Product Classification
  naics_code TEXT, -- North American Industry Classification
  custom_category TEXT,
  
  -- Identity
  external_id TEXT, -- VIN, GTIN, contract address, etc.
  serial_number TEXT,
  
  -- Ownership
  owner_type TEXT, -- 'user', 'company', 'system', 'public'
  owner_id UUID,
  
  -- Location
  location_geo JSONB, -- {lat, lng, address}
  jurisdiction TEXT,
  
  -- Composition (for assemblies)
  parent_asset_id UUID REFERENCES public.value_registry_assets(id),
  is_composite BOOLEAN DEFAULT false,
  component_count INTEGER DEFAULT 0,
  
  -- Current valuation snapshot
  current_value NUMERIC(20, 4),
  value_currency TEXT DEFAULT 'USD',
  value_confidence NUMERIC(5, 4), -- 0-1 confidence score
  valuation_method TEXT, -- 'market', 'replacement', 'hedonic', 'dcf', 'cost'
  last_valued_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'pending', 'deprecated'
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Value history table - tracks all valuations over time
CREATE TABLE public.value_registry_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.value_registry_assets(id) ON DELETE CASCADE,
  
  -- Valuation
  value NUMERIC(20, 4) NOT NULL,
  currency TEXT DEFAULT 'USD',
  confidence_score NUMERIC(5, 4),
  
  -- Method and source
  valuation_method TEXT NOT NULL, -- 'market', 'replacement', 'hedonic', 'dcf', 'cost', 'appraisal'
  data_source TEXT, -- 'exchange', 'marketplace', 'appraisal', 'model', 'manual'
  source_reference TEXT, -- URL or ID of source
  
  -- Context
  context JSONB, -- market conditions, assumptions, etc.
  notes TEXT,
  
  -- Who/when
  valued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valued_by UUID,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classification taxonomy table
CREATE TABLE public.value_registry_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_code TEXT REFERENCES public.value_registry_classifications(code),
  level INTEGER DEFAULT 0,
  path TEXT[], -- full path from root
  
  -- Type
  taxonomy TEXT NOT NULL, -- 'hs', 'gpc', 'naics', 'custom'
  
  -- Valuation hints
  typical_valuation_methods TEXT[],
  typical_depreciation_rate NUMERIC(5, 4),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asset events/transactions table
CREATE TABLE public.value_registry_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.value_registry_assets(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL, -- 'created', 'transferred', 'valued', 'modified', 'certified', 'damaged', 'repaired'
  event_data JSONB NOT NULL DEFAULT '{}',
  
  -- Value impact
  value_before NUMERIC(20, 4),
  value_after NUMERIC(20, 4),
  value_change NUMERIC(20, 4),
  
  -- Parties
  from_owner_id UUID,
  to_owner_id UUID,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verification_hash TEXT,
  
  event_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_vr_assets_type ON public.value_registry_assets(asset_type);
CREATE INDEX idx_vr_assets_owner ON public.value_registry_assets(owner_type, owner_id);
CREATE INDEX idx_vr_assets_status ON public.value_registry_assets(status);
CREATE INDEX idx_vr_assets_category ON public.value_registry_assets(custom_category);
CREATE INDEX idx_vr_history_asset ON public.value_registry_history(asset_id);
CREATE INDEX idx_vr_history_valued_at ON public.value_registry_history(valued_at);
CREATE INDEX idx_vr_events_asset ON public.value_registry_events(asset_id);
CREATE INDEX idx_vr_events_type ON public.value_registry_events(event_type);
CREATE INDEX idx_vr_classifications_taxonomy ON public.value_registry_classifications(taxonomy);

-- Enable RLS
ALTER TABLE public.value_registry_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_registry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_registry_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_registry_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies - viewable by authenticated users
CREATE POLICY "Authenticated users can view assets" 
ON public.value_registry_assets FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can create assets" 
ON public.value_registry_assets FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own assets" 
ON public.value_registry_assets FOR UPDATE 
TO authenticated USING (created_by = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Authenticated users can view history" 
ON public.value_registry_history FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can add history" 
ON public.value_registry_history FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view classifications" 
ON public.value_registry_classifications FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view events" 
ON public.value_registry_events FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can create events" 
ON public.value_registry_events FOR INSERT 
TO authenticated WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_vr_assets_updated_at
  BEFORE UPDATE ON public.value_registry_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.value_registry_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.value_registry_events;