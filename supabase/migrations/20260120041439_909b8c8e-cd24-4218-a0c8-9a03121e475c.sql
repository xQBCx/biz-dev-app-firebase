-- =====================================================
-- PHASE 1: ARCHETYPE EXPERIENCE LAYER
-- Platform archetypes for role-fluid human deployment
-- =====================================================

-- Create platform_archetypes table
CREATE TABLE public.platform_archetypes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'User',
  
  -- Language configuration for archetype-specific terminology
  language_config JSONB NOT NULL DEFAULT '{
    "tasks": "tasks",
    "deals": "deals", 
    "projects": "initiatives",
    "team": "team",
    "clients": "clients",
    "meetings": "meetings",
    "goals": "objectives",
    "success": "success",
    "dashboard": "command center"
  }'::jsonb,
  
  -- Onboarding flow configuration
  onboarding_flow JSONB NOT NULL DEFAULT '{
    "steps": ["welcome", "profile", "skills", "preferences", "complete"],
    "messaging": {},
    "featured_modules": ["dashboard", "crm", "tasks"]
  }'::jsonb,
  
  -- Incentive framing configuration
  incentive_config JSONB NOT NULL DEFAULT '{
    "achievement_language": "achievements",
    "reward_language": "rewards",
    "progress_language": "progress",
    "rank_system": false
  }'::jsonb,
  
  -- Trust signals and verification priorities
  trust_signals JSONB NOT NULL DEFAULT '{
    "primary_credentials": [],
    "verification_badges": [],
    "display_priorities": ["experience", "certifications", "references"]
  }'::jsonb,
  
  -- Default module permissions for this archetype
  default_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Role progression pathways
  role_progressions JSONB NOT NULL DEFAULT '{
    "pathways": [
      {"from": "responder", "to": "operator", "requirements": []},
      {"from": "operator", "to": "owner", "requirements": []}
    ]
  }'::jsonb,
  
  -- Visual theming
  theme_config JSONB DEFAULT '{}'::jsonb,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add archetype reference to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS archetype_id UUID REFERENCES public.platform_archetypes(id),
ADD COLUMN IF NOT EXISTS archetype_overrides JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS verified_credentials JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS workforce_status TEXT DEFAULT 'available' CHECK (workforce_status IN ('seeking', 'available', 'employed', 'not_available')),
ADD COLUMN IF NOT EXISTS workforce_visibility TEXT DEFAULT 'network_only' CHECK (workforce_visibility IN ('public', 'network_only', 'private'));

