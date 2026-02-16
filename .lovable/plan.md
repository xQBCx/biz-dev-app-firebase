

# Store Stripe Webhook Signing Secret

## What's Happening
The unified webhook code is already fully built and deployed with signature verification logic. The only remaining step is updating the `STRIPE_WEBHOOK_SECRET` with your new signing key so Stripe events are accepted.

## What Changes
1. **Update the `STRIPE_WEBHOOK_SECRET`** secret value to: `whsec_raGokdWGbgdDWa8kH0DKYnrnMaMIqtWr`

That's it -- no code changes needed. The webhook function already reads this secret and uses it to verify incoming events.

## After This
- All Stripe events will be signature-verified and routed to the correct handler
- Unhandled events return `200 OK` gracefully (future-proofed as agreed)
- Peter's withdrawal flow will correctly track `transfer.created` -> `payout.paid`

