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

-- Seed Georgetown Hotel rooms (77 rooms total)
-- Assuming Georgetown Hotel property_id as default property
INSERT INTO public.rooms (property_id, room_number, type, bed_config, status) VALUES
-- Floor 1 (Rooms 101-123) - 23 rooms
('44444444-4444-4444-4444-444444444444', '101', 'handicap', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '102', 'handicap', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '103', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '104', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '105', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '106', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '107', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '108', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '109', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '110', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '111', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '112', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '113', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '114', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '115', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '116', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '117', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '118', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '119', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '120', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '121', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '122', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '123', 'suite', 'suite', 'active'),

-- Floor 2 (Rooms 201-223) - 23 rooms
('44444444-4444-4444-4444-444444444444', '201', 'handicap', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '202', 'handicap', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '203', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '204', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '205', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '206', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '207', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '208', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '209', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '210', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '211', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '212', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '213', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '214', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '215', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '216', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '217', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '218', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '219', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '220', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '221', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '222', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '223', 'suite', 'suite', 'active'),

-- Floor 3 (Rooms 301-331) - 31 rooms  
('44444444-4444-4444-4444-444444444444', '301', 'handicap', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '302', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '303', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '304', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '305', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '306', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '307', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '308', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '309', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '310', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '311', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '312', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '313', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '314', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '315', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '316', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '317', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '318', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '319', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '320', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '321', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '322', 'standard', 'double_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '323', 'out_of_inventory', 'double_queen', 'out_of_inventory'),
('44444444-4444-4444-4444-444444444444', '324', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '325', 'standard', 'single_queen', 'active'),
('44444444-4444-4444-4444-444444444444', '326', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '327', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '328', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '329', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '330', 'suite', 'suite', 'active'),
('44444444-4444-4444-4444-444444444444', '331', 'suite', 'suite', 'active');