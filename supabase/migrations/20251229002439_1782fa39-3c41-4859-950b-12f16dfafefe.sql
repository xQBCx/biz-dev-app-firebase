-- =====================================================
-- CHEMICAL BLENDER MODEL: CREDIT SYSTEM & ATTRIBUTION
-- =====================================================

-- Enum for credit types
CREATE TYPE public.credit_type AS ENUM ('contribution', 'usage', 'value');

-- Enum for contribution classification (Chemical Blender categories)
CREATE TYPE public.contribution_classification AS ENUM (
  'ingredient_one_time',
  'ingredient_embedded',
  'formulation_effort',
  'process_governance',
  'distribution_origination',
  'execution_deployment',
  'risk_assumption'
);

-- Add missing values to existing compensation_type if needed
ALTER TYPE public.compensation_type ADD VALUE IF NOT EXISTS 'contribution_credit';

-- Enum for ingredient types
CREATE TYPE public.ingredient_type AS ENUM (
  'software_module',
  'ai_agent',
  'security_framework',
  'industry_knowledge',
  'capital',
  'customer_relationships',
  'execution_resources',
  'brand_trademark',
  'data_pipeline',
  'governance_framework',
  'visualization_system',
  'other'
);

-- Enum for formulation scope
CREATE TYPE public.formulation_scope AS ENUM (
  'customer_specific',
  'industry_specific',
  'platform_wide'
);

-- Enum for settlement trigger types
CREATE TYPE public.settlement_trigger AS ENUM (
  'revenue_received',
  'invoice_paid',
  'savings_verified',
  'milestone_hit',
  'usage_threshold',
  'time_based',
  'manual_approval'
);

-- =====================================================
-- INGREDIENT REGISTRY (Pre-existing and new IP)
-- =====================================================
CREATE TABLE public.blender_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  ingredient_type public.ingredient_type NOT NULL,
  is_pre_existing BOOLEAN NOT NULL DEFAULT true,
  ownership_status TEXT NOT NULL DEFAULT 'sole',
  license_terms JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- FORMULATIONS (Configurations of ingredients)
-- =====================================================
CREATE TABLE public.blender_formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scope public.formulation_scope NOT NULL DEFAULT 'customer_specific',
  is_embedded BOOLEAN NOT NULL DEFAULT false,
  embedded_since TIMESTAMP WITH TIME ZONE,
  ownership_type TEXT NOT NULL DEFAULT 'joint',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link ingredients to formulations
