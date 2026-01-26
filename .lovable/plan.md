
# Multi-Payment Method Escrow Funding

## Current Issue
The payment modal shows only Stripe Link (saved payment method) instead of giving options to:
1. Enter a new card number
2. Use bank account (ACH)
3. Use other payment methods

## Root Cause
Stripe Link is auto-detecting your saved payment method and presenting it first. The Payment Element configuration needs adjustment to ensure all payment options are visible.

## Implementation Plan

### Phase 1: Fix Stripe Payment Element Display (Immediate)

**File: `src/components/dealroom/EscrowPaymentModal.tsx`**

Update the `PaymentElement` options to:
- Use `accordion` layout instead of `tabs` for better visibility
- Disable Link wallet defaulting behavior
- Show all available payment methods clearly

```typescript
<PaymentElement 
  options={{
    layout: {
      type: "accordion",
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: true,
    },
    wallets: {
      applePay: "auto",
      googlePay: "auto",
    },
  }}
  // ... existing handlers
/>
```

**File: `supabase/functions/create-escrow-payment-intent/index.ts`**

Explicitly specify payment method types instead of using `automatic_payment_methods`:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: currency.toLowerCase(),
  customer: customerId,
  payment_method_types: [
    "card",           // Credit/debit cards
    "us_bank_account", // ACH bank transfers
    "link",           // Stripe Link (optional, can remove)
  ],
  // ... rest of config
});
```

### Phase 2: Add Payment Method Selector UI

**File: `src/components/dealroom/FundEscrowDialog.tsx`**

Add a payment method selection step before proceeding to Stripe:

| Option | Description |
|--------|-------------|
| 💳 Card | Credit or debit card |
| 🏦 Bank | ACH bank transfer |
| 🔗 Link | Saved payment methods |
| ₿ Crypto | (Future) Bitcoin, Ethereum, XRP |

For now, crypto option shows "Coming Soon" state with a waitlist signup.

### Phase 3: Crypto Payment Infrastructure (Future Roadmap)

This requires additional integrations beyond Stripe:

| Asset | Integration | Status |
|-------|-------------|--------|
| BTC | Coinbase Commerce / BTCPay | Future |
| ETH | Coinbase Commerce / Web3 | Future |
| XRP | XRPL Direct / Xumm | Future |
| XDK | Native XODIAK wallet | Future |

Each crypto rail requires:
1. Exchange rate API integration
2. Wallet address generation/verification
3. Transaction confirmation webhooks
4. XDK minting upon confirmation

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dealroom/EscrowPaymentModal.tsx` | Update PaymentElement layout to accordion, show all methods |
| `supabase/functions/create-escrow-payment-intent/index.ts` | Use explicit `payment_method_types` instead of automatic |

## Expected Outcome

After Phase 1:
- Users see accordion with Card, Bank Account options
- Can enter new card details (not just use saved Link card)
- Clear visual separation between payment methods

After Phase 2:
- Payment method selector before Stripe modal
- Crypto option visible (disabled with "Coming Soon")
- Better UX flow for all participants

---

## Technical Notes

**Why Link shows first:**
Stripe Link automatically appears when `automatic_payment_methods` is enabled and the customer has a saved payment method. By explicitly listing `payment_method_types`, we control exactly what appears.

**Accordion vs Tabs:**
Accordion layout ensures all options are visible without requiring clicks to discover them. Better for users unfamiliar with the interface.
