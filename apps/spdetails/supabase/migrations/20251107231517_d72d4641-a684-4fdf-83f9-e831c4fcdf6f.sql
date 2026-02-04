-- Create transactions table for financial tracking
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  partner_business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  stripe_payment_intent_id TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'payout')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_fee NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create partner_earnings table for tracking partner balances
CREATE TABLE public.partner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_earned NUMERIC DEFAULT 0 NOT NULL,
  available_balance NUMERIC DEFAULT 0 NOT NULL,
  pending_balance NUMERIC DEFAULT 0 NOT NULL,
  total_withdrawn NUMERIC DEFAULT 0 NOT NULL,
  last_payout_date TIMESTAMP WITH TIME ZONE,
  stripe_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create business_availability table for default weekly schedule
CREATE TABLE public.business_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(business_id, day_of_week)
);

-- Create availability_overrides table for specific date exceptions
CREATE TABLE public.availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  specific_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT false NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(business_id, specific_date)
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Partners can view their business transactions"
  ON public.transactions FOR SELECT
  USING (partner_business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid() AND role = 'partner'
  ));

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for partner_earnings
CREATE POLICY "Partners can view their business earnings"
  ON public.partner_earnings FOR SELECT
  USING (business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid() AND role = 'partner'
  ));

CREATE POLICY "Partners can update their business earnings"
  ON public.partner_earnings FOR UPDATE
  USING (business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid() AND role = 'partner'
  ));

CREATE POLICY "Partners can insert their business earnings"
  ON public.partner_earnings FOR INSERT
  WITH CHECK (business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid() AND role = 'partner'
  ));

CREATE POLICY "Admins can manage all earnings"
  ON public.partner_earnings FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for business_availability
CREATE POLICY "Anyone can view availability"
  ON public.business_availability FOR SELECT
  USING (true);

CREATE POLICY "Partners can manage their business availability"
  ON public.business_availability FOR ALL
  USING (business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid() AND role = 'partner'
  ));

CREATE POLICY "Admins can manage all availability"
  ON public.business_availability FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for availability_overrides
CREATE POLICY "Anyone can view availability overrides"
  ON public.availability_overrides FOR SELECT
  USING (true);

CREATE POLICY "Partners can manage their business overrides"
  ON public.availability_overrides FOR ALL
  USING (business_id IN (
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid() AND role = 'partner'
  ));

CREATE POLICY "Admins can manage all overrides"
  ON public.availability_overrides FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_earnings_updated_at
  BEFORE UPDATE ON public.partner_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_availability_updated_at
  BEFORE UPDATE ON public.business_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_overrides_updated_at
  BEFORE UPDATE ON public.availability_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();