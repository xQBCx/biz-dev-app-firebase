
# Fix XDK Attribution & Fee Recording Issues

## Problem Summary

Two issues are affecting the Deal Room's Financial Rails:

1. **"Unknown" Attribution**: Your funding deposits show "Unknown deposited..." instead of "Bill Mercer deposited..."
2. **Missing Fee Data**: Stripe processing fees aren't being captured properly, showing $0 fees

## Root Cause Analysis

### Attribution Bug
The `escrow-verify-funding` edge function queries the wrong column:
- **Line 392-395**: Queries for `full_name, company` 
- **Problem**: The `profiles` table has NO `company` column
- **Result**: Database query fails silently, returning null, defaulting to "Unknown"

### Fee Recording Gap
The Stripe balance_transaction (which contains actual fees) isn't always available immediately after payment. The function falls back to using gross amount as net, recording $0 fees.

## Solution

### Part 1: Fix Profile Query (Attribution)
Update the edge function to query only existing columns and use email as fallback:

```typescript
// Before (broken)
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, company")
  .eq("id", userId)
  .single();

const sourceName = userProfile?.company || userProfile?.full_name || "Unknown";

// After (fixed)
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, email")
  .eq("id", userId)
  .single();

const sourceName = userProfile?.full_name || userProfile?.email || "Unknown";
```

### Part 2: Correct Historical Data
Update existing value ledger entries to reflect proper attribution:
- Set `source_entity_name` = "Bill Mercer" for entries with your user ID
- Update narratives to replace "Unknown" with "Bill Mercer"

### Part 3: Ensure Fee Transparency
The fee calculation logic is correct but needs better handling when balance_transaction is delayed. Consider a webhook-based approach for final verification.

## Implementation Steps

1. **Edge Function Update**
   - Fix profile query to use existing columns (`full_name`, `email`)
   - Remove reference to non-existent `company` column
   - Improve source name resolution logic

2. **Database Correction**
   - Update value_ledger_entries for deal room `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Set proper attribution to "Bill Mercer" 
   - Recalculate narratives with correct name

3. **Deploy & Verify**
   - Deploy updated edge function
   - Confirm attribution displays correctly in Financial Rails tab
   - Future deposits will properly credit your XDK wallet

## Technical Details

### Files to Modify
- `supabase/functions/escrow-verify-funding/index.ts` - Fix profile query and source name logic

### Database Updates Required
```sql
UPDATE value_ledger_entries 
SET 
  source_entity_name = 'Bill Mercer',
  narrative = REPLACE(narrative, 'Unknown deposited', 'Bill Mercer deposited')
WHERE 
  deal_room_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND source_user_id = 'b8c5a162-5141-422e-9924-dc0e8c333790'
  AND source_entity_name = 'Unknown';
```

### Regarding XDK Balance
Your current **582.28 XDK = $582.28 USD** is correct. This represents:
- Total gross deposits: ~$600
- Stripe fees deducted: ~$17.72
- Net available for payouts: $582.28

This is precisely what Peter will receive (less any additional withdrawal fees if using instant payout).

## Expected Outcome

After implementation:
- Financial Rails will show "Bill Mercer deposited $515.24..." instead of "Unknown"
- Your contribution credits will properly sync with the settlement system
- Future deposits will automatically attribute to your profile
- XDK balance remains accurate at 582.28 (net of fees)
