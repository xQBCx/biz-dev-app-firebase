-- AI Message Feedback (thumbs up/down system)
CREATE TABLE public.ai_message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  feedback_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Outcome Tracking (did suggested actions get executed?)
CREATE TABLE public.ai_outcome_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.ai_messages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  suggested_action TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  was_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  outcome_success BOOLEAN,
  outcome_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Agent Tasks (autonomous background tasks)
CREATE TABLE public.ai_agent_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  task_description TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('scheduled', 'event', 'condition')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 5,
  context JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI System Improvements (meta-cognition storage)
CREATE TABLE public.ai_system_improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  improvement_type TEXT NOT NULL,
  category TEXT NOT NULL,
  insight TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  source_conversations UUID[] DEFAULT '{}',
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  effectiveness_score NUMERIC(3,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Cross-Module Links (automatic entity relationships)
CREATE TABLE public.ai_cross_module_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_module TEXT NOT NULL,
  source_entity_id UUID NOT NULL,
  target_module TEXT NOT NULL,
  target_entity_id UUID NOT NULL,
  link_type TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  discovered_by TEXT DEFAULT 'ai_analysis',
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Success Patterns (learned from high performers)
CREATE TABLE public.ai_success_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_description TEXT,
  pattern_rules JSONB NOT NULL,
  source_user_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2),
  applicable_contexts TEXT[] DEFAULT '{}',
  times_suggested INTEGER DEFAULT 0,
  times_adopted INTEGER DEFAULT 0,
  adoption_success_rate NUMERIC(5,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Proactive Notifications (for autonomous suggestions)
CREATE TABLE public.ai_proactive_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  action_type TEXT,
  action_payload JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  acted_on BOOLEAN DEFAULT false,
  acted_at TIMESTAMP WITH TIME ZONE,
  dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_outcome_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_system_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cross_module_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_success_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_proactive_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user-specific tables
CREATE POLICY "Users can manage their own feedback" ON public.ai_message_feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their outcome tracking" ON public.ai_outcome_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their agent tasks" ON public.ai_agent_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notifications" ON public.ai_proactive_notifications
  FOR ALL USING (auth.uid() = user_id);

-- System-wide tables (read by all authenticated, write by system)
CREATE POLICY "Authenticated users can view system improvements" ON public.ai_system_improvements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view cross-module links" ON public.ai_cross_module_links
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view success patterns" ON public.ai_success_patterns
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_ai_agent_tasks_user_status ON public.ai_agent_tasks(user_id, status);
CREATE INDEX idx_ai_agent_tasks_scheduled ON public.ai_agent_tasks(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_ai_notifications_user_unread ON public.ai_proactive_notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_ai_cross_module_source ON public.ai_cross_module_links(source_module, source_entity_id);
CREATE INDEX idx_ai_cross_module_target ON public.ai_cross_module_links(target_module, target_entity_id);
CREATE INDEX idx_ai_outcome_tracking_user ON public.ai_outcome_tracking(user_id, created_at DESC);

-- Update trigger for timestamps
CREATE TRIGGER update_ai_outcome_tracking_updated_at
  BEFORE UPDATE ON public.ai_outcome_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_agent_tasks_updated_at
  BEFORE UPDATE ON public.ai_agent_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_success_patterns_updated_at
  BEFORE UPDATE ON public.ai_success_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();