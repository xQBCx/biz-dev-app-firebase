-- =============================================
-- PERSONAL CORPORATION INFRASTRUCTURE
-- Sprint 1: Foundation Tables for Human Capital OS
-- =============================================

-- Personal Asset Snapshots - periodic valuations of user assets
CREATE TABLE public.personal_asset_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Time Assets
  available_hours_weekly NUMERIC(5,2) DEFAULT 0,
  peak_productivity_hours JSONB DEFAULT '[]'::jsonb,
  
  -- Skills Assets
  skills_inventory JSONB DEFAULT '[]'::jsonb,
  skill_scores JSONB DEFAULT '{}'::jsonb,
  
  -- Relationship Assets
  network_size INTEGER DEFAULT 0,
  relationship_strength_avg NUMERIC(3,2) DEFAULT 0,
  key_relationships JSONB DEFAULT '[]'::jsonb,
  
  -- IP Assets
  spawned_businesses_count INTEGER DEFAULT 0,
  content_pieces_count INTEGER DEFAULT 0,
  documented_knowledge_count INTEGER DEFAULT 0,
  
  -- Capital Assets
  total_earnings NUMERIC(12,2) DEFAULT 0,
  pending_payouts NUMERIC(12,2) DEFAULT 0,
  credit_balance NUMERIC(12,2) DEFAULT 0,
  
  -- Health/Energy Assets
  energy_score NUMERIC(3,2) DEFAULT 0,
  sustainability_index NUMERIC(3,2) DEFAULT 0,
  
  -- Attention Assets
  focus_capacity_score NUMERIC(3,2) DEFAULT 0,
  
  -- Computed totals
  total_asset_value NUMERIC(14,2) DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, snapshot_date)
);

-- Personal Liabilities - tracked obligations and risks
CREATE TABLE public.personal_liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  liability_type TEXT NOT NULL, -- 'burnout_risk', 'platform_dependence', 'financial_obligation', 'time_debt', 'overcommitment'
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  estimated_impact NUMERIC(12,2) DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'escalated'
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Personal Workflows - identified value-creation patterns
CREATE TABLE public.personal_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_type TEXT NOT NULL, -- 'income_generation', 'growth_learning', 'recovery_sustainability', 'relationship_maintenance'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Efficiency metrics
  time_invested_weekly NUMERIC(5,2) DEFAULT 0,
  value_generated_weekly NUMERIC(12,2) DEFAULT 0,
  efficiency_score NUMERIC(5,2) DEFAULT 0, -- value / time ratio
  
  -- Pattern data
  trigger_conditions JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  outcomes JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Burnout Risk Scores - AI-calculated risk metrics
CREATE TABLE public.burnout_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Overall score (0-100, higher = more risk)
  overall_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Component scores
  overcommitment_score NUMERIC(5,2) DEFAULT 0,
  recovery_deficit_score NUMERIC(5,2) DEFAULT 0,
  platform_dependence_score NUMERIC(5,2) DEFAULT 0,
  financial_stress_score NUMERIC(5,2) DEFAULT 0,
  relationship_strain_score NUMERIC(5,2) DEFAULT 0,
  
  -- Trend
  trend TEXT DEFAULT 'stable', -- 'improving', 'stable', 'worsening'
  previous_score NUMERIC(5,2),
  
  -- Recommendations
  recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Supporting data
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  behavioral_signals JSONB DEFAULT '[]'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Personal P&L Statement entries
CREATE TABLE public.personal_pnl_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL, -- 'value_created', 'value_invested', 'expense', 'income'
  category TEXT NOT NULL, -- 'contributions', 'deals', 'commissions', 'time', 'resources', 'learning'
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  source_entity_type TEXT, -- 'deal_room', 'task', 'contribution', 'business'
  source_entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.personal_asset_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burnout_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_pnl_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own asset snapshots" ON public.personal_asset_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own asset snapshots" ON public.personal_asset_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own asset snapshots" ON public.personal_asset_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own liabilities" ON public.personal_liabilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own liabilities" ON public.personal_liabilities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workflows" ON public.personal_workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workflows" ON public.personal_workflows
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own burnout scores" ON public.burnout_risk_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own burnout scores" ON public.burnout_risk_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own pnl entries" ON public.personal_pnl_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pnl entries" ON public.personal_pnl_entries
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_asset_snapshots_user_date ON public.personal_asset_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_liabilities_user_status ON public.personal_liabilities(user_id, status);
CREATE INDEX idx_workflows_user_type ON public.personal_workflows(user_id, workflow_type);
CREATE INDEX idx_burnout_scores_user_date ON public.burnout_risk_scores(user_id, calculated_at DESC);
CREATE INDEX idx_pnl_entries_user_date ON public.personal_pnl_entries(user_id, entry_date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_personal_asset_snapshots_updated_at
  BEFORE UPDATE ON public.personal_asset_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_liabilities_updated_at
  BEFORE UPDATE ON public.personal_liabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_workflows_updated_at
  BEFORE UPDATE ON public.personal_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();