

# Build the Signal Scout Feed Endpoint

## Summary
The only missing piece is the `signal-scout-feed` backend function. Once deployed, George replaces **one HTTP step** in Lindy (step 3 "Search Companies from HubSpot") with a call to our endpoint. Everything else in his flow stays the same -- steps 4 and 5 already post back to our `lindy-webhook` which handles enrichment, HubSpot sync, and rotation tracking.

No new HubSpot properties needed. No manual checkbox tagging of 20,000 companies.

## What Gets Built

### 1. New backend function: `signal-scout-feed`

**What it does:**
- George's agent calls this endpoint on a schedule to get a batch of companies to scan
- The function queries HubSpot for companies sorted by `signal_scout_last_scanned` (nulls first = never-scanned companies go first, then oldest)
- Returns a clean batch of company data (name, domain, HubSpot ID, last scanned date)
- George's agent processes them through his permit/acquisition/executive searches as normal

**Authentication:**
- Uses `x-api-key` header validated against a stored `SIGNAL_SCOUT_API_KEY` secret
- JWT verification disabled since this is an external agent endpoint

**Request format:**
```text
POST /functions/v1/signal-scout-feed
Header: x-api-key: <george_api_key>
Body: { "batch_size": 100 }
```

**Response format:**
```text
{
  "companies": [
    {
      "hubspot_id": "12345",
      "name": "Acme Corp",
      "domain": "acme.com",
      "last_scanned": null
    }
  ],
  "batch_size": 100,
  "total_returned": 100,
  "has_more": true
}
```

**Sorting logic:**
- HubSpot Search API does not support sorting by custom properties, so the function uses the List API with pagination
- Companies are returned sorted by `signal_scout_last_scanned` (ascending, nulls first)
- This ensures all 20,000 companies cycle through before any are re-scanned

### 2. New secret: `SIGNAL_SCOUT_API_KEY`
- A simple API key that George puts in his Lindy HTTP step header
- You will be prompted to enter a key value (can be any secure string)

### 3. Config update
- Add `verify_jwt = false` for the new function in `supabase/config.toml` (since George authenticates via API key, not user login)

## What You Tell George

Once deployed, George changes exactly **one step** in Lindy:

**Step 3 "Search Companies from HubSpot"** becomes:
- **URL:** `https://eoskcsbytaurtqrnuraw.supabase.co/functions/v1/signal-scout-feed`
- **Method:** POST
- **Headers:** `x-api-key: <the key you give him>`, `Content-Type: application/json`
- **Body:** `{ "batch_size": 100 }`

Everything else in his flow (steps 4-12) stays exactly the same. The "Post to Deal Room" and "Scan Completed" HTTP calls already work with the existing `lindy-webhook` endpoint.

## Technical Details

### HubSpot pagination strategy
- The function calls `GET /crm/v3/objects/companies` with `properties=name,domain,signal_scout_last_scanned`
- HubSpot returns pages of 100 with a cursor (`after` param)
- The function fetches enough pages to fill the requested batch, sorting locally by `signal_scout_last_scanned` ascending (nulls first)
- For 100-company batches this requires 1-2 HubSpot API calls per invocation

### Rate limiting
- HubSpot private apps allow 10 requests/second
- Each feed call makes 1-2 HubSpot requests total, well within limits
- The function itself is called once per schedule run (e.g., daily), so no risk of overload

### Rotation tracking (already works)
- When George's agent finishes scanning a company, it posts either `signal.detected` or `scan.completed` to the existing `lindy-webhook`
- The `lindy-webhook` and `workflow-event-router` already update `signal_scout_last_scanned` on the HubSpot company record
- Next time the feed is called, that company moves to the back of the queue

## Files Changed
1. **New:** `supabase/functions/signal-scout-feed/index.ts` -- the feed endpoint
2. **Modified:** `supabase/config.toml` -- add `verify_jwt = false` for the new function
3. **New secret:** `SIGNAL_SCOUT_API_KEY` -- prompted during implementation

