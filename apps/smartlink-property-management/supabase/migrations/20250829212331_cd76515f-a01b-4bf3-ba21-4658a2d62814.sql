-- First create the organization
INSERT INTO orgs (id, name) 
VALUES ('22222222-2222-2222-2222-222222222222', 'Georgetown Properties')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Then update the user's profile to be associated with Georgetown Microtel
UPDATE profiles 
SET property_id = '44444444-4444-4444-4444-444444444444',
    org_id = '22222222-2222-2222-2222-222222222222'
WHERE user_id = 'cc8f97a0-71ae-472e-8f4d-2928ca3ef8b8';