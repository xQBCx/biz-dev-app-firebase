
-- Create gym partnership tables

-- Gym brands/chains
CREATE TABLE public.gym_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  affiliate_program_type TEXT DEFAULT 'none' CHECK (affiliate_program_type IN ('none', 'direct', 'network', 'corporate_wellness')),
  affiliate_network TEXT,
  commission_structure JSONB DEFAULT '{}',
  partnership_status TEXT DEFAULT 'prospect' CHECK (partnership_status IN ('prospect', 'outreach', 'negotiating', 'active', 'paused', 'inactive')),
  contact_info JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual gym locations
CREATE TABLE public.gym_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_brand_id UUID REFERENCES public.gym_brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  website TEXT,
  google_maps_url TEXT,
  hours JSONB DEFAULT '{}',
  amenities JSONB DEFAULT '[]',
  referral_link TEXT,
  promo_code TEXT,
  monthly_price_estimate NUMERIC,
  has_personal_training BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track referral clicks and conversions
CREATE TABLE public.gym_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gym_location_id UUID NOT NULL REFERENCES public.gym_locations(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'app' CHECK (source IN ('app', 'coach_booking', 'quiz', 'content', 'direct')),
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referral_code TEXT,
  converted BOOLEAN DEFAULT false,
  conversion_date TIMESTAMP WITH TIME ZONE,
  commission_amount NUMERIC,
  commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'rejected'))
);

-- Coaches' preferred training locations
CREATE TABLE public.coach_gym_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  gym_location_id UUID NOT NULL REFERENCES public.gym_locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  availability_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, gym_location_id)
);

-- Entity embeddings tables

-- User embeddings for AI matching
CREATE TABLE public.user_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  embedding_vector JSONB,
  embedding_source TEXT DEFAULT 'profile' CHECK (embedding_source IN ('profile', 'quiz', 'behavior', 'combined')),
  profile_snapshot JSONB DEFAULT '{}',
  behavioral_signals JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER DEFAULT 1,
  UNIQUE(user_id, embedding_source)
);

-- Coach embeddings
CREATE TABLE public.coach_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  embedding_vector JSONB,
  profile_snapshot JSONB DEFAULT '{}',
  match_signals JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER DEFAULT 1,
  UNIQUE(coach_id)
);

-- Gym embeddings
CREATE TABLE public.gym_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_location_id UUID NOT NULL REFERENCES public.gym_locations(id) ON DELETE CASCADE,
  embedding_vector JSONB,
  feature_snapshot JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER DEFAULT 1,
  UNIQUE(gym_location_id)
);

-- Partner/business embeddings
CREATE TABLE public.partner_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  embedding_vector JSONB,
  profile_snapshot JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version INTEGER DEFAULT 1,
  UNIQUE(business_id)
);

-- Pre-computed similarity cache
CREATE TABLE public.embedding_similarity_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type_a TEXT NOT NULL,
  entity_id_a UUID NOT NULL,
  entity_type_b TEXT NOT NULL,
  entity_id_b UUID NOT NULL,
  similarity_score NUMERIC NOT NULL,
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_type_a, entity_id_a, entity_type_b, entity_id_b)
);

-- Create indexes for performance
CREATE INDEX idx_gym_locations_city_state ON public.gym_locations(city, state);
CREATE INDEX idx_gym_locations_zip ON public.gym_locations(zip_code);
CREATE INDEX idx_gym_locations_coords ON public.gym_locations(latitude, longitude);
CREATE INDEX idx_gym_referrals_user ON public.gym_referrals(user_id);
CREATE INDEX idx_gym_referrals_gym ON public.gym_referrals(gym_location_id);
CREATE INDEX idx_user_embeddings_user ON public.user_embeddings(user_id);
CREATE INDEX idx_similarity_cache_lookup ON public.embedding_similarity_cache(entity_type_a, entity_id_a);

-- Enable RLS on all tables
ALTER TABLE public.gym_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_gym_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedding_similarity_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_brands
CREATE POLICY "Anyone can view gym brands" ON public.gym_brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage gym brands" ON public.gym_brands FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for gym_locations
CREATE POLICY "Anyone can view active gym locations" ON public.gym_locations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage gym locations" ON public.gym_locations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for gym_referrals
CREATE POLICY "Users can create referrals" ON public.gym_referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their referrals" ON public.gym_referrals FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage referrals" ON public.gym_referrals FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for coach_gym_locations
CREATE POLICY "Anyone can view coach gym locations" ON public.coach_gym_locations FOR SELECT USING (true);
CREATE POLICY "Coaches can manage their gym locations" ON public.coach_gym_locations FOR ALL 
  USING (coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));

-- RLS Policies for user_embeddings
CREATE POLICY "Users can view their embeddings" ON public.user_embeddings FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "System can manage embeddings" ON public.user_embeddings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for coach_embeddings
CREATE POLICY "Anyone can view coach embeddings" ON public.coach_embeddings FOR SELECT USING (true);
CREATE POLICY "Admins can manage coach embeddings" ON public.coach_embeddings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for gym_embeddings
CREATE POLICY "Anyone can view gym embeddings" ON public.gym_embeddings FOR SELECT USING (true);
CREATE POLICY "Admins can manage gym embeddings" ON public.gym_embeddings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_embeddings
CREATE POLICY "Partners can view their embeddings" ON public.partner_embeddings FOR SELECT 
  USING (business_id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage partner embeddings" ON public.partner_embeddings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for embedding_similarity_cache
CREATE POLICY "Authenticated users can view similarity cache" ON public.embedding_similarity_cache FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage similarity cache" ON public.embedding_similarity_cache FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Update triggers
CREATE TRIGGER update_gym_brands_updated_at BEFORE UPDATE ON public.gym_brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gym_locations_updated_at BEFORE UPDATE ON public.gym_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
