

# In-App Client Invoicing with XDK Settlement & Multi-Currency Support

## Understanding Your Vision

Based on our conversation, here's what you want:

1. **Casey stays in the Biz Dev App** when paying his $1,000/month retainer
2. **Funds flow through XDK** - when Casey pays, USD converts to XDK in the Biz Dev Treasury
3. **You (Bill) get paid via XDK** - funds go to Business Development LLC's wallet  
4. **XDK converts to any currency** - not just USD, but EUR, GBP, CAD, etc.

## What's Already Built (Good News!)

| Feature | Status | How It Works |
|---------|--------|--------------|
| Escrow funding | ✅ In-app | `EscrowPaymentModal` uses embedded Payment Element |
| XDK minting | ✅ Working | `escrow-verify-funding` converts USD → XDK |
| XDK withdrawals | ✅ Working | `xdk-withdraw` + `process-stripe-payout` |
| Bank setup | ✅ In-app | Stripe Connect embedded onboarding |
| Exchange rates | ✅ Database | `xdk_exchange_rates` table (currently USD only) |

## What We Need to Build

### Phase 1: In-App Invoice Payment for Casey (Build Now)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INVOICE PAYMENT FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. YOU CREATE INVOICE                                                      │
│   ┌──────────────────┐                                                       │
│   │  Biz Dev App     │  → Creates invoice in Stripe                          │
│   │  Admin Panel     │  → Records in platform_invoices table                 │
│   └────────┬─────────┘                                                       │
│            │                                                                 │
│   2. CASEY GETS NOTIFIED                                                     │
│            ▼                                                                 │
│   ┌──────────────────┐                                                       │
│   │  Email + In-App  │  → "You have a new invoice"                           │
│   │  Notification    │  → Link goes to Biz Dev App (not Stripe)              │
│   └────────┬─────────┘                                                       │
│            │                                                                 │
│   3. CASEY PAYS IN-APP                                                       │
│            ▼                                                                 │
│   ┌──────────────────┐                                                       │
│   │  Invoice Payment │  → Uses embedded Payment Element                      │
│   │  Modal           │  → Never leaves Biz Dev App                           │
│   └────────┬─────────┘                                                       │
│            │                                                                 │
│   4. XDK SETTLEMENT                                                          │
│            ▼                                                                 │
│   ┌──────────────────┐                                                       │
│   │  $1,000 USD      │  → Mints 1,000 XDK                                    │
│   │  → Treasury      │  → Credits Business Dev LLC wallet                    │
│   └──────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Components to Build:**

1. **`platform_invoices` table** - Track invoices within the platform
2. **`create-client-invoice` edge function** - Creates Stripe invoice, stores client_secret
3. **`InvoicePaymentModal` component** - Embedded Payment Element for invoice payment
4. **Invoice Management UI** - For you to create/track invoices
5. **Client Invoice View** - For Casey to see and pay invoices in-app

### Phase 2: Multi-Currency XDK Off-Ramp (Build Later, Simple Foundation Now)

**Current State:** XDK → USD only (via Stripe Connect)

**Future State:** XDK → Any Currency

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MULTI-CURRENCY WITHDRAWAL                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   XDK Balance: 10,000 XDK ($10,000 USD equivalent)                           │
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │    USD      │    │    EUR      │    │    GBP      │    │    CAD      │  │
│   │  $10,000    │    │  €9,200     │    │  £7,900     │    │  $13,700    │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**What Stripe Connect Already Supports:**
- Payouts to 40+ countries in local currency
- Currency conversion at payout time
- Multi-currency balance management

**What We Need to Add:**
1. Extend `xdk_exchange_rates` table with EUR, GBP, CAD, etc.
2. Fetch live exchange rates (via API or manual admin updates)
3. Let users select target currency when withdrawing
4. Store payout currency preference on user profile

---

## Technical Implementation Plan

### Database Changes

**New Tables:**

```sql
-- Platform Invoices (tracks invoices created for clients like Casey)
CREATE TABLE platform_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT NOT NULL,
  creator_id UUID NOT NULL,          -- You (Bill)
  client_id UUID NOT NULL,           -- Casey (from clients table or user_id)
  deal_room_id UUID,                 -- Optional: link to deal room
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'draft',       -- draft, open, paid, void, uncollectible
  stripe_payment_intent_id TEXT,
  stripe_client_secret TEXT,         -- For embedded payment
  xdk_credited BOOLEAN DEFAULT FALSE,
  xdk_recipient_wallet TEXT,         -- Where XDK goes when paid
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-currency exchange rates
ALTER TABLE xdk_exchange_rates 
ADD COLUMN IF NOT EXISTS target_currency TEXT DEFAULT 'USD';

-- Add more currency rates
INSERT INTO xdk_exchange_rates (base_currency, target_currency, xdk_rate, source)
VALUES 
  ('XDK', 'EUR', 0.92, 'manual'),
  ('XDK', 'GBP', 0.79, 'manual'),
  ('XDK', 'CAD', 1.37, 'manual');
```

