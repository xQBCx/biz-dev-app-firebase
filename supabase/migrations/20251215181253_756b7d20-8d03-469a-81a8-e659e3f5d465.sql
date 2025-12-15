-- Add flexible redemption support for Giftly-style hybrid model

-- Create enum for redemption methods
CREATE TYPE redemption_method AS ENUM (
  'platform_credits',   -- Redeem directly at AI platform
  'prepaid_card',       -- Visa/Mastercard prepaid card by mail
  'bank_deposit',       -- Direct bank deposit (ACH)
  'paypal',             -- PayPal credit
  'venmo'               -- Venmo transfer
);

-- Add redemption method tracking to ai_redemptions
ALTER TABLE ai_redemptions 
ADD COLUMN redemption_method redemption_method DEFAULT 'platform_credits',
ADD COLUMN payout_status TEXT DEFAULT 'pending',
ADD COLUMN payout_reference TEXT,
ADD COLUMN payout_completed_at TIMESTAMPTZ,
ADD COLUMN recipient_payout_details JSONB DEFAULT '{}'::jsonb;

-- Create table for flexible payout requests
CREATE TABLE ai_payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_id UUID REFERENCES ai_redemptions(id) ON DELETE CASCADE,
  gift_card_id UUID REFERENCES ai_gift_cards(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payout_method redemption_method NOT NULL,
  recipient_email TEXT,
  recipient_name TEXT,
  -- For prepaid card
  shipping_address JSONB,
  -- For bank deposit
  bank_account_last4 TEXT,
  bank_routing_last4 TEXT,
  -- For PayPal/Venmo
  paypal_email TEXT,
  venmo_handle TEXT,
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processor_reference TEXT,
  processor_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable RLS
ALTER TABLE ai_payout_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create payout requests (for gift card recipients)
CREATE POLICY "Anyone can create payout requests"
ON ai_payout_requests FOR INSERT
WITH CHECK (true);

-- Allow viewing own payout requests by email
CREATE POLICY "Recipients can view their payout requests"
ON ai_payout_requests FOR SELECT
USING (true);

-- Add index for faster lookups
CREATE INDEX idx_payout_requests_gift_card ON ai_payout_requests(gift_card_id);
CREATE INDEX idx_payout_requests_status ON ai_payout_requests(status);

-- Update ai_gift_cards to track suggested vs actual usage
ALTER TABLE ai_gift_cards
ADD COLUMN suggested_provider_id UUID REFERENCES ai_providers(id),
ADD COLUMN actual_redemption_method redemption_method,
ADD COLUMN flexible_redemption_enabled BOOLEAN DEFAULT true;