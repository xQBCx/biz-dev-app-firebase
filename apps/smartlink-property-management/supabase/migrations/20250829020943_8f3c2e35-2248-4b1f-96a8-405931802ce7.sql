-- Add sample rooms for Georgetown Hotel property
INSERT INTO public.rooms (property_id, room_number, type, bed_config, status, notes) VALUES
-- First Floor Rooms
('11111111-1111-1111-1111-111111111111', '101', 'standard', 'single_queen', 'active', 'First floor standard room'),
('11111111-1111-1111-1111-111111111111', '102', 'standard', 'double_queen', 'active', 'First floor standard room'),
('11111111-1111-1111-1111-111111111111', '103', 'handicap', 'single_queen', 'active', 'ADA accessible room'),
('11111111-1111-1111-1111-111111111111', '104', 'standard', 'single_queen', 'under_maintenance', 'AC unit needs repair'),
('11111111-1111-1111-1111-111111111111', '105', 'suite', 'suite', 'active', 'Corner suite with city view'),

-- Second Floor Rooms
('11111111-1111-1111-1111-111111111111', '201', 'standard', 'single_queen', 'active', 'Second floor standard room'),
('11111111-1111-1111-1111-111111111111', '202', 'standard', 'double_queen', 'active', 'Second floor standard room'),
('11111111-1111-1111-1111-111111111111', '203', 'standard', 'single_queen', 'active', 'Second floor standard room'),
('11111111-1111-1111-1111-111111111111', '204', 'standard', 'double_queen', 'out_of_inventory', 'Water damage - being renovated'),
('11111111-1111-1111-1111-111111111111', '205', 'suite', 'suite', 'active', 'Premium suite with balcony'),

-- Third Floor Rooms
('11111111-1111-1111-1111-111111111111', '301', 'standard', 'single_queen', 'active', 'Third floor standard room'),
('11111111-1111-1111-1111-111111111111', '302', 'standard', 'double_queen', 'active', 'Third floor standard room'),
('11111111-1111-1111-1111-111111111111', '303', 'handicap', 'single_queen', 'active', 'ADA accessible room'),
('11111111-1111-1111-1111-111111111111', '304', 'standard', 'single_queen', 'under_maintenance', 'Plumbing repair needed'),
('11111111-1111-1111-1111-111111111111', '305', 'suite', 'suite', 'active', 'Executive suite with kitchenette'),

-- Fourth Floor Rooms
('11111111-1111-1111-1111-111111111111', '401', 'standard', 'single_queen', 'active', 'Fourth floor standard room'),
('11111111-1111-1111-1111-111111111111', '402', 'standard', 'double_queen', 'active', 'Fourth floor standard room'),
('11111111-1111-1111-1111-111111111111', '403', 'standard', 'single_queen', 'active', 'Fourth floor standard room'),
('11111111-1111-1111-1111-111111111111', '404', 'standard', 'double_queen', 'active', 'Fourth floor standard room'),
('11111111-1111-1111-1111-111111111111', '405', 'suite', 'suite', 'active', 'Penthouse suite with panoramic views')
ON CONFLICT DO NOTHING;