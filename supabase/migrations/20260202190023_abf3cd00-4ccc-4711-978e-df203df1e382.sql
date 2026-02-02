-- Add fee tracking columns to escrow_funding_requests
ALTER TABLE escrow_funding_requests ADD COLUMN IF NOT EXISTS gross_amount numeric;
ALTER TABLE escrow_funding_requests ADD COLUMN IF NOT EXISTS stripe_fee numeric;
ALTER TABLE escrow_funding_requests ADD COLUMN IF NOT EXISTS net_amount numeric;

-- Add fee tracking columns to fund_contribution_requests
ALTER TABLE fund_contribution_requests ADD COLUMN IF NOT EXISTS gross_amount numeric;
ALTER TABLE fund_contribution_requests ADD COLUMN IF NOT EXISTS stripe_fee numeric;
ALTER TABLE fund_contribution_requests ADD COLUMN IF NOT EXISTS net_amount numeric;

-- Add to value_ledger_entries for reporting
ALTER TABLE value_ledger_entries ADD COLUMN IF NOT EXISTS processing_fee numeric;
ALTER TABLE value_ledger_entries ADD COLUMN IF NOT EXISTS gross_amount numeric;