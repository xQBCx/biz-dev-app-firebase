

# Fix: Peter Can't Withdraw XDK

## Root Cause

The `check-stripe-connect-status` backend function is **not deployed**. This is the function that the withdrawal panel calls on load to check if Peter has Stripe Connect set up. When it returns a 404 error, the withdrawal panel either:
- Falls back to showing "Manual Processing" mode (less likely to be the blocker)
- Causes a rendering issue that prevents the withdrawal form from working properly

Peter's data is fine:
- Balance: 564.80 XDK
- Stripe Connect: Fully set up and verified (account `acct_1Swccc...`, payouts enabled)
- Previous withdrawal (485.20 XDK): Still in "processing" status (not blocking)

## Fix

**Deploy the `check-stripe-connect-status` backend function.** The code already exists and is correct -- it just was never deployed (or became inactive). This single deployment will:

1. Allow the withdrawal panel to correctly detect Peter's Stripe Connect status
2. Show "Fast Payout (Stripe)" instead of "Manual Processing"
3. Enable the full withdrawal flow with automated Stripe payouts

No code changes are needed -- just a deployment.

## Technical Details

- Function location: `supabase/functions/check-stripe-connect-status/index.ts`
- The function queries Peter's `stripe_connect_account_id` from profiles, then verifies the account status with the Stripe API
- On success, it returns `{ connected: true, payouts_enabled: true }` which enables the withdrawal button with fast payout
- The `XdkWithdrawalPanel` component gracefully handles the error case (line 63: returns `{ connected: false, payouts_enabled: false }`), but the withdrawal itself should still work in manual mode -- so there may also be a browser-side error worth checking after deployment