CREATE TABLE public.formulation_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id UUID REFERENCES blender_formulations(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES blender_ingredients(id) ON DELETE CASCADE NOT NULL,
  license_type TEXT DEFAULT 'non_exclusive',
  usage_weight NUMERIC(5,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(formulation_id, ingredient_id)
);

-- =====================================================
-- CREDIT LEDGERS (The core accounting system)
-- =====================================================

-- Contribution Credits - Who brought what
CREATE TABLE public.credit_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES deal_room_participants(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES blender_ingredients(id) ON DELETE SET NULL,
  formulation_id UUID REFERENCES blender_formulations(id) ON DELETE SET NULL,
  classification public.contribution_classification NOT NULL,
  credits_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  valuation_method TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Usage Credits - What was actually used (automated tracking)
CREATE TABLE public.credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_credit_id UUID REFERENCES credit_contributions(id) ON DELETE CASCADE NOT NULL,
  usage_type TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  compute_hours NUMERIC(10,4) DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  energy_kwh NUMERIC(10,4) DEFAULT 0,
  usage_context JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Value Credits - What actually produced value
CREATE TABLE public.credit_value (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE NOT NULL,
  contribution_credit_id UUID REFERENCES credit_contributions(id) ON DELETE SET NULL,
  value_type TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  source_description TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ATTRIBUTION ENGINE (Maps credits to payouts)
-- =====================================================
CREATE TABLE public.attribution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES deal_room_participants(id) ON DELETE CASCADE NOT NULL,
  classification public.contribution_classification NOT NULL,
  compensation_type public.compensation_type NOT NULL,
  percentage NUMERIC(5,2),
  fixed_amount NUMERIC(15,2),
  per_usage_rate NUMERIC(10,4),
  min_threshold NUMERIC(15,2),
  max_cap NUMERIC(15,2),
  decay_rate NUMERIC(5,4) DEFAULT 0,
  is_residual BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- SMART CONTRACT SETTLEMENT
-- =====================================================
CREATE TABLE public.settlement_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE NOT NULL,
  structure_id UUID REFERENCES deal_structures(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  trigger_type public.settlement_trigger NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  distribution_logic JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  total_distributed NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settlement executions (immutable log)
CREATE TABLE public.settlement_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES settlement_contracts(id) ON DELETE CASCADE NOT NULL,
  trigger_event JSONB NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual payouts from settlements
CREATE TABLE public.settlement_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES settlement_executions(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES deal_room_participants(id) ON DELETE CASCADE NOT NULL,
  attribution_rule_id UUID REFERENCES attribution_rules(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  calculation_breakdown JSONB DEFAULT '{}',
  payout_method TEXT,
  payout_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- INFRASTRUCTURE & ENERGY ACCOUNTING
-- =====================================================
CREATE TABLE public.resource_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL,
  formulation_id UUID REFERENCES blender_formulations(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  quantity NUMERIC(15,4) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(10,6),
  total_cost NUMERIC(15,4),
  provider TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- KNOWLEDGE BASE FOR FRAMEWORK CONCEPTS
-- =====================================================
CREATE TABLE public.blender_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  plain_english_explanation TEXT NOT NULL,
  technical_explanation TEXT,
  examples JSONB DEFAULT '[]',
  related_concepts TEXT[] DEFAULT '{}',
  icon_name TEXT,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.blender_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blender_formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulation_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blender_knowledge_base ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Ingredients: owners can manage, others can view
CREATE POLICY "Ingredient owners can manage" ON public.blender_ingredients
  FOR ALL USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view ingredients" ON public.blender_ingredients
  FOR SELECT TO authenticated USING (true);

-- Formulations: participants can view
CREATE POLICY "Deal participants can view formulations" ON public.blender_formulations
  FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM deal_room_participants WHERE deal_room_id = blender_formulations.deal_room_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Deal participants can create formulations" ON public.blender_formulations
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM deal_room_participants drp WHERE drp.deal_room_id = blender_formulations.deal_room_id AND drp.user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Formulation ingredients
CREATE POLICY "Participants can view formulation ingredients" ON public.formulation_ingredients
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM blender_formulations bf
      JOIN deal_room_participants drp ON bf.deal_room_id = drp.deal_room_id
      WHERE bf.id = formulation_id AND drp.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Credit contributions: participants can view
CREATE POLICY "Participants view credits" ON public.credit_contributions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM deal_room_participants WHERE id = participant_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM deal_room_participants WHERE deal_room_id = credit_contributions.deal_room_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins manage credits" ON public.credit_contributions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Usage credits
CREATE POLICY "Participants view usage" ON public.credit_usage
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM credit_contributions cc
      JOIN deal_room_participants drp ON cc.participant_id = drp.id
      WHERE cc.id = contribution_credit_id AND drp.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Value credits
CREATE POLICY "Deal participants view value credits" ON public.credit_value
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM deal_room_participants WHERE deal_room_id = credit_value.deal_room_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Attribution rules
CREATE POLICY "Participants view attribution" ON public.attribution_rules
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM deal_room_participants WHERE id = participant_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Settlement contracts
CREATE POLICY "Participants view settlements" ON public.settlement_contracts
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM deal_room_participants WHERE deal_room_id = settlement_contracts.deal_room_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Settlement executions
CREATE POLICY "Participants view executions" ON public.settlement_executions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM settlement_contracts sc
      JOIN deal_room_participants drp ON sc.deal_room_id = drp.deal_room_id
      WHERE sc.id = contract_id AND drp.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Settlement payouts
CREATE POLICY "Participants view own payouts" ON public.settlement_payouts
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM deal_room_participants WHERE id = participant_id AND user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Resource usage
CREATE POLICY "Admins view resource usage" ON public.resource_usage_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Knowledge base: public read
CREATE POLICY "Anyone can read knowledge base" ON public.blender_knowledge_base
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage knowledge base" ON public.blender_knowledge_base
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_blender_ingredients_updated_at BEFORE UPDATE ON public.blender_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blender_formulations_updated_at BEFORE UPDATE ON public.blender_formulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_contributions_updated_at BEFORE UPDATE ON public.credit_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attribution_rules_updated_at BEFORE UPDATE ON public.attribution_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settlement_contracts_updated_at BEFORE UPDATE ON public.settlement_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blender_knowledge_base_updated_at BEFORE UPDATE ON public.blender_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();