-- Documentation Version Tracking System
-- Stores historical versions of white papers for admin-only access

-- Create table for white paper versions
CREATE TABLE public.documentation_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_key TEXT NOT NULL,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL, -- stores the full sections array
  change_summary TEXT, -- brief description of what changed
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_documentation_versions_module_key ON public.documentation_versions(module_key);
CREATE INDEX idx_documentation_versions_created_at ON public.documentation_versions(created_at DESC);
CREATE UNIQUE INDEX idx_documentation_versions_unique ON public.documentation_versions(module_key, version);

-- Enable Row Level Security
ALTER TABLE public.documentation_versions ENABLE ROW LEVEL SECURITY;

-- Only admin can view documentation versions (using user_roles table)
CREATE POLICY "Admin can view documentation versions"
ON public.documentation_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admin can insert documentation versions
CREATE POLICY "Admin can insert documentation versions"
ON public.documentation_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admin can update documentation versions
CREATE POLICY "Admin can update documentation versions"
ON public.documentation_versions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admin can delete documentation versions
CREATE POLICY "Admin can delete documentation versions"
ON public.documentation_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create changelog table for tracking update reasons
CREATE TABLE public.documentation_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID REFERENCES public.documentation_versions(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  old_version INTEGER,
  new_version INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'major_revision')),
  change_notes TEXT,
  related_feature TEXT, -- what feature triggered the update
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for changelog
ALTER TABLE public.documentation_changelog ENABLE ROW LEVEL SECURITY;

-- Only admin can view changelog
CREATE POLICY "Admin can view documentation changelog"
ON public.documentation_changelog
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admin can insert into changelog
CREATE POLICY "Admin can insert documentation changelog"
ON public.documentation_changelog
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);