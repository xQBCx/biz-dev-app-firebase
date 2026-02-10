

# Fix: Peter Still Can't Withdraw XDK

## Diagnosis

After analyzing the edge function logs, database state, and code:

- **Peter's data is correct**: 564.80 XDK balance, Stripe Connect fully linked (acct_1SwcccI0WdeAzbzE, payouts enabled)
- **Zero function calls in logs**: No calls to `check-stripe-connect-status`, `xdk-withdraw`, or `process-stripe-payout` have been made recently -- meaning Peter's browser is not successfully invoking the backend functions at all
- **Functions are deployed and responding**: Both `check-stripe-connect-status` and `xdk-withdraw` return proper auth errors when called without credentials (400 and 401 respectively), confirming they're live

## Root Cause

Two issues need to be fixed:

### 1. Missing config.toml entries
The `check-stripe-connect-status` and `process-stripe-payout` functions are **not listed in `config.toml`**. While they default to `verify_jwt = true` (which should work), explicitly declaring them ensures consistent deployment behavior and prevents edge cases where the gateway may not route to them properly.

### 2. The `xdk-withdraw` function has `verify_jwt = true` AND does manual auth
When `verify_jwt = true`, the Supabase gateway validates the JWT before the function code runs. The function then re-validates the JWT internally. This double-validation can cause issues if the gateway rejects a slightly stale token that the function code would accept. Setting `verify_jwt = false` and letting the function handle its own auth (which it already does robustly) is the safer pattern -- and matches how similar functions like `create-escrow-payment-intent` are configured.

## Changes

### 1. Update `supabase/config.toml`
Add missing function entries and set `verify_jwt = false` for functions that handle their own authentication:

```toml
[functions.check-stripe-connect-status]
verify_jwt = false

[functions.process-stripe-payout]
verify_jwt = false

[functions.xdk-withdraw]
verify_jwt = false
```

- `check-stripe-connect-status`: Already validates auth internally (lines 30-41)
- `xdk-withdraw`: Already validates auth internally (lines 32-43)
- `process-stripe-payout`: Called server-to-server with service role key, needs to bypass JWT gate

### 2. Redeploy all three functions
After the config change, deploy `check-stripe-connect-status`, `xdk-withdraw`, and `process-stripe-payout` to ensure the new routing config takes effect.

### 3. Verify end-to-end
Test each function endpoint to confirm they're reachable and returning proper responses.

## Expected Result
After these changes, Peter will be able to:
1. Load the withdrawal panel (which calls `check-stripe-connect-status` to detect his Stripe Connect status)
2. See "Fast Payout (Stripe)" instead of "Manual Processing"
3. Submit a withdrawal that auto-triggers `process-stripe-payout` for immediate bank transfer

