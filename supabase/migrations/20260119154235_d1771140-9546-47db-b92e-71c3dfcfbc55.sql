-- =============================================
-- xEVENTSx MODULE: Core Event Management System
-- Phase 1-2: Foundation + Ticketing/Registration
-- =============================================

-- Event status enum (using xevents_ prefix to avoid conflicts)
CREATE TYPE public.xevents_status AS ENUM (
  'draft',
  'published',
  'live',
  'completed',
  'cancelled',
  'archived'
);

-- Event category enum (using xevents_ prefix since event_category exists)
CREATE TYPE public.xevents_category AS ENUM (
  'workshop',
  'summit',
  'conference',
  'webinar',
  'roundtable',
  'networking',
  'private_dinner',
  'training',
  'launch_event',
  'custom'
);

-- Event visibility enum
CREATE TYPE public.xevents_visibility AS ENUM (
  'public',
  'private',
  'invite_only'
);

-- Participant role enum
CREATE TYPE public.xevents_participant_role AS ENUM (
  'organizer',
  'co_organizer',
  'speaker',
  'sponsor',
  'staff',
  'vip',
  'attendee'
);

-- Registration status enum
CREATE TYPE public.xevents_registration_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'cancelled',
  'refunded',
  'waitlisted'
);

-- =============================================
-- CORE EVENTS TABLE
-- =============================================
CREATE TABLE public.xevents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ownership & Organization
  organizer_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  initiative_id UUID REFERENCES public.initiatives(id),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  
  -- Categorization
  category public.xevents_category NOT NULL DEFAULT 'custom',
  status public.xevents_status NOT NULL DEFAULT 'draft',
  visibility public.xevents_visibility NOT NULL DEFAULT 'public',
  
  -- Timing
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  
  -- Location
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_country TEXT,
  venue_zip TEXT,
  virtual_meeting_url TEXT,
  virtual_platform TEXT,
  
  -- Capacity & Registration
  max_capacity INTEGER,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  waitlist_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Branding & Landing Page
  cover_image_url TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#666666',
  website_data JSONB DEFAULT '{}',
  
  -- Features
  lobby_enabled BOOLEAN NOT NULL DEFAULT true,
  networking_enabled BOOLEAN NOT NULL DEFAULT true,
  qna_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Integration Links
  deal_room_id UUID REFERENCES public.deal_rooms(id),
  network_group_id UUID,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT SESSIONS (Agenda Items)
-- =============================================
CREATE TABLE public.xevents_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  event_id UUID NOT NULL REFERENCES public.xevents(id) ON DELETE CASCADE,
  
  -- Session Info
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'presentation',
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Location (for multi-track events)
  track_name TEXT,
  room_name TEXT,
  
  -- Capacity
  max_attendees INTEGER,
  requires_registration BOOLEAN NOT NULL DEFAULT false,
  
  -- Virtual
  virtual_meeting_url TEXT,
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_break BOOLEAN NOT NULL DEFAULT false,
  
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT TICKET TYPES
-- =============================================
CREATE TABLE public.xevents_ticket_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  event_id UUID NOT NULL REFERENCES public.xevents(id) ON DELETE CASCADE,
  
  -- Ticket Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_free BOOLEAN GENERATED ALWAYS AS (price_cents = 0) STORED,
  
  -- Inventory
  quantity_total INTEGER,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  
  -- Availability
  sale_start TIMESTAMP WITH TIME ZONE,
  sale_end TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  
  -- Limits
  min_per_order INTEGER NOT NULL DEFAULT 1,
  max_per_order INTEGER NOT NULL DEFAULT 10,
  
  -- Access
  access_level TEXT NOT NULL DEFAULT 'general',
  includes_sessions UUID[] DEFAULT '{}',
  
  -- XODIAK Integration
  xodiak_contract_id TEXT,
  revenue_split_config JSONB DEFAULT '{}',
  
  -- Display
  sort_order INTEGER NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT false,
  
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT PARTICIPANTS (Roles)
-- =============================================
CREATE TABLE public.xevents_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  event_id UUID NOT NULL REFERENCES public.xevents(id) ON DELETE CASCADE,
  user_id UUID,
  crm_contact_id UUID REFERENCES public.crm_contacts(id),
  
  -- Role & Permissions
  role public.xevents_participant_role NOT NULL DEFAULT 'attendee',
  permissions JSONB DEFAULT '{}',
  
  -- Profile (for speakers/sponsors)
  display_name TEXT,
  title TEXT,
  company TEXT,
  bio TEXT,
  photo_url TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  
  -- Speaking/Session Assignment
  session_ids UUID[] DEFAULT '{}',
  
  -- Sponsorship
  sponsor_tier TEXT,
  sponsor_logo_url TEXT,
  sponsor_website TEXT,
  sponsor_booth_number TEXT,
  
  -- Staff
  staff_role TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(event_id, user_id),
  UNIQUE(event_id, email)
);

