
# Complete XDK Settlement & Multi-Channel Withdrawal Infrastructure Plan

## Executive Summary

This plan enables Peter Optimo to receive and withdraw his $500 monthly retainer through a fully configurable, role-based settlement system with multiple withdrawal options. The system respects participant privacy (e.g., George cannot see financial data) and supports various payout methods including bank transfers, PayPal, Venmo, Cash App, Zelle, and crypto.

## Current State Analysis

### What Exists
| Component | Status | Notes |
|-----------|--------|-------|
| Peter's participant record | ✅ Configured | Partner role, `can_view_financials: true`, visibility properly set |
| Peter's XDK wallet | ❌ Missing | `wallet_address: null` - needs wallet creation on Profile page |
| View Pro treasury | ✅ Funded | 500 XDK in deal room treasury |
| Settlement contract | ❌ Missing | No retainer contract exists for Peter |
| George's restrictions | ✅ Configured | `financials: none`, `earnings: none`, `deal_terms: none` - properly locked |
| RetainerManagementPanel | ✅ Exists | Has recipient selector - properly designed |
| Withdrawal edge function | ⚠️ Limited | Only supports "manual" and placeholder "stripe_connect" |

### What's Missing
1. **Peter needs to create his XDK wallet** on the Profile page
2. **Admin needs to create the $500 retainer contract** naming Peter as recipient
3. **Multi-channel withdrawal methods** - only "manual" works currently
4. **Payout method configuration UI** - for users to set up their preferred withdrawal destination

## Technical Implementation

### Phase 1: Wallet & Recipient Link (Works Now)

**Peter's Action Required:**
1. Log in as Peter (peter@optimoit.io)
2. Go to Profile page
3. Click "Create XDK Wallet"
4. This creates his `xodiak_accounts` entry with a new address

**Admin's Action Required (via Deal Room UI):**
1. Go to The View Pro deal room → Financial Rails tab
2. Use RetainerManagementPanel to create:
   - Name: "OptimoIT Monthly Retainer"
   - Amount: $500
   - Frequency: Monthly
   - Recipient: Peter (from participant dropdown)

### Phase 2: Enhanced Withdrawal Methods

**Database Schema Enhancement:**
```sql
-- Add payout method options tracking
CREATE TYPE payout_method_type AS ENUM (
  'bank_ach',
  'stripe_connect',
  'paypal',
  'venmo',
  'cashapp',
  'zelle',
  'apple_cash',
  'crypto_btc',
  'crypto_eth',
  'crypto_xrp',
  'manual'
);

-- Add destination accounts table for user payout preferences
CREATE TABLE user_payout_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  method payout_method_type NOT NULL,
  account_name TEXT NOT NULL,  -- User-friendly name like "My Chase Account"
  account_details JSONB NOT NULL DEFAULT '{}',  -- Encrypted routing/account numbers
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Enhanced xdk-withdraw Edge Function:**
```typescript
// Support multiple withdrawal methods
interface WithdrawalRequest {
  amount: number;
  payout_account_id: string;  // References user_payout_accounts
}

