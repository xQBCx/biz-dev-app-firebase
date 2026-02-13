

## Update Whitepapers with New Capabilities (Last Week)

### What Needs Updating

Based on an audit of the codebase, memory context, and current whitepaper content, three sections need updates to reflect capabilities built or spec'd in the last week:

---

### 1. Deal Room White Paper — "Partner Agent Integration" Section (v6 -> v7)

**Current state:** Signal Scout is listed as just "Prospect identification" in a bullet point. No detail on how agents actually get companies, rotation, or enrichment.

**Add/update the following:**

- **Signal Scout Feed API** — The platform now acts as a proxy between HubSpot and external agents. Agents call `signal-scout-feed` instead of querying HubSpot directly, eliminating API errors and centralizing governance.
- **Company Rotation System** — Companies are served in rotation order (never-scanned first, then oldest-scanned), tracked via `signal_scout_last_scanned` on each company record. This ensures full portfolio coverage before re-scanning.
- **Dual Event Handling** — `signal.detected` creates CRM records, activity entries, and enriched outreach; `scan.completed` silently updates the timestamp without creating noise in the activity feed.
- **Local CRM Ingestion** — Companies flow into the platform's CRM 100 at a time as agents process them, rather than bulk importing. Each company is upserted with `external_crm_id` for deduplication.

### 2. Deal Room White Paper — New Section: "Local Enrichment Pipeline"

**Entirely new section to add:**

- **Enriched Outreach Generation** — When Signal Scout detects a trigger, the platform enriches the talking point using `client_knowledge_docs` (150+ project examples). It matches signals against relevant projects by property type and state hints (extracted from company domain, name, and signal title).
- **Priority: Local over Generic** — Locally generated outreach messages referencing specific client work are prioritized over generic talking points from external agents.
- **Tone Governance** — Enrichment maintains professional tone and prevents inclusion of internal-only pricing data.

### 3. CRM White Paper — Minor Addition (v4 stays v4)

**Add a note under "How It Works" or "Integration Points":**

- **Agent-Driven Company Ingestion** — External agents (Signal Scout) gradually populate the CRM with companies as they scan them, using upsert logic with `external_crm_id` to prevent duplicates. Companies include `signal_scout_last_scanned` for rotation tracking.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/whitepaper/whitePaperContent.ts` | Update `deal_room` section: bump to v7, expand "Partner Agent Integration", add "Local Enrichment Pipeline" section. Update `crm` section: add agent ingestion note to "How It Works". |

### Technical Details

- Deal Room `version` field: `6` -> `7`
- Deal Room `subtitle` stays the same
- Add ~2 new sections to `deal_room.sections[]` array (Signal Scout Feed Architecture, Local Enrichment Pipeline)
- Expand existing "Partner Agent Integration" section content with feed API, rotation, and dual event handling details
- Add 1 paragraph to `crm.sections` "How It Works" `content` string about agent-driven company ingestion
- No database changes required — this is purely frontend content

