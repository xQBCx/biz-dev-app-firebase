-- Sytuation: Real-time situational intelligence and resolution system

-- Main situations table
CREATE TABLE public.situations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  situation_type TEXT NOT NULL DEFAULT 'general', -- general, operational, financial, legal, logistics, emergency
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'active', -- active, monitoring, resolving, resolved, escalated
  
  -- Context and understanding
  context_summary TEXT, -- AI-generated context understanding
  root_cause TEXT,
  constraints JSONB DEFAULT '[]'::jsonb, -- array of constraints
  stakeholders JSONB DEFAULT '[]'::jsonb, -- who's involved
  
  -- Decision support
  recommended_action TEXT,
  action_options JSONB DEFAULT '[]'::jsonb, -- array of {action, risk, outcome, timing}
  risk_level TEXT DEFAULT 'medium', -- low, medium, high, extreme
  urgency_score INTEGER DEFAULT 50, -- 0-100, how urgent
  
  -- Resolution tracking
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_outcome TEXT, -- success, partial, failed, escalated
  
  -- Linked entities
  linked_company_id UUID,
  linked_deal_id UUID,
  linked_feature_id UUID,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Signals: Real-time inputs that feed into situations
CREATE TABLE public.situation_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  situation_id UUID REFERENCES public.situations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  signal_type TEXT NOT NULL, -- data, sensor, report, system_log, financial, alert, human_input
  source TEXT NOT NULL, -- where the signal came from
  content TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- info, warning, alert, critical
  
  -- AI processing
  processed BOOLEAN DEFAULT false,
  ai_interpretation TEXT,
  relevance_score INTEGER DEFAULT 50, -- 0-100
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actions: Steps taken to resolve situations
CREATE TABLE public.situation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  situation_id UUID REFERENCES public.situations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL, -- investigate, communicate, escalate, automate, delegate, resolve
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed, cancelled
  
  -- Execution details
  assigned_to UUID REFERENCES auth.users(id),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  outcome TEXT,
  
  -- AI automation
  is_automated BOOLEAN DEFAULT false,
  workflow_id UUID,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simulations: "if-then" scenarios
CREATE TABLE public.situation_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  situation_id UUID REFERENCES public.situations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  scenario_name TEXT NOT NULL,
  scenario_description TEXT,
  
  -- Simulation parameters
  assumptions JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '{}'::jsonb,
  
  -- Outcomes
  predicted_outcomes JSONB DEFAULT '[]'::jsonb, -- array of {outcome, probability, impact}
  best_outcome TEXT,
  worst_outcome TEXT,
  recommended_path TEXT,
  
  -- Risk analysis
  risk_factors JSONB DEFAULT '[]'::jsonb,
  confidence_score INTEGER DEFAULT 50, -- 0-100
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situation_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situation_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for situations
CREATE POLICY "Users can view their own situations" ON public.situations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own situations" ON public.situations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own situations" ON public.situations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own situations" ON public.situations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for signals
CREATE POLICY "Users can view their own signals" ON public.situation_signals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signals" ON public.situation_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals" ON public.situation_signals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signals" ON public.situation_signals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for actions
CREATE POLICY "Users can view their own actions" ON public.situation_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own actions" ON public.situation_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions" ON public.situation_actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions" ON public.situation_actions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for simulations
CREATE POLICY "Users can view their own simulations" ON public.situation_simulations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own simulations" ON public.situation_simulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulations" ON public.situation_simulations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations" ON public.situation_simulations
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_situations_user_id ON public.situations(user_id);
CREATE INDEX idx_situations_status ON public.situations(status);
CREATE INDEX idx_situations_severity ON public.situations(severity);
CREATE INDEX idx_situation_signals_situation_id ON public.situation_signals(situation_id);
CREATE INDEX idx_situation_actions_situation_id ON public.situation_actions(situation_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.situations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.situation_signals;

-- Update timestamp trigger
CREATE TRIGGER update_situations_updated_at
  BEFORE UPDATE ON public.situations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_situation_actions_updated_at
  BEFORE UPDATE ON public.situation_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();