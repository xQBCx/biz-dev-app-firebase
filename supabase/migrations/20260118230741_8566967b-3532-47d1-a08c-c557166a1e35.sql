-- Create user_scanner_preferences table for personal on/off control
CREATE TABLE public.user_scanner_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scan_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (scan_frequency IN ('hourly', 'every_6_hours', 'daily', 'weekly')),
  notification_preference TEXT NOT NULL DEFAULT 'in_app' CHECK (notification_preference IN ('email', 'in_app', 'both', 'none')),
  last_scan_at TIMESTAMPTZ,
  next_scan_at TIMESTAMPTZ,
  opportunities_found INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_scanner_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
CREATE POLICY "Users can view their own scanner preferences"
  ON public.user_scanner_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scanner preferences"
  ON public.user_scanner_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scanner preferences"
  ON public.user_scanner_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all preferences for monitoring
CREATE POLICY "Admins can view all scanner preferences"
  ON public.user_scanner_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_user_scanner_preferences_updated_at
  BEFORE UPDATE ON public.user_scanner_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for efficient queries
CREATE INDEX idx_user_scanner_preferences_user_id ON public.user_scanner_preferences(user_id);
CREATE INDEX idx_user_scanner_preferences_active ON public.user_scanner_preferences(is_active) WHERE is_active = true;