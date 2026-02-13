
## Build Signal Scout Feed Endpoint + Rotation System

### What We're Building
1. **Database migration** — Add `signal_scout_last_scanned` (TIMESTAMPTZ, nullable) to `crm_companies` table with index on `(client_id, signal_scout_last_scanned NULLS FIRST)`

2. **New edge function: `signal-scout-feed`** — George's agent calls this instead of HubSpot
   - Auth: `x-api-key` header (validates against user profile like other agent endpoints)
   - Params: `deal_room_id` (required), `limit` (optional, default 100, max 500)
   - Calls HubSpot API using existing `HUBSPOT_ACCESS_TOKEN`
   - Returns 100 companies sorted by never-scanned first, then oldest-scanned
   - Returns: id, name, domain, industry, city, state, external_crm_id
   - Eliminates George's 400 error — he never queries HubSpot properties

3. **Update `lindy-webhook`** — On both `signal.detected` and `scan.completed`:
   - Upsert company into `crm_companies` with `external_crm_id` and `client_id`
   - Set `signal_scout_last_scanned = now()` locally
   - Keep existing HubSpot note/update logic

4. **Update `workflow-event-router`** — Same upsert + timestamp logic for consistency

5. **Update `supabase/config.toml`** — Add `signal-scout-feed` function config with `verify_jwt = false` (uses x-api-key auth)

### Why This Works
- George makes one HTTP call instead of HubSpot search — no property name confusion, no 400 errors
- Companies flow into Biz Dev CRM 100 at a time as signals are processed
- Rotation is automatic — query always returns oldest-scanned companies first, so once all are scanned it loops back naturally
- Enrichment, attribution, and audit trail stay intact
- View Pro sees us ingesting their contacts gradually, not bulk-downloading

### Files to Modify
- Database: Add column + index
- New file: `supabase/functions/signal-scout-feed/index.ts`
- Update: `supabase/functions/lindy-webhook/index.ts` (add company upsert)
- Update: `supabase/functions/workflow-event-router/index.ts` (same upsert)
- Update: `supabase/config.toml` (register new function)

### Risks/Unknowns
- HubSpot API rate limits — feed endpoint will query HubSpot 4x/day; need to check we're within limits
- Company domain format in HubSpot — may need to map from HubSpot field name
- Signal Scout already has a deal_room_id passed — confirming this is available in George's Lindy flow

