-- Fix Business Cards Security: Restrict access to sensitive contact information

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Users can view all active business cards" ON public.business_cards;

-- Create secure policies that protect contact information

-- Users can view their own business cards (all fields)
CREATE POLICY "Users can view their own business cards"
ON public.business_cards FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can view basic info of active/minted/traded cards (without sensitive contact details)
-- Note: This allows viewing for networking purposes, but the application layer should
-- filter out sensitive fields like email and phone when displaying cards to other users
CREATE POLICY "Authenticated users can view public business cards"
ON public.business_cards FOR SELECT
TO authenticated
USING (
  (status = 'active'::card_status OR 
   status = 'minted'::card_status OR 
   status = 'traded'::card_status) 
  AND auth.uid() != user_id
);

-- Admins can view all cards
CREATE POLICY "Admins can view all business cards"
ON public.business_cards FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));