### Edge Functions

**1. `create-client-invoice`** - Creates invoice for clients like Casey

Flow:
1. Validate admin/creator permissions
2. Find or create Stripe customer for client
3. Create Stripe Invoice with line items
4. Finalize invoice to generate PaymentIntent
5. Store invoice + client_secret in `platform_invoices`
6. Send notification to client (email + in-app)

**2. `pay-invoice-embedded`** - Retrieves client_secret for Payment Element

Flow:
1. Validate client has access to this invoice
2. Return client_secret for Payment Element mounting
3. Track that payment UI was opened

**3. `invoice-payment-webhook`** - Handles successful payment

Flow:
1. Receive Stripe `invoice.paid` event
2. Mint XDK equal to invoice amount
3. Credit XDK to designated wallet (Business Dev LLC)
4. Update `platform_invoices` status
5. Create `xodiak_transactions` record

### Frontend Components

**1. Invoice Creation Panel** (for you as admin)
- Client selector (Casey, etc.)
- Amount, description, due date
- Deal room association (optional)
- XDK recipient wallet selector
- Create & send button

**2. Client Invoice Dashboard** (what Casey sees)
- Pending invoices with "Pay Now" button
- Payment history
- No external redirects

**3. Invoice Payment Modal**
- Reuses existing `EscrowPaymentModal` pattern
- Embedded Payment Element
- Shows invoice details + amount
- Success → XDK minted → funds credited

### File Changes Summary

| File | Change |
|------|--------|
| `supabase/migrations/[new]` | Create `platform_invoices` table |
| `supabase/functions/create-client-invoice/index.ts` | New edge function |
| `supabase/functions/pay-invoice-embedded/index.ts` | New edge function |
| `supabase/functions/stripe-invoice-webhook/index.ts` | New webhook handler |
| `src/components/invoicing/InvoiceCreationPanel.tsx` | New component |
| `src/components/invoicing/ClientInvoiceDashboard.tsx` | New component |
| `src/components/invoicing/InvoicePaymentModal.tsx` | New component (similar to EscrowPaymentModal) |
| `src/components/dealroom/XdkWithdrawalPanel.tsx` | Add currency selector (Phase 2) |

---

## Answering Your Direct Questions

**Q: Is Casey going to be redirected to a Stripe-branded page?**  
**A: No.** With this implementation, Casey pays entirely within the Biz Dev App using the embedded Payment Element - just like the escrow funding already works.

**Q: What about Peter's XDK withdrawal - does he leave the app?**  
**A: No.** The current `process-stripe-payout` uses Stripe Transfers which are backend API calls. Peter clicks "Withdraw" in-app → funds arrive in his bank. No redirect.

**Q: Can we convert XDK to currencies other than USD?**  
**A: Yes, this is possible now with Stripe.** Stripe Connect supports payouts in 40+ currencies. We just need to:
1. Add exchange rates to the database
2. Let users select their preferred currency
3. Pass the currency to Stripe when creating the payout

**Q: Should I set up custom domain for Stripe checkout now?**  
**A: Skip it.** Since we're using embedded components exclusively, users never see `checkout.stripe.com`. The custom domain feature only applies to Stripe-hosted pages which we're bypassing.

---

## Implementation Status

### ✅ Phase 1 Complete: In-App Invoice Payment

| Component | Status | Details |
|-----------|--------|---------|
| `platform_invoices` table | ✅ Done | With RLS, realtime, XDK tracking |
| `create-client-invoice` edge function | ✅ Done | Creates Stripe invoice + stores client_secret |
| `get-invoice-payment-secret` edge function | ✅ Done | Retrieves payment info for embedded element |
| `invoice-payment-webhook` edge function | ✅ Done | Handles payment → XDK minting |
| `InvoicePaymentModal` | ✅ Done | Embedded Payment Element |
| `InvoiceCreationPanel` | ✅ Done | Admin UI for creating invoices |
| `ClientInvoiceDashboard` | ✅ Done | Client view + pay button |

### Pending: Phase 2 Multi-Currency
- Add EUR, GBP, CAD rates to `xdk_exchange_rates`
- Currency selector in withdrawal UI

