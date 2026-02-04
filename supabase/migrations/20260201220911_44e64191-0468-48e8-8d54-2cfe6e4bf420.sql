-- ============================================
-- Phase 1: Oracle Network Infrastructure
-- The bridge between real-world events and smart contracts
-- ============================================

-- Create enum for oracle provider types
CREATE TYPE public.oracle_provider_type AS ENUM (
  'sensor',
  'api',
  'manual',
  'attestation',
  'price_feed',
  'iot_device'
);

-- Create enum for trust levels
CREATE TYPE public.oracle_trust_level AS ENUM (
  'bronze',
  'silver',
  'gold',
  'platinum'
);

-- Create enum for attestation types
CREATE TYPE public.oracle_attestation_type AS ENUM (
  'field_supervisor',
  'quality_inspector',
  'auditor',
  'compliance_officer',
  'executive',
  'third_party'
);

-- Create enum for commodity types
CREATE TYPE public.commodity_type AS ENUM (
  'oil',
  'natural_gas',
  'electricity',
  'carbon_credit',
  'rin',
  'water',
  'minerals',
  'agricultural',
  'other'
);

-- Oracle Data Providers Table
CREATE TABLE public.oracle_data_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  provider_type public.oracle_provider_type NOT NULL,
  endpoint_url TEXT,
  auth_config JSONB,
  data_schema JSONB,
  trust_level public.oracle_trust_level NOT NULL DEFAULT 'bronze',
  is_certified BOOLEAN NOT NULL DEFAULT false,
  certified_at TIMESTAMPTZ,
  certifier_id UUID REFERENCES auth.users(id),
  owner_user_id UUID REFERENCES auth.users(id),
  usage_stats JSONB DEFAULT '{"total_calls": 0, "successful_calls": 0, "failed_calls": 0}'::jsonb,
  last_polled_at TIMESTAMPTZ,
  polling_enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Oracle Data Feeds Table
