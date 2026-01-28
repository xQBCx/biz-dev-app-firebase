
# Fully In-App Bank Account Onboarding

## Overview

Replace the current redirect-based Express onboarding with Stripe's **Connect Embedded Components**. Users like Peter will complete all verification (identity, bank account, tax info) directly within the Biz Dev App profile page.

## What Users Will Experience

Instead of clicking "Set Up Fast Payouts" and being redirected to Stripe's website, users will:
1. Click "Set Up Fast Payouts"
2. See a modal or expanded section with Stripe's embedded onboarding form (styled to match your app)
3. Complete all verification steps in-app
4. See success confirmation when done

## Technical Implementation

### 1. Install Stripe Connect React Library

Add `@stripe/connect-js` and `@stripe/react-connect-js` packages to enable embedded components.

### 2. Create Account Session Edge Function

New edge function `create-stripe-account-session` that generates an Account Session (not Account Link). This provides a client secret for the embedded component.

```text
Frontend                    Edge Function              Stripe
   |                             |                       |
   |-- Request session --------->|                       |
   |                             |-- Create Account ---->|
   |                             |<-- Account ID --------|
   |                             |-- Create Session ---->|
   |                             |<-- Client Secret -----|
   |<-- { clientSecret } --------|                       |
   |                             |                       |
   |-- Render embedded component using clientSecret      |
```

### 3. Update Account Creation

Change account type from `express` to `custom` to enable full embedded component support. Custom accounts allow:
- Embedded onboarding without redirects
- Platform-managed experience
- Same payout capabilities

### 4. Update Frontend Component

Replace the redirect flow in `StripeConnectOnboarding.tsx` with:
- `ConnectComponentsProvider` wrapper
- `ConnectAccountOnboarding` embedded component
- Modal/dialog to display the onboarding form
- `onExit` callback to handle completion

### 5. Configure Platform Settings

In Stripe Dashboard, configure:
- Site links for embedded components (required for live mode)
- Email branding (Stripe sends verification emails from your domain)

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Add @stripe/connect-js, @stripe/react-connect-js |
| `supabase/functions/create-stripe-account-session/index.ts` | New edge function |
| `supabase/functions/create-stripe-connect/index.ts` | Change type: "express" to type: "custom" |
| `src/components/profile/StripeConnectOnboarding.tsx` | Replace redirect with embedded component |
| `src/lib/stripe-connect.ts` | Helper to initialize ConnectJS |

## Technical Details

### Account Session Creation (Edge Function)
```typescript
// Creates session for embedded component
const accountSession = await stripe.accountSessions.create({
  account: accountId,
  components: {
    account_onboarding: {
      enabled: true,
      features: {
        external_account_collection: true
      }
    }
  }
});
return { clientSecret: accountSession.client_secret };
```

### Frontend Embedded Component
```typescript
<ConnectComponentsProvider connectInstance={stripeConnectInstance}>
  <ConnectAccountOnboarding
    onExit={() => {
      // User completed or exited onboarding
      refetchStatus();
      setShowOnboarding(false);
    }}
  />
</ConnectComponentsProvider>
```

## Stripe Dashboard Configuration Required

After implementation, you'll need to configure in Stripe Dashboard:
1. **Connect Settings > Site Links** - URLs where embedded components are hosted
2. **Connect Settings > Emails** - Optional custom email domain

## Benefits Over Current Implementation

| Feature | Current (Express + Redirect) | New (Custom + Embedded) |
|---------|------------------------------|-------------------------|
| User stays in app | No | Yes |
| Custom styling | Limited | Full control |
| Branding | Stripe-heavy | Your branding |
| User experience | Jarring redirect | Seamless modal |

## Considerations

- **One-time platform setup**: You still need to complete the platform profile questionnaire (this is a one-time Stripe requirement for any Connect integration)
- **Same security**: Stripe still handles all sensitive data collection and KYC
- **Compliance**: Stripe embedded components auto-update when regulations change
