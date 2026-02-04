-- =============================================
-- CONSULTANT BOOKING & BILLING SYSTEM
-- =============================================

-- 1. Consultant Profiles - stores settings for users offering paid consultations
CREATE TABLE public.consultant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  booking_page_slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Denver',
  
  -- Pricing
  default_rate_30min NUMERIC(10,2) DEFAULT 50.00,
  default_rate_hourly NUMERIC(10,2) DEFAULT 100.00,
  first_call_rate NUMERIC(10,2) DEFAULT 50.00,
  min_booking_duration INTEGER DEFAULT 30,
  max_booking_duration INTEGER DEFAULT 120,
  
  -- Scheduling
  calendar_buffer_minutes INTEGER DEFAULT 15,
  max_daily_bookings INTEGER DEFAULT 8,
  advance_booking_days INTEGER DEFAULT 30,
  min_advance_hours INTEGER DEFAULT 24,
  
  -- NDA Settings
  nda_required BOOLEAN DEFAULT true,
  nda_content TEXT,
  
  -- Integration
  stripe_account_id TEXT,
  google_calendar_connected BOOLEAN DEFAULT false,
  google_refresh_token_encrypted TEXT,
  
  -- Contact
  contact_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_user_consultant UNIQUE(user_id)
);

-- 2. Consultant Availability - recurring weekly availability
CREATE TABLE public.consultant_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_day_slot UNIQUE(consultant_id, day_of_week, start_time, end_time)
);

-- 3. Consultant Blocked Times - specific date/time blocks
CREATE TABLE public.consultant_blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_datetime_range CHECK (end_datetime > start_datetime)
);

-- 4. Booking Access Codes - promo codes and special access
CREATE TABLE public.booking_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free')),
  discount_value NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  assigned_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_consultant_code UNIQUE(consultant_id, code)
);

-- 5. Consultation Bookings - all bookings
CREATE TABLE public.consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  
  -- Booker Info
  booker_email TEXT NOT NULL,
  booker_name TEXT NOT NULL,
  booker_company TEXT,
  booker_phone TEXT,
  booker_user_id UUID REFERENCES auth.users(id),
  
  -- Booking Details
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'
  )),
  
  -- Pricing
  original_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  amount_charged NUMERIC(10,2) NOT NULL,
  access_code_used TEXT,
  is_first_time_caller BOOLEAN DEFAULT false,
  
  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Meeting
  meeting_link TEXT,
  meeting_provider TEXT DEFAULT 'google_meet',
  google_event_id TEXT,
  
  -- NDA
  nda_accepted_at TIMESTAMPTZ,
  nda_version TEXT,
  
  -- Notes
  booking_notes TEXT,
  consultant_notes TEXT,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  refund_amount NUMERIC(10,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Consultant Client Rates - custom rates for specific clients
CREATE TABLE public.consultant_client_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT,
  custom_rate_30min NUMERIC(10,2),
  custom_rate_hourly NUMERIC(10,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_consultant_client UNIQUE(consultant_id, client_email)
);

-- Enable RLS on all tables
ALTER TABLE public.consultant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_client_rates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Consultant Profiles: Public read for active profiles, owner can manage
CREATE POLICY "Public can view active consultant profiles"
  ON public.consultant_profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage their own consultant profile"
  ON public.consultant_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Consultant Availability: Public read, owner can manage
CREATE POLICY "Public can view consultant availability"
  ON public.consultant_availability FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND is_active = true
  ));

CREATE POLICY "Consultants can manage their availability"
  ON public.consultant_availability FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ));

-- Consultant Blocked Times: Owner only
CREATE POLICY "Consultants can manage their blocked times"
  ON public.consultant_blocked_times FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ));

-- Booking Access Codes: Owner can manage, public can validate
CREATE POLICY "Consultants can manage their access codes"
  ON public.booking_access_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ));

CREATE POLICY "Public can view active access codes for validation"
  ON public.booking_access_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Consultation Bookings: Consultant and booker can view, service role for creation
CREATE POLICY "Consultants can view and manage their bookings"
  ON public.consultation_bookings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ));

CREATE POLICY "Bookers can view their own bookings"
  ON public.consultation_bookings FOR SELECT
  USING (booker_user_id = auth.uid() OR booker_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

CREATE POLICY "Allow insert for booking creation"
  ON public.consultation_bookings FOR INSERT
  WITH CHECK (true);

-- Consultant Client Rates: Owner only
CREATE POLICY "Consultants can manage their client rates"
  ON public.consultant_client_rates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.consultant_profiles 
    WHERE id = consultant_id AND user_id = auth.uid()
  ));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_consultant_profiles_slug ON public.consultant_profiles(booking_page_slug);
CREATE INDEX idx_consultant_profiles_user ON public.consultant_profiles(user_id);
CREATE INDEX idx_consultant_availability_consultant ON public.consultant_availability(consultant_id);
CREATE INDEX idx_consultant_blocked_times_consultant ON public.consultant_blocked_times(consultant_id);
CREATE INDEX idx_consultant_blocked_times_datetime ON public.consultant_blocked_times(start_datetime, end_datetime);
CREATE INDEX idx_booking_access_codes_consultant ON public.booking_access_codes(consultant_id);
CREATE INDEX idx_booking_access_codes_code ON public.booking_access_codes(code);
CREATE INDEX idx_consultation_bookings_consultant ON public.consultation_bookings(consultant_id);
CREATE INDEX idx_consultation_bookings_start_time ON public.consultation_bookings(start_time);
CREATE INDEX idx_consultation_bookings_status ON public.consultation_bookings(status);
CREATE INDEX idx_consultation_bookings_booker ON public.consultation_bookings(booker_email);
CREATE INDEX idx_consultant_client_rates_consultant ON public.consultant_client_rates(consultant_id);
CREATE INDEX idx_consultant_client_rates_email ON public.consultant_client_rates(client_email);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_consultation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultant_profiles_updated_at
  BEFORE UPDATE ON public.consultant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_consultation_updated_at();

CREATE TRIGGER update_booking_access_codes_updated_at
  BEFORE UPDATE ON public.booking_access_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_consultation_updated_at();

CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_consultation_updated_at();

CREATE TRIGGER update_consultant_client_rates_updated_at
  BEFORE UPDATE ON public.consultant_client_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_consultation_updated_at();