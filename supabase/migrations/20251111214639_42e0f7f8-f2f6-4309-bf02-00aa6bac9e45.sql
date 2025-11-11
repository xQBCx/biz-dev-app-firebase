-- Create enum for website status
CREATE TYPE website_status AS ENUM ('draft', 'published', 'archived');

-- Create enum for generation method
CREATE TYPE generation_method AS ENUM ('ai_generated', 'template_based', 'hybrid');

-- Table for generated websites
CREATE TABLE public.generated_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  white_label_config_id UUID REFERENCES public.white_label_configs(id) ON DELETE SET NULL,
  
  -- Business info
  business_name TEXT NOT NULL,
  business_description TEXT NOT NULL,
  industry TEXT,
  target_audience TEXT,
  
  -- Website data
  domain_slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  generation_method generation_method DEFAULT 'ai_generated',
  template_id UUID,
  
  -- Generated content (stored as JSON)
  sections JSONB NOT NULL DEFAULT '[]',
  theme JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  status website_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  
  -- Usage tracking
  ai_tokens_used INTEGER DEFAULT 0,
  images_generated INTEGER DEFAULT 0,
  generation_cost DECIMAL(10,4) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for website templates
CREATE TABLE public.website_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  preview_image_url TEXT,
  
  -- Template structure
  sections JSONB NOT NULL DEFAULT '[]',
  theme JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for website sections (reusable components)
CREATE TABLE public.website_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section_type TEXT NOT NULL,
  description TEXT,
  
  -- Section content template
  content_template JSONB NOT NULL,
  
  -- AI prompts for this section type
  ai_generation_prompt TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for industry best practices
CREATE TABLE public.industry_best_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  
  -- Best practices data
  recommended_sections TEXT[] DEFAULT '{}',
  color_schemes JSONB DEFAULT '[]',
  content_guidelines TEXT,
  cta_examples TEXT[],
  
  -- Form types that work best
  recommended_forms TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for usage tracking
CREATE TABLE public.website_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.generated_websites(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL,
  ai_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_best_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_websites
CREATE POLICY "Users can view their own websites"
  ON public.generated_websites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own websites"
  ON public.generated_websites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
  ON public.generated_websites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
  ON public.generated_websites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for website_templates (public read)
CREATE POLICY "Anyone can view active templates"
  ON public.website_templates FOR SELECT
  USING (is_active = true);

-- RLS Policies for website_sections (public read)
CREATE POLICY "Anyone can view active sections"
  ON public.website_sections FOR SELECT
  USING (is_active = true);

-- RLS Policies for industry_best_practices (public read)
CREATE POLICY "Anyone can view industry best practices"
  ON public.industry_best_practices FOR SELECT
  USING (true);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON public.website_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.website_usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_websites_user_id ON public.generated_websites(user_id);
CREATE INDEX idx_websites_domain_slug ON public.generated_websites(domain_slug);
CREATE INDEX idx_websites_status ON public.generated_websites(status);
CREATE INDEX idx_websites_client_id ON public.generated_websites(client_id);
CREATE INDEX idx_templates_industry ON public.website_templates(industry);
CREATE INDEX idx_usage_user_id ON public.website_usage_tracking(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON public.generated_websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.website_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial industry best practices
INSERT INTO public.industry_best_practices (industry, recommended_sections, content_guidelines, cta_examples, recommended_forms) VALUES
('auto_detailing', 
  ARRAY['hero', 'services', 'before_after_gallery', 'pricing', 'testimonials', 'booking_form', 'contact'],
  'Focus on visual transformation, emphasize convenience of mobile service, highlight quality products used',
  ARRAY['Book Your Detail Today', 'Get a Free Quote', 'Schedule Now', 'See Our Work'],
  ARRAY['booking_form', 'quote_request', 'contact_form']
),
('restaurant', 
  ARRAY['hero', 'menu', 'gallery', 'about', 'reservations', 'location', 'contact'],
  'Showcase food photography, emphasize unique dishes, highlight ambiance and experience',
  ARRAY['Reserve a Table', 'Order Online', 'View Menu', 'Book Now'],
  ARRAY['reservation_form', 'contact_form', 'newsletter_signup']
),
('fitness', 
  ARRAY['hero', 'classes', 'trainers', 'pricing', 'testimonials', 'free_trial', 'contact'],
  'Emphasize transformation stories, community aspect, expert trainers, results-driven',
  ARRAY['Start Free Trial', 'Join Now', 'Book a Class', 'Meet Our Trainers'],
  ARRAY['trial_signup', 'class_booking', 'contact_form']
),
('legal', 
  ARRAY['hero', 'practice_areas', 'about', 'attorney_profiles', 'testimonials', 'consultation', 'contact'],
  'Build trust and authority, showcase expertise, emphasize results and experience',
  ARRAY['Free Consultation', 'Contact Us', 'Get Legal Help', 'Schedule a Meeting'],
  ARRAY['consultation_request', 'contact_form', 'case_evaluation']
),
('real_estate', 
  ARRAY['hero', 'featured_properties', 'search', 'about', 'testimonials', 'contact'],
  'High-quality property photos, emphasize local market expertise, highlight success stories',
  ARRAY['Browse Listings', 'Schedule a Showing', 'Get Home Value', 'Contact Agent'],
  ARRAY['property_inquiry', 'home_valuation', 'contact_form']
);