-- =============================================
-- EVENT REGISTRATIONS
-- =============================================
CREATE TABLE public.xevents_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  event_id UUID NOT NULL REFERENCES public.xevents(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.xevents_ticket_types(id),
  user_id UUID,
  crm_contact_id UUID REFERENCES public.crm_contacts(id),
  
  -- Registration Status
  status public.xevents_registration_status NOT NULL DEFAULT 'pending',
  
  -- Attendee Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  title TEXT,
  
  -- Ticket
  ticket_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  
  -- Payment
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_intent_id TEXT,
  xodiak_transaction_id TEXT,
  
  -- Check-in
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID,
  check_in_location TEXT,
  
  -- Custom Fields
  custom_responses JSONB DEFAULT '{}',
  
  -- Tracking
  registration_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_code TEXT,
  
  -- Engagement
  sessions_attended UUID[] DEFAULT '{}',
  lobby_last_active TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT FORMS (Universal Form Engine)
-- =============================================
CREATE TABLE public.xevents_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Can be linked to event or standalone
  event_id UUID REFERENCES public.xevents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Form Info
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL DEFAULT 'registration',
  
  -- Fields Schema
  fields JSONB NOT NULL DEFAULT '[]',
  
  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you for your submission!',
  
  -- Limits
  max_responses INTEGER,
  response_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  opens_at TIMESTAMP WITH TIME ZONE,
  closes_at TIMESTAMP WITH TIME ZONE,
  
  -- Triggers
  trigger_workflow_id UUID,
  trigger_broadcast_id UUID,
  crm_field_mappings JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT FORM RESPONSES
-- =============================================
CREATE TABLE public.xevents_form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  form_id UUID NOT NULL REFERENCES public.xevents_forms(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.xevents(id),
  user_id UUID,
  registration_id UUID REFERENCES public.xevents_registrations(id),
  crm_contact_id UUID REFERENCES public.crm_contacts(id),
  
  -- Response Data
  responses JSONB NOT NULL DEFAULT '{}',
  
  -- Submitter Info
  submitter_email TEXT,
  submitter_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT LOBBY MESSAGES
-- =============================================
CREATE TABLE public.xevents_lobby_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  event_id UUID NOT NULL REFERENCES public.xevents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registration_id UUID REFERENCES public.xevents_registrations(id),
  
  -- Message
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  
  -- Channel
  channel TEXT NOT NULL DEFAULT 'general',
  session_id UUID REFERENCES public.xevents_sessions(id),
  
  -- Targeting
  is_announcement BOOLEAN NOT NULL DEFAULT false,
  visible_to_roles TEXT[] DEFAULT '{}',
  
  -- Reactions
  reactions JSONB DEFAULT '{}',
  
  -- Moderation
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  hidden_by UUID,
  hidden_reason TEXT,
  
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- EVENT ANALYTICS
-- =============================================
CREATE TABLE public.xevents_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  event_id UUID NOT NULL REFERENCES public.xevents(id) ON DELETE CASCADE,
  user_id UUID,
  registration_id UUID REFERENCES public.xevents_registrations(id),
  
  -- Event Type
  event_type TEXT NOT NULL,
  event_category TEXT,
  
  -- Context
  session_id UUID REFERENCES public.xevents_sessions(id),
  target_entity_type TEXT,
  target_entity_id UUID,
  
  -- Data
  properties JSONB DEFAULT '{}',
  
  -- Device/Location
  device_type TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_xevents_organizer ON public.xevents(organizer_id);
CREATE INDEX idx_xevents_status ON public.xevents(status);
CREATE INDEX idx_xevents_start_date ON public.xevents(start_date);
CREATE INDEX idx_xevents_slug ON public.xevents(slug);
CREATE INDEX idx_xevents_client ON public.xevents(client_id);

CREATE INDEX idx_xevents_sessions_event ON public.xevents_sessions(event_id);
CREATE INDEX idx_xevents_sessions_time ON public.xevents_sessions(start_time, end_time);

CREATE INDEX idx_xevents_ticket_types_event ON public.xevents_ticket_types(event_id);

CREATE INDEX idx_xevents_participants_event ON public.xevents_participants(event_id);
CREATE INDEX idx_xevents_participants_user ON public.xevents_participants(user_id);
CREATE INDEX idx_xevents_participants_role ON public.xevents_participants(role);

CREATE INDEX idx_xevents_registrations_event ON public.xevents_registrations(event_id);
CREATE INDEX idx_xevents_registrations_user ON public.xevents_registrations(user_id);
CREATE INDEX idx_xevents_registrations_email ON public.xevents_registrations(email);
CREATE INDEX idx_xevents_registrations_ticket_code ON public.xevents_registrations(ticket_code);
CREATE INDEX idx_xevents_registrations_status ON public.xevents_registrations(status);

CREATE INDEX idx_xevents_forms_event ON public.xevents_forms(event_id);
CREATE INDEX idx_xevents_forms_user ON public.xevents_forms(user_id);

CREATE INDEX idx_xevents_form_responses_form ON public.xevents_form_responses(form_id);
CREATE INDEX idx_xevents_form_responses_event ON public.xevents_form_responses(event_id);

CREATE INDEX idx_xevents_lobby_messages_event ON public.xevents_lobby_messages(event_id);
CREATE INDEX idx_xevents_lobby_messages_channel ON public.xevents_lobby_messages(event_id, channel);

CREATE INDEX idx_xevents_analytics_event ON public.xevents_analytics(event_id);
CREATE INDEX idx_xevents_analytics_type ON public.xevents_analytics(event_type);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.xevents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_lobby_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xevents_analytics ENABLE ROW LEVEL SECURITY;

-- Events: Organizers can manage, public events visible to all
CREATE POLICY "Organizers can manage their xevents"
ON public.xevents FOR ALL
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Published xevents are publicly viewable"
ON public.xevents FOR SELECT
USING (status IN ('published', 'live', 'completed') AND visibility = 'public');

CREATE POLICY "Participants can view their xevents"
ON public.xevents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents_participants ep
  WHERE ep.event_id = xevents.id AND ep.user_id = auth.uid()
));

