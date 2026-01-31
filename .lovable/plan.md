
# Plan: Fix Financial Operating System - Complete Functionality Gaps

## Overview
The Financial Operating System Phase 1 has foundational components created but several critical integration and bug issues prevent it from working. This plan addresses all gaps to make the financial flows fully functional.

---

## Issues to Fix

### Issue 1: Edge Function Column Name Mismatches
**Problem:** `fund-contribution-checkout` uses wrong column names
**Fix:** Update edge function to use correct database columns

```text
Wrong                        →  Correct
contributor_user_id          →  requested_from_user_id  
amount_requested             →  amount
```

### Issue 2: FinancialRailsTab Not in Main Page
**Problem:** The new tab component is only in the demo page, not the real deal room page
**Fix:** Integrate `FinancialRailsTab` into the existing "financial-rails" TabContent in `src/pages/DealRoomDetail.tsx`, replacing or augmenting the current manual implementation

### Issue 3: ContributorFundingDialog Not Rendered
**Problem:** Participants have no way to see/pay fund requests
**Fix:** Add a section in the Financial Rails tab showing pending fund requests for the current user with a "Pay Now" button that opens the `ContributorFundingDialog`

### Issue 4: Parameter Mismatch in ContributorFundingDialog  
**Problem:** Dialog sends `request_id` but edge function expects `fund_request_id`
**Fix:** Update the mutation in `ContributorFundingDialog` to send `fund_request_id`

### Issue 5: Treasury Balance Not Fetched
**Problem:** Balance hardcoded to 0
**Fix:** Query the `xodiak_accounts` table for the deal room's treasury account balance

---

## Implementation Steps

### Step 1: Fix Edge Function
Update `supabase/functions/fund-contribution-checkout/index.ts`:
- Line 84: Change `contributor_user_id` to `requested_from_user_id`
- Line 100: Change `amount_requested` to `amount`

### Step 2: Fix ContributorFundingDialog 
Update `src/components/deal-room/ContributorFundingDialog.tsx`:
- Change `request_id: request.id` to `fund_request_id: request.id` in the mutation body

### Step 3: Update FinancialRailsTab to Fetch Real Treasury Balance
Update `src/components/deal-room/FinancialRailsTab.tsx`:
- Add query to fetch treasury account from `xodiak_accounts` where `deal_room_id` matches and `account_type = 'deal_room_treasury'`
- Replace hardcoded `treasuryBalance = 0` with actual fetched balance

### Step 4: Add Pending Fund Requests Section for Contributors
Create new component or section in `FinancialRailsTab`:
- Query `fund_contribution_requests` where `requested_from_user_id` = current user and `status = 'pending'`
- Display list of pending requests with "Pay Now" button
- Wire button to open `ContributorFundingDialog`

### Step 5: Integrate FinancialRailsTab into Main Page
Update `src/pages/DealRoomDetail.tsx`:
- Import `FinancialRailsTab` component  
- In the "financial-rails" TabsContent (lines 798-847), either:
  - Replace the current manual implementation with `<FinancialRailsTab />`
  - Or integrate it alongside existing components (EscrowDashboard, PayoutCalculator, etc.)

### Step 6: Redeploy Edge Function
Deploy the updated `fund-contribution-checkout` function

---

## Technical Details

### Database Schema Confirmed
```text
fund_contribution_requests columns:
- id (uuid)
- deal_room_id (uuid)
- requested_by (uuid) - admin who created request
- requested_from_participant_id (uuid)
- requested_from_user_id (uuid) - user who should pay
- amount (numeric)
- currency (text)
- purpose (text)
- status (text) - pending/paid/cancelled
- stripe_checkout_session_id (text)
- paid_at (timestamptz)
- xdk_amount (numeric)
- xdk_tx_hash (text)
```

### Files to Modify
1. `supabase/functions/fund-contribution-checkout/index.ts`
2. `src/components/deal-room/ContributorFundingDialog.tsx`
3. `src/components/deal-room/FinancialRailsTab.tsx`
4. `src/pages/DealRoomDetail.tsx`

### Files Already Created (No Changes Needed)
- `src/components/deal-room/FundRequestPanel.tsx` - Working correctly
- `src/components/deal-room/XdkTransferPanel.tsx` - Working correctly
- `src/hooks/useFundRequests.ts` - Working correctly

---

## Testing Checklist
After implementation:
1. Navigate to a deal room → Financial Rails tab should be visible
2. As admin: Click "Request Funds" → Form should appear
3. As admin: Select participant, enter amount, submit → Request created
4. As contributor: See pending fund request in Financial Rails tab
5. As contributor: Click "Pay Now" → Stripe checkout or XDK payment flow
6. After payment: Request status updates to "paid"
7. Treasury balance reflects new contribution

---

## Estimated Changes
- ~10 lines in edge function
- ~5 lines in ContributorFundingDialog
- ~30 lines in FinancialRailsTab (treasury query + pending requests section)
- ~15 lines in DealRoomDetail.tsx (import + render FinancialRailsTab)
