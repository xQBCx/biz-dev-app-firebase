

# Build Signal Scout Feed Endpoint

## Summary
Create a single backend function that George's Lindy agent calls every 6 hours to get the next batch of 5 companies to scan. Companies that have never been scanned go first, then the oldest-scanned ones rotate back in. The response matches HubSpot's data shape so the Lindy loop step works without changes.

## What Gets Built

### 1. New backend function: `signal-scout-feed`
- Validates `x-api-key` header against stored `SIGNAL_SCOUT_API_KEY` secret
- Queries HubSpot Search API for companies where `signal_scout_last_scanned` has no value (never scanned) -- limited to requested batch size (default 5)
- If fewer than `batch_size` returned, makes a second query for companies sorted by oldest `signal_scout_last_scanned`
- Returns results in HubSpot-compatible shape (`results` array with `id` and `properties`)

### 2. New secret: `SIGNAL_SCOUT_API_KEY`
- You will be prompted to enter a value -- any secure string works
- This same value goes into the Lindy HTTP step header

### 3. Config update
- Add `verify_jwt = false` entry in `supabase/config.toml`

## Response Format (matches HubSpot shape)
```text
{
  "results": [
    {
      "id": "12345",
      "properties": {
        "name": "Acme Corp",
        "domain": "acme.com",
        "industry": "Construction",
        "city": "Phoenix",
        "state": "AZ",
        "signal_scout_last_scanned": null
      }
    }
  ],
  "batch_size": 5,
  "total_returned": 5,
  "has_more": true
}
```

## What You Change in Lindy

Only **Step 3** changes. Replace the current "Search Companies from HubSpot" step with an HTTP Request:

- **Method:** POST
- **URL:** (will be provided after deployment)
- **Headers:**
  - `x-api-key`: the key you set as the secret
  - `Content-Type`: `application/json`
- **Body:** `{ "batch_size": 5 }`

Everything else in the flow (the loop, signal searches, webhook posts, Slack, daily email) stays exactly the same.

## Technical Details

### Files changed
1. **New:** `supabase/functions/signal-scout-feed/index.ts`
2. **Modified:** `supabase/config.toml` -- add function entry
3. **New secret:** `SIGNAL_SCOUT_API_KEY` -- prompted during implementation

### HubSpot query strategy
- Query 1: Search API with filter `signal_scout_last_scanned` "HAS_NO_VALUE" -- gets never-scanned companies
- Query 2 (only if batch not full): Search API sorted by `signal_scout_last_scanned` ascending -- gets oldest-scanned companies
- Properties fetched: `name`, `domain`, `industry`, `city`, `state`, `signal_scout_last_scanned`
- Each run makes 1-2 HubSpot API calls total

### Authentication flow
- External agent sends `x-api-key` header
- Function compares against `SIGNAL_SCOUT_API_KEY` environment variable
- No JWT/user login required (this is a machine-to-machine call)
- Uses existing `HUBSPOT_ACCESS_TOKEN` for HubSpot API calls

### Existing rotation (already works, no changes needed)
- After scanning, Lindy posts `scan.completed` to `lindy-webhook`
- `lindy-webhook` updates `signal_scout_last_scanned` on the HubSpot company record
- Next feed call, that company moves to the back of the queue
