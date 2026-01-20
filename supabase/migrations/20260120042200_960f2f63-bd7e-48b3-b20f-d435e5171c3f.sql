-- =====================================================
-- PHASE 2: EROS - EMERGENCY RESPONSE OPERATING SYSTEM
-- Real-time coordination for responders and incidents
-- =====================================================

-- Create enum types for EROS
CREATE TYPE eros_incident_type AS ENUM ('natural_disaster', 'medical', 'security', 'infrastructure', 'community', 'industrial', 'environmental');
CREATE TYPE eros_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE eros_incident_status AS ENUM ('active', 'resolved', 'escalated', 'closed', 'standby');
CREATE TYPE eros_responder_status AS ENUM ('available', 'on_call', 'deployed', 'unavailable', 'standby');
CREATE TYPE eros_deployment_status AS ENUM ('requested', 'accepted', 'en_route', 'on_site', 'completed', 'cancelled', 'declined');
CREATE TYPE eros_deployment_role AS ENUM ('commander', 'team_lead', 'specialist', 'support', 'observer', 'coordinator');
CREATE TYPE eros_message_priority AS ENUM ('routine', 'urgent', 'flash', 'emergency');
CREATE TYPE eros_verification_status AS ENUM ('pending', 'verified', 'suspended', 'expired');

-- EROS Incidents Table
CREATE TABLE public.eros_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Incident classification
  incident_type eros_incident_type NOT NULL,
  severity eros_severity NOT NULL DEFAULT 'medium',
  status eros_incident_status NOT NULL DEFAULT 'active',
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  incident_code TEXT UNIQUE,
  
  -- Location
  location_address TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_radius_km DOUBLE PRECISION DEFAULT 10,
  
  -- Requirements
  required_skills TEXT[] DEFAULT '{}',
  required_certifications TEXT[] DEFAULT '{}',
  min_responders INTEGER DEFAULT 1,
  max_responders INTEGER,
  
  -- Situation reports (timestamped updates)
  situation_reports JSONB DEFAULT '[]'::jsonb,
  
  -- Command structure
  command_structure JSONB DEFAULT '{}'::jsonb,
  
  -- Compensation
  compensation_config JSONB DEFAULT '{
    "type": "hourly",
    "base_rate": 0,
    "hazard_multiplier": 1.0,
    "minimum_hours": 4
  }'::jsonb,
  
  -- Timing
  estimated_duration_hours INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EROS Responder Profiles Table
