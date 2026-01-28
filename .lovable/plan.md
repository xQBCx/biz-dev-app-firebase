
# Plan: Simplify XDK Wallet to Strict 1:1 Model with Full Treasury Dashboard

## What You Asked For

1. **Strict 1:1 with USD** - XDK is only minted when real money enters escrow (1 XDK = 1 USD, always)
2. **Full treasury dashboard** - Balance, pending settlements, withdrawal requests, and detailed activity

## What I'll Remove

The **entire Dynamic Minting Stats component** (`DynamicMintingStats.tsx`) including:
- Bronze/Silver/Gold/Platinum/Diamond tiers
- 1x-3x multipliers
- Minting power calculations
- The "Minting Stats" tab in the wallet

This gamification doesn't make sense for an asset-backed currency where 1 XDK = 1 USD.

## What I'll Add/Enhance

### Replace "Minting Stats" Tab with "Pending Settlements"

Show users what XDK payments are coming their way:

| Data Point | Source |
|------------|--------|
| Active settlement contracts where user is recipient | `settlement_contracts` joined with `deal_room_participants` |
| Pending escrow funds awaiting conversion | `escrow_funding_requests` where `status = 'pending'` |
| Deal room treasury balances | `deal_room_xdk_treasury` |

### Enhanced Overview Tab

Add a summary section at the top:
- **Total Incoming**: Sum of pending settlements for this user
- **Total Balance**: Current XDK balance
- **Total Withdrawn**: Sum of completed withdrawal requests

### Simplified Exchange Rate Display

Since 1:1 is the rule:
- Display "1 XDK = $1.00 USD" (fixed, not variable)
- Or simply show both values as equivalent

## Files to Modify

| File | Change |
|------|--------|
| `src/components/profile/ProfileWalletPanel.tsx` | Remove "Minting Stats" tab, replace with "Pending" tab showing incoming settlements |
| `src/components/profile/DynamicMintingStats.tsx` | **DELETE** this file |
| `src/pages/Profile.tsx` | No changes needed (already imports ProfileWalletPanel) |

## New UI Structure

```text
┌─────────────────────────────────────────────────┐
│  XDK Wallet                     [Refresh]       │
│  xdk1user7a8b9c...                              │
├─────────────────────────────────────────────────┤
│  Balance          Pending        Withdrawn      │
│  1,250 XDK        $500.00        $2,000.00     │
│  = $1,250.00                                    │
├─────────────────────────────────────────────────┤
│  [Overview]  [Pending]  [Withdraw]              │
└─────────────────────────────────────────────────┘
```

### Overview Tab
- Recent transaction history (existing)

### Pending Tab (NEW - replaces Minting Stats)
- Active settlement contracts where user is designated recipient
- Escrow funds awaiting XDK conversion
- Expected payout amounts

### Withdraw Tab
- Existing withdrawal form (no changes)
- Withdrawal history

## Code Changes

### ProfileWalletPanel.tsx

1. Remove import of `DynamicMintingStats`
2. Change tabs from `["overview", "withdraw", "minting"]` to `["overview", "pending", "withdraw"]`
3. Add new query for pending settlements:
```typescript
// Fetch pending settlements for this user
const { data: pendingSettlements } = await supabase
  .from('settlement_contracts')
  .select(`
    id, name, trigger_type, 
    distribution_logic,
    deal_room:deal_rooms(id, name),
    deal_room_xdk_treasury(balance)
  `)
  .eq('is_active', true);
```
4. Add summary stats row showing Balance / Pending / Withdrawn totals
5. Create "Pending" tab content showing upcoming payouts

### Delete DynamicMintingStats.tsx

This file will be completely removed as the tier/multiplier system is not wanted.

## Expected Result

A clean, professional wallet dashboard that shows:
- Your current XDK balance (= USD value at 1:1)
- Money coming your way from active deals
- Your transaction history
- Easy withdrawal to USD
