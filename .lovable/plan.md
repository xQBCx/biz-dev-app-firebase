
# Stripe Setup Guide: What You Need for Biz Dev App

## Your Goals Summary
1. **Send invoices** to Casey (The View Pro) as recurring payments
2. **Receive payments** in-app (already implemented via Payment Element)
3. **Pay out** to people/companies (partially implemented via Connect)
4. **Mobile-ready** (no redirects to Stripe pages)

---

## Setup Guide Breakdown: What You Need

### ✅ MUST COMPLETE (Required for Your Use Cases)

| Section | Why You Need It |
|---------|-----------------|
| **Complete Your Platform Profile** | Required to create connected accounts (like Peter/George) in live mode. This is the current blocker. |
| **Payments** | Already enabled - this powers your escrow funding |
| **Connect** | Already enabled - this powers Fast Payouts to partners |

### 🔶 RECOMMENDED (Adds Key Features)

| Section | What It Does | Your Use Case |
|---------|--------------|---------------|
| **Invoicing** | Create, send, and track invoices with automatic payment collection | Send Casey recurring invoices from the app instead of Square |
| **Tax** | Automatically calculate and collect sales tax | When invoicing clients like Casey, ensures tax compliance |

### ❌ NOT NEEDED (For Now)

| Section | What It Is | Why Skip |
|---------|------------|----------|
| **Issuing** | Create virtual/physical debit cards for your business | Only needed if you want to give partners branded debit cards to spend earnings |
| **Terminal** | Accept in-person card payments with physical hardware | Only for retail/point-of-sale; skip unless you'll have a physical office taking card swipes |
| **Climate** | Donate a portion of revenue to carbon removal | Optional sustainability initiative, not core functionality |
| **Radar** | Advanced fraud detection and prevention | Already included with Payments; only upgrade if you have high fraud risk |
| **Identity** | Verify customer identity with ID document scanning | Only needed for high-risk verification (KYC for financial services) |
| **Financial Connections** | Access customer bank account data (balances, transactions) | Only for apps that need to read user bank data (loan underwriting, budgeting apps) |

---

## Implementation Plan

### Phase 1: Complete Platform Profile (Unblocks Everything)
In your Stripe Dashboard, go through the Setup Guide and complete:
- Business details (Business Development LLC)
- Owner verification
- Bank account for receiving payouts
- Accept Stripe's Connected Account Agreement

**This must be done in the Stripe Dashboard** - cannot be done from Biz Dev App

### Phase 2: Enable Invoicing
After platform profile is complete, enable Invoicing in the Setup Guide. This gives you:
- Create invoices from API (we'll build this into Biz Dev App)
- Automatic payment reminders
- Recurring invoices (perfect for Casey)
- Invoice tracking and reporting

### Phase 3: Build In-App Invoice UI
Once Invoicing is enabled, I'll implement:

**New Components:**
- `InvoiceCreationPanel.tsx` - Create and send invoices to contacts/companies
- `RecurringInvoiceSetup.tsx` - Set up recurring billing (Casey's monthly payments)
- `InvoiceHistoryTable.tsx` - Track all sent invoices and payment status

**New Edge Functions:**
- `create-invoice` - Create Stripe Invoice for a customer
- `send-invoice` - Finalize and email invoice to customer
- `list-invoices` - Fetch invoice history
- `create-subscription-invoice` - Set up recurring invoices

**Database Tables:**
- `invoices` - Track invoices sent through the app
- Link to existing `crm_contacts` and `crm_companies`

### Phase 4: Paying People/Companies (Outbound Payments)
You already have Connect for paying connected accounts (Peter, George). For paying external vendors/companies:

**Option A: Connect (Current Approach)**
Partners like Peter/George complete Fast Payouts setup → you transfer funds to their connected accounts → they receive money in their bank

**Option B: Stripe Treasury + Global Payouts (Future)**
For paying companies that don't want to create Stripe accounts, you'd need Stripe Treasury (a full banking-as-a-service product). This is complex and requires Stripe approval.

**Recommendation:** For now, require payees to complete Fast Payouts onboarding (5 min setup). This keeps everything in-app and compliant.

---

## Invoicing Casey: How It Will Work

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Biz Dev App                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. You go to Invoicing section                                  │
│                                                                  │
│  2. Select "The View Pro" or search for casey@theviewpro.com     │
│                                                                  │
│  3. Create invoice:                                              │
│     • Service: "Monthly Strategic Partnership Fee"              │
│     • Amount: $X,XXX.XX                                          │
│     • Recurrence: Monthly on 1st                                 │
│     • Payment terms: Due in 30 days                              │
│                                                                  │
│  4. Click "Send Invoice"                                         │
│     → Casey receives email with payment link                     │
│     → Payment happens in Stripe-hosted page OR                   │
│     → Casey pays via bank transfer                               │
│                                                                  │
│  5. Track payment status in app                                  │
│     → Automatically marked paid when complete                    │
│     → Next month: invoice auto-generates                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mobile App Compatibility

| Feature | Current Status | Mobile-Ready? |
|---------|----------------|---------------|
| Fund Escrow | Stripe Payment Element | ✅ Works in WebView/native |
| Fast Payouts Setup | Connect Embedded Components | ✅ Works in WebView |
| Invoice Payments (Casey pays) | Stripe Hosted Invoice Page | ⚠️ Opens external link |
| Invoice Creation | API-based | ✅ Fully in-app |

**Note:** When Casey pays an invoice, they'll click a link that opens Stripe's hosted payment page. This is standard for B2B invoicing and expected behavior. Your app users (you, Peter, George) never leave the app.

---

## Next Steps

1. **Complete the Stripe Platform Profile** in the Setup Guide (takes 10-15 minutes)
2. **Enable Invoicing** in the Setup Guide
3. Let me know when done, and I'll build the invoice creation UI

---

## Technical Details

### Edge Function: create-invoice

```typescript
// Creates a Stripe Invoice for a customer
const invoice = await stripe.invoices.create({
  customer: stripeCustomerId,
  collection_method: 'send_invoice',
  days_until_due: 30,
  auto_advance: true,
  metadata: {
    deal_room_id: dealRoomId,
    created_from: 'biz_dev_app'
  }
});

// Add line items
await stripe.invoiceItems.create({
  customer: stripeCustomerId,
  invoice: invoice.id,
  price_data: {
    currency: 'usd',
    unit_amount: amountCents,
    product_data: {
      name: 'Monthly Strategic Partnership Fee'
    }
  }
});

// Finalize and send
await stripe.invoices.finalizeInvoice(invoice.id);
await stripe.invoices.sendInvoice(invoice.id);
```

### Recurring Invoice Setup

For Casey's recurring payments, we'll use Stripe Subscriptions:

```typescript
// Create a subscription for recurring billing
const subscription = await stripe.subscriptions.create({
  customer: stripeCustomerId,
  items: [{ price: priceId }],
  collection_method: 'send_invoice',
  days_until_due: 30
});
```

This automatically generates and sends invoices each billing period.

