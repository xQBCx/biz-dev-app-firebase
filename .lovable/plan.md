
# Plan: Keep Stripe Connect Onboarding Fully In-App

## Problem Identified

When clicking "Add information" in the Stripe Connect onboarding dialog, Stripe opens an external popup window for authentication (as shown in your screenshot - `connect.stripe.com/d/embedded/...`). This breaks the seamless in-app experience you want for the Biz Dev platform.

## Root Cause

According to Stripe's documentation, the Account Onboarding component requires user authentication via a popup by default. However, **for Custom accounts** (which we are using), Stripe provides a feature flag called `disable_stripe_user_authentication` that can eliminate this popup requirement.

The current implementation:
- Uses `overlays: "dialog"` in appearance settings
- Does NOT enable `disable_stripe_user_authentication` feature in the account session

## Solution

We need to make two changes to enable a fully embedded onboarding experience:

### 1. Update Edge Function to Disable Stripe User Authentication

Modify `supabase/functions/create-stripe-account-session/index.ts` to add `disable_stripe_user_authentication: true` to the account session features:

```text
Before:
components: {
  account_onboarding: {
    enabled: true,
    features: {
      external_account_collection: true
    }
  }
}

After:
components: {
  account_onboarding: {
    enabled: true,
    features: {
      external_account_collection: true,
      disable_stripe_user_authentication: true
    }
  }
}
```

### 2. Update Connect.js Appearance to Use Drawer Overlay

Modify `src/lib/stripe-connect.ts` to change the overlay style from `"dialog"` to `"drawer"` for a more seamless inline experience:

```text
Before:
overlays: "dialog"

After:
overlays: "drawer"
```

This makes overlays slide in from the edge of the screen rather than appearing as floating dialogs, creating a more integrated feel.

---

## Technical Details

### Why This Works

1. **Custom Accounts Support**: Your platform uses Stripe Connect Custom accounts (`type: "custom"`), which allows you to disable Stripe's authentication requirement. The platform (Biz Dev App) assumes responsibility for verifying user identity.

2. **Liability Note**: By disabling Stripe authentication, you (the platform) assume liability if connected accounts can't pay back negative balances. This aligns with your requirement to handle fraud protection at the platform level (as you mentioned earlier about wanting to protect the Biz Dev App from fraud).

3. **Mobile-First**: This change supports your future iOS/Android app deployment where external redirects and popups create a poor user experience.

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/create-stripe-account-session/index.ts` | Add `disable_stripe_user_authentication: true` feature |
| `src/lib/stripe-connect.ts` | Change `overlays: "dialog"` to `overlays: "drawer"` |

### Expected Outcome

After these changes:
- The entire onboarding flow will stay within your dialog
- No external popup windows will appear
- Users can complete KYC, identity verification, and bank account setup entirely within the Biz Dev App
- The drawer overlay style will make any additional inputs slide in smoothly from the screen edge
