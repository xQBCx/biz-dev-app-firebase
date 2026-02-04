-- Create enum types for the inspection system
CREATE TYPE public.defect_type AS ENUM (
  'undercut',
  'porosity',
  'lack_of_fusion',
  'sloppy_weld',
  'cold_lap',
  'crack',
  'incomplete_penetration',
  'spatter',
  'distortion'
);

CREATE TYPE public.defect_severity AS ENUM ('critical', 'major', 'minor');

CREATE TYPE public.inspection_status AS ENUM ('in_progress', 'completed', 'requires_review');

CREATE TYPE public.repair_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TYPE public.pipe_support_type AS ENUM ('spring_can', 'hanger', 'guide', 'anchor', 'saddle');

CREATE TYPE public.pipe_support_status AS ENUM ('good', 'needs_repair', 'critical');

CREATE TYPE public.app_role AS ENUM ('inspector', 'executive', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  employee_id TEXT,
  certifications TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'inspector',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create pipe_supports table
CREATE TABLE public.pipe_supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type pipe_support_type NOT NULL,
  blueprint_ref TEXT,
  location TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  status pipe_support_status NOT NULL DEFAULT 'good',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inspections table
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspector_id UUID NOT NULL REFERENCES auth.users(id),
  welder_id TEXT NOT NULL,
  welder_name TEXT NOT NULL,
  location TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  pipe_support_id UUID REFERENCES public.pipe_supports(id),
  wps_ref TEXT,
  status inspection_status NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  labor_hours DECIMAL(5, 2) DEFAULT 0,
  labor_rate DECIMAL(8, 2) DEFAULT 65,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create defects table
CREATE TABLE public.defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  type defect_type NOT NULL,
  severity defect_severity NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  bounding_box JSONB,
  repair_required BOOLEAN NOT NULL DEFAULT true,
  repair_status repair_status DEFAULT 'pending',
  repair_cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create material_costs table
CREATE TABLE public.material_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost DECIMAL(8, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inspection_photos table
CREATE TABLE public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audio_notes table
CREATE TABLE public.audio_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  transcription TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipe_supports_updated_at
  BEFORE UPDATE ON public.pipe_supports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'inspector');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipe_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Executives can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'executive') OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Pipe supports policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view pipe supports"
  ON public.pipe_supports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pipe supports"
  ON public.pipe_supports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pipe supports"
  ON public.pipe_supports FOR UPDATE
  TO authenticated
  USING (true);

-- Inspections policies
CREATE POLICY "Inspectors can view own inspections"
  ON public.inspections FOR SELECT
  USING (auth.uid() = inspector_id);

CREATE POLICY "Executives can view all inspections"
  ON public.inspections FOR SELECT
  USING (public.has_role(auth.uid(), 'executive') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Inspectors can create inspections"
  ON public.inspections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inspector_id);

CREATE POLICY "Inspectors can update own inspections"
  ON public.inspections FOR UPDATE
  USING (auth.uid() = inspector_id);

-- Defects policies
CREATE POLICY "Users can view defects for their inspections"
  ON public.defects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = defects.inspection_id 
      AND (inspector_id = auth.uid() OR public.has_role(auth.uid(), 'executive') OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Inspectors can create defects"
  ON public.defects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = defects.inspection_id AND inspector_id = auth.uid()
    )
  );

CREATE POLICY "Inspectors can update defects"
  ON public.defects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = defects.inspection_id AND inspector_id = auth.uid()
    )
  );

-- Material costs policies
CREATE POLICY "Users can view material costs"
  ON public.material_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = material_costs.inspection_id 
      AND (inspector_id = auth.uid() OR public.has_role(auth.uid(), 'executive') OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Inspectors can manage material costs"
  ON public.material_costs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = material_costs.inspection_id AND inspector_id = auth.uid()
    )
  );

-- Inspection photos policies
CREATE POLICY "Users can view inspection photos"
  ON public.inspection_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = inspection_photos.inspection_id 
      AND (inspector_id = auth.uid() OR public.has_role(auth.uid(), 'executive') OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Inspectors can manage photos"
  ON public.inspection_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = inspection_photos.inspection_id AND inspector_id = auth.uid()
    )
  );

-- Audio notes policies
CREATE POLICY "Users can view audio notes"
  ON public.audio_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = audio_notes.inspection_id 
      AND (inspector_id = auth.uid() OR public.has_role(auth.uid(), 'executive') OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Inspectors can manage audio notes"
  ON public.audio_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections 
      WHERE id = audio_notes.inspection_id AND inspector_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_inspections_inspector_id ON public.inspections(inspector_id);
CREATE INDEX idx_inspections_status ON public.inspections(status);
CREATE INDEX idx_inspections_created_at ON public.inspections(created_at DESC);
CREATE INDEX idx_defects_inspection_id ON public.defects(inspection_id);
CREATE INDEX idx_defects_severity ON public.defects(severity);
CREATE INDEX idx_pipe_supports_status ON public.pipe_supports(status);