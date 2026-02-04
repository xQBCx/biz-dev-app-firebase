-- Theme Source Harvester Database Schema

-- Libraries table: stores metadata about harvested UI libraries
CREATE TABLE public.libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  license_spdx TEXT NOT NULL,
  website TEXT,
  repo_url TEXT,
  npm_url TEXT,
  stars INTEGER DEFAULT 0,
  last_commit_at TIMESTAMP WITH TIME ZONE,
  framework TEXT NOT NULL CHECK (framework IN ('plain_css', 'tailwind', 'react', 'headless')),
  is_approved BOOLEAN DEFAULT false,
  admin_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Library versions: stores different versions of each library
CREATE TABLE public.library_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  tarball_url TEXT,
  checksum TEXT NOT NULL,
  size_kb INTEGER,
  changelog TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(library_id, version)
);

-- Library assets: stores individual files from libraries
CREATE TABLE public.library_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_version_id UUID NOT NULL REFERENCES public.library_versions(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  bytes BYTEA,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Themes: stores generated themes
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('uploaded_image', 'uploaded_css', 'library', 'manual')),
  library_version_id UUID REFERENCES public.library_versions(id) ON DELETE SET NULL,
  tokens_json JSONB NOT NULL DEFAULT '{}',
  palette_json JSONB NOT NULL DEFAULT '{}',
  css_content TEXT,
  is_published BOOLEAN DEFAULT false,
  published_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Theme validations: stores validation results for themes
CREATE TABLE public.theme_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  passes_accessibility BOOLEAN NOT NULL,
  passes_layout BOOLEAN NOT NULL,
  report_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Jobs: tracks background jobs for harvesting and processing
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('harvest_npm', 'harvest_github', 'import_library', 'validate_theme', 'weekly_update')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  payload_json JSONB NOT NULL DEFAULT '{}',
  error_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- License configs: stores license rules and special cases
CREATE TABLE public.license_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id TEXT NOT NULL UNIQUE,
  is_allowed BOOLEAN NOT NULL,
  special_rules JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed libraries: pre-configured list of libraries to harvest
CREATE TABLE public.seed_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  license TEXT NOT NULL,
  homepage TEXT NOT NULL,
  npm_package TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_libraries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for libraries (admin-only write, public read for approved)
CREATE POLICY "Anyone can view approved libraries"
  ON public.libraries FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can manage libraries"
  ON public.libraries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for library_versions (public read, admin write)
CREATE POLICY "Anyone can view library versions"
  ON public.library_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.libraries 
    WHERE id = library_versions.library_id AND is_approved = true
  ));

CREATE POLICY "Admins can manage library versions"
  ON public.library_versions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for library_assets (public read, admin write)
CREATE POLICY "Anyone can view library assets"
  ON public.library_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.library_versions lv
    JOIN public.libraries l ON l.id = lv.library_id
    WHERE lv.id = library_assets.library_version_id AND l.is_approved = true
  ));

CREATE POLICY "Admins can manage library assets"
  ON public.library_assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for themes (users own their themes)
CREATE POLICY "Users can view their own themes"
  ON public.themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own themes"
  ON public.themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
  ON public.themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
  ON public.themes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for theme_validations (linked to theme ownership)
CREATE POLICY "Users can view validations for their themes"
  ON public.theme_validations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.themes 
    WHERE id = theme_validations.theme_id AND user_id = auth.uid()
  ));

CREATE POLICY "System can create validations"
  ON public.theme_validations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for jobs (admin only)
CREATE POLICY "Admins can view all jobs"
  ON public.jobs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage jobs"
  ON public.jobs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for license_configs (admin write, public read)
CREATE POLICY "Anyone can view license configs"
  ON public.license_configs FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage license configs"
  ON public.license_configs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for seed_libraries (admin write, public read)
CREATE POLICY "Anyone can view seed libraries"
  ON public.seed_libraries FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage seed libraries"
  ON public.seed_libraries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_libraries_approved ON public.libraries(is_approved);
CREATE INDEX idx_libraries_framework ON public.libraries(framework);
CREATE INDEX idx_library_versions_library_id ON public.library_versions(library_id);
CREATE INDEX idx_library_assets_version_id ON public.library_assets(library_version_id);
CREATE INDEX idx_themes_user_id ON public.themes(user_id);
CREATE INDEX idx_themes_published ON public.themes(is_published);
CREATE INDEX idx_theme_validations_theme_id ON public.theme_validations(theme_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_type ON public.jobs(type);

-- Insert seed libraries from the provided list
INSERT INTO public.seed_libraries (name, type, license, homepage, npm_package, priority) VALUES
('daisyui', 'tailwind-plugin', 'MIT', 'https://daisyui.com/docs/intro/', 'daisyui', 10),
('flowbite-core', 'tailwind-components', 'MIT', 'https://flowbite.com/docs/getting-started/introduction/', 'flowbite', 9),
('preline-core', 'tailwind-components', 'MIT+FairUse', 'https://preline.co/', 'preline', 8),
('hyperui', 'tailwind-components', 'MIT', 'https://www.hyperui.dev/', NULL, 7),
('floatui', 'tailwind-components', 'MIT', 'https://floatui.com/', NULL, 7),
('uiverse', 'html-css-snippets', 'MIT', 'https://uiverse.io/', NULL, 6),
('shadcn-ui', 'react+tailwind-registry', 'MIT', 'https://ui.shadcn.com/', NULL, 10),
('radix-ui', 'react-primitives+themes', 'MIT', 'https://www.radix-ui.com/', NULL, 9),
('headlessui', 'headless-components', 'MIT', 'https://headlessui.com/', '@headlessui/react', 8),
('tanstack-table', 'headless-datagrid', 'MIT', 'https://github.com/TanStack/table', '@tanstack/react-table', 7),
('open-props', 'css-design-tokens', 'MIT', 'https://open-props.style/', 'open-props', 8),
('pico-css', 'minimal-css', 'MIT', 'https://picocss.com/', '@picocss/pico', 6),
('chota', 'micro-css', 'MIT', 'https://github.com/jenil/chota', 'chota', 5),
('animate.css', 'css-animations', 'MIT', 'https://animate.style/', 'animate.css', 7);

-- Insert license configurations
INSERT INTO public.license_configs (license_id, is_allowed, special_rules, notes) VALUES
('MIT', true, NULL, 'Permissive open source license'),
('BSD-2-Clause', true, NULL, 'Permissive BSD license'),
('BSD-3-Clause', true, NULL, 'Permissive BSD license'),
('ISC', true, NULL, 'Permissive ISC license'),
('Apache-2.0', true, NULL, 'Permissive Apache license'),
('0BSD', true, NULL, 'Zero-clause BSD license'),
('Unlicense', true, NULL, 'Public domain equivalent'),
('GPL-3.0-only', false, NULL, 'Copyleft license - not allowed'),
('AGPL-3.0-only', false, NULL, 'Strong copyleft license - not allowed'),
('LGPL-3.0-only', false, NULL, 'Limited copyleft license - not allowed'),
('SSPL-1.0', false, NULL, 'Server Side Public License - not allowed'),
('MIT+FairUse', true, 
  '{"rules": ["Do not redistribute components or templates as a standalone library, theme, or generator.", "Mirror only for internal build-time compilation; do not expose raw source for public download.", "Show attribution in OSS attributions page."], "action": "ingest_with_restrictions"}'::jsonb, 
  'Preline UI Fair Use - special restrictions apply');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_libraries_updated_at
  BEFORE UPDATE ON public.libraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();