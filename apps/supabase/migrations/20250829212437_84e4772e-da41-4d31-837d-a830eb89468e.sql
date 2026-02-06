-- Update the user's profile to be associated with the existing Georgetown Microtel property
UPDATE profiles 
SET property_id = '11111111-1111-1111-1111-111111111111',
    org_id = '11111111-1111-1111-1111-111111111111'
WHERE user_id = 'cc8f97a0-71ae-472e-8f4d-2928ca3ef8b8';

-- Update all team members to use the correct Georgetown property ID
UPDATE team_members 
SET property_id = '11111111-1111-1111-1111-111111111111'
WHERE property_id = '44444444-4444-4444-4444-444444444444';

-- Update team status to use the correct property ID
UPDATE team_status 
SET property_id = '11111111-1111-1111-1111-111111111111'
WHERE property_id = '44444444-4444-4444-4444-444444444444';