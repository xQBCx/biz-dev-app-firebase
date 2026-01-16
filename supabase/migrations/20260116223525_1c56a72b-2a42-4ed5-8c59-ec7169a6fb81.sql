-- ============================================
-- PHASE 2A: OPPORTUNITY DISCOVERY ENGINE
-- ============================================

-- Watchlist for target entities/keywords to scan for
CREATE TABLE public.opportunity_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('company', 'country', 'industry', 'event', 'person')),
  target_value TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  scan_frequency TEXT DEFAULT 'daily' CHECK (scan_frequency IN ('hourly', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Discovered opportunities from scanning
CREATE TABLE public.discovered_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  watchlist_id UUID REFERENCES public.opportunity_watchlist(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('news', 'press_release', 'social', 'public_filings', 'industry_report', 'conference', 'manual')),
  source_url TEXT,
  headline TEXT NOT NULL,
  summary TEXT,
  full_content TEXT,
  entities_mentioned JSONB DEFAULT '{}',
  relevance_score NUMERIC DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  opportunity_type TEXT CHECK (opportunity_type IN ('investment', 'partnership', 'acquisition', 'service', 'networking', 'conference', 'other')),
  estimated_value NUMERIC,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'qualified', 'converted', 'dismissed')),
  converted_to_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  converted_to_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  converted_to_deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 2B: PROPOSAL GENERATOR
-- ============================================

-- Proposal templates
CREATE TABLE public.proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('executive_landing', 'investment_tour', 'consulting', 'property', 'workshop', 'partnership', 'service', 'custom')),
  structure JSONB DEFAULT '{"sections": []}',
  branding JSONB DEFAULT '{"primaryColor": "#000000", "logo": null}',
  default_terms JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated proposals
CREATE TABLE public.generated_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.proposal_templates(id) ON DELETE SET NULL,
  target_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  target_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  proposal_number TEXT,
  generated_content JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  terms JSONB DEFAULT '{}',
  pdf_url TEXT,
  secure_link_token TEXT UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  xodiak_anchor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 2C: PARTNER PORTAL
-- ============================================

-- Registered partners with capabilities
CREATE TABLE public.registered_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('legal', 'industrial', 'real_estate', 'consulting', 'technology', 'financial', 'marketing', 'other')),
  services_offered TEXT[] DEFAULT '{}',
  commission_structure JSONB DEFAULT '{"default_rate": 10}',
  access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  portal_permissions JSONB DEFAULT '{"view_leads": true, "view_commissions": true, "submit_deliverables": true}',
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partner commissions
CREATE TABLE public.partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.registered_partners(id) ON DELETE CASCADE NOT NULL,
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.generated_proposals(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.consultation_bookings(id) ON DELETE SET NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('referral', 'service', 'network_access', 'closing', 'introduction', 'support')),
  description TEXT,
  commission_rate NUMERIC NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  base_amount NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC GENERATED ALWAYS AS (base_amount * commission_rate / 100) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  xodiak_anchor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partner activity log
CREATE TABLE public.partner_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.registered_partners(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'view_lead', 'submit_deliverable', 'view_commission', 'update_profile')),
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 2D: xSTAYx PROPERTY MANAGEMENT
-- ============================================

