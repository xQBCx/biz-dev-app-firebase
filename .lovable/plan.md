
# Fix XDK Wallet Display During User Impersonation

## Problem Summary

When viewing as Peter via impersonation, the XDK Wallet shows:
- **0 XDK balance** instead of **485.20 XDK** (Peter's actual balance)
- **$250 pending** which are Bill's pending escrow requests, not Peter's

This happens because the wallet components use `useAuth()` which returns the **real logged-in admin** instead of the **impersonated user**.

## Root Cause Analysis

| Component | Issue |
|-----------|-------|
| `ProfileWalletPanel.tsx` | Uses `useAuth()` on line 55, fetches wallet for `user.id` (Bill) instead of Peter |
| `PendingSettlementsTab.tsx` | Fetches escrow requests without `user_id` filter on lines 95-98, showing ALL pending requests |

The UI correctly shows Bill's wallet address (`xdk1109c909a...0F87230c`) but should show Peter's (`xdk1a7ebd8b8f...`).

## Solution

### Step 1: Update ProfileWalletPanel.tsx

Replace `useAuth()` with `useEffectiveUser()` to respect impersonation context:

```typescript
// Before
const { user } = useAuth();
// ... queries use user.id

// After  
const effectiveUser = useEffectiveUser();
const effectiveUserId = effectiveUser.id;
// ... queries use effectiveUserId
```

### Step 2: Update PendingSettlementsTab.tsx

Fix the escrow requests query to filter by the specific user:

```typescript
// Before (shows ALL pending requests)
const { data: escrowRequests } = await supabase
  .from('escrow_funding_requests')
  .select('amount')
  .eq('status', 'pending');

// After (shows only user's pending requests)
const { data: escrowRequests } = await supabase
  .from('escrow_funding_requests')
  .select('amount')
  .eq('status', 'pending')
  .eq('user_id', userId);  // Add user filter
```

### Step 3: Propagate Effective User ID

The `PendingSettlementsTab` receives `userId` as a prop from `ProfileWalletPanel`. We need to ensure this prop passes the effective user ID (Peter's) not the auth user ID (Bill's).

## Expected Result

After fix, when viewing as Peter:
- Wallet address: `xdk1a7ebd8b8f...` (Peter's)
- Available Balance: **485.20 XDK**
- Pending tab: Shows only Peter's pending settlements (likely $0)

## Technical Details

Files to modify:
1. `src/components/profile/ProfileWalletPanel.tsx` - Switch from `useAuth()` to `useEffectiveUser()`
2. `src/components/profile/PendingSettlementsTab.tsx` - Add `user_id` filter to escrow query

This follows the same impersonation pattern already established in `Profile.tsx` which correctly uses `useEffectiveUser()`.
