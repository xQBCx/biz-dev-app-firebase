
# Peter's $500 Withdrawal: Status & Enhancement Plan

## Executive Summary

Peter cannot withdraw $500 yet because:
1. The Deal Room treasury has $485.20 (short by ~$15 due to Stripe fees)
2. No settlement has been executed to move XDK from treasury → Peter's wallet
3. Peter hasn't set up any withdrawal method (Stripe Connect or bank details)

This plan outlines **immediate workarounds** and **system enhancements** to make this process seamless for future payments.

---

## Current System Status

### Peter's Account Status

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Profile | ✅ Exists | None |
| Stripe Connect | ❌ Not configured | Peter needs to complete onboarding **OR** use manual bank entry |
| Personal XDK Wallet | ❌ Not created | Wallet will auto-create on first credit |
| Alternative Payout Methods | ❌ None configured | You can add his bank info via "View as User" |

### Deal Room Treasury

| Balance | Target | Gap |
|---------|--------|-----|
| $485.20 XDK | $500.00 | -$14.80 |

### Fee Calculation Formula

To ensure a recipient gets exactly **$500 net** after Stripe's ~2.9% + $0.30 fee:

```
Gross Deposit = (Target Net + $0.30) / (1 - 0.029)
Gross Deposit = ($500.00 + $0.30) / 0.971
Gross Deposit = $515.24
```

---

## Part 1: Immediate Steps to Pay Peter

### Step 1: Add Missing Funds

**Option A - Top Up to $500:**
- Add ~$15.28 more to get treasury to $500 (will net ~$14.80 after fees)
- Or add exactly $500.08 (nets to ~$485.00, totaling ~$500 with existing)

**Option B - Pay What's Available:**
- Execute settlement for $485.20 now
- Send Peter $14.80 separately (Venmo, Zelle, etc.)

### Step 2: Execute Settlement

Trigger the settlement contract to transfer XDK from the Deal Room treasury to Peter's personal wallet.

### Step 3: Set Up Peter's Payout Method

**Option A - Peter Self-Service (Recommended):**
1. Peter logs into Biz Dev App
2. Goes to Profile → Wallet tab
3. Clicks "Set Up Fast Payouts"
4. Completes Stripe Connect onboarding (~5 minutes)
5. Requests withdrawal of his XDK balance

**Option B - Admin Enters Bank Info (For Immediate Manual Payout):**
1. You go to Admin Panel → Users → Find Peter
2. Click "View as User" button
3. Navigate to Profile → Wallet → Alternative Payout Methods
4. Add "Bank Account (ACH)" with:
   - Account Name: "Peter's Bank"
   - Bank Name: From invoice
   - Last 4 Digits: From invoice
5. When Peter requests withdrawal, you process it manually via wire transfer

---

## Part 2: System Enhancements

### Enhancement 1: Fee Calculator in FundEscrowDialog

**Goal:** Allow users to enter a "Target Net Amount" and auto-calculate the gross deposit needed.

**Changes:**
- Add toggle: "I want recipient to receive exactly..."
- Add input for target net amount
- Display calculated gross amount including fee breakdown:
  - Target Net: $500.00
  - Stripe Fee (~3%): $15.24
  - You Pay: $515.24

**Files to modify:**
- `src/components/dealroom/FundEscrowDialog.tsx`

---

### Enhancement 2: Admin Withdrawal Dashboard

**Goal:** Give admins visibility into pending withdrawals and ability to process them.

**Features:**
- List all pending withdrawal requests
- Show user details, amount, method, bank info
- "Process Payout" button for manual processing
- "Mark as Completed" when wire is sent
- Integration with `process-stripe-payout` for automated cases

**New files:**
- `src/components/admin/WithdrawalRequestsPanel.tsx`
- Add tab to `AdminPanelUnified.tsx`

---

### Enhancement 3: Admin Bank Entry for Users

**Goal:** Allow admins to enter verified bank details on behalf of users (for invoice scenarios).

**Features:**
- In admin user detail view, add "Payout Methods" section
- Allow adding bank_ach, paypal, etc. on user's behalf
- Mark as "Admin Verified" vs "User Submitted"
- Store routing/account numbers securely (encrypted)

**Changes:**
- Extend `PayoutAccountManager.tsx` for admin use
- Add admin-specific fields (full routing/account numbers)
- Add `admin_verified` column to `user_payout_accounts`

---

### Enhancement 4: Settlement Execution UI

**Goal:** Make it easy to execute settlements from Deal Room Financial Rails.

**Current gap:** Settlement contracts exist but may not have a clear "Execute Now" button.

**Features:**
- "Execute Settlement" button in Financial Rails tab
- Preview: Shows who gets paid, from which treasury, amount
- Confirmation dialog with fee breakdown
- Automatic XDK transfer on confirmation

---

## Part 3: Withdrawal Fee Structure

### Current Fee Model (No Platform Fees)

| Step | Fee | Who Pays |
|------|-----|----------|
| **Deposit to Escrow** | ~2.9% + $0.30 | Depositor (you) |
| **XDK Internal Transfer** | $0.00 | Free |
| **Withdrawal via Stripe Connect** | $0.00 (standard) / ~1.5% (instant) | Recipient |
| **Manual Bank Wire** | Varies by bank | Platform or Recipient |

### Recommendation

Keep the current model (no platform withdrawal fees) to incentivize partners to use the system. You absorb deposit fees; Stripe handles payout infrastructure.

---

## Technical Implementation Summary

| Enhancement | Priority | Effort | Files |
|-------------|----------|--------|-------|
| Fee Calculator | High | 1-2 hours | FundEscrowDialog.tsx |
| Admin Withdrawal Dashboard | High | 3-4 hours | New component + AdminPanelUnified.tsx |
| Admin Bank Entry | Medium | 2-3 hours | PayoutAccountManager.tsx, user_payout_accounts table |
| Settlement Execute UI | Medium | 2-3 hours | FinancialRailsTab.tsx |

---

## Immediate Action Items

1. **Today**: Use "View as User" to add Peter's bank details as an Alternative Payout Method
2. **Today**: Add ~$15 more to Deal Room treasury OR accept paying $485.20 now
3. **Today**: Execute the settlement to credit Peter's XDK wallet
4. **Today**: Either:
   - Ask Peter to complete Stripe Connect onboarding, OR
   - Process a manual wire to his bank using the invoice details
5. **This Week**: Implement Fee Calculator enhancement
6. **Next Week**: Build Admin Withdrawal Dashboard
