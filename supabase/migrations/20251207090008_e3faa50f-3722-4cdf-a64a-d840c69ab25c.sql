-- Create agents registry table
CREATE TABLE public.instincts_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'sales', 'operations', 'finance', 'marketing', 'legal', 'hr'
  icon TEXT, -- lucide icon name
  capabilities JSONB DEFAULT '[]'::jsonb, -- array of capability strings
  config_schema JSONB DEFAULT '{}'::jsonb, -- JSON schema for agent config
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user agent subscriptions (which agents user has enabled)
CREATE TABLE public.instincts_user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES instincts_agents(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}'::jsonb, -- user-specific agent config
  is_enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Create agent execution logs
CREATE TABLE public.instincts_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES instincts_agents(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL, -- 'manual', 'scheduled', 'event', 'recommendation'
  trigger_context JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- Indexes
CREATE INDEX idx_instincts_agents_category ON instincts_agents(category);
CREATE INDEX idx_instincts_agents_active ON instincts_agents(is_active);
CREATE INDEX idx_instincts_user_agents_user ON instincts_user_agents(user_id);
CREATE INDEX idx_instincts_user_agents_enabled ON instincts_user_agents(user_id, is_enabled);
CREATE INDEX idx_instincts_agent_runs_user ON instincts_agent_runs(user_id);
CREATE INDEX idx_instincts_agent_runs_agent ON instincts_agent_runs(agent_id);
CREATE INDEX idx_instincts_agent_runs_status ON instincts_agent_runs(status);

-- Enable RLS
ALTER TABLE instincts_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE instincts_user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE instincts_agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - agents are readable by all authenticated users
CREATE POLICY "Agents are viewable by authenticated users"
  ON instincts_agents FOR SELECT
  USING (auth.role() = 'authenticated');

-- User agents policies
CREATE POLICY "Users can view their own agent subscriptions"
  ON instincts_user_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to agents"
  ON instincts_user_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their agent subscriptions"
  ON instincts_user_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe from agents"
  ON instincts_user_agents FOR DELETE
  USING (auth.uid() = user_id);

-- Agent runs policies
CREATE POLICY "Users can view their own agent runs"
  ON instincts_agent_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create agent runs"
  ON instincts_agent_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent runs"
  ON instincts_agent_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed initial agents
INSERT INTO instincts_agents (slug, name, description, category, icon, capabilities) VALUES
('deal-qualifier', 'Deal Qualifier', 'Analyzes CRM deals and scores them based on likelihood to close', 'sales', 'Target', '["analyze_deals", "score_opportunities", "prioritize_pipeline"]'),
('follow-up-coach', 'Follow-up Coach', 'Suggests optimal follow-up timing and messaging for contacts', 'sales', 'MessageSquare', '["analyze_contacts", "suggest_timing", "draft_messages"]'),
('task-prioritizer', 'Task Prioritizer', 'Automatically prioritizes tasks based on deadlines and impact', 'operations', 'ListChecks', '["analyze_tasks", "calculate_priority", "suggest_order"]'),
('meeting-prep', 'Meeting Prep', 'Prepares briefings and talking points before meetings', 'operations', 'Calendar', '["analyze_calendar", "research_attendees", "generate_briefing"]'),
('expense-tracker', 'Expense Tracker', 'Categorizes and tracks business expenses automatically', 'finance', 'Receipt', '["categorize_expenses", "track_spending", "generate_reports"]'),
('content-curator', 'Content Curator', 'Curates and suggests content ideas based on industry trends', 'marketing', 'Newspaper', '["analyze_trends", "suggest_topics", "draft_content"]');

-- Updated at trigger
CREATE TRIGGER update_instincts_agents_updated_at
  BEFORE UPDATE ON instincts_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instincts_user_agents_updated_at
  BEFORE UPDATE ON instincts_user_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();