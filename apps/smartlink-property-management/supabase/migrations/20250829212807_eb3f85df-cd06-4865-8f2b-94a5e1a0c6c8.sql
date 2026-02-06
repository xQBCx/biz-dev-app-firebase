-- Add the missing team members (without team_status for now)
INSERT INTO team_members (full_name, initials, role, property_id, status) VALUES
('Bell Sleeper', 'BS', 'Front Desk Clerk', '11111111-1111-1111-1111-111111111111', 'active'),
('Yadira Martinez', 'YM', 'House Keeping', '11111111-1111-1111-1111-111111111111', 'active')
ON CONFLICT DO NOTHING;