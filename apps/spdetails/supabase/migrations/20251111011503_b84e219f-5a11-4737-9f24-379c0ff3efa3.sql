-- Add phone number to profiles and bookings for SMS integration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Add AI analysis fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_type text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_condition text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ai_recommendations jsonb DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_type ON bookings(vehicle_type);