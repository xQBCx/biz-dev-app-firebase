-- Insert SmartLink Hospitality organization
INSERT INTO public.orgs (id, name) 
VALUES ('22222222-2222-2222-2222-222222222222', 'SmartLink Hospitality')
ON CONFLICT (id) DO NOTHING;

-- Insert Microtel Georgetown property
INSERT INTO public.properties (id, name, city, state, timezone, org_id)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Microtel Georgetown', 
  'Georgetown', 
  'TX', 
  'America/Denver',
  '22222222-2222-2222-2222-222222222222'
)
ON CONFLICT (id) DO NOTHING;

-- Update the default org and property assignments
UPDATE public.orgs 
SET name = 'SmartLink Hospitality'
WHERE name = 'SmartLink Management';

-- Update properties to point to the new org
UPDATE public.properties 
SET 
  name = 'Microtel Georgetown',
  city = 'Georgetown', 
  state = 'TX',
  timezone = 'America/Denver',
  org_id = '22222222-2222-2222-2222-222222222222'
WHERE org_id = '11111111-1111-1111-1111-111111111111';

-- Update handle_new_user function to use the new org
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, initials, org_id, property_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'owner',
    UPPER(LEFT(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1), 1)) || 
    UPPER(LEFT(SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 2), 1)),
    '22222222-2222-2222-2222-222222222222'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;