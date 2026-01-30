
# Fix Signal Scout Agent Integration for The View Pro

## Summary

George's Lindy.ai Signal Scout agent is now successfully connecting (200 OK), but the system returns "Unhandled event type: signal.detected" because:

1. **Wrong Endpoint**: George is hitting `hubspot-confirm` which expects HubSpot's native array format
2. **Missing Mapping**: The `lindy-webhook` function doesn't map `signal.detected` to an outcome type
3. **Missing Attribution Rules**: No rules exist in the database to track/quantify agent outcomes for The View Pro deal room

## What George's Agent is Sending

Based on his screenshot, Signal Scout sends:
```json
{
  "subscriptionType": "signal.detected",
  "customData": {
    "company_name": "Gables Residential",
    "contact_email": "lstokes@gables.com",
    "signal_title": "Joint Venture for 243-Unit Colorado Development",
    "confidence": 80,
    "priority": "high",
    "talking_point": "..."
  }
}
```

## Implementation Plan

### Step 1: Update lindy-webhook to Handle Signal Scout Events

Add `signal.detected` and related signal events to the outcome mapping function:

```text
mapActionToOutcome() additions:
- signal.detected → trigger_detected
- signal_detected → trigger_detected
- trigger_detected → trigger_detected
- enrichment_complete → enrichment_complete
- draft_created → draft_created
```

Also add handling to store Signal Scout data in `discovered_opportunities` table when a trigger is detected.

### Step 2: Update workflow-event-router Credit Mapping

Add `trigger_detected` to the credit map so it properly tracks value:

```text
creditMap additions:
- trigger_detected: { compute: 1, action: 2, outcome: 0 }
- enrichment_complete: { compute: 2, action: 3, outcome: 0 }
- draft_created: { compute: 1, action: 2, outcome: 0 }
```

### Step 3: Add Attribution Rules for The View Pro

Create database entries for the deal room:

| Outcome Type | Base Amount | Description |
|--------------|-------------|-------------|
| meeting_set | 250 | Per your agreement with The View Pro |
| trigger_detected | 0 | Tracking only (Signal Scout) |
| enrichment_complete | 0 | Tracking only (Account Intel) |
| draft_created | 0 | Tracking only (Sequence Draft) |
| reply_received | 25 | Engagement value |

### Step 4: Store Signal Scout Data in discovered_opportunities

When a `signal.detected` or `trigger_detected` event comes through:
1. Create an entry in `discovered_opportunities` with the signal data
2. Link it to the deal room
3. Log activity for attribution tracking

---

## Where Signal Scout Data Goes in the Deal Room

George asked: "Where should this data go in the Deal Room?"

**Answer**: Signal Scout discoveries flow to **three places**:

1. **discovered_opportunities table** - Primary storage with fields:
   - `headline`: Signal title
   - `source_type`: "lindy_signal_scout"
   - `relevance_score`: Confidence value
   - `opportunity_type`: Priority (high/medium/low)
   - `entities_mentioned`: Company name, contact, talking points

2. **external_agent_activities table** - Activity log for attribution tracking

3. **contribution_events table** - Value credit quantification (when attribution rules exist)

---

## Message for George

After implementing these changes, here's the updated guidance for George:

**Correct Endpoint**: `https://eoskcsbytaurtqrnuraw.supabase.co/functions/v1/lindy-webhook`

**Payload Structure** (Lindy.ai format):
```json
{
  "event_type": "signal.detected",
  "action": "trigger_detected",
  "deal_room_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "lindy_agent_id": "signal_scout",
  "data": {
    "company_name": "Gables Residential",
    "contact_email": "lstokes@gables.com",
    "signal_title": "Joint Venture for 243-Unit Colorado Development",
    "confidence": 80,
    "priority": "high",
    "talking_point": "..."
  }
}
```

---

## Technical Details

### Files to Modify

1. **supabase/functions/lindy-webhook/index.ts**
   - Add signal event types to `mapActionToOutcome()`
   - Add handling to create `discovered_opportunities` entries

2. **supabase/functions/workflow-event-router/index.ts**
   - Add `trigger_detected`, `enrichment_complete`, `draft_created` to credit mapping

3. **Database Migration**
   - Insert attribution rules for The View Pro deal room

### Data Flow After Fix

```text
Lindy.ai Signal Scout
        │
        ▼
lindy-webhook (handles signal.detected)
        │
        ├──► lindy_webhooks table (raw event storage)
        │
        ├──► discovered_opportunities table (signal data)
        │
        ▼
workflow-event-router
        │
        ├──► Attribution Rules → agent_attribution_rules
        │
        ├──► Contribution Events → contribution_events
        │
        └──► HubSpot Sync (if configured) → crm_connections
```

### Database Entries to Create

```sql
-- Attribution rules for The View Pro Strategic Partnership
INSERT INTO agent_attribution_rules 
  (deal_room_id, outcome_type, base_amount, is_active, description)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meeting_set', 250, true, 'Qualified meeting fee'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'trigger_detected', 0, true, 'Signal Scout tracking'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'enrichment_complete', 0, true, 'Account Intel tracking'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'draft_created', 0, true, 'Sequence Draft tracking'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'reply_received', 25, true, 'Engagement tracking');
```
