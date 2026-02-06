-- Enable real-time updates for maintenance tables
ALTER TABLE maintenance_requests REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE team_status REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE team_status;

-- Create maintenance_technicians table for tracking who's working on what
CREATE TABLE IF NOT EXISTS maintenance_technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID NOT NULL,
  name TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  current_location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on maintenance_technicians
ALTER TABLE maintenance_technicians ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_technicians
CREATE POLICY "Users can view technicians for their property" 
ON maintenance_technicians 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = maintenance_technicians.property_id
));

CREATE POLICY "Managers can manage technicians" 
ON maintenance_technicians 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.property_id = maintenance_technicians.property_id 
  AND profiles.role IN ('manager', 'owner', 'regional')
));

-- Add Georgetown Colorado specific data
INSERT INTO maintenance_technicians (user_id, property_id, name, specialties, phone) 
SELECT 
  (SELECT user_id FROM profiles WHERE full_name = 'John Smith' LIMIT 1),
  (SELECT id FROM properties WHERE name ILIKE '%georgetown%' LIMIT 1),
  'Mike Rodriguez',
  ARRAY['HVAC', 'Electrical', 'Plumbing'],
  '(970) 555-0123'
WHERE EXISTS (SELECT 1 FROM properties WHERE name ILIKE '%georgetown%')
ON CONFLICT DO NOTHING;

INSERT INTO maintenance_technicians (user_id, property_id, name, specialties, phone) 
SELECT 
  (SELECT user_id FROM profiles WHERE full_name = 'John Smith' LIMIT 1),
  (SELECT id FROM properties WHERE name ILIKE '%georgetown%' LIMIT 1),
  'Sarah Chen',
  ARRAY['Electrical', 'Security', 'WiFi'],
  '(970) 555-0124'
WHERE EXISTS (SELECT 1 FROM properties WHERE name ILIKE '%georgetown%')
ON CONFLICT DO NOTHING;

-- Create maintenance_assignments table for tracking work assignments
CREATE TABLE IF NOT EXISTS maintenance_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES maintenance_technicians(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on maintenance_assignments
ALTER TABLE maintenance_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_assignments
CREATE POLICY "Users can view assignments for their property" 
ON maintenance_assignments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM maintenance_requests mr
  JOIN profiles p ON p.property_id = mr.property_id
  WHERE mr.id = maintenance_assignments.request_id 
  AND p.user_id = auth.uid()
));

CREATE POLICY "Managers can manage assignments" 
ON maintenance_assignments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM maintenance_requests mr
  JOIN profiles p ON p.property_id = mr.property_id
  WHERE mr.id = maintenance_assignments.request_id 
  AND p.user_id = auth.uid()
  AND p.role IN ('manager', 'owner', 'regional', 'maintenance')
));

-- Add realtime to new tables
ALTER TABLE maintenance_technicians REPLICA IDENTITY FULL;
ALTER TABLE maintenance_assignments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_technicians;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_assignments;

-- Create function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_maintenance_technicians_updated_at
  BEFORE UPDATE ON maintenance_technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_assignments_updated_at
  BEFORE UPDATE ON maintenance_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();