
# Fix Plan: XDK Internal Transfer Failures

## Problem Summary

When you click "Transfer XDK" to send Peter his $485.20, the system fails with "Deal room treasury not found" because of two mismatches:

1. **Parameter Names**: The Transfer panel sends `to_type`, `to_address`, `to_participant_id` but the backend expects `destination_type`, `destination_wallet_address`, `destination_user_id`

2. **Treasury Lookup**: The backend looks in the wrong table (`xodiak_accounts`) instead of where your treasury actually is (`deal_room_xdk_treasury`)

3. **Participant vs User ID**: When selecting a participant, we send the participant record ID instead of their user ID

---

## Fix Strategy

### Option A: Update Frontend Only (Recommended - Faster)
Modify `XdkTransferPanel.tsx` to send the correct parameter names AND look up the participant's `user_id` before sending.

### Option B: Update Backend Only
Modify the edge function to accept the parameters as-is and look in the correct treasury table.

**Recommendation**: Option A is faster and less risky since we're just renaming parameters and adding a simple lookup.

---

## Implementation Details

### Step 1: Fix Parameter Names in XdkTransferPanel.tsx

**Current code (lines 142-154):**
```typescript
body: {
  from_address: treasuryAddress,
  from_type: "treasury",
  to_type: values.to_type,                    // Wrong name
  to_address: values.to_type === "personal"   // Wrong name
    ? personalWallet?.address 
    : values.to_address,
  to_participant_id: values.to_participant_id, // Wrong name + wrong value
  amount: values.amount,
  ...
}
```

**Fixed code:**
```typescript
body: {
  deal_room_id: dealRoomId,
  amount: values.amount,
  destination_type: values.to_type,
  destination_wallet_address: values.to_type === "entity" 
    ? values.to_address 
    : undefined,
  destination_user_id: values.to_type === "participant" 
    ? getParticipantUserId(values.to_participant_id)  // Lookup user_id
    : undefined,
  purpose: values.purpose,
  category_id: values.category_id,
}
```

### Step 2: Resolve Participant ID to User ID

When a participant is selected, look up their `user_id` from the participants array:

```typescript
// Helper function
const getParticipantUserId = (participantId: string | undefined) => {
  if (!participantId) return undefined;
  const participant = participants?.find(p => p.id === participantId);
  return participant?.user_id;
};
```

### Step 3: Fix Treasury Lookup in Edge Function

Update `xdk-internal-transfer/index.ts` to query the correct table:

**Current (lines 99-104):**
```typescript
const { data: treasuryAccount } = await supabase
  .from("xodiak_accounts")
  .select("address, balance")
  .eq("deal_room_id", deal_room_id)
  .eq("account_type", "deal_room_treasury")
  .single();
```

**Fixed:**
```typescript
const { data: treasuryAccount } = await supabase
  .from("deal_room_xdk_treasury")
  .select("xdk_address, balance")
  .eq("deal_room_id", deal_room_id)
  .single();

// Rename for consistency
const treasury = treasuryAccount ? {
  address: treasuryAccount.xdk_address,
  balance: treasuryAccount.balance
} : null;
```

### Step 4: Update Balance Operations

The edge function uses `increment_xdk_balance` RPC which operates on `xodiak_accounts`. We need to also update `deal_room_xdk_treasury.balance`:

```typescript
// Decrement treasury balance
await supabase
  .from("deal_room_xdk_treasury")
  .update({ 
    balance: treasuryAccount.balance - amount,
    updated_at: new Date().toISOString()
  })
  .eq("deal_room_id", deal_room_id);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/deal-room/XdkTransferPanel.tsx` | Fix parameter names, add user_id resolution |
| `supabase/functions/xdk-internal-transfer/index.ts` | Fix treasury table query, update balance correctly |

---

## Technical Notes

- `deal_room_xdk_treasury` uses `xdk_address` column, not `address`
- The edge function will need to be redeployed after changes
- No database migrations needed - just code fixes

---

## Expected Outcome

After this fix:
1. Click "Transfer XDK" button
2. Select "Participant Wallet" and choose Peter Holcomb
3. Enter 485.20 XDK and purpose "OptimoIT Invoice Payment January 2026"
4. Click Transfer - should complete successfully
5. Peter's XDK wallet will be credited with 485.20 XDK
6. He can then request a withdrawal to his bank account
