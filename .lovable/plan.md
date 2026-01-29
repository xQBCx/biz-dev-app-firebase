
# Add STRIPE_WEBHOOK_SECRET to Backend Secrets

## Overview
Add the Stripe webhook signing secret to enable secure verification of incoming webhook events from Stripe.

## What Will Be Done
Add a new backend secret:
- **Name**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_VMqApEhVPkJFknZmYte3nNwjxa0V0dEJ`

## Why This Is Needed
The `invoice-payment-webhook` edge function uses this secret to verify that incoming webhook requests are genuinely from Stripe (not spoofed). This is a security best practice that prevents malicious actors from triggering fake payment events.

## What This Enables
Once configured, the complete automated invoice payment flow will work:

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client Pays    │────▶│  Stripe Fires   │────▶│  Edge Function  │
│  Invoice        │     │  invoice.paid   │     │  Verifies Sig   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Value Ledger   │◀────│  XDK Minted &   │
                        │  Entry Created  │     │  Credited       │
                        └─────────────────┘     └─────────────────┘
```

## Technical Details
- No code changes required - the `invoice-payment-webhook` function already reads `STRIPE_WEBHOOK_SECRET` from environment variables
- The function will use `stripe.webhooks.constructEvent()` to verify the signature
- Invalid signatures will be rejected with a 400 error
