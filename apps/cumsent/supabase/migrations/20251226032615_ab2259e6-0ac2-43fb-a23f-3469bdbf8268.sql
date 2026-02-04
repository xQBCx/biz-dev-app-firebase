-- Create enum for consent session status
CREATE TYPE public.session_status AS ENUM ('pending', 'verified', 'expired', 'revoked');

-- Create enum for verification type
CREATE TYPE public.verification_type AS ENUM ('facial', 'id_document');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consent_sessions table
CREATE TABLE public.consent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.session_status NOT NULL DEFAULT 'pending',
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  revoked_at TIMESTAMP WITH TIME ZONE,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verification_records table
CREATE TABLE public.verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.consent_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_type public.verification_type NOT NULL DEFAULT 'facial',
  media_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Consent Sessions RLS Policies
CREATE POLICY "Users can view sessions they are part of"
  ON public.consent_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = initiator_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create their own sessions"
  ON public.consent_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Initiators can update their own sessions"
  ON public.consent_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = initiator_id);

CREATE POLICY "Initiators can delete their own sessions"
  ON public.consent_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = initiator_id);

-- Verification Records RLS Policies
CREATE POLICY "Users can view verifications for their sessions"
  ON public.verification_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.consent_sessions cs
      WHERE cs.id = session_id
      AND (cs.initiator_id = auth.uid() OR cs.partner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own verifications"
  ON public.verification_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consent_sessions_updated_at
  BEFORE UPDATE ON public.consent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_consent_sessions_initiator ON public.consent_sessions(initiator_id);
CREATE INDEX idx_consent_sessions_partner ON public.consent_sessions(partner_id);
CREATE INDEX idx_consent_sessions_status ON public.consent_sessions(status);
CREATE INDEX idx_consent_sessions_share_token ON public.consent_sessions(share_token);
CREATE INDEX idx_verification_records_session ON public.verification_records(session_id);
CREATE INDEX idx_verification_records_user ON public.verification_records(user_id);