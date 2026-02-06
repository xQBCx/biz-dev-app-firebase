-- Add sample maintenance requests for Georgetown Hotel
-- First, let's get the room IDs for reference
WITH room_refs AS (
  SELECT id, room_number FROM public.rooms WHERE property_id = '11111111-1111-1111-1111-111111111111'
)

INSERT INTO public.maintenance_requests (
  property_id, 
  user_id, 
  room_id,
  suite_number, 
  location_type, 
  specific_location, 
  urgency, 
  status, 
  description, 
  selected_items,
  remarks,
  created_at,
  updated_at
) VALUES
-- Emergency Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM room_refs WHERE room_number = '104'),
 '104', 'guest_room', 'Air conditioning unit', 'emergency', 'pending', 
 'AC unit completely failed, room is extremely hot. Guest is complaining and requesting room change.',
 '[1, 4, 7]'::jsonb,
 'Guest checked in 2 hours ago',
 NOW() - INTERVAL '1 hour',
 NOW() - INTERVAL '1 hour'),

-- High Priority Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM room_refs WHERE room_number = '304'),
 '304', 'guest_room', 'Bathroom sink', 'high', 'assigned', 
 'Bathroom sink is completely clogged and overflowing. Water damage possible.',
 '[2, 8]'::jsonb,
 'Plumber has been notified',
 NOW() - INTERVAL '3 hours',
 NOW() - INTERVAL '2 hours'),

-- Medium Priority Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM room_refs WHERE room_number = '201'),
 '201', 'guest_room', 'Light fixture', 'medium', 'in_progress', 
 'Overhead light in bedroom is flickering and making buzzing sounds.',
 '[3, 9]'::jsonb,
 'Electrician is on-site working on the issue',
 NOW() - INTERVAL '5 hours',
 NOW() - INTERVAL '1 hour'),

-- Low Priority Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM room_refs WHERE room_number = '302'),
 '302', 'guest_room', 'Window blind', 'low', 'pending', 
 'Window blind cord is broken. Blind cannot be adjusted properly.',
 '[5]'::jsonb,
 'Non-urgent, can be addressed during next maintenance cycle',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

-- Completed Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM room_refs WHERE room_number = '105'),
 '105', 'guest_room', 'TV remote', 'low', 'completed', 
 'TV remote control not working properly. Buttons are unresponsive.',
 '[6]'::jsonb,
 'Replaced with new remote control',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '6 hours'),

-- Common Area Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 NULL,
 'Lobby', 'common_area', 'Elevator', 'high', 'assigned', 
 'Elevator making loud grinding noise when traveling between 2nd and 3rd floor.',
 '[10, 11]'::jsonb,
 'Elevator technician scheduled for tomorrow morning',
 NOW() - INTERVAL '6 hours',
 NOW() - INTERVAL '4 hours'),

-- Exterior Request  
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 NULL,
 'Exterior', 'exterior', 'Parking lot', 'medium', 'pending', 
 'Pothole in parking lot near main entrance. Could damage vehicles.',
 '[12]'::jsonb,
 'Need to coordinate with parking lot maintenance company',
 NOW() - INTERVAL '8 hours',
 NOW() - INTERVAL '8 hours'),

-- Another Emergency
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM room_refs WHERE room_number = '204'),
 '204', 'guest_room', 'Ceiling', 'emergency', 'in_progress', 
 'Water leaking from ceiling in guest room. Active leak detected.',
 '[13, 14, 15]'::jsonb,
 'Water source has been shut off, cleanup crew on site',
 NOW() - INTERVAL '4 hours',
 NOW() - INTERVAL '30 minutes');