-- Clean up and restructure for SmartLink Hospitality
-- First, clean up existing data and add proper SmartLink properties

-- Update the SmartLink org with proper info
UPDATE orgs 
SET name = 'SmartLink Hospitality Management', 
    updated_at = now()
WHERE name = 'SmartLink Hospitality';

-- Add comprehensive SmartLink properties across different markets
INSERT INTO properties (id, name, city, state, org_id, timezone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Microtel Inn Georgetown', 'Georgetown', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111112', 'Hampton Inn Austin Airport', 'Austin', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111113', 'Holiday Inn Express Round Rock', 'Round Rock', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111114', 'Fairfield Inn Pflugerville', 'Pflugerville', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111115', 'SpringHill Suites Cedar Park', 'Cedar Park', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111116', 'Residence Inn Lakeway', 'Lakeway', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111117', 'Courtyard Dallas Plano', 'Plano', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111118', 'TownePlace Suites Frisco', 'Frisco', 'TX', '11111111-1111-1111-1111-111111111111', 'America/Chicago'),
  ('11111111-1111-1111-1111-111111111119', 'Aloft Denver Downtown', 'Denver', 'CO', '11111111-1111-1111-1111-111111111111', 'America/Denver'),
  ('11111111-1111-1111-1111-111111111120', 'Element Boulder', 'Boulder', 'CO', '11111111-1111-1111-1111-111111111111', 'America/Denver');

-- Add comprehensive job postings for SmartLink operations
INSERT INTO job_postings (title, department, type, location, description, active) VALUES
  ('Front Desk Associate', 'Front Office', 'Full-time', 'Georgetown, TX', 'Provide exceptional guest service at our Microtel Inn Georgetown location. Handle check-ins, reservations, and guest inquiries.', true),
  ('Housekeeping Supervisor', 'Housekeeping', 'Full-time', 'Austin, TX', 'Lead housekeeping team at Hampton Inn Austin Airport. Ensure rooms meet brand standards and manage cleaning schedules.', true),
  ('Maintenance Technician', 'Maintenance', 'Full-time', 'Round Rock, TX', 'Perform preventive maintenance and repairs at Holiday Inn Express Round Rock. HVAC and plumbing experience preferred.', true),
  ('Night Auditor', 'Front Office', 'Full-time', 'Cedar Park, TX', 'Overnight front desk position at SpringHill Suites Cedar Park. Handle night operations and audit procedures.', true),
  ('General Manager', 'Management', 'Full-time', 'Plano, TX', 'Lead operations at Courtyard Dallas Plano. 5+ years hospitality management experience required.', true),
  ('Sales Coordinator', 'Sales & Marketing', 'Full-time', 'Denver, CO', 'Develop group sales and manage corporate accounts for Aloft Denver Downtown. Travel industry experience preferred.', true);

-- Add sample Standard Operating Procedures
INSERT INTO sops (title, department, sop_url) VALUES
  ('Guest Check-in Procedures', 'Front Office', 'https://docs.smartlinkmgt.com/sops/checkin-procedures'),
  ('Room Cleaning Standards', 'Housekeeping', 'https://docs.smartlinkmgt.com/sops/room-cleaning'),
  ('Emergency Response Protocol', 'Management', 'https://docs.smartlinkmgt.com/sops/emergency-response'),
  ('Revenue Management Guidelines', 'Management', 'https://docs.smartlinkmgt.com/sops/revenue-management'),
  ('Maintenance Request Handling', 'Maintenance', 'https://docs.smartlinkmgt.com/sops/maintenance-requests'),
  ('Group Sales Process', 'Sales & Marketing', 'https://docs.smartlinkmgt.com/sops/group-sales'),
  ('Guest Complaint Resolution', 'Front Office', 'https://docs.smartlinkmgt.com/sops/complaint-resolution'),
  ('Food Safety Standards', 'Food & Beverage', 'https://docs.smartlinkmgt.com/sops/food-safety'),
  ('New Employee Onboarding', 'Human Resources', 'https://docs.smartlinkmgt.com/sops/employee-onboarding'),
  ('Property Inspection Checklist', 'Management', 'https://docs.smartlinkmgt.com/sops/property-inspection');

-- Add sample partnership leads
INSERT INTO leads (contact_name, org_name, email, phone, property_count, notes) VALUES
  ('Michael Rodriguez', 'Texas Hospitality Group', 'mrodriguez@txhospitality.com', '512-555-0123', 8, 'Interested in management services for Austin-area properties'),
  ('Sarah Chen', 'Denver Hotel Investors', 'schen@denverhotels.com', '303-555-0456', 12, 'Looking for comprehensive management for Colorado portfolio'),
  ('David Thompson', 'Lone Star Properties', 'dthompson@lonestarprops.com', '214-555-0789', 6, 'Seeking revenue management and operations support'),
  ('Lisa Johnson', 'Mountain View Hospitality', 'ljohnson@mountainviewhosp.com', '720-555-0321', 4, 'Interested in housekeeping and maintenance services'),
  ('Robert Kim', 'Central Texas Hotels', 'rkim@centraltxhotels.com', '512-555-0654', 15, 'Full-service management needed for expanding portfolio');

-- Clean up demo data that's not relevant to SmartLink
DELETE FROM properties WHERE org_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM orgs WHERE id = '22222222-2222-2222-2222-222222222222';
DELETE FROM profiles WHERE org_id = '22222222-2222-2222-2222-222222222222';

-- Update user's profile to point to a real SmartLink property
UPDATE profiles 
SET property_id = '11111111-1111-1111-1111-111111111111'
WHERE org_id = '11111111-1111-1111-1111-111111111111';