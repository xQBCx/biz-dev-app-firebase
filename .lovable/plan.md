

# Plan: Fully In-App Fund Contribution Payment System

## Overview

This plan converts the fund contribution payment flow from Stripe Checkout (external redirect) to an **embedded Stripe PaymentElement** (stays within the Biz Dev App). This follows the same pattern already used for Escrow Funding and Invoice Payments.

---

## What the Completed System Will Look Like

```text
Participant Experience (all in-app):
┌─────────────────────────────────────────────────────────────────┐
│  Deal Room → Financial Rails Tab                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  PENDING FUND REQUESTS                                       ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │ $500.00 - Deal Room Operating Capital                   │││
│  │  │ Due: Feb 15, 2026                                       │││
│  │  │ [Pay Now] [Decline]                                     │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ← Click "Pay Now"                                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ╔═══════════════════════════════════════╗                   ││
│  │  ║  💳 Fund Contribution                  ║                   ││
│  │  ║  Amount: $500.00                       ║                   ││
│  │  ║  ─────────────────────                 ║                   ││
│  │  ║  [Stripe PaymentElement loads here]    ║                   ││
│  │  ║  Card / Bank Account options           ║                   ││
│  │  ║  Apple Pay / Google Pay                ║                   ││
│  │  ║  ─────────────────────                 ║                   ││
│  │  ║  [Pay $500.00]                         ║                   ││
│  │  ╚═══════════════════════════════════════╝                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Payment completes → Dialog shows success → Treasury updates    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Step 1: Create Payment Intent Edge Function

**New file:** `supabase/functions/create-fund-contribution-payment-intent/index.ts`

This function will:
- Authenticate the user
- Verify the fund request exists and is for this user
- Verify status is "pending" 
- Create a Stripe PaymentIntent (not Checkout Session)
- Return `clientSecret` for embedded payment
- Store payment intent ID on the fund request

Key differences from current `fund-contribution-checkout`:
- Returns `clientSecret` instead of `url`
- Uses PaymentIntent API (for in-app) instead of Checkout Session API (for redirect)

### Step 2: Create Webhook Handler for Fund Contributions

**New file:** `supabase/functions/fund-contribution-webhook/index.ts`

This will handle `payment_intent.succeeded` events:
- Verify Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`
- Extract `fund_request_id` from payment intent metadata
- Update fund request status to "paid"
- Mint XDK to deal room treasury (1:1 conversion)
- Create XDK transaction record
- Create value ledger entry
- Send notification to admin

### Step 3: Create Embedded Payment Modal Component

**New file:** `src/components/deal-room/FundContributionPaymentModal.tsx`

This will follow the exact pattern of `InvoicePaymentModal.tsx`:
- Fetch client secret from new edge function
- Render Stripe Elements with PaymentElement
- Use `redirect: "if_required"` for in-app completion
- Show success animation on completion
- Invalidate relevant queries to refresh data

### Step 4: Update ContributorFundingDialog

**Modify:** `src/components/deal-room/ContributorFundingDialog.tsx`

- Instead of creating checkout session and redirecting
- Open the new `FundContributionPaymentModal`
- Pass the fund request details
- Handle success callback

### Step 5: Add Success Handler for Legacy URL Params

**Modify:** `src/pages/DealRoomDetail.tsx`

Add handling for `?contribution=success&session_id=` URL params (in case any old checkout sessions exist):
- Detect contribution success params
- Verify payment via API call
- Clear params and show toast

---

## Files to Create

1. `supabase/functions/create-fund-contribution-payment-intent/index.ts` - Creates PaymentIntent for embedded payment
2. `supabase/functions/fund-contribution-webhook/index.ts` - Handles payment_intent.succeeded events
3. `src/components/deal-room/FundContributionPaymentModal.tsx` - Embedded payment UI

## Files to Modify

1. `src/components/deal-room/ContributorFundingDialog.tsx` - Switch from redirect to modal
2. `src/components/deal-room/PendingFundRequestsSection.tsx` - Integrate payment modal
3. `src/pages/DealRoomDetail.tsx` - Add contribution success URL handler
4. `supabase/config.toml` - Add new functions config

---

## Technical Details

### PaymentIntent vs Checkout Session

| Feature | Checkout Session (Current) | PaymentIntent (New) |
|---------|---------------------------|---------------------|
| User Experience | Leaves app, goes to Stripe | Stays in app |
| Payment Form | Stripe-hosted page | Embedded PaymentElement |
| Webhook Event | checkout.session.completed | payment_intent.succeeded |
| Mobile Friendly | Poor (external browser) | Excellent (native feel) |

### Webhook Configuration

The webhook is already configured to use `STRIPE_WEBHOOK_SECRET`. The new endpoint should be registered in Stripe Dashboard:
```
Endpoint URL: https://eoskcsbytaurtqrnuraw.supabase.co/functions/v1/fund-contribution-webhook
Events: payment_intent.succeeded
```

### XDK Minting Flow (in webhook)

```text
1. Payment confirmed by Stripe
2. Get/create treasury account for deal room  
3. Calculate XDK amount (USD × exchange rate)
4. Create xodiak_transaction record
5. Increment treasury balance
6. Update fund_contribution_requests.status = 'paid'
7. Create value_ledger_entries record
8. Send notification to admin
```

---

## Testing Checklist

After implementation:
1. As admin: Create fund request for participant
2. As participant: See request in Financial Rails tab
3. As participant: Click "Pay Now" → Modal opens with PaymentElement
4. As participant: Enter test card (4242...) → Submit
5. As participant: See success animation in modal
6. Verify: fund_contribution_requests.status = "paid"
7. Verify: Treasury balance increased
8. Verify: XDK transaction created
9. Verify: Value ledger entry created
10. As admin: Receive payment notification

---

## Estimated Changes

- ~150 lines: `create-fund-contribution-payment-intent/index.ts`
- ~250 lines: `fund-contribution-webhook/index.ts`
- ~200 lines: `FundContributionPaymentModal.tsx`
- ~30 lines: `ContributorFundingDialog.tsx` modifications
- ~10 lines: `DealRoomDetail.tsx` success handler

