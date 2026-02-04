-- Add Google Calendar integration fields to consultant_profiles
ALTER TABLE public.consultant_profiles 
ADD COLUMN IF NOT EXISTS google_calendar_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS google_refresh_token text,
ADD COLUMN IF NOT EXISTS google_access_token text,
ADD COLUMN IF NOT EXISTS google_token_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS google_calendar_id text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS sync_google_calendar boolean DEFAULT true;

-- Create index for calendar sync queries
CREATE INDEX IF NOT EXISTS idx_consultant_profiles_google_connected 
ON public.consultant_profiles(google_calendar_connected) 
WHERE google_calendar_connected = true;