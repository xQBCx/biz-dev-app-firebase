-- Seed some sample team members and their statuses for Georgetown Hotel
-- First, let's add some sample profiles for testing (these would normally be created when users sign up)

-- Insert sample team status records for existing profiles
INSERT INTO public.team_status (employee_id, property_id, status, last_seen) 
SELECT 
  p.id,
  p.property_id,
  CASE 
    WHEN p.role = 'manager' THEN 'on_shift'
    WHEN p.role = 'owner' THEN 'on_shift'
    ELSE 'off_duty'
  END as status,
  now() - interval '15 minutes' as last_seen
FROM public.profiles p
WHERE p.property_id = '11111111-1111-1111-1111-111111111111'
ON CONFLICT (employee_id, property_id) DO UPDATE SET
  status = EXCLUDED.status,
  last_seen = EXCLUDED.last_seen;

-- Create some sample daily shifts for today
INSERT INTO public.daily_shifts (property_id, employee_id, shift_date, shift_start, shift_end, department)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  p.id,
  CURRENT_DATE,
  CASE 
    WHEN p.role = 'front_desk' THEN '07:00'::time
    WHEN p.role = 'housekeeping' THEN '08:00'::time
    WHEN p.role = 'maintenance' THEN '09:00'::time
    ELSE '08:00'::time
  END as shift_start,
  CASE 
    WHEN p.role = 'front_desk' THEN '15:00'::time
    WHEN p.role = 'housekeeping' THEN '16:00'::time
    WHEN p.role = 'maintenance' THEN '17:00'::time
    ELSE '16:00'::time
  END as shift_end,
  CASE 
    WHEN p.role IN ('manager', 'owner') THEN 'management'
    WHEN p.role = 'front_desk' THEN 'front_desk'
    WHEN p.role = 'housekeeping' THEN 'housekeeping'
    WHEN p.role = 'maintenance' THEN 'maintenance'
    ELSE 'general'
  END as department
FROM public.profiles p
WHERE p.property_id = '11111111-1111-1111-1111-111111111111'
ON CONFLICT DO NOTHING;