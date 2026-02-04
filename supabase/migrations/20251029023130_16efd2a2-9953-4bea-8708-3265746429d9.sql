-- Add client_id to activity_logs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_logs' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.activity_logs 
    ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;
    
    CREATE INDEX idx_activity_logs_client_id ON public.activity_logs(client_id);
  END IF;
END $$;

-- Create client_users table for mapping users to clients
CREATE TABLE IF NOT EXISTS public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'viewer',
  can_view_activities BOOLEAN DEFAULT true,
  can_add_tasks BOOLEAN DEFAULT false,
  can_add_contacts BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,
  invited_by UUID NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  UNIQUE(client_id, user_id)
);

ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

-- RLS for client_users
DROP POLICY IF EXISTS "Users can view their client access" ON public.client_users;
CREATE POLICY "Users can view their client access"
  ON public.client_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = invited_by);

DROP POLICY IF EXISTS "Client owners can manage client users" ON public.client_users;
CREATE POLICY "Client owners can manage client users"
  ON public.client_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_users.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Update activity_logs RLS to include client users
DROP POLICY IF EXISTS "Users can view their own or client activity logs" ON public.activity_logs;
CREATE POLICY "Users can view their own or client activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.client_id = activity_logs.client_id
      AND client_users.user_id = auth.uid()
      AND client_users.can_view_activities = true
    )
  );

-- Create client_activity_reports table
CREATE TABLE IF NOT EXISTS public.client_activity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  report_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.client_activity_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage reports for their clients" ON public.client_activity_reports;
CREATE POLICY "Users can manage reports for their clients"
  ON public.client_activity_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_activity_reports.client_id
      AND clients.user_id = auth.uid()
    )
  );