-- Platform Invoices table for in-app client invoicing
CREATE TABLE public.platform_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_client_secret TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  client_email TEXT NOT NULL,
  deal_room_id UUID REFERENCES public.deal_rooms(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  line_items JSONB DEFAULT '[]',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  xdk_credited BOOLEAN DEFAULT FALSE,
  xdk_amount NUMERIC,
  xdk_tx_hash TEXT,
  xdk_recipient_wallet TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_invoices ENABLE ROW LEVEL SECURITY;

-- Index for faster queries
CREATE INDEX idx_platform_invoices_creator ON public.platform_invoices(creator_id);
CREATE INDEX idx_platform_invoices_client ON public.platform_invoices(client_id);
CREATE INDEX idx_platform_invoices_status ON public.platform_invoices(status);
CREATE INDEX idx_platform_invoices_stripe_id ON public.platform_invoices(stripe_invoice_id);

-- RLS Policies: Creators can manage their invoices
CREATE POLICY "Creators can view their invoices" 
ON public.platform_invoices 
FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can create invoices" 
ON public.platform_invoices 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their invoices" 
ON public.platform_invoices 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies: Clients can view and pay invoices addressed to them
CREATE POLICY "Clients can view invoices addressed to them" 
ON public.platform_invoices 
FOR SELECT 
USING (auth.uid() = client_id);

-- Allow webhooks/service role to update invoices (for payment processing)
-- This is handled by service_role key in edge functions

-- Trigger to update updated_at
CREATE TRIGGER update_platform_invoices_updated_at
BEFORE UPDATE ON public.platform_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for invoice status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_invoices;

-- Add comment for documentation
COMMENT ON TABLE public.platform_invoices IS 'Platform invoices for in-app billing between users. Supports embedded Stripe Payment Element and XDK settlement.';