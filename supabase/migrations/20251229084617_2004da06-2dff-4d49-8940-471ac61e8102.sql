-- Create white papers table for per-module documentation
CREATE TABLE public.platform_white_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  module_name TEXT NOT NULL,
  module_description TEXT,
  white_paper_content TEXT NOT NULL,
  white_paper_markdown TEXT,
  audio_url TEXT,
  last_code_hash TEXT,
  version INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  is_shareable BOOLEAN DEFAULT false,
  is_copyable BOOLEAN DEFAULT false,
  share_enabled_for_users BOOLEAN DEFAULT false,
  copy_enabled_for_users BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_generated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for module lookups
CREATE INDEX idx_white_papers_module_key ON public.platform_white_papers(module_key);

-- Enable RLS
ALTER TABLE public.platform_white_papers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published white papers
CREATE POLICY "Anyone can read published white papers"
ON public.platform_white_papers
FOR SELECT
USING (is_published = true);

-- Admins can manage all white papers (using user_roles table)
CREATE POLICY "Admins can manage white papers"
ON public.platform_white_papers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Create table to track white paper change triggers
CREATE TABLE public.white_paper_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_paper_id UUID REFERENCES public.platform_white_papers(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  change_summary TEXT,
  previous_version INTEGER,
  new_version INTEGER,
  triggered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.white_paper_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read change log"
ON public.white_paper_change_log FOR SELECT USING (true);

CREATE POLICY "Admins can manage change log"
ON public.white_paper_change_log FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Add module_enabled_flags to spawned_businesses
ALTER TABLE public.spawned_businesses 
ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '{}';

-- Update timestamp trigger
CREATE TRIGGER update_white_papers_updated_at
BEFORE UPDATE ON public.platform_white_papers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();