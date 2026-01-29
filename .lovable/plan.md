
# Unified Value Ledger System: Complete Attribution & Export

## What You're Asking For

You want **every financial transaction tokenized and attributed** so that:

1. **Every dollar has a source** - When Harley deposits $250, it's tagged as "MacDonald Holdings LLC via Harley"
2. **Every payment has a destination trail** - When Peter gets paid, the ledger shows which deposits funded it
3. **Contribution credits are earned** - People who fund, execute, or close deals gain "value credits" that inform future compensation
4. **Multiple export formats** - View as human language narrative, visual diagrams, raw JSON, and exportable PDF/text

## Current State Analysis

| What Exists | What's Missing |
|-------------|----------------|
| `escrow_transactions` table with `attribution_chain` JSONB column | Source entity tracking (person vs company) |
| `contribution_events` table with credits | Funder attribution (who paid for what) |
| `xodiak_transactions` table with full blockchain-style logging | Cross-table unified view |
| `escrow_funding_requests` tracks who funded | Purpose/destination linking |
| `XodiakBlockExplorer` shows transactions | Human narrative export |
| `exportDealRoomPDF` utility exists | Ledger-specific PDF export |

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED VALUE LEDGER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EVERY TRANSACTION CAPTURES:                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ WHO funded it?                                                       │   │
│   │   • user_id (Harley)                                                 │   │
│   │   • entity_id (MacDonald Holdings LLC)                               │   │
│   │   • entity_type (individual / company / deal_room)                   │   │
│   │                                                                      │   │
│   │ WHAT was it for?                                                     │   │
│   │   • purpose (escrow_deposit / invoice_payment / subscription)        │   │
│   │   • destination_type (deal_room_treasury / user_wallet / vendor)     │   │
│   │   • destination_id (OptimoIT's wallet)                               │   │
│   │                                                                      │   │
│   │ HOW was value created?                                               │   │
│   │   • value_type (cash / service / compute / meeting)                  │   │
│   │   • credit_earned (contribution credits for compensation logic)      │   │
│   │   • verifiable_proof (HubSpot meeting, Stripe payment, etc.)         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Enhanced Attribution Schema

**New Database Table: `value_ledger_entries`**

A unified ledger that links all financial events with complete attribution:

```sql
CREATE TABLE value_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID REFERENCES deal_rooms(id),
  
  -- SOURCE: Who provided the value?
  source_user_id UUID REFERENCES auth.users(id),
  source_entity_type TEXT NOT NULL, -- 'individual', 'company', 'deal_room', 'agent'
  source_entity_id UUID,
  source_entity_name TEXT NOT NULL, -- "Harley MacDonald" or "MacDonald Holdings LLC"
  
  -- DESTINATION: Where did the value go?
  destination_user_id UUID,
  destination_entity_type TEXT,
  destination_entity_id UUID,
  destination_entity_name TEXT,
  
  -- TRANSACTION DETAILS
  entry_type TEXT NOT NULL, -- 'escrow_deposit', 'invoice_payment', 'payout', 'fee', 'subscription', 'service_credit'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  xdk_amount NUMERIC, -- If converted to XDK
  
  -- PURPOSE & CONTEXT
  purpose TEXT, -- Human-readable: "Monthly retainer contribution"
  reference_type TEXT, -- 'escrow_funding_request', 'platform_invoice', 'contribution_event'
  reference_id UUID,
  
  -- CREDITS EARNED
  contribution_credits NUMERIC DEFAULT 0,
  credit_category TEXT, -- 'funding', 'execution', 'outcome'
  
  -- VERIFICATION
  verification_source TEXT, -- 'stripe', 'hubspot', 'manual', 'agent'
  verification_id TEXT, -- External reference
  verified_at TIMESTAMPTZ,
  
  -- BLOCKCHAIN ANCHOR
  xdk_tx_hash TEXT,
  xodiak_block_number BIGINT,
  
  -- NARRATIVE (Human-readable)
  narrative TEXT, -- "Harley MacDonald (MacDonald Holdings LLC) deposited $250 to The View Pro deal room escrow on Jan 28, 2026"
  
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);
```

### Phase 2: Automatic Ledger Entry Creation

**Modify existing edge functions** to create ledger entries:

| Edge Function | Ledger Entry Created |
|---------------|---------------------|
| `escrow-verify-funding` | "Harley (MacDonald Holdings LLC) deposited $250 to escrow" |
| `invoice-payment-webhook` | "Casey (The View Pro) paid $1,000 invoice" |
| `settlement-execute` | "Peter (OptimoIT) received $250 payout from escrow" |
| `log-external-agent-activity` | "Lindy.ai agent set meeting - 50 action credits earned" |

**Example Entry for Harley's Deposit:**
```json
{
  "source_user_id": "harley-uuid",
  "source_entity_type": "company",
  "source_entity_id": "macdonald-holdings-uuid",
  "source_entity_name": "MacDonald Holdings LLC",
  "destination_entity_type": "deal_room",
  "destination_entity_name": "The View Pro Strategic Partnership",
  "entry_type": "escrow_deposit",
  "amount": 250,
  "purpose": "Monthly retainer contribution (50% split)",
  "contribution_credits": 25,
  "credit_category": "funding",
  "narrative": "Harley MacDonald (MacDonald Holdings LLC) deposited $250.00 to The View Pro deal room treasury on January 28, 2026. This contribution represents 50% of Peter's $500 monthly retainer. 25 funding credits earned."
}
```

### Phase 3: Value Ledger Viewer Component

**New Component: `ValueLedgerViewer.tsx`**

Provides three views of the same data:

1. **Human Language View** - Narrative timeline
2. **Diagram View** - Sankey flow or node graph
3. **Code View** - Raw JSON with copy/export

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  VALUE LEDGER  │  Timeline  │  Flow Diagram  │  Raw Data  │  [Export ▼]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIMELINE VIEW (Human Language)                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Jan 28, 2026 - 2:30 PM                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 💰 ESCROW DEPOSIT                                                     │   │
│  │                                                                       │   │
│  │ Harley MacDonald (MacDonald Holdings LLC) deposited $250.00 to        │   │
│  │ The View Pro deal room treasury.                                      │   │
│  │                                                                       │   │
│  │ Purpose: Monthly retainer contribution (50% of Peter's $500)          │   │
│  │ Credits Earned: 25 funding credits                                    │   │
│  │ XDK Minted: 250 XDK (tx: 0x3f8a...)                                   │   │
│  │                                                                       │   │
│  │ [View Proof] [Copy JSON]                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Jan 28, 2026 - 2:15 PM                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 💰 ESCROW DEPOSIT                                                     │   │
│  │                                                                       │   │
│  │ Bill Mercer (Business Development LLC) deposited $250.00 to           │   │
│  │ The View Pro deal room treasury.                                      │   │
│  │                                                                       │   │
│  │ Purpose: Monthly retainer contribution (50% of Peter's $500)          │   │
│  │ Credits Earned: 25 funding credits                                    │   │
│  │ XDK Minted: 250 XDK (tx: 0x7b2c...)                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase 4: Export Capabilities

**Export Options:**

1. **PDF Export** - Full ledger report with:
   - Cover page with deal room info
   - Timeline of all transactions
   - Attribution breakdown chart
   - Credit summary per participant
   - XODIAK verification hashes

2. **Text/Markdown Export** - Structured narrative
3. **JSON Export** - Complete data for external systems
4. **CSV Export** - For spreadsheet analysis

**PDF Example Structure:**
```text
═══════════════════════════════════════════════════════
  THE VIEW PRO STRATEGIC PARTNERSHIP
  VALUE LEDGER REPORT
  Generated: January 29, 2026
═══════════════════════════════════════════════════════

EXECUTIVE SUMMARY
─────────────────────────────────────────────────────
Total Value Transacted:     $3,500.00
Total XDK Minted:           3,500 XDK
Unique Contributors:        3 entities
Total Credits Distributed:  175 credits

CONTRIBUTION BREAKDOWN
─────────────────────────────────────────────────────
Business Development LLC:   $1,750 (50%)   87.5 credits
MacDonald Holdings LLC:     $1,250 (36%)   62.5 credits
The View Pro (Client):      $500   (14%)   25.0 credits

TRANSACTION LEDGER
─────────────────────────────────────────────────────
[Entry 1 - Jan 28, 2:30 PM]
Type:    Escrow Deposit
From:    Harley MacDonald (MacDonald Holdings LLC)
To:      The View Pro Deal Room Treasury
Amount:  $250.00 → 250 XDK
Purpose: Monthly retainer contribution
XDK TX:  0x3f8a7b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
Credits: 25 funding credits

[... more entries ...]

VERIFICATION CERTIFICATE
─────────────────────────────────────────────────────
This ledger is anchored to XODIAK blockchain.
Merkle Root: 0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b
Validator:   Genesis Validator
Block:       #1,247
```

### Phase 5: Lindy.ai Credit Attribution

When you're paying for Lindy.ai and someone else takes over:

```sql
INSERT INTO value_ledger_entries (
  source_entity_name,
  source_entity_type,
  entry_type,
  purpose,
  narrative
) VALUES (
  'MacDonald Holdings LLC',
  'company',
  'subscription_payment',
  'Lindy.ai AI agent subscription - January 2026',
  'MacDonald Holdings LLC paid $99 for Lindy.ai subscription (previously paid by Business Development LLC). This covers AI agent compute costs for sales outreach automation.'
);
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/[new]` | Create | `value_ledger_entries` table |
| `supabase/functions/escrow-verify-funding/index.ts` | Modify | Add ledger entry creation |
| `supabase/functions/invoice-payment-webhook/index.ts` | Modify | Add ledger entry creation |
| `supabase/functions/settlement-execute/index.ts` | Modify | Add ledger entry creation |
| `src/components/ledger/ValueLedgerViewer.tsx` | Create | Main ledger viewer with tabs |
| `src/components/ledger/LedgerTimeline.tsx` | Create | Human narrative view |
| `src/components/ledger/LedgerFlowDiagram.tsx` | Create | Visual flow diagram |
| `src/components/ledger/LedgerRawData.tsx` | Create | JSON/code view |
| `src/utils/exportLedgerPDF.ts` | Create | PDF generation for ledger |
| `src/utils/exportLedgerFormats.ts` | Create | Text, CSV, JSON exports |
| `src/hooks/useValueLedger.tsx` | Create | Ledger data fetching hook |

---

## How This Answers Your Requirements

| Requirement | Solution |
|-------------|----------|
| "Harley uploading money needs to be logged that way" | `source_entity_name = "MacDonald Holdings LLC"`, `entry_type = "escrow_deposit"` |
| "Used to pay Peter's invoice" | `destination_entity_name = "OptimoIT"`, `purpose = "Monthly retainer payout"` |
| "Lindy.ai credits paid by Harley" | `entry_type = "subscription_payment"`, `source_entity_name = "MacDonald Holdings LLC"` |
| "Differentiate Bill vs Business Development LLC" | `source_entity_type` distinguishes `individual` vs `company` |
| "Contribution credits for compensation" | `contribution_credits` field on every entry |
| "View in human language" | `narrative` field + `LedgerTimeline` component |
| "View in diagrams" | `LedgerFlowDiagram` with Recharts Sankey or ReactFlow |
| "View in computer code" | `LedgerRawData` with JSON viewer |
| "Export as PDF" | `exportLedgerPDF.ts` generates branded PDF report |
| "Export as text" | `exportLedgerFormats.ts` generates markdown/text |

---

## Implementation Order

1. **Create `value_ledger_entries` table** with full attribution schema
2. **Update `escrow-verify-funding`** to create ledger entries (Harley's deposit case)
3. **Create `useValueLedger` hook** for fetching and filtering entries
4. **Create `ValueLedgerViewer`** with Timeline, Diagram, and Raw tabs
5. **Create `exportLedgerPDF`** utility for PDF generation
6. **Add ledger viewer to Deal Room** Financial Rails tab
7. **Update invoice/payout functions** to create ledger entries
