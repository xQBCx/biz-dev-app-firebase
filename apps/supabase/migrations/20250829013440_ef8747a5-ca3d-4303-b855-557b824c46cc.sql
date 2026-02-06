-- Create rooms table for property management
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id),
  room_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('standard', 'suite', 'handicap', 'out_of_inventory')),
  bed_config TEXT NOT NULL CHECK (bed_config IN ('single_queen', 'double_queen', 'suite')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'out_of_inventory', 'under_maintenance')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, room_number)
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms
CREATE POLICY "Users can view rooms for their property" 
ON public.rooms 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = rooms.property_id
));

CREATE POLICY "Managers can manage rooms" 
ON public.rooms 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = rooms.property_id 
  AND profiles.role IN ('manager', 'owner', 'regional')
));

-- Add room_id to maintenance_requests
ALTER TABLE public.maintenance_requests 
ADD COLUMN room_id UUID REFERENCES public.rooms(id);

-- Create index for better performance
CREATE INDEX idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_maintenance_requests_room_id ON public.maintenance_requests(room_id);

-- Create trigger for updated_at
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Georgetown Hotel (Microtel Inn Georgetown) rooms (77 rooms total)
INSERT INTO public.rooms (property_id, room_number, type, bed_config, status) VALUES
-- Floor 1 (Rooms 101-123) - 23 rooms
('11111111-1111-1111-1111-111111111111', '101', 'handicap', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '102', 'handicap', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '103', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '104', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '105', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '106', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '107', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '108', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '109', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '110', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '111', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '112', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '113', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '114', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '115', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '116', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '117', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '118', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '119', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '120', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '121', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '122', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '123', 'suite', 'suite', 'active'),

-- Floor 2 (Rooms 201-223) - 23 rooms
('11111111-1111-1111-1111-111111111111', '201', 'handicap', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '202', 'handicap', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '203', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '204', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '205', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '206', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '207', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '208', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '209', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '210', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '211', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '212', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '213', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '214', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '215', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '216', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '217', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '218', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '219', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '220', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '221', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '222', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '223', 'suite', 'suite', 'active'),

-- Floor 3 (Rooms 301-331) - 31 rooms  
('11111111-1111-1111-1111-111111111111', '301', 'handicap', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '302', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '303', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '304', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '305', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '306', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '307', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '308', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '309', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '310', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '311', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '312', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '313', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '314', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '315', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '316', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '317', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '318', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '319', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '320', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '321', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '322', 'standard', 'double_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '323', 'out_of_inventory', 'double_queen', 'out_of_inventory'),
('11111111-1111-1111-1111-111111111111', '324', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '325', 'standard', 'single_queen', 'active'),
('11111111-1111-1111-1111-111111111111', '326', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '327', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '328', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '329', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '330', 'suite', 'suite', 'active'),
('11111111-1111-1111-1111-111111111111', '331', 'suite', 'suite', 'active');