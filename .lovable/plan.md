
# Unified Stripe Webhook System

## The Problem
Right now you have 3 separate webhook endpoints that each only listen for 1-2 events, and some of them reference events that don't even exist (like `transfer.paid`). This means every time Stripe does something important, there's a chance the platform misses it -- which is exactly what happened with Peter's stuck $485.20.

## The Solution
Instead of creating one webhook endpoint per event category, we'll build **one master webhook endpoint** that handles ALL Stripe events relevant to the platform. You'll only need to set up **one destination** in the Stripe Dashboard.

## What Events We Need

### Money Coming IN
| Event | What It Does |
|-------|-------------|
| `payment_intent.succeeded` | Escrow funding and fund contributions confirmed |
| `payment_intent.payment_failed` | Payment attempt failed -- notify user |
| `invoice.paid` | Client invoice paid -- mint XDK, credit wallet |
| `invoice.payment_failed` | Client invoice payment failed -- keep open for retry |
| `invoice.voided` | Invoice cancelled |
| `charge.refunded` | Money returned to payer -- reverse XDK if applicable |
| `charge.dispute.created` | Chargeback opened -- flag for review |
| `charge.dispute.closed` | Chargeback resolved |

### Money Going OUT (to partners like Peter)
| Event | What It Does |
|-------|-------------|
| `transfer.created` | Withdrawal transfer initiated to connected account |
| `transfer.failed` | Transfer failed -- refund XDK balance, notify user |
| `transfer.reversed` | Transfer reversed -- refund XDK balance, notify user |
| `payout.paid` | Money landed in partner's bank account (final confirmation) |
| `payout.failed` | Bank deposit failed -- flag for review |

### Connected Accounts (Stripe Connect)
| Event | What It Does |
|-------|-------------|
| `account.updated` | Partner's Stripe Connect status changed (onboarding completed, issues flagged) |

## What Changes

1. **New unified function**: `stripe-webhook` -- one function that routes ALL events to the correct handler logic (merging the existing logic from `stripe-transfer-webhook`, `invoice-payment-webhook`, and `fund-contribution-webhook`)

2. **Remove old functions**: Delete the 3 separate webhook functions since all their logic moves into the unified one

3. **One Stripe Dashboard setup**: You create ONE webhook destination with ALL the events above, get ONE signing secret, done forever

## Stripe Dashboard Instructions (after approval)

In Stripe Dashboard > Developers > Webhooks:
1. Click **"+ Add destination"**
2. Select **"Webhook endpoint"**
3. Set Endpoint URL to: the new unified webhook URL
4. Under "Select events", check ALL the events listed above (16 total)
5. Click **"Add destination"**
6. Copy the **Signing secret** (starts with `whsec_`) and paste it in chat

## Technical Details

### Architecture
The unified function will use a router pattern:

```text
stripe-webhook receives event
    |
    +--> payment_intent.succeeded --> handle escrow/fund contribution
    +--> payment_intent.payment_failed --> notify failure  
    +--> invoice.paid --> mint XDK, credit wallet
    +--> invoice.payment_failed --> mark retry
    +--> invoice.voided --> mark void
    +--> charge.refunded --> reverse XDK if applicable
    +--> charge.dispute.created --> flag for admin
    +--> charge.dispute.closed --> update dispute status
    +--> transfer.created --> update withdrawal to processing
    +--> transfer.failed --> refund XDK, mark failed
    +--> transfer.reversed --> refund XDK, mark failed
    +--> payout.paid --> update withdrawal to completed (final)
    +--> payout.failed --> flag for admin review
    +--> account.updated --> sync Connect status to profiles
    +--> [unknown event] --> log and acknowledge (200 OK)
```

### Key improvement: `payout.paid` instead of `transfer.paid`
The reason Peter's withdrawal stayed stuck is that `transfer.paid` doesn't exist as a Stripe event. What actually confirms money landed is `payout.paid`. The new system correctly uses `transfer.created` (money left the platform) and `payout.paid` (money arrived in the partner's bank).

### Files to create
- `supabase/functions/stripe-webhook/index.ts` -- the unified handler

### Files to delete
- `supabase/functions/stripe-transfer-webhook/index.ts`
- `supabase/functions/invoice-payment-webhook/index.ts`  
- `supabase/functions/fund-contribution-webhook/index.ts`

### Config changes
- `supabase/config.toml` -- add `stripe-webhook` with `verify_jwt = false`, remove old entries

### Existing logic preserved
All the XDK minting, balance updates, ledger entries, notifications, and refund logic from the 3 existing webhooks will be carried over exactly as-is into the unified handler.