CREATE TABLE public.oracle_data_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.oracle_data_providers(id) ON DELETE CASCADE,
  feed_name TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  commodity_type public.commodity_type,
  unit_of_measure TEXT,
  polling_frequency_seconds INTEGER NOT NULL DEFAULT 300,
  last_value JSONB,
  last_updated TIMESTAMPTZ,
  validation_rules JSONB,
  anomaly_threshold NUMERIC,
  deal_room_subscriptions UUID[] DEFAULT '{}',
  settlement_contract_subscriptions UUID[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Oracle Attestations Table
CREATE TABLE public.oracle_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.oracle_data_providers(id),
  attester_id UUID NOT NULL REFERENCES auth.users(id),
  attestation_type public.oracle_attestation_type NOT NULL,
  subject_entity_type TEXT NOT NULL,
  subject_entity_id UUID NOT NULL,
  deal_room_id UUID REFERENCES public.deal_rooms(id),
  settlement_contract_id UUID,
  attestation_data JSONB NOT NULL,
  signature_hash TEXT,
  xodiak_tx_hash TEXT,
  xodiak_block_number BIGINT,
  geolocation JSONB,
  device_info JSONB,
  photo_evidence_urls TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Oracle Feed History Table
CREATE TABLE public.oracle_feed_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES public.oracle_data_feeds(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  source_timestamp TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_anomaly BOOLEAN NOT NULL DEFAULT false,
  anomaly_notes TEXT,
  xodiak_tx_hash TEXT
);

-- Oracle Conditions Table
CREATE TABLE public.oracle_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  feed_id UUID REFERENCES public.oracle_data_feeds(id),
  attestation_type public.oracle_attestation_type,
  condition_expression TEXT NOT NULL,
  settlement_contract_id UUID,
  deal_room_id UUID REFERENCES public.deal_rooms(id),
  is_met BOOLEAN NOT NULL DEFAULT false,
  last_checked_at TIMESTAMPTZ,
  met_at TIMESTAMPTZ,
  triggered_action TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_oracle_providers_type ON public.oracle_data_providers(provider_type);
CREATE INDEX idx_oracle_providers_trust_level ON public.oracle_data_providers(trust_level);
CREATE INDEX idx_oracle_providers_certified ON public.oracle_data_providers(is_certified) WHERE is_certified = true;
CREATE INDEX idx_oracle_providers_owner ON public.oracle_data_providers(owner_user_id);

CREATE INDEX idx_oracle_feeds_provider ON public.oracle_data_feeds(provider_id);
CREATE INDEX idx_oracle_feeds_commodity ON public.oracle_data_feeds(commodity_type);
CREATE INDEX idx_oracle_feeds_active ON public.oracle_data_feeds(is_active) WHERE is_active = true;

CREATE INDEX idx_oracle_attestations_attester ON public.oracle_attestations(attester_id);
CREATE INDEX idx_oracle_attestations_type ON public.oracle_attestations(attestation_type);
CREATE INDEX idx_oracle_attestations_subject ON public.oracle_attestations(subject_entity_type, subject_entity_id);
CREATE INDEX idx_oracle_attestations_deal_room ON public.oracle_attestations(deal_room_id);
CREATE INDEX idx_oracle_attestations_verified ON public.oracle_attestations(is_verified);

CREATE INDEX idx_oracle_feed_history_feed ON public.oracle_feed_history(feed_id);
CREATE INDEX idx_oracle_feed_history_received ON public.oracle_feed_history(received_at DESC);

CREATE INDEX idx_oracle_conditions_feed ON public.oracle_conditions(feed_id);
CREATE INDEX idx_oracle_conditions_deal_room ON public.oracle_conditions(deal_room_id);
CREATE INDEX idx_oracle_conditions_met ON public.oracle_conditions(is_met);

-- Enable RLS on all tables
ALTER TABLE public.oracle_data_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_data_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_feed_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_conditions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oracle_data_providers
CREATE POLICY "Users can view certified or own providers"
  ON public.oracle_data_providers FOR SELECT
  USING (is_certified = true OR owner_user_id = auth.uid());

CREATE POLICY "Admins can manage all providers"
  ON public.oracle_data_providers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own providers"
  ON public.oracle_data_providers FOR ALL
  USING (owner_user_id = auth.uid());

-- RLS Policies for oracle_data_feeds
CREATE POLICY "Users can view active feeds"
  ON public.oracle_data_feeds FOR SELECT
  USING (is_active = true OR provider_id IN (
    SELECT id FROM public.oracle_data_providers WHERE owner_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage feeds"
  ON public.oracle_data_feeds FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Provider owners can manage feeds"
  ON public.oracle_data_feeds FOR ALL
  USING (provider_id IN (
    SELECT id FROM public.oracle_data_providers WHERE owner_user_id = auth.uid()
  ));

-- RLS Policies for oracle_attestations
CREATE POLICY "Users can view attestations they created or are part of"
  ON public.oracle_attestations FOR SELECT
  USING (
    attester_id = auth.uid() 
    OR deal_room_id IN (
      SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attestations"
  ON public.oracle_attestations FOR INSERT
  WITH CHECK (attester_id = auth.uid());

CREATE POLICY "Admins can view all attestations"
  ON public.oracle_attestations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for oracle_feed_history
CREATE POLICY "Users can view history for active feeds"
  ON public.oracle_feed_history FOR SELECT
  USING (feed_id IN (
    SELECT id FROM public.oracle_data_feeds WHERE is_active = true
  ));

CREATE POLICY "Admins can manage feed history"
  ON public.oracle_feed_history FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for oracle_conditions
CREATE POLICY "Users can view conditions for their deal rooms"
  ON public.oracle_conditions FOR SELECT
  USING (
    deal_room_id IN (
      SELECT deal_room_id FROM public.deal_room_participants WHERE user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage conditions"
  ON public.oracle_conditions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_oracle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_oracle_providers_updated_at
  BEFORE UPDATE ON public.oracle_data_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_oracle_updated_at();

CREATE TRIGGER update_oracle_feeds_updated_at
  BEFORE UPDATE ON public.oracle_data_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_oracle_updated_at();

CREATE TRIGGER update_oracle_conditions_updated_at
  BEFORE UPDATE ON public.oracle_conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_oracle_updated_at();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.oracle_attestations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.oracle_data_feeds;