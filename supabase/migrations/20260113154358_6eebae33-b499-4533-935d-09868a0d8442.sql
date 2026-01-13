-- QBC Lattice Configurations
CREATE TABLE public.qbc_lattices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lattice_name TEXT NOT NULL,
  lattice_type TEXT DEFAULT 'metatron_cube',
  vertex_config JSONB NOT NULL DEFAULT '{}',
  character_map JSONB NOT NULL DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- QBC Encoding/Decoding Log
CREATE TABLE public.qbc_encoding_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lattice_id UUID REFERENCES public.qbc_lattices(id) ON DELETE SET NULL,
  content_hash TEXT NOT NULL,
  gio_hash TEXT,
  encoding_type TEXT DEFAULT 'word',
  operation TEXT NOT NULL CHECK (operation IN ('encode', 'decode', 'verify')),
  source_context TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QBC Protected Messages
CREATE TABLE public.qbc_protected_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deal_room_id UUID REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  gio_payload JSONB NOT NULL,
  content_hash TEXT NOT NULL,
  luxkey_verified BOOLEAN DEFAULT false,
  mesh_route_used TEXT,
  xodiak_anchor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qbc_lattices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qbc_encoding_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qbc_protected_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qbc_lattices
CREATE POLICY "Users can view their own lattices"
  ON public.qbc_lattices FOR SELECT
  USING (auth.uid() = owner_user_id OR is_private = false);

CREATE POLICY "Users can create their own lattices"
  ON public.qbc_lattices FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own lattices"
  ON public.qbc_lattices FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own lattices"
  ON public.qbc_lattices FOR DELETE
  USING (auth.uid() = owner_user_id);

-- RLS Policies for qbc_encoding_log
CREATE POLICY "Users can view their own encoding logs"
  ON public.qbc_encoding_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create encoding logs"
  ON public.qbc_encoding_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for qbc_protected_messages
CREATE POLICY "Users can view messages they sent or received"
  ON public.qbc_protected_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send protected messages"
  ON public.qbc_protected_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create updated_at trigger for qbc_lattices
CREATE TRIGGER update_qbc_lattices_updated_at
  BEFORE UPDATE ON public.qbc_lattices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Metatron's Cube lattice configuration
INSERT INTO public.qbc_lattices (
  owner_user_id,
  lattice_name,
  lattice_type,
  is_private,
  is_default,
  vertex_config,
  character_map
) VALUES (
  NULL,
  'Metatron''s Cube Standard',
  'metatron_cube',
  false,
  true,
  '{
    "vertices": [
      {"id": 0, "x": 0, "y": -100, "label": "Crown"},
      {"id": 1, "x": 86.6, "y": -50, "label": "Wisdom"},
      {"id": 2, "x": 86.6, "y": 50, "label": "Understanding"},
      {"id": 3, "x": 0, "y": 100, "label": "Foundation"},
      {"id": 4, "x": -86.6, "y": 50, "label": "Mercy"},
      {"id": 5, "x": -86.6, "y": -50, "label": "Severity"},
      {"id": 6, "x": 0, "y": 0, "label": "Beauty"},
      {"id": 7, "x": 43.3, "y": -25, "label": "Victory"},
      {"id": 8, "x": 43.3, "y": 25, "label": "Splendor"},
      {"id": 9, "x": -43.3, "y": 25, "label": "Kingdom"},
      {"id": 10, "x": -43.3, "y": -25, "label": "Eternity"},
      {"id": 11, "x": 0, "y": -50, "label": "Knowledge"},
      {"id": 12, "x": 0, "y": 50, "label": "Manifestation"}
    ],
    "edges": [
      [0, 1], [0, 5], [0, 6], [0, 11],
      [1, 2], [1, 6], [1, 7], [1, 11],
      [2, 3], [2, 6], [2, 8], [2, 12],
      [3, 4], [3, 6], [3, 9], [3, 12],
      [4, 5], [4, 6], [4, 10], [4, 12],
      [5, 6], [5, 10], [5, 11],
      [6, 7], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12],
      [7, 8], [7, 11],
      [8, 9], [8, 12],
      [9, 10], [9, 12],
      [10, 11]
    ]
  }',
  '{
    "A": [0, 1], "B": [1, 2], "C": [2, 3], "D": [3, 4], "E": [4, 5],
    "F": [5, 0], "G": [0, 6], "H": [1, 6], "I": [2, 6], "J": [3, 6],
    "K": [4, 6], "L": [5, 6], "M": [6, 7], "N": [7, 8], "O": [8, 9],
    "P": [9, 10], "Q": [10, 11], "R": [11, 7], "S": [6, 11], "T": [6, 12],
    "U": [7, 11], "V": [8, 12], "W": [9, 12], "X": [10, 11], "Y": [11, 12],
    "Z": [0, 11], " ": [6, 6],
    "0": [0, 7], "1": [1, 8], "2": [2, 9], "3": [3, 10], "4": [4, 11],
    "5": [5, 12], "6": [6, 0], "7": [7, 1], "8": [8, 2], "9": [9, 3]
  }'
);