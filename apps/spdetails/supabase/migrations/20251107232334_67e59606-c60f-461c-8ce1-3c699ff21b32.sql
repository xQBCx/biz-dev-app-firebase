-- Fix Security Issue: Remove NULL user_id fallback from bookings SELECT policy
-- This prevents potential unauthorized access to bookings without a user_id

DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;

CREATE POLICY "Customers can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Fix Security Issue: Restrict transaction insertions to service role only
-- Remove the overly permissive "System can insert transactions" policy

DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;

-- Only allow inserts from authenticated service role (edge functions)
CREATE POLICY "Service role can insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');