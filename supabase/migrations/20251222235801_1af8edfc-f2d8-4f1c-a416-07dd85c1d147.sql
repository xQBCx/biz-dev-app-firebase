-- Add grid_settings column to profiles for storing user's Grid preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS grid_settings jsonb DEFAULT '{}';

-- Create a table for Grid tool configurations and add-ons
CREATE TABLE IF NOT EXISTS public.grid_tools_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tool_id text NOT NULL,
  enabled boolean DEFAULT true,
  is_favorite boolean DEFAULT false,
  settings jsonb DEFAULT '{}',
  last_used_at timestamp with time zone,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS
ALTER TABLE public.grid_tools_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for grid_tools_config
CREATE POLICY "Users can view their own grid config"
ON public.grid_tools_config FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grid config"
ON public.grid_tools_config FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grid config"
ON public.grid_tools_config FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grid config"
ON public.grid_tools_config FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_grid_tools_config_updated_at
BEFORE UPDATE ON public.grid_tools_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table for Grid add-ons and extensions
CREATE TABLE IF NOT EXISTS public.grid_addons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL,
  icon text,
  tool_id text, -- Which grid tool this extends
  version text DEFAULT '1.0.0',
  is_system boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  config_schema jsonb DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User's installed add-ons
CREATE TABLE IF NOT EXISTS public.grid_user_addons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  addon_id uuid NOT NULL REFERENCES public.grid_addons(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  installed_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, addon_id)
);

-- Enable RLS on add-ons tables
ALTER TABLE public.grid_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grid_user_addons ENABLE ROW LEVEL SECURITY;

-- Anyone can view available add-ons
CREATE POLICY "Anyone can view grid addons"
ON public.grid_addons FOR SELECT
USING (true);

-- Users can manage their own add-on installations
CREATE POLICY "Users can view their installed addons"
ON public.grid_user_addons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can install addons"
ON public.grid_user_addons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their addon config"
ON public.grid_user_addons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can uninstall addons"
ON public.grid_user_addons FOR DELETE
USING (auth.uid() = user_id);

-- Insert some initial system add-ons
INSERT INTO public.grid_addons (name, slug, description, category, icon, tool_id, is_system) VALUES
('Smart Priority', 'smart-priority', 'AI-powered task priority suggestions based on your patterns', 'productivity', 'Sparkles', 'momentum', true),
('Email Templates', 'email-templates', 'Personalized email templates that learn your style', 'communication', 'Mail', 'pulse', true),
('Meeting Prep', 'meeting-prep', 'Auto-generated meeting briefs with relevant context', 'organization', 'Calendar', 'rhythm', true),
('Relationship Insights', 'relationship-insights', 'Deep relationship analysis and engagement suggestions', 'intelligence', 'Users', 'sphere', true),
('Document Linker', 'document-linker', 'Automatic linking between related documents', 'organization', 'Link', 'vault', true),
('Flow Suggestions', 'flow-suggestions', 'AI-detected automation opportunities', 'automation', 'Zap', 'flow', true)
ON CONFLICT (slug) DO NOTHING;