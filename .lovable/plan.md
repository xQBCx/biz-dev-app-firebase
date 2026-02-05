
# Fix Withdrawal Processing - Auto-Payout Implementation

## Problem Summary

Peter requested a withdrawal of 485.20 XDK ($485.20 USD) but the funds were never transferred to his bank account. The current system has a **two-step manual process**:

1. `xdk-withdraw` - Creates request and debits XDK balance (✓ completed)
2. `process-stripe-payout` - Transfers USD to connected account (❌ never called)

The $1,059.41 in your Stripe dashboard is the platform's total revenue, not Peter's pending withdrawal.

## Root Cause

The withdrawal flow requires **manual admin action** to trigger the payout function. There's no automation connecting step 1 to step 2.

## Solution: Automated Payout Processing

### Part 1: Immediate Fix - Process Peter's Pending Withdrawal

Manually trigger the payout for Peter's existing withdrawal request:
- Withdrawal ID: `90e74f0f-f747-416b-85cf-4f8ac54de387`
- Amount: $485.20 USD
- Destination: `acct_1SwcccI0WdeAzbzE` (Peter's Stripe Connect)

### Part 2: Automation - Auto-Process Stripe Connect Withdrawals

Modify `xdk-withdraw` to automatically call `process-stripe-payout` when:
- User has `stripe_connect_payouts_enabled = true`
- Withdrawal method is `stripe_connect`

This eliminates the need for manual admin intervention for Stripe Connect users.

## Implementation Steps

### Step 1: Process Peter's Pending Withdrawal Now

Call the `process-stripe-payout` edge function with Peter's withdrawal request ID to initiate the Stripe transfer immediately.

### Step 2: Update xdk-withdraw Function

Add auto-processing logic after creating the withdrawal request:

```typescript
// After creating withdrawal request...
if (withdrawal_method === 'stripe_connect') {
  // Check if user has Stripe Connect enabled
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
    .eq("id", userId)
    .single();

  if (profile?.stripe_connect_payouts_enabled) {
    // Auto-process the payout
    const payoutResponse = await fetch(
      `${supabaseUrl}/functions/v1/process-stripe-payout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ withdrawal_request_id: withdrawal.id })
      }
    );
    
    const payoutResult = await payoutResponse.json();
    // Update response with payout status
  }
}
```

### Step 3: Add Admin Withdrawal Dashboard

Create an admin interface to:
- View all pending withdrawals
- Manually process withdrawals for non-Stripe-Connect users
- Track payout status and history

## Technical Details

### Files to Modify
- `supabase/functions/xdk-withdraw/index.ts` - Add auto-processing for Stripe Connect users

### Files to Create (Optional)
- `src/components/admin/WithdrawalManagement.tsx` - Admin dashboard for manual payouts

### Database Updates
None required - existing schema supports this flow

## Expected Outcome

1. **Immediate**: Peter receives $485.20 in his connected bank account (1-2 business days after transfer)
2. **Future**: All Stripe Connect withdrawals process automatically
3. **Fallback**: Manual withdrawals still work via admin dashboard

## Money Flow Clarification

After processing Peter's withdrawal:
- Platform Stripe Balance: ~$574.21 ($1,059.41 - $485.20)
- Peter's Bank: +$485.20 (via Stripe Connect transfer)
- Deal Room XDK Treasury: Reduced by 485.20 XDK (already happened)