// Method-specific processing
switch (payoutAccount.method) {
  case 'stripe_connect':
    // Requires Peter to have Stripe Connect account
    // Uses Stripe Express onboarding
    break;
  case 'paypal':
    // Uses PayPal Payouts API
    break;
  case 'venmo':
    // Venmo is owned by PayPal - uses same API
    break;
  case 'crypto_btc':
    // Integrate with Coinbase Commerce or similar
    break;
  default:
    // Manual admin processing
}
```

### Phase 3: User Payout Account Configuration UI

**New Component: PayoutAccountManager.tsx**
Location: `src/components/profile/PayoutAccountManager.tsx`

Features:
- Add/remove payout destinations
- Set primary payout method
- Verification flow for bank accounts
- Crypto wallet address validation

### Phase 4: Stripe Connect Integration (Recommended Path)

**Why Stripe Connect is the Best Option:**

Stripe Connect supports payouts to:
- ✅ Bank accounts (ACH/wire in US, local rails internationally)
- ✅ Debit cards (Instant Payouts)
- ❌ PayPal/Venmo/Cash App - NOT directly supported

**User Flow for Stripe Connect:**
1. Peter clicks "Set Up Fast Payouts" in Profile wallet
2. Redirected to Stripe Express onboarding
3. Stripe handles KYC, bank verification
4. Peter becomes a "Connected Account"
5. Withdrawals auto-process via Stripe API

**Edge Function: create-stripe-connect-account**
```typescript
// Creates Stripe Express account for partner
const account = await stripe.accounts.create({
  type: 'express',
  email: user.email,
  capabilities: {
    transfers: { requested: true }
  }
});

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  return_url: `${origin}/profile?stripe_connect=complete`,
  refresh_url: `${origin}/profile?stripe_connect=refresh`,
  type: 'account_onboarding',
});
```

**Edge Function: process-stripe-payout**
```typescript
// Execute payout to connected account
const payout = await stripe.transfers.create({
  amount: usdAmountInCents,
  currency: 'usd',
  destination: connectedAccountId,
  metadata: {
    withdrawal_request_id: withdrawal.id,
    xdk_amount: amount
  }
});
```

### Phase 5: Alternative Payment Providers (Future)

For PayPal, Venmo, Cash App, Zelle:

| Provider | Integration Method | Complexity |
|----------|-------------------|------------|
| PayPal | PayPal Payouts API | Medium - requires Business account |
| Venmo | PayPal Payouts API (same owner) | Medium |
| Cash App | No official API | ❌ Manual only |
| Zelle | Bank-integrated only | ❌ No direct API |
| Apple Cash | No official API | ❌ Manual only |

**Crypto Withdrawal Options:**
- **Coinbase Commerce**: Simple on-ramp for BTC, ETH, XRP
- **Circle (USDC)**: Stablecoin payouts
- **Direct wallet transfer**: User provides wallet address

## Privacy & Access Control

**Ensuring George Cannot See Financials:**

George's current permissions (already correctly configured):
```json
{
  "visibility_config": {
    "financials": "none",
    "earnings": "none",
    "deal_terms": "none",
    "contributions": "none"
  },
  "default_permissions": {
    "view_all_financials": false,
    "view_own_financials": false,
    "edit_financials": false
  }
}
```

**Tab Access Restrictions** (in `useDealRoomPermissions.ts`):
- George CANNOT access: Financial Rails, Settlement, Analytics, Credits
- George CAN access: Documents, Participants, Messaging, Agent Setup

**UI Enforcement:**
- RetainerManagementPanel only shows to `isAdmin` users
- XdkWithdrawalPanel in deal room only shows to users with `view_all_financials`

## Implementation Files

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/profile/PayoutAccountManager.tsx` | UI for adding payout destinations |
| `src/components/profile/StripeConnectOnboarding.tsx` | Stripe Express onboarding flow |
| `supabase/functions/create-stripe-connect/index.ts` | Create Stripe Connect account |
| `supabase/functions/process-stripe-payout/index.ts` | Execute payouts via Stripe |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/profile/XdkWithdrawalPanel.tsx` | Add multi-method selector, Stripe Connect option |
| `src/components/profile/ProfileWalletPanel.tsx` | Add payout account management section |
| `supabase/functions/xdk-withdraw/index.ts` | Route to appropriate payout processor |

### Database Migrations
1. Create `user_payout_accounts` table
2. Add `stripe_connect_account_id` to `profiles` table
3. Add `payout_processor` and `external_payout_id` to `xdk_withdrawal_requests`

## Recommended Implementation Order

```text
Week 1: Foundation
├── Peter creates XDK wallet (manual action)
├── Admin creates $500 retainer contract (manual action via UI)
├── Test end-to-end settlement execution
└── Verify Peter can see balance on Profile

Week 2: Stripe Connect
├── Create Stripe Connect edge functions
├── Add onboarding UI to Profile
├── Update withdrawal panel with Stripe option
└── Test payout flow

Week 3: Polish & Alternatives
├── Add payout account management UI
├── Document manual process for non-Stripe methods
├── Consider PayPal Payouts API integration
└── Add crypto withdrawal option (Coinbase Commerce)
```

## Security Considerations

1. **Payout account verification**: Require micro-deposit verification for bank accounts
2. **Withdrawal limits**: Implement daily/monthly withdrawal limits
3. **Two-factor for large withdrawals**: Require email/SMS confirmation for withdrawals over $1000
4. **Audit trail**: Log all withdrawal requests with IP, device, timestamp
5. **RLS policies**: Ensure `user_payout_accounts` only accessible by owner

## Answer to Your Questions

| Question | Answer |
|----------|--------|
| Does Stripe enable withdrawal to PayPal, Venmo, etc? | **No** - Stripe Connect only supports bank accounts and debit cards |
| Does Peter need a Stripe account? | **Yes** - He'll create a "Connected Account" via Express onboarding (simple, ~5 min) |
| Can we use Cash App, Apple Cash, Zelle? | **Not via API** - These don't have payout APIs, must be manual processing |
| Crypto withdrawals? | **Yes** - Via Coinbase Commerce or direct wallet transfer |
| Privacy for George? | **Already configured** - He cannot see financials, earnings, or deal terms |
