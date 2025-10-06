-- Create Financial Module Tables
CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
  account_code TEXT,
  parent_account_id UUID REFERENCES public.financial_accounts(id),
  currency TEXT DEFAULT 'USD',
  balance NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_type TEXT NOT NULL, -- invoice, payment, expense, transfer
  reference_number TEXT,
  description TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled
  contact_id UUID REFERENCES public.crm_contacts(id),
  company_id UUID REFERENCES public.crm_companies(id),
  deal_id UUID REFERENCES public.crm_deals(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transaction_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id),
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Service Module Tables
CREATE TABLE IF NOT EXISTS public.service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open', -- open, in_progress, waiting, resolved, closed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  category TEXT,
  contact_id UUID REFERENCES public.crm_contacts(id),
  company_id UUID REFERENCES public.crm_companies(id),
  assigned_to UUID REFERENCES auth.users(id),
  resolution TEXT,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create Marketing Module Tables
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- email, sms, social, ad
  status TEXT DEFAULT 'draft', -- draft, scheduled, active, paused, completed
  budget NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_audience JSONB,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  list_type TEXT DEFAULT 'static', -- static, dynamic
  filter_criteria JSONB,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.marketing_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, contact_id)
);

-- Create Communication/Timeline Tables
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL, -- email, call, meeting, note, sms
  subject TEXT,
  body TEXT,
  direction TEXT, -- inbound, outbound
  status TEXT DEFAULT 'completed',
  contact_id UUID REFERENCES public.crm_contacts(id),
  company_id UUID REFERENCES public.crm_companies(id),
  deal_id UUID REFERENCES public.crm_deals(id),
  ticket_id UUID REFERENCES public.service_tickets(id),
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Financial Accounts
CREATE POLICY "Users can view their own financial accounts"
ON public.financial_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial accounts"
ON public.financial_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial accounts"
ON public.financial_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial accounts"
ON public.financial_accounts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for Financial Transactions
CREATE POLICY "Users can view their own transactions"
ON public.financial_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.financial_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.financial_transactions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for Transaction Entries
CREATE POLICY "Users can view their transaction entries"
ON public.transaction_entries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.financial_transactions
  WHERE financial_transactions.id = transaction_entries.transaction_id
  AND financial_transactions.user_id = auth.uid()
));

CREATE POLICY "Users can create transaction entries"
ON public.transaction_entries FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.financial_transactions
  WHERE financial_transactions.id = transaction_entries.transaction_id
  AND financial_transactions.user_id = auth.uid()
));

-- RLS Policies for Service Tickets
CREATE POLICY "Users can view their own tickets"
ON public.service_tickets FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create their own tickets"
ON public.service_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
ON public.service_tickets FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own tickets"
ON public.service_tickets FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for Knowledge Base
CREATE POLICY "Anyone can view published articles"
ON public.knowledge_base_articles FOR SELECT
USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own articles"
ON public.knowledge_base_articles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
ON public.knowledge_base_articles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
ON public.knowledge_base_articles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for Marketing Campaigns
CREATE POLICY "Users can view their own campaigns"
ON public.marketing_campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
ON public.marketing_campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.marketing_campaigns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.marketing_campaigns FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for Marketing Lists
CREATE POLICY "Users can manage their own lists"
ON public.marketing_lists FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for List Members
CREATE POLICY "Users can manage their list members"
ON public.marketing_list_members FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.marketing_lists
  WHERE marketing_lists.id = marketing_list_members.list_id
  AND marketing_lists.user_id = auth.uid()
));

-- RLS Policies for Communications
CREATE POLICY "Users can view their own communications"
ON public.communications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own communications"
ON public.communications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communications"
ON public.communications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own communications"
ON public.communications FOR DELETE
USING (auth.uid() = user_id);

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'TKT-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM service_tickets WHERE ticket_number = new_number) INTO number_exists;
    EXIT WHEN NOT number_exists;
  END LOOP;
  RETURN new_number;
END;
$$;

-- Add trigger for ticket number generation
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger
BEFORE INSERT ON public.service_tickets
FOR EACH ROW
EXECUTE FUNCTION set_ticket_number();

-- Add updated_at triggers
CREATE TRIGGER update_financial_accounts_updated_at
BEFORE UPDATE ON public.financial_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_tickets_updated_at
BEFORE UPDATE ON public.service_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_articles_updated_at
BEFORE UPDATE ON public.knowledge_base_articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_lists_updated_at
BEFORE UPDATE ON public.marketing_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communications_updated_at
BEFORE UPDATE ON public.communications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();