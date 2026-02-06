-- Clear existing SOPs and add 3 focused SOPs for each department
DELETE FROM public.sops;

-- Front Desk SOPs (3 core procedures)
INSERT INTO public.sops (title, department, sop_url) VALUES
('Guest Check-In & Registration Process', 'frontdesk', 'https://docs.company.com/frontdesk/checkin-process'),
('Guest Service & Complaint Resolution', 'frontdesk', 'https://docs.company.com/frontdesk/guest-service'),
('End-of-Shift Closing Procedures', 'frontdesk', 'https://docs.company.com/frontdesk/closing-procedures'),

-- Housekeeping SOPs (3 core procedures)
('Standard Room Cleaning Protocol', 'housekeeping', 'https://docs.company.com/housekeeping/room-cleaning'),
('Inventory Management & Supply Control', 'housekeeping', 'https://docs.company.com/housekeeping/inventory'),
('Deep Cleaning & Sanitization Standards', 'housekeeping', 'https://docs.company.com/housekeeping/deep-cleaning'),

-- Maintenance SOPs (3 core procedures)
('Preventive Maintenance Schedule & Inspections', 'maintenance', 'https://docs.company.com/maintenance/preventive'),
('Emergency Repair Response Protocol', 'maintenance', 'https://docs.company.com/maintenance/emergency-response'),
('Work Order Processing & Documentation', 'maintenance', 'https://docs.company.com/maintenance/work-orders'),

-- General SOPs (3 core procedures)
('Emergency Evacuation & Safety Procedures', 'general', 'https://docs.company.com/general/emergency-evacuation'),
('Staff Communication & Reporting Standards', 'general', 'https://docs.company.com/general/communication'),
('Quality Control & Guest Satisfaction Monitoring', 'general', 'https://docs.company.com/general/quality-control');