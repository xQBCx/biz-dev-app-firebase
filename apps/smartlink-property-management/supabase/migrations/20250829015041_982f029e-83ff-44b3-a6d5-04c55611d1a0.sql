-- Add sample SOPs for each department
INSERT INTO public.sops (title, department, sop_url) VALUES
-- Front Desk SOPs
('Guest Check-In Procedures', 'frontdesk', 'https://docs.company.com/front-desk/check-in'),
('Guest Check-Out Process', 'frontdesk', 'https://docs.company.com/front-desk/check-out'),
('Handling Guest Complaints', 'frontdesk', 'https://docs.company.com/front-desk/complaints'),
('Room Assignment Guidelines', 'frontdesk', 'https://docs.company.com/front-desk/room-assignment'),
('Payment Processing Procedures', 'frontdesk', 'https://docs.company.com/front-desk/payments'),
('Emergency Contact Protocols', 'frontdesk', 'https://docs.company.com/front-desk/emergency'),

-- Housekeeping SOPs
('Daily Room Cleaning Checklist', 'housekeeping', 'https://docs.company.com/housekeeping/room-cleaning'),
('Laundry Management Procedures', 'housekeeping', 'https://docs.company.com/housekeeping/laundry'),
('Supply Inventory Management', 'housekeeping', 'https://docs.company.com/housekeeping/inventory'),
('Deep Cleaning Protocols', 'housekeeping', 'https://docs.company.com/housekeeping/deep-cleaning'),
('Lost & Found Procedures', 'housekeeping', 'https://docs.company.com/housekeeping/lost-found'),
('Chemical Safety Guidelines', 'housekeeping', 'https://docs.company.com/housekeeping/chemical-safety'),

-- Maintenance SOPs
('HVAC System Maintenance', 'maintenance', 'https://docs.company.com/maintenance/hvac'),
('Plumbing Emergency Response', 'maintenance', 'https://docs.company.com/maintenance/plumbing'),
('Electrical Safety Procedures', 'maintenance', 'https://docs.company.com/maintenance/electrical'),
('Preventive Maintenance Schedule', 'maintenance', 'https://docs.company.com/maintenance/preventive'),
('Work Order Management', 'maintenance', 'https://docs.company.com/maintenance/work-orders'),
('Equipment Inspection Checklist', 'maintenance', 'https://docs.company.com/maintenance/inspections'),

-- General SOPs
('Fire Safety Procedures', 'general', 'https://docs.company.com/general/fire-safety'),
('Security Protocols', 'general', 'https://docs.company.com/general/security'),
('Staff Onboarding Process', 'general', 'https://docs.company.com/general/onboarding'),
('Incident Reporting Guidelines', 'general', 'https://docs.company.com/general/incident-reporting'),
('Communication Standards', 'general', 'https://docs.company.com/general/communication'),
('Quality Assurance Procedures', 'general', 'https://docs.company.com/general/quality-assurance')
ON CONFLICT DO NOTHING;