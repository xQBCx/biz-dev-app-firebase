-- Complete the SmartLink database cleanup by adding the remaining data

-- Update the SmartLink org name to be more professional
UPDATE orgs 
SET name = 'SmartLink Hospitality Management', 
    updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Add comprehensive job postings for SmartLink operations (check if they exist first)
INSERT INTO job_postings (title, department, type, location, description, active) 
SELECT * FROM (VALUES
  ('Front Desk Associate', 'Front Office', 'Full-time', 'Georgetown, TX', 'Provide exceptional guest service at our Microtel Inn Georgetown location. Handle check-ins, reservations, and guest inquiries.', true),
  ('Housekeeping Supervisor', 'Housekeeping', 'Full-time', 'Austin, TX', 'Lead housekeeping team at Hampton Inn Austin Airport. Ensure rooms meet brand standards and manage cleaning schedules.', true),
  ('Maintenance Technician', 'Maintenance', 'Full-time', 'Round Rock, TX', 'Perform preventive maintenance and repairs at Holiday Inn Express Round Rock. HVAC and plumbing experience preferred.', true),
  ('Night Auditor', 'Front Office', 'Full-time', 'Cedar Park, TX', 'Overnight front desk position at SpringHill Suites Cedar Park. Handle night operations and audit procedures.', true),
  ('General Manager', 'Management', 'Full-time', 'Plano, TX', 'Lead operations at Courtyard Dallas Plano. 5+ years hospitality management experience required.', true),
  ('Sales Coordinator', 'Sales & Marketing', 'Full-time', 'Denver, CO', 'Develop group sales and manage corporate accounts for Aloft Denver Downtown. Travel industry experience preferred.', true)
) AS new_jobs(title, department, type, location, description, active)
WHERE NOT EXISTS (SELECT 1 FROM job_postings WHERE job_postings.title = new_jobs.title);

-- Add sample Standard Operating Procedures (check if they exist first)
INSERT INTO sops (title, department, sop_url)
SELECT * FROM (VALUES
  ('Guest Check-in Procedures', 'Front Office', 'https://docs.smartlinkmgt.com/sops/checkin-procedures'),
  ('Room Cleaning Standards', 'Housekeeping', 'https://docs.smartlinkmgt.com/sops/room-cleaning'),
  ('Emergency Response Protocol', 'Management', 'https://docs.smartlinkmgt.com/sops/emergency-response'),
  ('Revenue Management Guidelines', 'Management', 'https://docs.smartlinkmgt.com/sops/revenue-management'),
  ('Maintenance Request Handling', 'Maintenance', 'https://docs.smartlinkmgt.com/sops/maintenance-requests'),
  ('Group Sales Process', 'Sales & Marketing', 'https://docs.smartlinkmgt.com/sops/group-sales'),
  ('Guest Complaint Resolution', 'Front Office', 'https://docs.smartlinkmgt.com/sops/complaint-resolution'),
  ('Food Safety Standards', 'Food & Beverage', 'https://docs.smartlinkmgt.com/sops/food-safety'),
  ('New Employee Onboarding', 'Human Resources', 'https://docs.smartlinkmgt.com/sops/employee-onboarding'),
  ('Property Inspection Checklist', 'Management', 'https://docs.smartlinkmgt.com/sops/property-inspection')
) AS new_sops(title, department, sop_url)
WHERE NOT EXISTS (SELECT 1 FROM sops WHERE sops.title = new_sops.title);

-- Add sample partnership leads (check if they exist first)
INSERT INTO leads (contact_name, org_name, email, phone, property_count, notes)
SELECT * FROM (VALUES
  ('Michael Rodriguez', 'Texas Hospitality Group', 'mrodriguez@txhospitality.com', '512-555-0123', 8, 'Interested in management services for Austin-area properties'),
  ('Sarah Chen', 'Denver Hotel Investors', 'schen@denverhotels.com', '303-555-0456', 12, 'Looking for comprehensive management for Colorado portfolio'),
  ('David Thompson', 'Lone Star Properties', 'dthompson@lonestarprops.com', '214-555-0789', 6, 'Seeking revenue management and operations support'),
  ('Lisa Johnson', 'Mountain View Hospitality', 'ljohnson@mountainviewhosp.com', '720-555-0321', 4, 'Interested in housekeeping and maintenance services'),
  ('Robert Kim', 'Central Texas Hotels', 'rkim@centraltxhotels.com', '512-555-0654', 15, 'Full-service management needed for expanding portfolio')
) AS new_leads(contact_name, org_name, email, phone, property_count, notes)
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE leads.email = new_leads.email);

-- Clean up any demo data that doesn't belong to SmartLink
DELETE FROM properties WHERE org_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM profiles WHERE org_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM orgs WHERE id = '22222222-2222-2222-2222-222222222222';