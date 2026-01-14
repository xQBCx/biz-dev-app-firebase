-- Create the original lattices table (as used in the QBC repo)
CREATE TABLE IF NOT EXISTS public.lattices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lattice_key TEXT NOT NULL UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  description TEXT,
  anchors_json JSONB NOT NULL,
  anchors_3d_json JSONB,
  rules_json JSONB NOT NULL DEFAULT '{"enableTick": true, "tickLengthFactor": 0.08, "insideBoundaryPreference": true, "nodeSpacing": 0.2}'::jsonb,
  style_json JSONB NOT NULL DEFAULT '{"strokeWidth": 2, "nodeSize": 6, "showNodes": true, "showGrid": false, "theme": "notebook"}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lattices ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view active lattices)
CREATE POLICY "Anyone can view active lattices" 
ON public.lattices 
FOR SELECT 
USING (is_active = true);

-- Authenticated users can create lattices
CREATE POLICY "Authenticated users can create lattices" 
ON public.lattices 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own unlocked lattices
CREATE POLICY "Users can update their own unlocked lattices" 
ON public.lattices 
FOR UPDATE 
USING (auth.uid() = created_by AND is_locked = false);

-- Insert default Metatron's Cube lattice with A-Z + space anchors
INSERT INTO public.lattices (
  lattice_key, 
  version, 
  name, 
  description, 
  anchors_json, 
  rules_json, 
  style_json, 
  is_default, 
  is_active, 
  is_locked
) VALUES (
  'metatrons-cube-v1',
  1,
  'Metatrons Cube',
  'The classic 13-vertex Metatron''s Cube lattice with 27 character anchors (A-Z and space)',
  '{
    "A": [0.5, 0.933],
    "B": [0.25, 0.8],
    "C": [0.75, 0.8],
    "D": [0.067, 0.667],
    "E": [0.5, 0.667],
    "F": [0.933, 0.667],
    "G": [0.25, 0.533],
    "H": [0.75, 0.533],
    "I": [0.067, 0.5],
    "J": [0.5, 0.5],
    "K": [0.933, 0.5],
    "L": [0.25, 0.467],
    "M": [0.75, 0.467],
    "N": [0.067, 0.333],
    "O": [0.5, 0.333],
    "P": [0.933, 0.333],
    "Q": [0.25, 0.2],
    "R": [0.75, 0.2],
    "S": [0.067, 0.133],
    "T": [0.5, 0.067],
    "U": [0.933, 0.133],
    "V": [0.15, 0.067],
    "W": [0.85, 0.067],
    "X": [0.3, 0.133],
    "Y": [0.7, 0.133],
    "Z": [0.5, 0.0],
    " ": [0.5, 0.5]
  }'::jsonb,
  '{
    "enableTick": true,
    "tickLengthFactor": 0.08,
    "insideBoundaryPreference": true,
    "nodeSpacing": 0.2
  }'::jsonb,
  '{
    "strokeWidth": 2,
    "nodeSize": 6,
    "showNodes": true,
    "showGrid": false,
    "theme": "notebook"
  }'::jsonb,
  true,
  true,
  true
)
ON CONFLICT (lattice_key) DO UPDATE SET
  anchors_json = EXCLUDED.anchors_json,
  rules_json = EXCLUDED.rules_json,
  is_default = true,
  is_active = true;