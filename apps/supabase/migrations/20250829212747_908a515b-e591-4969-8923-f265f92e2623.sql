-- Add the missing team members
INSERT INTO team_members (full_name, initials, role, property_id, status) VALUES
('Bell Sleeper', 'BS', 'Front Desk Clerk', '11111111-1111-1111-1111-111111111111', 'active'),
('Yadira Martinez', 'YM', 'House Keeping', '11111111-1111-1111-1111-111111111111', 'active')
ON CONFLICT DO NOTHING;

-- Clean up any duplicate properties (keep only the Georgetown one)
DELETE FROM properties 
WHERE name LIKE '%Georgetown%' 
AND id != '11111111-1111-1111-1111-111111111111';

-- Verify and clean up team status entries
DELETE FROM team_status 
WHERE employee_id NOT IN (
    SELECT id FROM team_members WHERE property_id = '11111111-1111-1111-1111-111111111111'
);

-- Add missing team status entries for the new members
INSERT INTO team_status (employee_id, property_id, status, last_seen)
SELECT tm.id, tm.property_id, 'off_duty', now()
FROM team_members tm
WHERE tm.property_id = '11111111-1111-1111-1111-111111111111'
AND tm.id NOT IN (SELECT employee_id FROM team_status WHERE property_id = '11111111-1111-1111-1111-111111111111');