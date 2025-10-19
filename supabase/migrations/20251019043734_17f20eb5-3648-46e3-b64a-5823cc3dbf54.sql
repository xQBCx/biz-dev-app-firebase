-- Create account levels enum
CREATE TYPE account_level AS ENUM ('free_trial', 'basic', 'professional', 'enterprise', 'partner');

-- Add account_level column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_level account_level DEFAULT 'free_trial',
ADD COLUMN IF NOT EXISTS modules_access jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS account_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Update access_requests table to include approval details
ALTER TABLE access_requests
ADD COLUMN IF NOT EXISTS assigned_account_level account_level,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE,
ADD COLUMN IF NOT EXISTS invite_expires_at timestamp with time zone;