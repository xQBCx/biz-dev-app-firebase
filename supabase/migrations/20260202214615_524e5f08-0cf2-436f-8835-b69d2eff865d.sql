-- Add missing transaction types to the enum
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'fund_contribution';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'mint_funding';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'withdrawal';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'settlement_payout';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'mint_invoice_payment';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'mint_treasury_routing';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'anchor';
ALTER TYPE public.xdk_tx_type ADD VALUE IF NOT EXISTS 'internal_transfer';