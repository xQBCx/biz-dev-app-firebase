-- Update the Georgetown property to properly reflect "by Wyndham" branding
UPDATE properties 
SET name = 'Georgetown Microtel by Wyndham',
    city = 'Georgetown',
    state = 'Colorado',
    timezone = 'America/Denver'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Update the organization name to reflect Wyndham branding
UPDATE orgs 
SET name = 'Wyndham Hotels & Resorts' 
WHERE id = '11111111-1111-1111-1111-111111111111';