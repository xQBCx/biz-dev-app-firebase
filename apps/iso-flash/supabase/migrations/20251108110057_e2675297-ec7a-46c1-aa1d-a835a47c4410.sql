-- Add scheduled_at field to sessions table for advance bookings
ALTER TABLE public.sessions
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add check constraint to ensure scheduled sessions have a scheduled_at time
ALTER TABLE public.sessions
ADD CONSTRAINT scheduled_sessions_must_have_time 
CHECK (
  (status = 'scheduled' AND scheduled_at IS NOT NULL) OR 
  (status != 'scheduled')
);