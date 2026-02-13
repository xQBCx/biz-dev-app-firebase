
## Signal Scout Feed Endpoint + Rotation System — Ready to Build

### Approved Architecture
The Biz Dev App acts as proxy between HubSpot and George's Signal Scout agent. Companies flow into the local CRM 100 at a time as they're scanned, no bulk import.

### What We'll Build

**1. Database Migration**
- Add column: `signal_scout_last_scanned TIMESTAMPTZ NULL` to `crm_companies`
- Add index: `idx_crm_companies_signal_scout_rotation` on `(client_id, signal_scout_last_scanned NULLS FIRST)` for fast feed queries
- SQL migration file: `supabase/migrations/add_signal_scout_last_scanned.sql`

**2. New Edge Function: `signal-scout-feed`**
- File: `supabase/functions/signal-scout-feed/index.ts`
- Auth: `x-api-key` header validated against `profiles.api_key`
- Query params: `deal_room_id` (required), `limit` (optional, default 100, max 500)
- Logic:
  - Get `client_id` from deal room
  - Query HubSpot API for companies sorted by `signal_scout_last_scanned` ascending (nulls first)
  - Upsert each company into `crm_companies` with `external_crm_id`, `external_crm_type='hubspot'`, `client_id`
  - Return: id, name, domain, industry, city, state, external_crm_id
- HTTP 401 if invalid/missing API key
- HTTP 400 if missing deal_room_id
- HTTP 404 if deal room not found
- HTTP 500 if HubSpot API fails
- Config: Register in `supabase/config.toml` with `verify_jwt = false`

**3. Update `lindy-webhook/index.ts`**
- On `signal.detected` event (outcome_type = 'trigger_detected'):
  - Extract company name, domain, industry from signal data
  - Upsert into `crm_companies` with `client_id` from deal room, `external_crm_id` from HubSpot, `external_crm_type='hubspot'`
  - Set `signal_scout_last_scanned = now()`
  - Keep existing HubSpot note creation and enrichment logic
- On `scan.completed` event (outcome_type = 'scan_completed'):
  - Upsert company into `crm_companies` with `signal_scout_last_scanned = now()`
  - Keep existing HubSpot property update for `signal_scout_last_scanned`

**4. Update `supabase/config.toml`**
- Register new function under lindy-webhook:
  ```toml
  [functions.signal-scout-feed]
  verify_jwt = false
  ```

### What George Changes
Replace his "Search Companies from HubSpot" step with:
```
GET /functions/v1/signal-scout-feed?deal_room_id={deal_room_id}&limit=100
Header: x-api-key: {his_api_key}
```

Response format:
```json
{
  "success": true,
  "count": 100,
  "companies": [
    {
      "id": "hs_123",
      "name": "Acme Corp",
      "domain": "acme.com",
      "industry": "Software",
      "city": "San Francisco",
      "state": "CA",
      "external_crm_id": "hs_123"
    }
  ]
}
```

Everything else in his Lindy flow stays the same — loop through companies, detect signals, send webhook results back.

### Flow Summary
```
George calls signal-scout-feed
         ↓
BizDev App queries HubSpot (we handle this, he doesn't)
         ↓
Returns next 100 unscanned/oldest companies
         ↓
George scans each one
         ↓
signal.detected → upsert company + enrich + sync to HubSpot
OR
scan.completed → upsert company + update timestamp
         ↓
Companies accumulate in BizDev CRM at 100/batch pace
```

### Files Modified
1. `supabase/migrations/add_signal_scout_last_scanned.sql` — NEW
2. `supabase/functions/signal-scout-feed/index.ts` — NEW
3. `supabase/functions/lindy-webhook/index.ts` — UPDATE (add company upsert logic)
4. `supabase/functions/workflow-event-router/index.ts` — UPDATE (add company upsert logic for consistency)
5. `supabase/config.toml` — UPDATE (register signal-scout-feed)

### No Breaking Changes
- All existing HubSpot sync logic continues
- All existing enrichment and attribution logic continues
- Local DB company tracking happens transparently
- George's 400 error goes away because he never queries HubSpot properties

