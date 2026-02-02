

# Fix Plan: Resolve Agent UUID + Fix Enum for Signal Scout

## Goal
Fix the two bugs preventing George's Signal Scout webhook from creating contribution events. After this fix, **any future agent** will work automatically without code changes.

## What's Broken

### Bug 1: String vs UUID Type Mismatch
The `contribution_events.actor_id` column requires a **UUID**, but the code inserts `event.agent_id` directly, which contains the string `"signal_scout"`.

**Error**: `invalid input syntax for type uuid`

### Bug 2: Invalid Enum Value
The code uses `event_type: "agent_workflow_completed"` which is **not a valid value** in the `contribution_event_type` enum.

**Valid values include**: `agent_executed`, `workflow_triggered`, `task_completed`, etc.

---

## Fix Implementation

### Step 1: Add Slug-to-UUID Resolution with Auto-Registration

Update `supabase/functions/workflow-event-router/index.ts` to resolve agent slugs to UUIDs before inserting contribution events.

**Logic**:
1. Check if `agent_id` looks like a UUID (matches UUID regex)
2. If yes → use it directly
3. If no → look up `instincts_agents` by slug
4. If found → use the agent's UUID
5. If not found → **auto-register** the agent and use the new UUID

This ensures George can send `lindy_agent_id: "signal_scout"` and it will work, while also supporting future agents like `"account_intel"`, `"sequence_draft"`, etc. without any manual registration.

### Step 2: Fix the Event Type Enum

Change from the invalid value to a valid one:

```text
BEFORE:  event_type: "agent_workflow_completed"  (INVALID)
AFTER:   event_type: "agent_executed"            (VALID)
```

### Step 3: Preserve Original Slug in Payload

Store the original agent slug in the event payload for display and debugging:

```json
{
  "source_platform": "lindy.ai",
  "agent_slug": "signal_scout",
  "workflow_id": "...",
  ...
}
```

---

## Code Changes

### File: `supabase/functions/workflow-event-router/index.ts`

Add a helper function to resolve or create agent:

```typescript
// UUID validation helper
function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Resolve agent slug to UUID, auto-registering if needed
async function resolveAgentUuid(
  supabase: SupabaseClientAny,
  agentRef: string,
  sourcePlatform: string
): Promise<{ uuid: string; slug: string; isNew: boolean }> {
  // If already a UUID, return it
  if (isUuid(agentRef)) {
    return { uuid: agentRef, slug: agentRef, isNew: false };
  }

  const slug = agentRef.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  // Look up existing agent
  const { data: existing } = await supabase
    .from('instincts_agents')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return { uuid: existing.id, slug: existing.slug, isNew: false };
  }

  // Auto-register new agent
  const { data: newAgent, error } = await supabase
    .from('instincts_agents')
    .insert({
      slug,
      name: formatAgentName(slug),
      category: 'sales',
      is_active: true,
      capabilities: [sourcePlatform],
      config_schema: { auto_registered: true, source_platform: sourcePlatform }
    })
    .select('id, slug')
    .single();

  if (error) {
    console.error('Failed to auto-register agent:', error);
    throw new Error(`Cannot resolve agent: ${agentRef}`);
  }

  console.log(`Auto-registered new agent: ${slug} -> ${newAgent.id}`);
  return { uuid: newAgent.id, slug: newAgent.slug, isNew: true };
}

function formatAgentName(slug: string): string {
  return slug
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

Update `createContributionEvent` function:

```typescript
async function createContributionEvent(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ event_id: string }> {
  // Resolve agent slug to UUID
  const agentResolution = await resolveAgentUuid(
    supabase,
    event.agent_id || 'unknown_agent',
    event.source_platform
  );

  // Credit map unchanged...
  const credits = creditMap[event.outcome_type || ""] || { compute: 1, action: 1, outcome: 0 };

  const { data, error } = await supabase
    .from("contribution_events")
    .insert({
      actor_type: "agent",
      actor_id: agentResolution.uuid,  // ← UUID now!
      event_type: "agent_executed",     // ← Valid enum now!
      event_description: `${event.source_platform} workflow: ${event.outcome_type}`,
      deal_room_id: event.deal_room_id,
      compute_credits: credits.compute,
      action_credits: credits.action,
      outcome_credits: credits.outcome,
      payload: {
        source_platform: event.source_platform,
        agent_slug: agentResolution.slug,  // ← Preserve for display
        auto_registered: agentResolution.isNew,
        workflow_id: event.workflow_id,
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        value_amount: event.value_amount,
      },
      attribution_tags: [event.source_platform, event.outcome_type || "unknown"],
    })
    .select()
    .single();

  if (error) throw error;
  return { event_id: data.id };
}
```

---

## Testing Plan

After deployment, send the same request George has been using:

```json
{
  "event_type": "signal.detected",
  "deal_room_id": "<the-view-pro-deal-room-id>",
  "lindy_agent_id": "signal_scout",
  "data": {
    "company_name": "Test Company",
    "signal_title": "New permit filed"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "routing_results": [
    { "handler": "attribution", "success": true },
    { "handler": "credit_metering", "success": true },
    { "handler": "contribution", "success": true }  // ← This one was failing
  ]
}
```

**Database Verification**:
- `instincts_agents` should have a `signal_scout` row (auto-created)
- `contribution_events` should have a new row with `actor_id` = the UUID of signal_scout

---

## Why This Approach is Scalable

### Adding Future Agents (After This Fix)

| Step | Who Does It | Effort |
|------|-------------|--------|
| 1. Partner decides to deploy a new agent (e.g., "account_intel") | George @ OptimoIT | - |
| 2. Partner sends webhook with `lindy_agent_id: "account_intel"` | Lindy.ai | Automatic |
| 3. System auto-registers the agent | Biz Dev App | Automatic |
| 4. Contribution events are created | Biz Dev App | Automatic |
| 5. Credits are tracked | Biz Dev App | Automatic |

**No code changes. No Lovable tickets. No back-and-forth.**

### What Partners Can Do Today

With OptimoIT's existing API key, they can also:
- Call `partner-agent-integration` with `action: "register_agent"` to pre-register agents with custom metadata
- Use `action: "hubspot_create_contact"` to push data to client HubSpot instances
- Use `action: "sync_data"` to sync contacts/activities

---

## Summary

This fix is **minimal but future-proof**:
- Fixes the immediate UUID type error
- Fixes the enum mismatch
- Adds auto-registration so future agents "just work"
- Preserves all existing functionality

**Time to implement**: ~30 minutes
**Files changed**: 1 (`workflow-event-router/index.ts`)
**Database changes**: None required

