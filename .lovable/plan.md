

# Fix Plan: Stripe Fee Reconciliation + Correct Balance Display

## Summary of What Actually Happened

### The $10 Payment Investigation Results

I verified the Stripe records directly:

| PaymentIntent ID | Amount | Status | Deal Room |
|:---|:---|:---|:---|
| `pi_3SwQXdIJlRmmBH2K10rIFjrH` | $10.00 | **succeeded** | Test Deal |
| `pi_3SwQVqIJlRmmBH2K0LA2c0hp` | $10.00 | **requires_payment_method** | Test Deal |

**Good news**: You only made **ONE successful $10 payment**. The second PaymentIntent (`pi_3SwQVq...`) never completed - it has status `requires_payment_method`, meaning the user started checkout but didn't finish entering payment details.

**What went wrong**: During my previous "data fix," I found two records in `escrow_funding_requests` and incorrectly marked BOTH as completed, minting 20 XDK instead of 10 XDK.

### The $500 vs $485.20 Discrepancy

Your Stripe dashboard shows $485.20 because Stripe takes processing fees (~2.9% + $0.30 per transaction). The platform was crediting the **gross amount** ($500) instead of the **net amount** ($485.20).

---

## Fixes To Implement

### Part 1: Correct the Test Deal Treasury Balance

**Database Corrections Needed:**
1. Update `deal_room_xdk_treasury` balance from 20 to 9.41 XDK (net of $10 minus ~$0.59 fee)
2. Delete or void the duplicate `escrow_funding_request` record for the failed PaymentIntent
3. Update the `escrow_transactions` and `value_ledger_entries` to reflect accurate amounts

### Part 2: Fix Balance Display (Gross + Fees + Net)

Per your selection, the UI will show three values:
- **Gross Amount**: What the customer paid ($10.00)
- **Processing Fee**: Stripe's cut (~$0.59)
- **Net Amount**: What's actually available ($9.41)

**Files to Update:**
- `src/components/deal-room/FinancialRailsTab.tsx` - Add fee breakdown display
- `src/components/dealroom/EscrowDashboard.tsx` - Show gross/fees/net in balance cards
- `src/components/dealroom/FundEscrowDialog.tsx` - Warn users about ~3% processing fee upfront

### Part 3: Fix XDK Minting to Use Net Amount

The verification function will now:
1. Retrieve the PaymentIntent's `latest_charge` with `balance_transaction` expanded
2. Extract the `net` and `fee` amounts from the balance transaction
3. Mint XDK based on the **net** amount only
4. Store fee data for display/reporting

**Files to Update:**
- `supabase/functions/escrow-verify-funding/index.ts` - Use Stripe's balance_transaction.net
- `supabase/functions/fund-contribution-webhook/index.ts` - Same fix for fund contributions

---

## Technical Implementation Details

### Schema Changes Needed

Add columns to track fee data:

```sql
-- Add fee tracking columns to escrow_funding_requests
ALTER TABLE escrow_funding_requests ADD COLUMN IF NOT EXISTS gross_amount numeric;
ALTER TABLE escrow_funding_requests ADD COLUMN IF NOT EXISTS stripe_fee numeric;
ALTER TABLE escrow_funding_requests ADD COLUMN IF NOT EXISTS net_amount numeric;

-- Add to value_ledger_entries for reporting
ALTER TABLE value_ledger_entries ADD COLUMN IF NOT EXISTS processing_fee numeric;
ALTER TABLE value_ledger_entries ADD COLUMN IF NOT EXISTS gross_amount numeric;
```

### Edge Function: Retrieve Net Amount from Stripe

```typescript
// In escrow-verify-funding/index.ts

// Retrieve PaymentIntent with balance transaction expanded
const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
  expand: ['latest_charge.balance_transaction']
});

// Extract fee details
const charge = paymentIntent.latest_charge as Stripe.Charge;
const balanceTx = charge?.balance_transaction as Stripe.BalanceTransaction;

const grossAmount = paymentIntent.amount / 100;
const stripeFee = balanceTx?.fee ? balanceTx.fee / 100 : 0;
const netAmount = balanceTx?.net ? balanceTx.net / 100 : grossAmount;

// Mint XDK based on NET amount only
const xdkAmount = netAmount * rate;
```

### UI: Fee Transparency

The Treasury Balance section will show:

```text
+------------------------------------------+
| Treasury Balance                         |
|------------------------------------------|
| Gross Deposits:     $500.00              |
| Processing Fees:    -$14.80              |
| Net Available:      $485.20              |
|------------------------------------------|
| XDK Treasury:       485.20 XDK           |
+------------------------------------------+
```

---

## Data Correction Summary

For "Test Deal" room (`1bf494eb-ccfc-4e7d-b000-f6f380f82882`):

| Current Value | Corrected Value | Reason |
|:---|:---|:---|
| Treasury Balance: 20 XDK | 9.41 XDK | One $10 payment minus ~$0.59 fee |
| 2 completed funding requests | 1 completed | Second PaymentIntent never succeeded |

For "The View Pro Strategic Partnership" room:
- Will audit and correct based on actual successful PaymentIntents

---

## Expected Outcome

After these fixes:
1. Balances will match Stripe's "Net Volume" exactly
2. Users see transparent fee breakdowns before and after payment
3. XDK minted = actual USD received (net of fees)
4. No more phantom transactions from failed PaymentIntents
5. Full audit trail of gross/fee/net for tax and accounting purposes

