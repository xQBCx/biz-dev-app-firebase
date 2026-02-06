-- Add sample maintenance requests with correct location_type values
INSERT INTO public.maintenance_requests (
  property_id, 
  user_id, 
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
 '104', 'bedroom', 'Air conditioning unit', 'emergency', 'pending', 
 'AC unit completely failed, room is extremely hot. Guest is complaining and requesting room change.',
 '[1, 4, 7]'::jsonb,
 'Guest checked in 2 hours ago',
 NOW() - INTERVAL '1 hour',
 NOW() - INTERVAL '1 hour'),

-- High Priority Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '304', 'bathroom', 'Sink drain', 'high', 'assigned', 
 'Bathroom sink is completely clogged and overflowing. Water damage possible.',
 '[2, 8]'::jsonb,
 'Plumber has been notified',
 NOW() - INTERVAL '3 hours',
 NOW() - INTERVAL '2 hours'),

-- Medium Priority Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '201', 'bedroom', 'Overhead light', 'medium', 'in_progress', 
 'Overhead light in bedroom is flickering and making buzzing sounds.',
 '[3, 9]'::jsonb,
 'Electrician is on-site working on the issue',
 NOW() - INTERVAL '5 hours',
 NOW() - INTERVAL '1 hour'),

-- Low Priority Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '302', 'bedroom', 'Window blind', 'low', 'pending', 
 'Window blind cord is broken. Blind cannot be adjusted properly.',
 '[5]'::jsonb,
 'Non-urgent, can be addressed during next maintenance cycle',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day'),

-- Completed Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '105', 'living_room', 'TV remote', 'low', 'completed', 
 'TV remote control not working properly. Buttons are unresponsive.',
 '[6]'::jsonb,
 'Replaced with new remote control',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '6 hours'),

-- Kitchen Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '205', 'kitchen', 'Refrigerator', 'high', 'assigned', 
 'Suite refrigerator not cooling properly. Food is spoiling.',
 '[10, 11]'::jsonb,
 'Appliance technician scheduled for tomorrow morning',
 NOW() - INTERVAL '6 hours',
 NOW() - INTERVAL '4 hours'),

-- Other Request  
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 'Hallway-2F', 'other', 'Elevator', 'medium', 'pending', 
 'Elevator making loud grinding noise when traveling between floors.',
 '[12]'::jsonb,
 'Need to schedule elevator maintenance inspection',
 NOW() - INTERVAL '8 hours',
 NOW() - INTERVAL '8 hours'),

-- Another Emergency
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '204', 'bathroom', 'Ceiling leak', 'emergency', 'in_progress', 
 'Water leaking from ceiling in guest bathroom. Active leak detected.',
 '[13, 14, 15]'::jsonb,
 'Water source has been shut off, cleanup crew on site',
 NOW() - INTERVAL '4 hours',
 NOW() - INTERVAL '30 minutes'),

-- Bathroom Request
('11111111-1111-1111-1111-111111111111', 
 '11111111-1111-1111-1111-111111111111', 
 '301', 'bathroom', 'Shower head', 'low', 'pending', 
 'Shower head has low water pressure and needs cleaning or replacement.',
 '[7]'::jsonb,
 'Can be done during next scheduled maintenance',
 NOW() - INTERVAL '12 hours',
 NOW() - INTERVAL '12 hours');