CREATE TABLE public.eros_responder_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verification
  verification_status eros_verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Skills and certifications
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]'::jsonb,
  specializations TEXT[] DEFAULT '{}',
  
  -- Availability
  availability_status eros_responder_status NOT NULL DEFAULT 'available',
  availability_schedule JSONB DEFAULT '{}'::jsonb,
  
  -- Location
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_updated_at TIMESTAMP WITH TIME ZONE,
  travel_radius_km DOUBLE PRECISION DEFAULT 50,
  response_time_minutes INTEGER DEFAULT 30,
  
  -- Equipment
  equipment_available TEXT[] DEFAULT '{}',
  vehicles_available TEXT[] DEFAULT '{}',
  
  -- Emergency contacts
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  
  -- Deployment history stats
  total_deployments INTEGER DEFAULT 0,
  successful_deployments INTEGER DEFAULT 0,
  average_rating DOUBLE PRECISION,
  total_hours_served DOUBLE PRECISION DEFAULT 0,
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{
    "sms": true,
    "email": true,
    "push": true,
    "call": false
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- EROS Deployments Table
CREATE TABLE public.eros_deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.eros_incidents(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.eros_responder_profiles(id) ON DELETE CASCADE,
  
  -- Assignment
  role eros_deployment_role NOT NULL DEFAULT 'support',
  status eros_deployment_status NOT NULL DEFAULT 'requested',
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Timing
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  en_route_at TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Check-ins
  check_in_log JSONB DEFAULT '[]'::jsonb,
  last_check_in_at TIMESTAMP WITH TIME ZONE,
  
  -- Compensation
  hours_worked DOUBLE PRECISION DEFAULT 0,
  compensation_earned DOUBLE PRECISION DEFAULT 0,
  compensation_paid BOOLEAN DEFAULT false,
  compensation_paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Performance
  performance_rating DOUBLE PRECISION,
  performance_notes TEXT,
  rated_by UUID REFERENCES auth.users(id),
  
  -- Notes
  notes TEXT,
  
  -- XODIAK anchor for proof
  xodiak_anchor_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(incident_id, responder_id)
);

-- EROS Communication Log
CREATE TABLE public.eros_communication_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.eros_incidents(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES public.eros_deployments(id) ON DELETE SET NULL,
  
  -- Sender
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Message
  channel TEXT NOT NULL DEFAULT 'app',
  message_type TEXT NOT NULL DEFAULT 'status_update',
  priority eros_message_priority NOT NULL DEFAULT 'routine',
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Delivery
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  received_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- EROS Resource Requests
CREATE TABLE public.eros_resource_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.eros_incidents(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  
  resource_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  priority eros_message_priority NOT NULL DEFAULT 'routine',
  description TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending',
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  fulfilled_by UUID REFERENCES auth.users(id),
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all EROS tables
ALTER TABLE public.eros_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eros_responder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eros_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eros_communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eros_resource_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for eros_incidents
CREATE POLICY "Users can view incidents they created or are deployed to"
ON public.eros_incidents FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.eros_deployments d
    JOIN public.eros_responder_profiles r ON d.responder_id = r.id
    WHERE d.incident_id = eros_incidents.id AND r.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create incidents"
ON public.eros_incidents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators and admins can update incidents"
ON public.eros_incidents FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for eros_responder_profiles
CREATE POLICY "Users can view verified responder profiles"
ON public.eros_responder_profiles FOR SELECT
USING (
  auth.uid() = user_id OR
  verification_status = 'verified' OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create their own responder profile"
ON public.eros_responder_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responder profile"
ON public.eros_responder_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for eros_deployments
CREATE POLICY "Users can view deployments for their incidents or their own"
ON public.eros_deployments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.eros_responder_profiles r WHERE r.id = responder_id AND r.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Incident creators and admins can create deployments"
ON public.eros_deployments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Responders can update their own deployment status"
ON public.eros_deployments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.eros_responder_profiles r WHERE r.id = responder_id AND r.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for eros_communication_log
CREATE POLICY "Users can view communications for their incidents"
ON public.eros_communication_log FOR SELECT
USING (
  auth.uid() = sender_id OR
  EXISTS (
    SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.eros_deployments d
    JOIN public.eros_responder_profiles r ON d.responder_id = r.id
    WHERE d.incident_id = eros_communication_log.incident_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send communications for incidents they're involved in"
ON public.eros_communication_log FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (
      SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.eros_deployments d
      JOIN public.eros_responder_profiles r ON d.responder_id = r.id
      WHERE d.incident_id = incident_id AND r.user_id = auth.uid()
    )
  )
);

-- RLS Policies for eros_resource_requests
CREATE POLICY "Users can view resource requests for their incidents"
ON public.eros_resource_requests FOR SELECT
USING (
  auth.uid() = requested_by OR
  EXISTS (
    SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create resource requests for incidents they're involved in"
ON public.eros_resource_requests FOR INSERT
WITH CHECK (
  auth.uid() = requested_by AND (
    EXISTS (
      SELECT 1 FROM public.eros_incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.eros_deployments d
      JOIN public.eros_responder_profiles r ON d.responder_id = r.id
      WHERE d.incident_id = incident_id AND r.user_id = auth.uid()
    )
  )
);

-- Indexes for performance
CREATE INDEX idx_eros_incidents_user ON public.eros_incidents(user_id);
CREATE INDEX idx_eros_incidents_status ON public.eros_incidents(status);
CREATE INDEX idx_eros_incidents_severity ON public.eros_incidents(severity);
CREATE INDEX idx_eros_incidents_type ON public.eros_incidents(incident_type);
CREATE INDEX idx_eros_incidents_location ON public.eros_incidents(location_lat, location_lng);

CREATE INDEX idx_eros_responder_profiles_user ON public.eros_responder_profiles(user_id);
CREATE INDEX idx_eros_responder_profiles_status ON public.eros_responder_profiles(availability_status);
CREATE INDEX idx_eros_responder_profiles_verification ON public.eros_responder_profiles(verification_status);
CREATE INDEX idx_eros_responder_profiles_location ON public.eros_responder_profiles(location_lat, location_lng);

CREATE INDEX idx_eros_deployments_incident ON public.eros_deployments(incident_id);
CREATE INDEX idx_eros_deployments_responder ON public.eros_deployments(responder_id);
CREATE INDEX idx_eros_deployments_status ON public.eros_deployments(status);

CREATE INDEX idx_eros_communication_incident ON public.eros_communication_log(incident_id);
CREATE INDEX idx_eros_resource_requests_incident ON public.eros_resource_requests(incident_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.eros_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eros_deployments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eros_communication_log;

-- Update triggers
CREATE TRIGGER update_eros_incidents_updated_at
BEFORE UPDATE ON public.eros_incidents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eros_responder_profiles_updated_at
BEFORE UPDATE ON public.eros_responder_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eros_deployments_updated_at
BEFORE UPDATE ON public.eros_deployments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate incident code
CREATE OR REPLACE FUNCTION generate_incident_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.incident_code := 'INC-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_incident_code
BEFORE INSERT ON public.eros_incidents
FOR EACH ROW EXECUTE FUNCTION generate_incident_code();