-- Create user archetype preferences for tracking
CREATE TABLE public.user_archetype_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_id UUID NOT NULL REFERENCES public.platform_archetypes(id),
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.platform_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_archetype_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_archetypes (public read, admin write)
CREATE POLICY "Anyone can view active archetypes" 
ON public.platform_archetypes 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage archetypes" 
ON public.platform_archetypes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for user_archetype_history
CREATE POLICY "Users can view their own archetype history" 
ON public.user_archetype_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own archetype history" 
ON public.user_archetype_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Seed initial archetypes
INSERT INTO public.platform_archetypes (slug, display_name, description, icon_name, language_config, onboarding_flow, incentive_config, trust_signals, sort_order) VALUES
(
  'service_professional',
  'Service Professional',
  'Military veterans, first responders, law enforcement, and security professionals with mission-critical experience.',
  'Shield',
  '{
    "tasks": "missions",
    "deals": "operations",
    "projects": "campaigns",
    "team": "unit",
    "clients": "stakeholders",
    "meetings": "briefings",
    "goals": "objectives",
    "success": "mission accomplished",
    "dashboard": "command center"
  }'::jsonb,
  '{
    "steps": ["welcome", "service_verification", "skills", "clearance", "preferences", "complete"],
    "messaging": {
      "welcome": "Welcome to your new mission",
      "complete": "Ready for deployment"
    },
    "featured_modules": ["eros", "deal_rooms", "tasks"]
  }'::jsonb,
  '{
    "achievement_language": "commendations",
    "reward_language": "recognition",
    "progress_language": "advancement",
    "rank_system": true
  }'::jsonb,
  '{
    "primary_credentials": ["military_service", "security_clearance", "first_responder_cert"],
    "verification_badges": ["veteran", "active_duty", "first_responder"],
    "display_priorities": ["service_record", "certifications", "clearance_level"]
  }'::jsonb,
  1
),
(
  'technical_professional',
  'Technical Professional',
  'Engineers, developers, analysts, and technical specialists driving innovation and solutions.',
  'Code',
  '{
    "tasks": "tickets",
    "deals": "projects",
    "projects": "initiatives",
    "team": "team",
    "clients": "stakeholders",
    "meetings": "syncs",
    "goals": "milestones",
    "success": "shipped",
    "dashboard": "dashboard"
  }'::jsonb,
  '{
    "steps": ["welcome", "profile", "tech_stack", "portfolio", "preferences", "complete"],
    "messaging": {
      "welcome": "Welcome to the platform",
      "complete": "Ready to build"
    },
    "featured_modules": ["research_studio", "system_intelligence", "tasks"]
  }'::jsonb,
  '{
    "achievement_language": "achievements",
    "reward_language": "recognition",
    "progress_language": "leveling up",
    "rank_system": false
  }'::jsonb,
  '{
    "primary_credentials": ["certifications", "portfolio", "github_profile"],
    "verification_badges": ["certified", "contributor", "architect"],
    "display_priorities": ["skills", "portfolio", "contributions"]
  }'::jsonb,
  2
),
(
  'tradesperson',
  'Tradesperson',
  'Construction, manufacturing, and skilled labor professionals with hands-on expertise.',
  'Wrench',
  '{
    "tasks": "jobs",
    "deals": "contracts",
    "projects": "projects",
    "team": "crew",
    "clients": "clients",
    "meetings": "site meetings",
    "goals": "targets",
    "success": "job complete",
    "dashboard": "job board"
  }'::jsonb,
  '{
    "steps": ["welcome", "profile", "trade_certs", "equipment", "preferences", "complete"],
    "messaging": {
      "welcome": "Welcome aboard",
      "complete": "Ready to work"
    },
    "featured_modules": ["tasks", "deal_rooms", "crm"]
  }'::jsonb,
  '{
    "achievement_language": "accomplishments",
    "reward_language": "bonuses",
    "progress_language": "advancement",
    "rank_system": true
  }'::jsonb,
  '{
    "primary_credentials": ["trade_license", "certifications", "union_membership"],
    "verification_badges": ["licensed", "certified", "master"],
    "display_priorities": ["trade_experience", "certifications", "equipment"]
  }'::jsonb,
  3
),
(
  'athlete_performer',
  'Athlete / Performer',
  'Sports professionals, entertainers, influencers, and performance-driven individuals.',
  'Trophy',
  '{
    "tasks": "training",
    "deals": "contracts",
    "projects": "campaigns",
    "team": "team",
    "clients": "sponsors",
    "meetings": "sessions",
    "goals": "performance goals",
    "success": "victory",
    "dashboard": "performance hub"
  }'::jsonb,
  '{
    "steps": ["welcome", "profile", "achievements", "representation", "preferences", "complete"],
    "messaging": {
      "welcome": "Welcome to the arena",
      "complete": "Ready to compete"
    },
    "featured_modules": ["talent_network", "deal_rooms", "proposals"]
  }'::jsonb,
  '{
    "achievement_language": "records",
    "reward_language": "prizes",
    "progress_language": "ranking up",
    "rank_system": true
  }'::jsonb,
  '{
    "primary_credentials": ["athletic_record", "representation", "endorsements"],
    "verification_badges": ["pro", "champion", "endorsed"],
    "display_priorities": ["achievements", "stats", "endorsements"]
  }'::jsonb,
  4
),
(
  'entrepreneur_founder',
  'Entrepreneur / Founder',
  'Startup founders, small business owners, and venture builders creating new value.',
  'Rocket',
  '{
    "tasks": "priorities",
    "deals": "deals",
    "projects": "ventures",
    "team": "co-founders",
    "clients": "customers",
    "meetings": "pitches",
    "goals": "milestones",
    "success": "growth",
    "dashboard": "founder hub"
  }'::jsonb,
  '{
    "steps": ["welcome", "profile", "ventures", "network", "preferences", "complete"],
    "messaging": {
      "welcome": "Welcome, founder",
      "complete": "Ready to build"
    },
    "featured_modules": ["initiatives", "deal_rooms", "proposals"]
  }'::jsonb,
  '{
    "achievement_language": "milestones",
    "reward_language": "returns",
    "progress_language": "scaling",
    "rank_system": false
  }'::jsonb,
  '{
    "primary_credentials": ["ventures", "exits", "funding_raised"],
    "verification_badges": ["founder", "investor", "advisor"],
    "display_priorities": ["ventures", "exits", "network"]
  }'::jsonb,
  5
),
(
  'capital_allocator',
  'Capital Allocator',
  'Investors, family offices, fund managers, and capital deployment professionals.',
  'DollarSign',
  '{
    "tasks": "reviews",
    "deals": "investments",
    "projects": "portfolios",
    "team": "partners",
    "clients": "LPs",
    "meetings": "due diligence",
    "goals": "returns",
    "success": "alpha",
    "dashboard": "portfolio command"
  }'::jsonb,
  '{
    "steps": ["welcome", "profile", "accreditation", "thesis", "preferences", "complete"],
    "messaging": {
      "welcome": "Welcome to the table",
      "complete": "Ready to deploy"
    },
    "featured_modules": ["deal_rooms", "proposals", "research_studio"]
  }'::jsonb,
  '{
    "achievement_language": "returns",
    "reward_language": "carry",
    "progress_language": "AUM growth",
    "rank_system": false
  }'::jsonb,
  '{
    "primary_credentials": ["accreditation", "track_record", "aum"],
    "verification_badges": ["accredited", "institutional", "family_office"],
    "display_priorities": ["thesis", "track_record", "portfolio"]
  }'::jsonb,
  6
);

-- Create index for faster lookups
CREATE INDEX idx_platform_archetypes_slug ON public.platform_archetypes(slug);
CREATE INDEX idx_platform_archetypes_active ON public.platform_archetypes(is_active);
CREATE INDEX idx_profiles_archetype ON public.profiles(archetype_id);
CREATE INDEX idx_user_archetype_history_user ON public.user_archetype_history(user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_platform_archetypes_updated_at
BEFORE UPDATE ON public.platform_archetypes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();