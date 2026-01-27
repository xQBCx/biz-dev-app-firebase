
# Plan: Enable Peter to Withdraw $500 Retainer from Deal Room

## Current Situation

The escrow system is funded and working, but the final "off-ramp" for Peter to actually receive his money is not yet built. Here's what exists vs. what's missing:

| What Exists | What's Missing |
|-------------|----------------|
| Escrow with $500 deposited | Retainer settlement contract for Peter |
| XDK Treasury with 500 XDK | Peter's XDK wallet (not created yet) |
| Settlement execution engine | XDK → USD withdrawal edge function |
| `xdk_withdrawal_requests` table | Withdrawal request UI for partners |

## Complete Flow That Needs to Work

```text
+-----------------+     +------------------+     +----------------+     +-------------------+
| Fund Escrow     | --> | Execute Retainer | --> | Credit Peter's | --> | Peter Withdraws   |
| (Already Done)  |     | Settlement       |     | XDK Wallet     |     | XDK to Bank (USD) |
+-----------------+     +------------------+     +----------------+     +-------------------+
     ✅ Done              ❌ No Contract        ❌ No Wallet        ❌ No Withdrawal System
```

## Implementation Plan

### Phase 1: Set Up Peter's XDK Wallet (Quick - Already Possible)

Peter can do this today by:
1. Going to The View Pro Strategic Partnership deal room
2. Finding the Participants section (or a dedicated wallet setup area)
3. Clicking "Create Platform Wallet" via the existing `PartnerWalletSetup` component

**Issue:** The wallet setup may not be easily accessible. Need to verify if partners can find and use it.

**Solution:** Add a clear "Set Up Your Wallet" CTA in the Partner's view of the Deal Room.

### Phase 2: Create Retainer Settlement Contract (Admin Action)

You need to create a settlement contract that pays Peter $500 monthly:
1. Go to The View Pro deal room → Financial Rails tab
2. Use the Retainer Management Panel or Settlement Contract Builder
3. Create contract with:
   - Name: "OptimoIT Monthly Retainer"
   - Amount: $500
   - Recipient: Peter's participant ID
   - Trigger: Monthly (time-based)
   - Priority: 1 (highest)

**Technical Fix Needed:** The current `RetainerManagementPanel` creates contracts but doesn't specify which participant receives the payout. Need to add recipient selection.

### Phase 3: Build XDK Withdrawal System (New Development)

This is the main work - enabling partners to convert XDK to USD:

**A. Create `xdk-withdraw` Edge Function**
```text
supabase/functions/xdk-withdraw/index.ts
```

Function will:
1. Validate user owns the XDK account
2. Check sufficient balance
3. Verify connected bank account (via Stripe Connect or stored details)
4. Create `xdk_withdrawal_requests` record
5. Debit XDK account balance
6. Queue Stripe payout (or manual processing initially)

**B. Create Partner Withdrawal UI Component**
```text
src/components/dealroom/XdkWithdrawalPanel.tsx
```

Component will show:
- Current XDK balance
- "Withdraw to Bank" button
- Withdrawal amount input
- Connected bank account (or prompt to connect)
- Pending/completed withdrawal history

**C. Add Bank Account Connection Flow**

Options for off-ramp:
1. **Stripe Connect** (Recommended) - Partners connect their bank via Stripe
2. **Manual Payout** - Admin manually processes withdrawals via Zelle/ACH
3. **Coinbase Commerce** - Convert XDK to USD via crypto exchange (future)

For MVP, I recommend **Stripe Connect Express** because:
- Partners enter their own bank details securely
- Stripe handles compliance/verification
- Payouts are automatic and trackable
- Already have Stripe integration

### Phase 4: Integrate Withdrawal into Partner View

Add the withdrawal panel to places partners can access:
- Deal Room → Financial Rails tab (for participants)
- Partner Portal → My Earnings section
- XodiakWallet component → Add "Withdraw to Bank" tab

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/xdk-withdraw/index.ts` | Create | Edge function to process withdrawal requests |
| `src/components/dealroom/XdkWithdrawalPanel.tsx` | Create | UI for partners to request withdrawals |
| `src/components/dealroom/PartnerEarningsView.tsx` | Create | Consolidated view of earnings + withdrawal |
| `src/components/dealroom/RetainerManagementPanel.tsx` | Modify | Add recipient participant selector |
| `src/pages/DealRoomDetail.tsx` | Modify | Add withdrawal panel for non-admin participants |
| `supabase/functions/stripe-connect-onboard/index.ts` | Create | Stripe Connect Express onboarding for partners |

## Recommended Execution Order

**Immediate (Today):**
1. Help Peter create his XDK wallet manually
2. Create the $500 retainer settlement contract via the existing UI
3. Execute the first payout to credit Peter's XDK wallet

**This Week:**
1. Build `XdkWithdrawalPanel` with manual withdrawal request (admin processes)
2. Update `RetainerManagementPanel` to select payout recipient
3. Add withdrawal UI to Deal Room for participants

**Next Week:**
1. Implement Stripe Connect Express for automated bank payouts
2. Build `xdk-withdraw` edge function with Stripe payout integration
3. Add withdrawal history and status tracking

## Technical Details

### XDK Withdrawal Edge Function Structure

```text
POST /xdk-withdraw
{
  "amount": 500,
  "withdrawal_method": "stripe_connect" | "manual",
  "bank_account_id": "ba_xxx" (optional for Stripe)
}

Response:
{
  "withdrawal_id": "uuid",
  "xdk_amount": 500,
  "usd_amount": 500,
  "exchange_rate": 1.0,
  "status": "pending" | "processing" | "completed",
  "estimated_arrival": "2-3 business days"
}
```

### Database Updates Needed

No new tables required - `xdk_withdrawal_requests` already exists with:
- `user_id`, `xdk_amount`, `usd_amount`, `exchange_rate`
- `withdrawal_method`, `status`, `stripe_payout_id`
- `bank_account_last4`, `processed_at`

### Stripe Connect Express Flow

1. Partner clicks "Connect Bank Account"
2. Redirect to Stripe Connect onboarding
3. Stripe verifies identity and bank details
4. Store connected account ID in `profiles` or new table
5. When withdrawing, use connected account for payout

## Summary

Peter's path to getting his $500:
1. **Create XDK wallet** → Can do now with existing UI
2. **Settlement contract pays him** → Needs recipient selection fix
3. **Withdraw XDK to USD** → Needs new withdrawal system built

The MVP approach: Build manual withdrawal requests first (you approve and process via Zelle/Stripe dashboard), then automate with Stripe Connect.
