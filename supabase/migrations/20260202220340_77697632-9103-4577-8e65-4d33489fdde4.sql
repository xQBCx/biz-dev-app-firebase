-- Create increment_xdk_balance function to atomically update wallet balances
CREATE OR REPLACE FUNCTION public.increment_xdk_balance(p_address TEXT, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.xodiak_accounts
  SET balance = balance + p_amount
  WHERE address = p_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;