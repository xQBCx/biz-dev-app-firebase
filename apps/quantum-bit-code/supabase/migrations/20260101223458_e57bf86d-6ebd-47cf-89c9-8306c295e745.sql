-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create enum for glyph visibility
CREATE TYPE public.glyph_visibility AS ENUM ('private', 'public', 'unlisted');

-- Create enum for library submission status
CREATE TYPE public.library_submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Lattices table
CREATE TABLE public.lattices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lattice_key TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  description TEXT,
  anchors_json JSONB NOT NULL,
  anchors_3d_json JSONB,
  rules_json JSONB NOT NULL DEFAULT '{}',
  style_json JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lattice_key, version)
);

-- Glyphs table
CREATE TABLE public.glyphs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  lattice_id UUID NOT NULL REFERENCES public.lattices(id),
  orientation_json JSONB NOT NULL DEFAULT '{"rotation": 0, "mirror": false}',
  style_json JSONB NOT NULL DEFAULT '{}',
  path_json JSONB NOT NULL,
  svg_data TEXT,
  png_url TEXT,
  visibility glyph_visibility NOT NULL DEFAULT 'private',
  tags TEXT[] DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Glyph messages/shares table
CREATE TABLE public.glyph_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  glyph_id UUID NOT NULL REFERENCES public.glyphs(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Library submissions for moderation
CREATE TABLE public.library_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_id UUID NOT NULL REFERENCES public.glyphs(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status library_submission_status NOT NULL DEFAULT 'pending',
  moderator_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Glyph likes table
CREATE TABLE public.glyph_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_id UUID NOT NULL REFERENCES public.glyphs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(glyph_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.lattices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glyphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glyph_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glyph_likes ENABLE ROW LEVEL SECURITY;

-- Lattices policies (public read, admin write)
CREATE POLICY "Anyone can view active lattices" ON public.lattices
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage lattices" ON public.lattices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Glyphs policies
CREATE POLICY "Users can view their own glyphs" ON public.glyphs
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Anyone can view public glyphs" ON public.glyphs
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can create glyphs" ON public.glyphs
  FOR INSERT WITH CHECK (owner_user_id = auth.uid() OR owner_user_id IS NULL);

CREATE POLICY "Users can update their own glyphs" ON public.glyphs
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their own glyphs" ON public.glyphs
  FOR DELETE USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can manage all glyphs" ON public.glyphs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Glyph messages policies
CREATE POLICY "Users can view messages sent to them" ON public.glyph_messages
  FOR SELECT USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.glyph_messages
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Recipients can update read status" ON public.glyph_messages
  FOR UPDATE USING (to_user_id = auth.uid());

-- Library submissions policies
CREATE POLICY "Users can view their own submissions" ON public.library_submissions
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Users can create submissions" ON public.library_submissions
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admins can manage submissions" ON public.library_submissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Glyph likes policies
CREATE POLICY "Anyone can view likes" ON public.glyph_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.glyph_likes
  FOR ALL USING (user_id = auth.uid());

-- Update timestamp triggers
CREATE TRIGGER update_lattices_updated_at
  BEFORE UPDATE ON public.lattices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_glyphs_updated_at
  BEFORE UPDATE ON public.glyphs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the G1 Genesis Lattice
INSERT INTO public.lattices (lattice_key, version, name, description, anchors_json, anchors_3d_json, rules_json, style_json, is_default, is_locked)
VALUES (
  'G1',
  1,
  'QBC Genesis — Origin Lattice (G1)',
  'The foundational 27-anchor lattice with A-Z and SPACE. SPACE is fixed at top-right.',
  '{"A": [0.1, 0.9], "B": [0.3, 0.9], "C": [0.5, 0.9], "D": [0.7, 0.9], "E": [0.9, 0.9], "F": [0.1, 0.7], "G": [0.3, 0.7], "H": [0.5, 0.7], "I": [0.7, 0.7], "J": [0.9, 0.7], "K": [0.1, 0.5], "L": [0.3, 0.5], "M": [0.5, 0.5], "N": [0.7, 0.5], "O": [0.9, 0.5], "P": [0.1, 0.3], "Q": [0.3, 0.3], "R": [0.5, 0.3], "S": [0.7, 0.3], "T": [0.9, 0.3], "U": [0.1, 0.1], "V": [0.3, 0.1], "W": [0.5, 0.1], "X": [0.7, 0.1], "Y": [0.9, 0.1], "Z": [0.1, 0.0], " ": [1.0, 1.0]}',
  '{"A": [0.1, 0.9, 0], "B": [0.3, 0.9, 0], "C": [0.5, 0.9, 0], "D": [0.7, 0.9, 0], "E": [0.9, 0.9, 0], "F": [0.1, 0.7, 0.1], "G": [0.3, 0.7, 0.1], "H": [0.5, 0.7, 0.1], "I": [0.7, 0.7, 0.1], "J": [0.9, 0.7, 0.1], "K": [0.1, 0.5, 0.2], "L": [0.3, 0.5, 0.2], "M": [0.5, 0.5, 0.2], "N": [0.7, 0.5, 0.2], "O": [0.9, 0.5, 0.2], "P": [0.1, 0.3, 0.3], "Q": [0.3, 0.3, 0.3], "R": [0.5, 0.3, 0.3], "S": [0.7, 0.3, 0.3], "T": [0.9, 0.3, 0.3], "U": [0.1, 0.1, 0.4], "V": [0.3, 0.1, 0.4], "W": [0.5, 0.1, 0.4], "X": [0.7, 0.1, 0.4], "Y": [0.9, 0.1, 0.4], "Z": [0.1, 0.0, 0.5], " ": [1.0, 1.0, 0]}',
  '{"enableMicroLoop": true, "enableRestartNotch": true, "loopRadiusFactor": 0.25, "notchLengthFactor": 0.15, "nodeSpacing": 0.2, "directionPriority": ["down", "left", "up", "right"], "insideSquarePreference": true}',
  '{"strokeWidth": 2, "nodeSize": 6, "showNodes": true, "showGrid": false, "theme": "notebook"}',
  true,
  true
);