CREATE POLICY "Registrants can view their xevents"
ON public.xevents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents_registrations er
  WHERE er.event_id = xevents.id AND er.user_id = auth.uid()
));

-- Sessions: Viewable for event viewers
CREATE POLICY "Sessions viewable for xevent viewers"
ON public.xevents_sessions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_sessions.event_id
  AND (e.organizer_id = auth.uid() OR e.status IN ('published', 'live', 'completed'))
));

CREATE POLICY "Organizers can manage xevents sessions"
ON public.xevents_sessions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_sessions.event_id AND e.organizer_id = auth.uid()
));

-- Ticket Types: Viewable for event viewers
CREATE POLICY "Ticket types viewable for xevent viewers"
ON public.xevents_ticket_types FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_ticket_types.event_id
  AND (e.organizer_id = auth.uid() OR (e.status IN ('published', 'live') AND NOT hidden))
));

CREATE POLICY "Organizers can manage xevents ticket types"
ON public.xevents_ticket_types FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_ticket_types.event_id AND e.organizer_id = auth.uid()
));

-- Participants: Various access levels
CREATE POLICY "Organizers can manage xevents participants"
ON public.xevents_participants FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_participants.event_id AND e.organizer_id = auth.uid()
));

CREATE POLICY "Users can view own xevents participation"
ON public.xevents_participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Public xevents participants visible"
ON public.xevents_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_participants.event_id
  AND e.status IN ('published', 'live', 'completed')
  AND e.visibility = 'public'
  AND role IN ('speaker', 'sponsor')
));

