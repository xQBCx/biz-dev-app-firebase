
## Implement HubSpot Sync for Signal Scout v3.0

### Problem Statement
Currently, when Signal Scout detects a trigger (company signal), the system:
1. Stores the signal in the Biz Dev App (`external_agent_activities` table)
2. Creates an opportunity record (`discovered_opportunities`)
3. **Fails to sync to HubSpot** — the `syncToHubSpot()` function in `workflow-event-router` is a stub with just a TODO comment

George needs these signals to appear as **notes on HubSpot company records** so Casey (and Bill) can see them in HubSpot without logging into the Biz Dev App. This is the "Mirroring" strategy mentioned in the architecture: agent-generated data syncs to the partner's external CRM.

### Solution Architecture

The implementation will follow a **two-step approach**:

#### Step 1: Implement HubSpot Note Creation in `workflow-event-router`

When a Signal Scout detection (outcome_type = "trigger_detected") comes through the webhook:

1. **Look up the HubSpot company record** using the company name from the signal data
2. **Create a note/engagement on that company** via HubSpot API with:
   - Body: Formatted signal content (company name, signal type, talking point, confidence score)
   - Owner: Configured HubSpot user (initially Bill's account for "proof of work")
   - Custom properties: Update `signal_scout_last_scanned` with today's date (enables George's rotation logic)
3. **Track the sync** in the database so we know which signals have been synced to HubSpot

#### Step 2: Data Flow & Mapping

**Signal data path:**
```
Lindy.ai webhook 
  → lindy-webhook (stores in external_agent_activities)
  → workflow-event-router (NOW IMPLEMENTS HUBSPOT SYNC)
```

**HubSpot note format:**
```
Signal Scout Detection
─────────────────────
Company: [company_name]
Signal Type: [signal_type]
Talking Point: [talking_point]
Confidence: [confidence_score]%
Source: Signal Scout v3.0
Detected: [timestamp]

[Additional context if provided]
```

**Owner Assignment:**
- Notes are created by the configured HubSpot API token (bill@theviewpro.com's account)
- If Casey's HubSpot user ID becomes available, we can add an association to assign him visibility
- No need for Casey to log into Lindy.ai — this is fully handled via API

#### Step 3: Database Tracking

Add a boolean column to `external_agent_activities` to track sync status:
- `synced_to_hubspot` (boolean, default false)
- `hubspot_sync_id` (text, stores HubSpot note ID)
- `hubspot_sync_error` (text, stores error message if sync fails)

This allows:
- Retry logic if a sync fails
- UI visibility of what's been synced vs. pending
- Debugging if HubSpot API errors occur

### Technical Implementation Details

**File: `supabase/functions/workflow-event-router/index.ts`**

The `syncToHubSpot()` function (currently line 544-570) will be expanded to:

1. Check if event is a Signal Scout trigger detection
2. Extract signal metadata (company name, signal details)
3. Call HubSpot API to:
   - **Search for company** by name: `GET /crm/v3/objects/companies/search`
   - **Create note on company**: `POST /crm/v3/objects/notes` with company association
   - **Update company property**: PATCH the `signal_scout_last_scanned` date field
4. Update the `external_agent_activities` record with sync status
5. Log the result for debugging

**HubSpot API Calls:**
- Uses existing `HUBSPOT_ACCESS_TOKEN` environment variable (already configured)
- Bearer token authentication: `Authorization: Bearer ${token}`
- Handles errors gracefully (logs, continues, marks as failed for retry)

**Error Handling:**
- If company not found in HubSpot → log warning, mark as "not_found", allow retry
- If note creation fails → mark as failed, include error message for debugging
- If `signal_scout_last_scanned` property doesn't exist → log warning but don't fail the note creation
- Return sync status to caller for audit logging

### UI Impact

The existing `DualCRMSyncStatus.tsx` component will:
- Show which signals are synced vs. pending (using `synced_to_hubspot` boolean)
- Display the HubSpot sync ID when available
- Show any sync errors for troubleshooting

No UI changes needed for this initial implementation — the backend creates the notes, they appear in HubSpot immediately.

### Secrets & Configuration

- **HUBSPOT_ACCESS_TOKEN** — Already configured (verified in codebase)
- **No additional secrets needed** for this phase

### Deployment & Testing

1. Update `workflow-event-router/index.ts` with full HubSpot sync logic
2. Deploy the function
3. Manually send a test Signal Scout webhook with sample company/signal data
4. Verify:
   - Note appears on HubSpot company record
   - `signal_scout_last_scanned` date is updated
   - `external_agent_activities` record shows `synced_to_hubspot = true`
   - HubSpot note shows Bill's account as creator
5. Test error scenarios (company not found, invalid property, API down)

### Future Enhancements

- **Owner Assignment**: Tag Casey's HubSpot user ID once available (no Lindy.ai login required)
- **Deal Association**: Auto-link notes to active deals if company has one
- **Retry Queue**: Implement automatic retry for failed syncs
- **Batch Sync**: For v3.0 backfill, sync all historical Signal Scout detections to HubSpot in one pass
- **Custom Fields**: Add more HubSpot custom properties as needed (e.g., signal_confidence, signal_type)

### Success Criteria

✅ Signal Scout detections appear as notes on HubSpot company records within seconds of detection  
✅ `signal_scout_last_scanned` property is updated automatically  
✅ Notes show Bill's account as creator (proof of work)  
✅ No errors break the signal detection flow  
✅ Sync status is tracked in database for debugging  
✅ George can see signals in HubSpot and doesn't need to log into the Biz Dev App  

