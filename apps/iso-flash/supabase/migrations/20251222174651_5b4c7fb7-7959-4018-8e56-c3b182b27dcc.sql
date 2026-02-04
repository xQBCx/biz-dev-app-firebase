-- Create referrals table to track who brought whom to the platform
-- Referrer gets 2.5% of referee's lifetime revenue
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_earnings NUMERIC DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE
);

-- Create unique referral codes table for users
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_referrals INTEGER DEFAULT 0,
  total_lifetime_earnings NUMERIC DEFAULT 0
);

-- Enable RLS on both tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Referrals: Users can view referrals they made or received
CREATE POLICY "Users can view their referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Referrals: System can insert (handled via trigger/function)
CREATE POLICY "Allow referral creation" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referred_id);

-- Referral codes: Anyone can read codes (needed for signup lookup)
CREATE POLICY "Anyone can view referral codes" 
ON public.referral_codes 
FOR SELECT 
USING (true);

-- Referral codes: Users can manage their own code
CREATE POLICY "Users can manage their own referral code" 
ON public.referral_codes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add referral_code column to profiles for storing which code they used
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- Function to generate a unique referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a short alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert the new referral code
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, new_code);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-generate referral code when profile is created
CREATE TRIGGER create_referral_code_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();

-- Create index for faster lookups
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);