-- MCP (Model Context Protocol) tables for agent orchestration

-- Create agents table
CREATE TABLE IF NOT EXISTS public.mcp_agents (
  agent_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capabilities JSONB DEFAULT '[]'::jsonb,
  allowed_tools JSONB DEFAULT '[]'::jsonb,
  policy JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS public.mcp_tools (
  tool_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  openapi_url TEXT,
  auth_type TEXT,
  scopes JSONB DEFAULT '[]'::jsonb,
  allowed_agents JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create context snapshots table for state sharing
CREATE TABLE IF NOT EXISTS public.mcp_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  user_ctx JSONB NOT NULL,
  goal TEXT,
  inputs JSONB,
  visibility JSONB,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table for agent work tracking
CREATE TABLE IF NOT EXISTS public.mcp_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES public.mcp_agents(agent_id) ON DELETE CASCADE,
  tool_id TEXT REFERENCES public.mcp_tools(tool_id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  input JSONB,
  output JSONB,
  created_by UUID REFERENCES auth.users(id),
  callback_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task events table for audit trail
CREATE TABLE IF NOT EXISTS public.mcp_task_events (
  id BIGSERIAL PRIMARY KEY,
  task_id UUID REFERENCES public.mcp_tasks(task_id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create permissions table for RBAC
CREATE TABLE IF NOT EXISTS public.mcp_permissions (
  id BIGSERIAL PRIMARY KEY,
  principal TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  effect TEXT NOT NULL CHECK (effect IN ('allow', 'deny')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mcp_tasks_agent ON public.mcp_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_mcp_tasks_status ON public.mcp_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mcp_tasks_created_by ON public.mcp_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_mcp_task_events_task ON public.mcp_task_events(task_id);
CREATE INDEX IF NOT EXISTS idx_mcp_context_actor ON public.mcp_context_snapshots(actor);

-- Enable RLS
ALTER TABLE public.mcp_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for now, can expand later)
CREATE POLICY "Admins can manage agents" ON public.mcp_agents FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tools" ON public.mcp_tools FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view context" ON public.mcp_context_snapshots FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their tasks" ON public.mcp_tasks FOR SELECT USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tasks" ON public.mcp_tasks FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view task events for their tasks" ON public.mcp_task_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mcp_tasks WHERE task_id = mcp_task_events.task_id AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Admins can manage permissions" ON public.mcp_permissions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Seed default agents and tools
INSERT INTO public.mcp_agents (agent_id, name, capabilities, allowed_tools, policy) VALUES
  ('kb:rag', 'Knowledge Base RAG', '["search", "retrieve", "summarize"]'::jsonb, '[]'::jsonb, '{"maxRuntimeSeconds": 30}'::jsonb),
  ('crm:sync', 'CRM Sync Agent', '["sync", "import", "export"]'::jsonb, '["kb:rag"]'::jsonb, '{"safeWrite": true, "maxRuntimeSeconds": 300}'::jsonb)
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO public.mcp_tools (tool_id, name, description, auth_type) VALUES
  ('kb:rag', 'Knowledge Base Search', 'Search and retrieve information from knowledge base', 'internal'),
  ('crm:import', 'CRM Import Tool', 'Import contacts, companies, and deals into CRM', 'internal'),
  ('crm:export', 'CRM Export Tool', 'Export CRM data in various formats', 'internal')
ON CONFLICT (tool_id) DO NOTHING;