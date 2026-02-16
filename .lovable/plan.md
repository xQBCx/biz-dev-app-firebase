

## Fix: XDK Net-Minting Accuracy and Stripe Webhook Cleanup

### Problem Summary

Two issues discovered:

1. **Overminting Bug**: When you deposited $51.80, the system minted 51.80 XDK instead of ~50 XDK. The `escrow-verify-funding` function falls back to using the gross amount when Stripe's `balance_transaction` data isn't available yet (which is common for freshly completed payments). This means Stripe's processing fee (~$1.80) was never deducted before minting.

2. **Duplicate Webhook Destination**: You have two "Biz Dev App Webhook" endpoints in Stripe, each with a different signing secret. Only one can match the stored `STRIPE_WEBHOOK_SECRET`. The second (Thin payload) destination should be deleted — it will either fail signature verification or send incomplete payloads.

---

### Plan

#### Step 1: Fix the net-minting fallback in `escrow-verify-funding`

Currently (lines 83-86), when `balance_transaction` isn't available:
```text
netAmount = grossAmount;  // <-- BUG: mints full gross
```

**Change to**: Apply the estimated Stripe fee formula (2.9% + $0.30) as a fallback, then add retry logic to attempt fetching the real fee with a short delay.

```text
Approach:
1. First attempt: try to get balance_transaction (as today)
2. If unavailable: wait 2 seconds, retry once
3. If still unavailable: apply estimated fee (2.9% + $0.30)
4. Log which method was used for audit trail
```

This ensures XDK is always minted at net value, never gross.

#### Step 2: Correct the current treasury balance

Run a data correction to fix the overminted 1.80 XDK:
- Set `deal_room_xdk_treasury.balance` to `0` (since the 50 XDK transfer accounted for the true net value)
- Update the `deal_room_escrow.total_deposited` to reflect the net amount
- Create a corrective ledger entry documenting the adjustment

#### Step 3: Remove duplicate Stripe webhook destination

**Manual step for you in the Stripe Dashboard:**
- Delete **Destination 2 of 2** (the "Thin payload" / "Unversioned" one with 20 events)
- Keep **Destination 1 of 1** (the "Snapshot payload" / "2025-09-30.clover" one with 228 events)
- Verify the stored `STRIPE_WEBHOOK_SECRET` matches the signing secret of the remaining destination: `whsec_raGokdWGbgdDWa8kH8DKYnrnMaMIqtWr`

#### Step 4: Sync the `STRIPE_WEBHOOK_SECRET` value

Prompt you to re-enter the signing secret from the remaining Snapshot destination to ensure it matches exactly.

---

### Technical Details

**Files modified:**
- `supabase/functions/escrow-verify-funding/index.ts` — Add retry logic + estimated fee fallback

**Data corrections (via SQL):**
- Zero out the 1.80 XDK phantom balance in `deal_room_xdk_treasury`
- Adjust `deal_room_escrow.total_deposited` by -1.80
- Insert a corrective `xodiak_transactions` record (type: `fee_correction`) for audit

**Manual steps (you):**
- Delete the Thin payload webhook destination in Stripe Dashboard
- Confirm/re-enter the webhook signing secret when prompted

