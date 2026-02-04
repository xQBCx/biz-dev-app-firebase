-- Fix the check_escrow_kill_switch trigger function to use correct column names
CREATE OR REPLACE FUNCTION public.check_escrow_kill_switch()
RETURNS TRIGGER AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Calculate current balance (deposited - released)
  current_balance := COALESCE(NEW.total_deposited, 0) - COALESCE(NEW.total_released, 0);
  
  -- Check if balance dropped below threshold
  IF current_balance < NEW.minimum_balance_threshold AND NEW.minimum_balance_threshold > 0 THEN
    NEW.workflows_paused := true;
    NEW.paused_reason := 'Escrow balance dropped below minimum threshold of $' || NEW.minimum_balance_threshold;
    NEW.paused_at := now();
  END IF;
  
  -- Check if balance recovered
  IF current_balance >= NEW.minimum_balance_threshold AND OLD.workflows_paused = true THEN
    NEW.workflows_paused := false;
    NEW.paused_reason := null;
    NEW.paused_at := null;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;