-- Insert View Point Hotel property in Texas
INSERT INTO public.properties (id, org_id, name, city, state, timezone, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'View Point Hotel',
  'Austin',
  'TX',
  'America/Chicago',
  now(),
  now()
);

-- Insert 177 rooms for View Point Hotel
INSERT INTO public.rooms (property_id, room_number, type, bed_config, status, created_at, updated_at)
SELECT 
  '55555555-5555-5555-5555-555555555555'::uuid,
  LPAD(room_num::text, 3, '0'),
  CASE 
    WHEN room_num % 10 = 0 THEN 'suite'
    WHEN room_num % 20 = 1 THEN 'handicap'
    WHEN room_num % 15 = 2 THEN 'out_of_inventory'
    ELSE 'standard'
  END,
  CASE 
    WHEN room_num % 3 = 1 THEN 'single_queen'
    WHEN room_num % 3 = 2 THEN 'double_queen'
    ELSE 'suite'
  END,
  'active',
  now(),
  now()
FROM generate_series(101, 277) AS room_num;