-- Properties under management
CREATE TABLE public.xstay_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.spawned_businesses(id) ON DELETE SET NULL,
  owner_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  property_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Houston',
  state TEXT DEFAULT 'TX',
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  property_type TEXT NOT NULL CHECK (property_type IN ('mansion', 'luxury_home', 'penthouse', 'estate', 'villa', 'townhouse', 'condo')),
  bedrooms INT NOT NULL CHECK (bedrooms > 0),
  bathrooms NUMERIC NOT NULL CHECK (bathrooms > 0),
  max_guests INT NOT NULL CHECK (max_guests > 0),
  square_feet INT,
  lot_size TEXT,
  year_built INT,
  amenities JSONB DEFAULT '[]',
  features TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  virtual_tour_url TEXT,
  description TEXT,
  house_rules TEXT,
  check_in_time TIME DEFAULT '15:00',
  check_out_time TIME DEFAULT '11:00',
  minimum_stay INT DEFAULT 1,
  nightly_rate NUMERIC NOT NULL CHECK (nightly_rate > 0),
  weekly_rate NUMERIC,
  monthly_rate NUMERIC,
  cleaning_fee NUMERIC DEFAULT 0,
  security_deposit NUMERIC DEFAULT 0,
  management_fee_percent NUMERIC DEFAULT 20 CHECK (management_fee_percent >= 0 AND management_fee_percent <= 100),
  listing_status TEXT DEFAULT 'draft' CHECK (listing_status IN ('draft', 'pending_approval', 'active', 'paused', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  rating NUMERIC,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Property availability/blocked dates
CREATE TABLE public.xstay_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.xstay_properties(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  custom_rate NUMERIC,
  minimum_stay INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Property bookings
CREATE TABLE public.xstay_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.xstay_properties(id) ON DELETE CASCADE NOT NULL,
  guest_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL,
  nights INT GENERATED ALWAYS AS (check_out - check_in) STORED,
  nightly_total NUMERIC NOT NULL,
  cleaning_fee NUMERIC DEFAULT 0,
  service_fee NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  owner_payout NUMERIC NOT NULL,
  management_fee NUMERIC NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial_refund', 'full_refund', 'failed')),
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Owner portal access
CREATE TABLE public.xstay_owner_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.xstay_properties(id) ON DELETE CASCADE NOT NULL,
  owner_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  permissions JSONB DEFAULT '{"view_calendar": true, "view_financials": true, "update_availability": true}',
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Property reviews
CREATE TABLE public.xstay_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.xstay_properties(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.xstay_bookings(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INT CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INT CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  review_text TEXT,
  owner_response TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 2E: INITIATIVE ARCHITECT
-- ============================================

-- Initiatives created by the AGI system
CREATE TABLE public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  original_prompt TEXT,
  status TEXT DEFAULT 'scaffolding' CHECK (status IN ('scaffolding', 'review', 'active', 'completed', 'archived')),
  initiative_type TEXT CHECK (initiative_type IN ('workshop', 'partnership', 'campaign', 'product_launch', 'event', 'research', 'acquisition', 'custom')),
  scaffolded_entities JSONB DEFAULT '{"contacts": [], "companies": [], "deal_rooms": [], "tasks": [], "workflows": []}',
  generated_content JSONB DEFAULT '{"emails": [], "proposals": [], "curriculum": []}',
  workspace_structure JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '[]',
  progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initiative milestones
CREATE TABLE public.initiative_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES public.initiatives(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  order_index INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.opportunity_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstay_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstay_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstay_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstay_owner_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstay_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_milestones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Opportunity Watchlist
CREATE POLICY "Users can manage own watchlist" ON public.opportunity_watchlist FOR ALL USING (auth.uid() = user_id);

-- Discovered Opportunities
CREATE POLICY "Users can manage own opportunities" ON public.discovered_opportunities FOR ALL USING (auth.uid() = user_id);

-- Proposal Templates
CREATE POLICY "Users can manage own templates" ON public.proposal_templates FOR ALL USING (auth.uid() = user_id);

-- Generated Proposals
CREATE POLICY "Users can manage own proposals" ON public.generated_proposals FOR ALL USING (auth.uid() = user_id);

-- Registered Partners
CREATE POLICY "Users can manage own partners" ON public.registered_partners FOR ALL USING (auth.uid() = user_id);

-- Partner Commissions
CREATE POLICY "Users can view partner commissions" ON public.partner_commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.registered_partners WHERE id = partner_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage partner commissions" ON public.partner_commissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.registered_partners WHERE id = partner_id AND user_id = auth.uid())
);

-- Partner Activity Log
CREATE POLICY "Users can view partner activity" ON public.partner_activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.registered_partners WHERE id = partner_id AND user_id = auth.uid())
);

-- xSTAYx Properties
CREATE POLICY "Users can manage own properties" ON public.xstay_properties FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view active properties" ON public.xstay_properties FOR SELECT USING (listing_status = 'active');

-- xSTAYx Availability
CREATE POLICY "Users can manage property availability" ON public.xstay_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM public.xstay_properties WHERE id = property_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view availability" ON public.xstay_availability FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.xstay_properties WHERE id = property_id AND listing_status = 'active')
);

-- xSTAYx Bookings
CREATE POLICY "Users can manage bookings" ON public.xstay_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.xstay_properties WHERE id = property_id AND user_id = auth.uid())
);
CREATE POLICY "Guests can view own bookings" ON public.xstay_bookings FOR SELECT USING (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

-- xSTAYx Owner Portals
CREATE POLICY "Property owners can access portal" ON public.xstay_owner_portals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.xstay_properties WHERE id = property_id AND user_id = auth.uid())
);

