-- Create security definer function to check if user is admin
-- This bypasses RLS to prevent infinite recursion issues
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
    AND role = 'admin'::user_role
  );
$$;

-- Drop existing policies on merchants table
DROP POLICY IF EXISTS "Admins can insert merchants" ON public.merchants;
DROP POLICY IF EXISTS "Admins can update merchants" ON public.merchants;
DROP POLICY IF EXISTS "Admins can view all merchants" ON public.merchants;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can insert merchants"
ON public.merchants
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update merchants"
ON public.merchants
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all merchants"
ON public.merchants
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Also update payment_links policies to use the function
DROP POLICY IF EXISTS "Admins can view all payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Admins and merchants can create payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Admins and merchants can update their payment links" ON public.payment_links;

CREATE POLICY "Admins can view all payment links"
ON public.payment_links
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins and merchants can create payment links"
ON public.payment_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM merchants
    WHERE merchants.id = payment_links.merchant_id
    AND (merchants.user_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

CREATE POLICY "Admins and merchants can update their payment links"
ON public.payment_links
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM merchants
    WHERE merchants.id = payment_links.merchant_id
    AND (merchants.user_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

-- Update transactions policies
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.is_admin(auth.uid()));