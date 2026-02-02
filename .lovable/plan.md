

# Fix Financial Rails Data Issues & Comprehensive Testing Plan

## Executive Summary

Multiple critical data and display issues exist in the Financial Rails tab that need to be corrected. This plan addresses wrong entity names, incorrect monetary calculations, a broken Flow Diagram, and inadequate Raw Data display.

---

## Issues Identified

### Issue 1: Wrong Name - "Peter Amici" vs "Peter Holcomb"
**Root Cause**: The `value_ledger_entries` record backfilled earlier incorrectly used "Peter Amici" instead of "Peter Holcomb" in the `destination_entity_name` field.

**Database Evidence**:
- Profile table shows: `Peter Holcomb` (email: peter@optimoit.io, id: 054ad970-...)
- Value ledger entry incorrectly shows: `destination_entity_name: "Peter Amici"`

### Issue 2: USD Backing Shows $500 When Treasury is Empty
**Root Cause**: The `deal_room_escrow.total_deposited` is still 500, but `total_released` is 0. The escrow balance calculation is:
```
escrowBalance = total_deposited - total_released = 500 - 0 = 500
```

However, the XDK was transferred OUT of the treasury (485.20 XDK to Peter), so the USD backing should reflect:
- Either decrease the backing to match treasury balance (0)
- Or update `total_released` to reflect funds distributed

**Issue**: The escrow release was never recorded when the XDK transfer happened.

### Issue 3: $500 vs $485.20 Stripe Fee Discrepancy
**Root Cause**: The escrow funding request shows:
- `gross_amount: 500`
- `stripe_fee: 14.80`  
- `net_amount: 485.20`

But the `deal_room_escrow.total_deposited` is set to gross ($500) instead of net ($485.20), violating the net-minting reconciliation policy.

