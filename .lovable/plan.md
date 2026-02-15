

## Fix the XDK Withdrawal Pipeline — End-to-End

### Problem Summary
Peter's $564.80 withdrawal (Feb 10) is stuck at `pending` — his XDK was debited but the Stripe transfer was never created. His earlier $485.20 transfer is stuck at `processing` since Feb 5 despite having a Stripe transfer ID.

### Root Causes

1. **Wrong column name in `xdk-withdraw`** — Line 130 writes to `metadata` but the `xodiak_transactions` table uses `data` (jsonb). The insert silently fails, breaking the audit trail.
2. **No retry/recovery for failed auto-payout** — If the internal call to `process-stripe-payout` times out or errors, the withdrawal sits at `pending` forever with no admin visibility or retry path.
3. **Transfer webhook gap** — The $485.20 transfer (`tr_1SxYTtIJlRmmBH2KKrsFR5cC`) was never marked `completed`, meaning the `stripe-transfer-webhook` isn't receiving or processing `transfer.paid` events.

### Fix Plan

#### 1. Fix `xdk-withdraw/index.ts` — Column Name Bug
- Change `metadata` to `data` in the `xodiak_transactions` insert (line 138)
- This ensures the transaction record actually gets created with the `withdrawal_request_id` reference

#### 2. Fix `xdk-withdraw/index.ts` — Add Error Visibility
- When the auto-payout call fails, write the error to `xdk_withdrawal_requests.payout_error` so admins can see why it failed instead of silent swallowing
- Log the full response body on failure, not just a generic message

#### 3. Fix the Stuck $564.80 Withdrawal — Manual Trigger
- After deploying the fix, manually trigger `process-stripe-payout` for withdrawal `69589a11-6c9a-4746-869f-f5621bb419a3` to create the Stripe transfer
- This will move Peter's money to his Stripe Connect account (`acct_1SwcccI0WdeAzbzE`)

#### 4. Fix the Stuck $485.20 Withdrawal — Status Sync
- Query Stripe for transfer `tr_1SxYTtIJlRmmBH2KKrsFR5cC` status
- Update the withdrawal request to `completed` if the transfer already landed
- If not, investigate the Stripe Connect account status

#### 5. Add a "Retry Payout" Admin Action
- Ensure the existing UI "Retry Payout" button actually calls `process-stripe-payout` for stuck `pending` withdrawals (verify the frontend wiring)

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/xdk-withdraw/index.ts` | Fix `metadata` -> `data` column name; add error writing to `payout_error` on failure |
| Manual action post-deploy | Trigger `process-stripe-payout` for withdrawal `69589a11` |
| Manual action post-deploy | Check Stripe transfer `tr_1SxYTtIJlRmmBH2KKrsFR5cC` and sync status |

### Technical Details

**xdk-withdraw fix (line 138):**
```
// BEFORE (broken):
metadata: { withdrawal_request_id: withdrawal.id, ... }

// AFTER (correct):
data: { withdrawal_request_id: withdrawal.id, ... }
```

**Error visibility fix (after line 200):**
```typescript
if (!payoutResult.success) {
  await supabase
    .from("xdk_withdrawal_requests")
    .update({ payout_error: payoutResult.error || "Auto-payout failed" })
    .eq("id", withdrawal.id);
}
```

**Post-deploy manual trigger:**
Call `process-stripe-payout` with `{ "withdrawal_request_id": "69589a11-6c9a-4746-869f-f5621bb419a3" }` to push the $564.80 to Peter's connected account.

### What This Means for Peter
Once deployed and triggered, his $564.80 will transfer to his Stripe Connect account and arrive in his bank in 1-2 business days. The $485.20 status will also be resolved.
