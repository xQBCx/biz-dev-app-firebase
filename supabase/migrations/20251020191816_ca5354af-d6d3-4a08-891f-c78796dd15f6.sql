-- Add time and attendee fields to crm_activities for meeting functionality
ALTER TABLE public.crm_activities 
ADD COLUMN start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN location TEXT,
ADD COLUMN meeting_link TEXT,
ADD COLUMN attendee_emails TEXT[];

-- Add index for better performance on time-based queries
CREATE INDEX idx_crm_activities_start_time ON public.crm_activities(start_time);

-- Add comment to clarify the schema
COMMENT ON COLUMN public.crm_activities.start_time IS 'Specific start date and time for meetings';
COMMENT ON COLUMN public.crm_activities.end_time IS 'Specific end date and time for meetings';
COMMENT ON COLUMN public.crm_activities.attendee_emails IS 'Array of attendee email addresses for meeting invites';