### Issue 4: Flow Diagram is "Fucked Up"
**Root Cause**: The Sankey diagram uses `entry.amount` (which is $0.00 for XDK transfers since it's in USD) to calculate flow values. With zero values, the links are invisible.

**Code Location**: `LedgerFlowDiagram.tsx` line 36:
```typescript
flowMap.set(flowKey, currentFlow + Number(entry.amount));
```

Should use `xdk_amount` when `amount` is zero.

### Issue 5: Raw Data is "Worthless" 
**Root Cause**: The Raw Data tab only shows `value_ledger_entries` JSON, not the actual blockchain transaction data from `xodiak_transactions`. Users expect to see the blockchain events with `tx_hash`, `from_address`, `to_address`, `signature`, etc.

---

## Proposed Fixes

### Fix 1: Correct Peter's Name in Database

**Action**: SQL UPDATE to fix the name
```sql
UPDATE public.value_ledger_entries 
SET 
  destination_entity_name = 'Peter Holcomb',
  narrative = REPLACE(narrative, 'Peter Amici', 'Peter Holcomb')
WHERE destination_user_id = '054ad970-35f5-4183-96a6-eef6a3c8ff8b'
  AND destination_entity_name = 'Peter Amici';
```

### Fix 2: Correct Escrow Balance to Reflect Distribution

**Action**: Update `deal_room_escrow` to mark the funds as released
```sql
UPDATE public.deal_room_escrow 
SET 
  total_deposited = 485.20,  -- Use NET amount per reconciliation policy
  total_released = 485.20,   -- Mark as fully distributed
  updated_at = NOW()
WHERE deal_room_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

This fixes:
- USD Backing will show $0 (485.20 - 485.20 = 0)
- Aligns with net-minting policy

### Fix 3: Fix Flow Diagram to Use XDK Amount

**File**: `src/components/ledger/LedgerFlowDiagram.tsx`

**Change**: Use `xdk_amount` when `amount` is zero
```typescript
entries.forEach((entry) => {
  const source = entry.source_entity_name || "Unknown";
  const destination = entry.destination_entity_name || "Treasury";
  
  entitySet.add(source);
  entitySet.add(destination);

  const flowKey = `${source}|${destination}`;
  const currentFlow = flowMap.get(flowKey) || 0;
  // Use xdk_amount if amount is zero (for XDK-only transfers)
  const flowValue = Number(entry.amount) || Number(entry.xdk_amount) || 0;
  flowMap.set(flowKey, currentFlow + flowValue);
});
```

### Fix 4: Enhance Raw Data to Show Blockchain Events

**File**: `src/components/ledger/LedgerRawData.tsx`

**Change**: Add a toggle to show XODIAK blockchain transactions alongside ledger entries. Fetch from `xodiak_transactions` table and display:
- `tx_hash`
- `from_address` / `to_address`
- `amount`
- `signature`
- `status`
- Full JSON data

Create a tabbed interface within Raw Data:
- **Ledger Entries** tab (current)
- **Blockchain Events** tab (new - shows xodiak_transactions)

### Fix 5: Add Escrow Release Record for the XDK Transfer

When XDK is transferred from treasury, a corresponding escrow release record should be created to keep the systems synchronized.

**Action**: Insert escrow transaction record
```sql
INSERT INTO public.escrow_transactions (
  escrow_id, transaction_type, amount, currency, status,
  participant_id, metadata, created_at
) VALUES (
  '0aa3fdd5-9c78-4820-9159-7f47338587ca',
  'release',
  485.20,
  'USD',
  'confirmed',
  '054ad970-35f5-4183-96a6-eef6a3c8ff8b',
  '{"linked_xdk_tx": "0xc318b1b5a4004c57a635974b3d801850", "purpose": "Optimo IT January Invoice", "backfill": true}'::jsonb,
  '2026-02-02 22:02:27+00'
);
```

---

## Technical Implementation Details

### Database Changes
1. UPDATE `value_ledger_entries` - fix Peter's name
2. UPDATE `deal_room_escrow` - correct balances to NET amount
3. INSERT `escrow_transactions` - add release record for audit trail

### Code Changes
1. **LedgerFlowDiagram.tsx** - Use `xdk_amount` fallback for flow calculations
2. **LedgerRawData.tsx** - Add blockchain events tab with xodiak_transactions data
3. **FinancialRailsTab.tsx** - Pass blockchain transactions to LedgerRawData

### Edge Function Changes
4. **xdk-internal-transfer/index.ts** - Automatically create escrow release record when transferring XDK (prevents future sync issues)

---

## Testing Requirements

### Test 1: The View Pro Strategic Partnership Deal Room
- Verify Peter Holcomb name displays correctly everywhere
- Verify XDK Balance shows 0.00 XDK (treasury is empty)
- Verify USD Backing shows $0.00 (funds fully released)
- Verify Total Released shows $485.20
- Verify Flow Diagram renders with visible flow line (485.20)
- Verify Raw Data shows blockchain transaction details
- Test Fund button works
- Test Request button works
- Test Transfer button is disabled (zero balance)
- Verify Timeline shows correct narrative with "Peter Holcomb"

### Test 2: New Deal Room Creation
- Create a new deal room
- Fund escrow with a test amount
- Verify Gross/Fee/Net breakdown displays correctly
- Execute XDK transfer to participant
- Verify all displays update correctly
- Verify escrow release record is created automatically

### Test 3: Second Existing Deal Room
- Navigate to other existing deal room(s)
- Verify Financial Rails tab loads without errors
- Verify all buttons are functional
- Verify empty states display correctly if no transactions

### Test 4: Edge Cases
- Test with participant who has no wallet (should create one)
- Test export functionality (PDF, CSV, JSON, Markdown)
- Test search in Raw Data tab
- Test Copy JSON functionality

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ledger/LedgerFlowDiagram.tsx` | Use xdk_amount fallback for flow values |
| `src/components/ledger/LedgerRawData.tsx` | Add blockchain events tab |
| `src/components/deal-room/FinancialRailsTab.tsx` | Fetch and pass xodiak_transactions |
| `supabase/functions/xdk-internal-transfer/index.ts` | Auto-create escrow release record |

---

## Query Invalidation Improvements

Ensure proper cache busting after transfers by adding to XdkTransferPanel invalidation list:
```typescript
queryClient.invalidateQueries({ queryKey: ["escrow-transactions-activity", dealRoomId] });
```

