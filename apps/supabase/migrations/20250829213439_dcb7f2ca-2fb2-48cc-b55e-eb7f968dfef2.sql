-- Enable real-time functionality for team tables
ALTER TABLE team_members REPLICA IDENTITY FULL;
ALTER TABLE team_status REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE team_status;