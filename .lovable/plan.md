
# Fix Payment Element to Show All Payment Options

## Problem Identified

The Payment Element shows only "Link" with your saved card because:
1. Your email (`bill@bdsrvs.com`) is associated with a Stripe Link account
2. When `link` is included in `payment_method_types`, Stripe auto-detects returning Link customers and shows their saved payment method first
3. The accordion layout is working, but Link is the only visible option because it's prioritized for returning customers

## Solution

Remove `link` from the `payment_method_types` array in the edge function. This forces Stripe to show Card and Bank Account options directly, without Link intercepting the display.

---

## Implementation

### Step 1: Update Edge Function

**File:** `supabase/functions/create-escrow-payment-intent/index.ts`

**Change:** Remove `"link"` from the `payment_method_types` array (lines 148-152)

Current:
```typescript
payment_method_types: [
  "card",           // Credit/debit cards
  "us_bank_account", // ACH bank transfers
  "link",           // Stripe Link saved methods
],
```

New:
```typescript
payment_method_types: [
  "card",           // Credit/debit cards
  "us_bank_account", // ACH bank transfers
],
```

### Step 2: Update Frontend PaymentElement Options

**File:** `src/components/dealroom/EscrowPaymentModal.tsx`

**Change:** Remove `"link"` from `paymentMethodOrder` array (line 225)

Current:
```typescript
paymentMethodOrder: ["card", "us_bank_account", "link"],
```

New:
```typescript
paymentMethodOrder: ["card", "us_bank_account"],
```

### Step 3: Deploy Edge Function

Redeploy `create-escrow-payment-intent` to apply the backend changes.

---

## Expected Outcome

After these changes:

| Before | After |
|--------|-------|
| Only shows "Link" with saved card | Shows accordion with Card and Bank Account sections |
| No way to enter new card details | Full card input form visible |
| ACH bank transfer hidden | Bank account option visible |

---

## Technical Explanation

Stripe Link is designed to streamline checkout for returning customers. When enabled:
1. It detects if the customer email has a Link account
2. It auto-fills their saved payment method
3. It hides other payment options to simplify the UI

By removing Link from the allowed payment methods, we force Stripe to show the raw Card and Bank Account input forms, giving users full control over which payment method to use.

---

## Future Consideration: Re-enabling Link

If you want to offer Link as an **optional** convenience alongside other methods in the future, you can:
1. Re-add `link` to `payment_method_types`
2. Configure Link settings in the Stripe Dashboard to show as a secondary option
3. Use the `defaultCollapsed: true` option in the accordion to collapse Link by default

For now, removing Link ensures all participants see Card and Bank options clearly.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/create-escrow-payment-intent/index.ts` | Remove `"link"` from `payment_method_types` |
| `src/components/dealroom/EscrowPaymentModal.tsx` | Remove `"link"` from `paymentMethodOrder` |
