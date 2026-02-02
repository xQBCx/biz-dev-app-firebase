
# Fix Plan: Escrow Payment Verification & Financial Rails Black Screen

## Problem Summary
You've identified two critical issues:
1. **$10 payments not showing**: Payment succeeded in Stripe but isn't verified in the database
2. **Black screen on Financial Rails**: Component crashes due to querying wrong database table

---

## Root Causes

### Payment Not Verified
The payment flow creates PaymentIntents, but after successful payment the app doesn't call the verification function. The `escrow-verify-funding` function expects Checkout Session IDs but receives PaymentIntent IDs.

Your $10 is safe - it's recorded with status "pending" and just needs to be marked as completed.

### Black Screen
The Financial Rails component queries the wrong database table (`xodiak_accounts` with a column that doesn't exist). The correct table is `deal_room_xdk_treasury`.

---

## Solution

### Part 1: Fix Payment Verification Flow

**1. Update `EscrowPaymentModal.tsx`** - Call verification after successful payment:
- After `paymentIntent.status === "succeeded"`, invoke the `escrow-verify-funding` function
- Pass the PaymentIntent ID for verification

**2. Update `escrow-verify-funding` edge function** - Support PaymentIntent verification:
- Accept both Checkout Session IDs and PaymentIntent IDs
- Add logic to detect which type was passed and retrieve appropriately
- Process XDK minting and treasury updates

### Part 2: Fix Financial Rails Query

**Update `FinancialRailsTab.tsx`** - Query correct table:
- Change query from `xodiak_accounts` to `deal_room_xdk_treasury`
- Add proper error handling with try/catch to prevent black screens
- Show user-friendly message if treasury doesn't exist yet

---

## Immediate Data Fix

Your existing $10 payments need to be manually verified. The plan includes updating those records and minting the appropriate XDK to the Test Deal treasury.

---

## Technical Details

### File Changes

**`src/components/dealroom/EscrowPaymentModal.tsx`**
- Add verification call after payment success
- Import supabase client
- Call `escrow-verify-funding` with paymentIntentId

**`supabase/functions/escrow-verify-funding/index.ts`**  
- Add PaymentIntent support alongside Checkout Session
- Detect ID type by prefix (`pi_` vs `cs_`)
- Use appropriate Stripe API method

**`src/components/deal-room/FinancialRailsTab.tsx`**
- Fix treasury query to use `deal_room_xdk_treasury` table
- Add try/catch for all async operations
- Add fallback UI for errors

### Database Updates
- Mark your 2 pending Test Deal payments as "completed"
- Create treasury for Test Deal (doesn't exist yet)
- Mint XDK to new treasury

---

## Expected Outcome
- All new escrow payments will be automatically verified and XDK minted
- Financial Rails will load without crashing on all deal rooms
- Your $10 test payment will appear in the treasury balance
