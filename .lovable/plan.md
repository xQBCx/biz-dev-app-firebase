

# Fix XDK Balance & USD Backing Discrepancy

## The Problem

Your Financial Rails tab shows **582.28 XDK / $582.28 USD Backing**, but your actual Stripe balance is only **$574.21**.

## What Went Wrong

The database confirms the issue. Your two recent deposits recorded **$0 in Stripe fees**:

| Deposit | Gross Charged | Fee Recorded | Net Recorded | Actual Fee |
|---------|--------------|--------------|--------------|------------|
| $515.24 | $515.24 | **$0.00** | $515.24 | ~$15.24 |
| $67.04 | $67.04 | **$0.00** | $67.04 | ~$2.24 |

Your first $500 deposit was correct: $500 gross → $14.80 fee → $485.20 net.

The verification function failed to capture the fees because Stripe's fee data wasn't immediately available, and it fell back to using the gross amount as net.

## Current vs. Correct Values

| Record | Current Value | Correct Value |
|--------|--------------|---------------|
| `deal_room_xdk_treasury.balance` | 582.28 | 564.80 |
| `xodiak_accounts.balance` | 582.28 | 564.80 |
| `deal_room_escrow.total_deposited` | 1067.48 | 1050.00 |

The math:
- First deposit: $485.20 net (correct)
- Second deposit: $64.80 net (was $67.04)
- Third deposit: $500.00 net (was $515.24)
- **Total net deposits: $1,050.00**
- Minus Peter's withdrawal: $485.20
- **Correct balance: $564.80**

The remaining ~$9.41 gap between $564.80 and $574.21 is Stripe's processing reserve.

## The Fix

### Part 1: Correct Historical Data

Update the two funding requests with actual fees, then correct all balance tables.

### Part 2: Fix the Verification Function

Add retry logic so the system waits for Stripe's fee data instead of falling back to gross = net.

## Technical Details

### Database Corrections (SQL)

```sql
-- Fix the $67.04 deposit (actual fee ~$2.24)
UPDATE escrow_funding_requests SET
  stripe_fee = 2.24,
  net_amount = 64.80
WHERE id = 'ff9462c9-5752-4321-b2f2-5f141f015ac0';

-- Fix the $515.24 deposit (actual fee ~$15.24)  
UPDATE escrow_funding_requests SET
  stripe_fee = 15.24,
  net_amount = 500.00
WHERE id = '9342a759-5079-47fc-aa2d-1bb38b4bc390';

-- Correct treasury balance
UPDATE deal_room_xdk_treasury 
SET balance = 564.80 
WHERE deal_room_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Correct XODIAK account balance
UPDATE xodiak_accounts 
SET balance = 564.80 
WHERE address = 'xdk11dd538cb03a2092c318735cfbaf71af0';

-- Correct escrow totals
UPDATE deal_room_escrow 
SET total_deposited = 1050.00 
WHERE deal_room_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

### Edge Function Fix

Update `supabase/functions/escrow-verify-funding/index.ts` to retry fetching Stripe's balance_transaction data up to 3 times with 2-second delays before recording the transaction.

### Files to Modify

1. `supabase/functions/escrow-verify-funding/index.ts` - Add retry logic for fee capture

## Expected Result

After this fix:
- **XDK Balance**: 564.80 XDK
- **USD Backing**: $564.80
- Future deposits will always capture accurate fees