-- Registrations: Users can manage their own, organizers can view all
CREATE POLICY "Users can manage their own xevents registrations"
ON public.xevents_registrations FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view xevents registrations"
ON public.xevents_registrations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_registrations.event_id AND e.organizer_id = auth.uid()
));

CREATE POLICY "Organizers can update xevents registrations"
ON public.xevents_registrations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_registrations.event_id AND e.organizer_id = auth.uid()
));

CREATE POLICY "Anyone can create xevents registrations"
ON public.xevents_registrations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_registrations.event_id
  AND e.registration_open = true
  AND e.status IN ('published', 'live')
));

-- Forms: Organizers manage, public forms accessible
CREATE POLICY "Users can manage their own xevents forms"
ON public.xevents_forms FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Active xevents forms are publicly viewable"
ON public.xevents_forms FOR SELECT
USING (is_active = true AND (opens_at IS NULL OR opens_at <= now()) AND (closes_at IS NULL OR closes_at >= now()));

-- Form Responses: Submitters can view own, form owners can view all
CREATE POLICY "Users can view their own xevents form responses"
ON public.xevents_form_responses FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Form owners can view all xevents form responses"
ON public.xevents_form_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents_forms ef
  WHERE ef.id = xevents_form_responses.form_id AND ef.user_id = auth.uid()
));

CREATE POLICY "Anyone can submit to active xevents forms"
ON public.xevents_form_responses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.xevents_forms ef
  WHERE ef.id = xevents_form_responses.form_id AND ef.is_active = true
));

-- Lobby Messages: Participants can interact
CREATE POLICY "Participants can view xevents lobby messages"
ON public.xevents_lobby_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.xevents_registrations er
    WHERE er.event_id = xevents_lobby_messages.event_id AND er.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.xevents_participants ep
    WHERE ep.event_id = xevents_lobby_messages.event_id AND ep.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.xevents e
    WHERE e.id = xevents_lobby_messages.event_id AND e.organizer_id = auth.uid()
  )
);

CREATE POLICY "Participants can send xevents lobby messages"
ON public.xevents_lobby_messages FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.xevents_registrations er
      WHERE er.event_id = xevents_lobby_messages.event_id AND er.user_id = auth.uid() AND er.status = 'confirmed'
    )
    OR EXISTS (
      SELECT 1 FROM public.xevents_participants ep
      WHERE ep.event_id = xevents_lobby_messages.event_id AND ep.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.xevents e
      WHERE e.id = xevents_lobby_messages.event_id AND e.organizer_id = auth.uid()
    )
  )
);

-- Analytics: Organizers can view
CREATE POLICY "Organizers can view xevents analytics"
ON public.xevents_analytics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.xevents e
  WHERE e.id = xevents_analytics.event_id AND e.organizer_id = auth.uid()
));

CREATE POLICY "System can insert xevents analytics"
ON public.xevents_analytics FOR INSERT
WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_xevents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_xevents_updated_at
BEFORE UPDATE ON public.xevents
FOR EACH ROW EXECUTE FUNCTION public.update_xevents_updated_at();

CREATE TRIGGER update_xevents_sessions_updated_at
BEFORE UPDATE ON public.xevents_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_xevents_updated_at();

CREATE TRIGGER update_xevents_ticket_types_updated_at
BEFORE UPDATE ON public.xevents_ticket_types
FOR EACH ROW EXECUTE FUNCTION public.update_xevents_updated_at();

CREATE TRIGGER update_xevents_participants_updated_at
BEFORE UPDATE ON public.xevents_participants
FOR EACH ROW EXECUTE FUNCTION public.update_xevents_updated_at();

CREATE TRIGGER update_xevents_registrations_updated_at
BEFORE UPDATE ON public.xevents_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_xevents_updated_at();

CREATE TRIGGER update_xevents_forms_updated_at
BEFORE UPDATE ON public.xevents_forms
FOR EACH ROW EXECUTE FUNCTION public.update_xevents_updated_at();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_xevents_ticket_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_xevents_slug(event_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(event_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.xevents WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for lobby messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.xevents_lobby_messages;