-- xSTAYx Reviews
CREATE POLICY "Public can view reviews" ON public.xstay_reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Property owners can manage reviews" ON public.xstay_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.xstay_properties WHERE id = property_id AND user_id = auth.uid())
);

-- Initiatives
CREATE POLICY "Users can manage own initiatives" ON public.initiatives FOR ALL USING (auth.uid() = user_id);

-- Initiative Milestones
CREATE POLICY "Users can manage initiative milestones" ON public.initiative_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.initiatives WHERE id = initiative_id AND user_id = auth.uid())
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_opportunity_watchlist_user ON public.opportunity_watchlist(user_id);
CREATE INDEX idx_opportunity_watchlist_active ON public.opportunity_watchlist(is_active) WHERE is_active = true;
CREATE INDEX idx_discovered_opportunities_user ON public.discovered_opportunities(user_id);
CREATE INDEX idx_discovered_opportunities_status ON public.discovered_opportunities(status);
CREATE INDEX idx_discovered_opportunities_relevance ON public.discovered_opportunities(relevance_score DESC);
CREATE INDEX idx_proposal_templates_user ON public.proposal_templates(user_id);
CREATE INDEX idx_generated_proposals_user ON public.generated_proposals(user_id);
CREATE INDEX idx_generated_proposals_status ON public.generated_proposals(status);
CREATE INDEX idx_registered_partners_user ON public.registered_partners(user_id);
CREATE INDEX idx_registered_partners_token ON public.registered_partners(access_token);
CREATE INDEX idx_partner_commissions_partner ON public.partner_commissions(partner_id);
CREATE INDEX idx_partner_commissions_status ON public.partner_commissions(status);
CREATE INDEX idx_xstay_properties_user ON public.xstay_properties(user_id);
CREATE INDEX idx_xstay_properties_status ON public.xstay_properties(listing_status);
CREATE INDEX idx_xstay_properties_featured ON public.xstay_properties(is_featured) WHERE is_featured = true;
CREATE INDEX idx_xstay_bookings_property ON public.xstay_bookings(property_id);
CREATE INDEX idx_xstay_bookings_dates ON public.xstay_bookings(check_in, check_out);
CREATE INDEX idx_xstay_bookings_status ON public.xstay_bookings(booking_status);
CREATE INDEX idx_initiatives_user ON public.initiatives(user_id);
CREATE INDEX idx_initiatives_status ON public.initiatives(status);
CREATE INDEX idx_initiative_milestones_initiative ON public.initiative_milestones(initiative_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_opportunity_watchlist_updated_at BEFORE UPDATE ON public.opportunity_watchlist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discovered_opportunities_updated_at BEFORE UPDATE ON public.discovered_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposal_templates_updated_at BEFORE UPDATE ON public.proposal_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_generated_proposals_updated_at BEFORE UPDATE ON public.generated_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registered_partners_updated_at BEFORE UPDATE ON public.registered_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partner_commissions_updated_at BEFORE UPDATE ON public.partner_commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_xstay_properties_updated_at BEFORE UPDATE ON public.xstay_properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_xstay_bookings_updated_at BEFORE UPDATE ON public.xstay_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_initiatives_updated_at BEFORE UPDATE ON public.initiatives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();