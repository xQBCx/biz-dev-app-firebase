-- Workflow Engine Tables

-- Workflow templates (pre-built and user-created)
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  icon TEXT DEFAULT 'Workflow',
  is_system BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  complexity TEXT DEFAULT 'beginner',
  estimated_time_saved_hours NUMERIC(5,1),
  use_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  required_modules TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow definitions (the actual workflow logic)
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.workflow_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  variables JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  trigger_config JSONB,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow node types (available nodes in the builder)
CREATE TABLE public.workflow_node_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  module TEXT,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  config_schema JSONB DEFAULT '{}',
  is_trigger BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow runs (execution history)
CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  trigger_type TEXT NOT NULL,
  trigger_data JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  node_results JSONB DEFAULT '[]',
  error_message TEXT,
  error_node_id TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Workflow schedules (for scheduled triggers)
CREATE TABLE public.workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow event subscriptions (for event-based triggers)
CREATE TABLE public.workflow_event_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  filter_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_featured ON public.workflow_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_workflows_user ON public.workflows(user_id);
CREATE INDEX idx_workflows_active ON public.workflows(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_runs_workflow ON public.workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_user ON public.workflow_runs(user_id);
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs(status);
CREATE INDEX idx_workflow_schedules_next ON public.workflow_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_workflow_events_type ON public.workflow_event_subscriptions(event_type) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_node_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_event_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active templates" ON public.workflow_templates
  FOR SELECT USING (is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.workflow_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON public.workflow_templates
  FOR UPDATE USING (auth.uid() = created_by AND is_system = false);

CREATE POLICY "Users can view own workflows" ON public.workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" ON public.workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" ON public.workflows
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view node types" ON public.workflow_node_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own runs" ON public.workflow_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create runs" ON public.workflow_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs" ON public.workflow_runs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own schedules" ON public.workflow_schedules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON public.workflow_event_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Seed workflow node types
INSERT INTO public.workflow_node_types (slug, name, description, category, module, icon, color, is_trigger, input_schema, output_schema) VALUES
('trigger-manual', 'Manual Trigger', 'Run workflow manually', 'trigger', NULL, 'Play', '#22c55e', true, '{}', '{"type": "object"}'),
('trigger-schedule', 'Schedule', 'Run on a schedule (cron)', 'trigger', NULL, 'Clock', '#22c55e', true, '{}', '{}'),
('trigger-crm-deal', 'CRM Deal Event', 'Trigger on deal changes', 'trigger', 'crm', 'Briefcase', '#22c55e', true, '{}', '{}'),
('trigger-task-event', 'Task Event', 'Trigger on task changes', 'trigger', 'tasks', 'CheckSquare', '#22c55e', true, '{}', '{}'),
('trigger-email-received', 'Email Received', 'Trigger when email arrives', 'trigger', 'messages', 'Mail', '#22c55e', true, '{}', '{}'),
('trigger-driveby-captured', 'Drive-By Captured', 'Trigger on new business discovery', 'trigger', 'driveby', 'MapPin', '#22c55e', true, '{}', '{}'),
('trigger-webhook', 'Webhook', 'Trigger via HTTP webhook', 'trigger', NULL, 'Globe', '#22c55e', true, '{}', '{}'),
('action-create-deal', 'Create Deal', 'Create a new CRM deal', 'action', 'crm', 'PlusCircle', '#3b82f6', false, '{}', '{}'),
('action-update-deal', 'Update Deal', 'Update an existing deal', 'action', 'crm', 'Edit', '#3b82f6', false, '{}', '{}'),
('action-create-contact', 'Create Contact', 'Create a new contact', 'action', 'crm', 'UserPlus', '#3b82f6', false, '{}', '{}'),
('action-add-activity', 'Log Activity', 'Log an activity to CRM', 'action', 'crm', 'Activity', '#3b82f6', false, '{}', '{}'),
('action-create-task', 'Create Task', 'Create a new task', 'action', 'tasks', 'CheckSquare', '#8b5cf6', false, '{}', '{}'),
('action-complete-task', 'Complete Task', 'Mark a task as complete', 'action', 'tasks', 'CheckCircle', '#8b5cf6', false, '{}', '{}'),
('action-assign-task', 'Assign Task', 'Assign task to user', 'action', 'tasks', 'UserCheck', '#8b5cf6', false, '{}', '{}'),
('action-send-email', 'Send Email', 'Send an email', 'action', 'messages', 'Send', '#f59e0b', false, '{}', '{}'),
('action-send-sms', 'Send SMS', 'Send an SMS message', 'action', 'messages', 'MessageSquare', '#f59e0b', false, '{}', '{}'),
('action-create-notification', 'Send Notification', 'Create in-app notification', 'action', 'messages', 'Bell', '#f59e0b', false, '{}', '{}'),
('action-ai-analyze', 'AI Analysis', 'Analyze data with AI', 'ai', NULL, 'Brain', '#ec4899', false, '{}', '{}'),
('action-ai-generate', 'AI Generate Content', 'Generate content with AI', 'ai', NULL, 'Sparkles', '#ec4899', false, '{}', '{}'),
('action-ai-summarize', 'AI Summarize', 'Summarize text with AI', 'ai', NULL, 'FileText', '#ec4899', false, '{}', '{}'),
('action-ai-classify', 'AI Classify', 'Classify data with AI', 'ai', NULL, 'Tags', '#ec4899', false, '{}', '{}'),
('action-ai-extract', 'AI Extract', 'Extract structured data with AI', 'ai', NULL, 'Database', '#ec4899', false, '{}', '{}'),
('logic-if', 'If/Else', 'Conditional branching', 'logic', NULL, 'GitBranch', '#64748b', false, '{}', '{}'),
('logic-switch', 'Switch', 'Multi-way branching', 'logic', NULL, 'GitMerge', '#64748b', false, '{}', '{}'),
('logic-loop', 'Loop', 'Iterate over items', 'logic', NULL, 'Repeat', '#64748b', false, '{}', '{}'),
('logic-delay', 'Delay', 'Wait for specified time', 'logic', NULL, 'Timer', '#64748b', false, '{}', '{}'),
('logic-filter', 'Filter', 'Filter items by condition', 'logic', NULL, 'Filter', '#64748b', false, '{}', '{}'),
('logic-transform', 'Transform', 'Transform data structure', 'logic', NULL, 'Shuffle', '#64748b', false, '{}', '{}'),
('logic-merge', 'Merge', 'Merge multiple inputs', 'logic', NULL, 'Layers', '#64748b', false, '{}', '{}'),
('action-erp-sync', 'Sync to ERP', 'Sync data to ERP system', 'action', 'erp', 'RefreshCw', '#059669', false, '{}', '{}'),
('action-audit-log', 'Create Audit Entry', 'Log audit trail entry', 'action', 'audit', 'Shield', '#059669', false, '{}', '{}'),
('action-compliance-check', 'Compliance Check', 'Run compliance validation', 'action', 'audit', 'ClipboardCheck', '#059669', false, '{}', '{}'),
('action-generate-report', 'Generate Report', 'Generate business report', 'action', 'erp', 'FileBarChart', '#059669', false, '{}', '{}'),
('action-http-request', 'HTTP Request', 'Make external API call', 'integration', NULL, 'Globe', '#0ea5e9', false, '{}', '{}'),
('action-store-data', 'Store Data', 'Save data to database', 'integration', NULL, 'Database', '#0ea5e9', false, '{}', '{}'),
('action-query-data', 'Query Data', 'Query database records', 'integration', NULL, 'Search', '#0ea5e9', false, '{}', '{}');

-- Seed workflow templates
INSERT INTO public.workflow_templates (slug, name, description, category, subcategory, icon, is_system, is_featured, complexity, estimated_time_saved_hours, tags, required_modules) VALUES
('lead-nurture-sequence', 'Lead Nurture Sequence', 'Automatically follow up with new leads over 7 days', 'sales', 'lead-management', 'Users', true, true, 'beginner', 5, ARRAY['leads', 'email', 'automation']::TEXT[], ARRAY['crm', 'messages']::TEXT[]),
('deal-stage-automation', 'Deal Stage Automation', 'Auto-update deals and notify team on stage changes', 'sales', 'deal-management', 'TrendingUp', true, true, 'intermediate', 3, ARRAY['deals', 'notifications', 'crm']::TEXT[], ARRAY['crm']::TEXT[]),
('win-loss-analysis', 'Win/Loss Analysis', 'AI-powered analysis of closed deals to improve sales', 'sales', 'analytics', 'BarChart', true, false, 'advanced', 8, ARRAY['ai', 'analytics', 'deals']::TEXT[], ARRAY['crm']::TEXT[]),
('proposal-reminder', 'Proposal Follow-up', 'Remind prospects about pending proposals', 'sales', 'follow-up', 'FileText', true, false, 'beginner', 2, ARRAY['proposals', 'reminders']::TEXT[], ARRAY['crm', 'tasks']::TEXT[]),
('social-post-scheduler', 'Social Media Scheduler', 'Schedule and auto-post content across platforms', 'marketing', 'social-media', 'Share2', true, true, 'beginner', 10, ARRAY['social', 'content', 'scheduling']::TEXT[], ARRAY['social']::TEXT[]),
('content-repurposing', 'Content Repurposing', 'Turn one piece of content into multiple formats', 'marketing', 'content', 'Repeat', true, false, 'intermediate', 15, ARRAY['ai', 'content', 'generation']::TEXT[], ARRAY['social']::TEXT[]),
('email-campaign-drip', 'Email Drip Campaign', 'Automated email sequences for nurturing', 'marketing', 'email', 'Mail', true, true, 'intermediate', 8, ARRAY['email', 'nurture', 'campaigns']::TEXT[], ARRAY['messages']::TEXT[]),
('campaign-roi-tracker', 'Campaign ROI Tracker', 'Track and report on marketing campaign performance', 'marketing', 'analytics', 'PieChart', true, false, 'advanced', 5, ARRAY['analytics', 'roi', 'reporting']::TEXT[], ARRAY['crm']::TEXT[]),
('meeting-summarizer', 'Meeting Summarizer', 'Auto-summarize meetings and create action items', 'ai', 'productivity', 'Mic', true, true, 'beginner', 20, ARRAY['ai', 'meetings', 'notes']::TEXT[], ARRAY['calendar', 'tasks']::TEXT[]),
('document-processor', 'Document Processor', 'Extract and process data from documents', 'ai', 'document-ops', 'FileText', true, false, 'intermediate', 12, ARRAY['ai', 'documents', 'extraction']::TEXT[], ARRAY[]::TEXT[]),
('smart-email-responder', 'Smart Email Responder', 'AI-draft replies to common emails', 'ai', 'email', 'MessageCircle', true, true, 'intermediate', 15, ARRAY['ai', 'email', 'automation']::TEXT[], ARRAY['messages']::TEXT[]),
('sentiment-analyzer', 'Customer Sentiment Analysis', 'Analyze customer feedback sentiment', 'ai', 'analytics', 'Heart', true, false, 'advanced', 6, ARRAY['ai', 'sentiment', 'customers']::TEXT[], ARRAY['crm']::TEXT[]),
('task-auto-assign', 'Smart Task Assignment', 'Auto-assign tasks based on capacity and skills', 'operations', 'task-management', 'Users', true, false, 'intermediate', 10, ARRAY['tasks', 'team', 'automation']::TEXT[], ARRAY['tasks']::TEXT[]),
('daily-standup-report', 'Daily Standup Report', 'Generate daily team progress reports', 'operations', 'reporting', 'Calendar', true, true, 'beginner', 5, ARRAY['reports', 'team', 'daily']::TEXT[], ARRAY['tasks']::TEXT[]),
('deadline-escalation', 'Deadline Escalation', 'Escalate overdue tasks automatically', 'operations', 'task-management', 'AlertTriangle', true, false, 'beginner', 3, ARRAY['tasks', 'escalation', 'deadlines']::TEXT[], ARRAY['tasks']::TEXT[]),
('resource-utilization', 'Resource Utilization Tracker', 'Track team capacity and utilization', 'operations', 'analytics', 'Users', true, false, 'advanced', 8, ARRAY['team', 'capacity', 'analytics']::TEXT[], ARRAY['tasks', 'calendar']::TEXT[]),
('company-setup-wizard', 'Company Setup Wizard', 'Step-by-step ERP onboarding for new companies', 'erp', 'onboarding', 'Building', true, true, 'beginner', 40, ARRAY['erp', 'setup', 'onboarding']::TEXT[], ARRAY['erp']::TEXT[]),
('financial-reconciliation', 'Financial Reconciliation', 'Automated financial data reconciliation', 'erp', 'finance', 'DollarSign', true, false, 'advanced', 20, ARRAY['finance', 'reconciliation', 'erp']::TEXT[], ARRAY['erp']::TEXT[]),
('compliance-audit', 'Compliance Audit Runner', 'Run scheduled compliance audits', 'erp', 'compliance', 'Shield', true, true, 'intermediate', 15, ARRAY['audit', 'compliance', 'governance']::TEXT[], ARRAY['erp']::TEXT[]),
('goal-recommendation', 'AI Goal Recommendations', 'AI analyzes business and recommends goals', 'erp', 'strategy', 'Target', true, true, 'intermediate', 10, ARRAY['ai', 'goals', 'strategy']::TEXT[], ARRAY['erp', 'crm']::TEXT[]),
('human-audit', 'Human Operations Audit', 'Analyze team workflows and recommend improvements', 'erp', 'audit', 'Users', true, false, 'advanced', 25, ARRAY['audit', 'team', 'optimization']::TEXT[], ARRAY['tasks', 'calendar']::TEXT[]);

-- Add update triggers
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();