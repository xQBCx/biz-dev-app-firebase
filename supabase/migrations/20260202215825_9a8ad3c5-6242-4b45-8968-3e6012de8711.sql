-- A) Backfill missing treasury accounts in xodiak_accounts
INSERT INTO public.xodiak_accounts (address, balance, account_type, metadata, created_at)
SELECT 
  t.xdk_address,
  t.balance,
  'treasury',
  jsonb_build_object('deal_room_id', t.deal_room_id),
  NOW()
FROM public.deal_room_xdk_treasury t
WHERE NOT EXISTS (
  SELECT 1 FROM public.xodiak_accounts a WHERE a.address = t.xdk_address
);

-- B) Create trigger function to keep treasury accounts in sync
CREATE OR REPLACE FUNCTION public.sync_treasury_to_xodiak_accounts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.xodiak_accounts (address, balance, account_type, metadata, created_at)
  VALUES (
    NEW.xdk_address,
    NEW.balance,
    'treasury',
    jsonb_build_object('deal_room_id', NEW.deal_room_id),
    NOW()
  )
  ON CONFLICT (address) DO UPDATE SET
    balance = EXCLUDED.balance,
    metadata = EXCLUDED.metadata;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on deal_room_xdk_treasury
DROP TRIGGER IF EXISTS sync_treasury_account_trigger ON public.deal_room_xdk_treasury;
CREATE TRIGGER sync_treasury_account_trigger
  AFTER INSERT OR UPDATE ON public.deal_room_xdk_treasury
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_treasury_to_xodiak_accounts();