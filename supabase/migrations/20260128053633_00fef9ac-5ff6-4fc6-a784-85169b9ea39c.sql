-- Create payout method type enum
CREATE TYPE payout_method_type AS ENUM (
  'bank_ach',
  'stripe_connect',
  'paypal',
  'venmo',
  'cashapp',
  'zelle',
  'apple_cash',
  'crypto_btc',
  'crypto_eth',
  'crypto_xrp',
  'manual'
);

-- Create user payout accounts table for storing withdrawal destinations
CREATE TABLE public.user_payout_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  method payout_method_type NOT NULL,
  account_name TEXT NOT NULL,
  account_details JSONB NOT NULL DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add Stripe Connect account ID to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_connect_onboarded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_connect_payouts_enabled BOOLEAN DEFAULT false;

-- Add payout tracking columns to withdrawal requests
ALTER TABLE public.xdk_withdrawal_requests
ADD COLUMN IF NOT EXISTS payout_account_id UUID REFERENCES public.user_payout_accounts(id),
ADD COLUMN IF NOT EXISTS payout_processor TEXT,
ADD COLUMN IF NOT EXISTS external_payout_id TEXT,
ADD COLUMN IF NOT EXISTS payout_error TEXT;

-- Enable RLS on user_payout_accounts
ALTER TABLE public.user_payout_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payout accounts
CREATE POLICY "Users can view own payout accounts" 
ON public.user_payout_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own payout accounts
CREATE POLICY "Users can create own payout accounts" 
ON public.user_payout_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payout accounts
CREATE POLICY "Users can update own payout accounts" 
ON public.user_payout_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own payout accounts
CREATE POLICY "Users can delete own payout accounts" 
ON public.user_payout_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_payout_accounts_updated_at
BEFORE UPDATE ON public.user_payout_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_user_payout_accounts_user_id ON public.user_payout_accounts(user_id);
CREATE INDEX idx_user_payout_accounts_primary ON public.user_payout_accounts(user_id, is_primary) WHERE is_primary = true;