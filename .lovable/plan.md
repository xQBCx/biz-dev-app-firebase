

## Ingest Knowledge Docs and Activate the Enrichment Pipeline

### What We're Doing

Loading your three documents into the database so the enrichment pipeline can generate on-brand, specific talking points for every Signal Scout detection. This also fixes a bug in the current enrichment function that would prevent it from working.

### Document Ingestion Strategy

**1. Knowledge Base (The_View_Pro_Knowledge_Base.docx)**
Split into two records:
- **knowledge_base** record: Services catalog, target audiences, Seenic platform overview, outreach templates, property type reference, AI agent guidelines. This is what the AI uses to write talking points.
- **pricing** record (marked `is_internal_only = true`): The 2025 pricing table. Never shown in outreach, but available for generating ballpark estimates when you ask for them in conversation. Pricing ranges like "$4,400-$8,500 for Rendered Virtual Tours" let the system give intelligent rough numbers without exposing exact rates.

**2. Project Locations (TheView_Projects_locations.xlsx)**
- **project_locations** record with `structured_data` as a JSON array of all 150+ projects
- Each project entry: `{ property_name, client_name, product_mix, city, state }`
- The enrichment AI will search this by state and product type to find relevant examples (e.g., "We recently completed a 3D Virtual Tour for Fairfield in Austin, TX")

**3. Guidelines** (extracted from Knowledge Base Section 12)
- Separate **guidelines** record with the AI Agent Guidelines section: "Use project examples from the same property type and state," "Keep under 120 words," "Be conversational, not salesy"

### Bug Fix: Enrichment Function

The current `enrichTalkingPoint()` function checks for `deal_room.client_id`, but the `deal_rooms` table has no `client_id` column. This means enrichment silently fails every time. The fix removes that check and queries `client_knowledge_docs` directly by `deal_room_id` (which is the correct foreign key).

Also improving project matching: instead of blindly taking the first 3 projects, the function will filter by state or product type when signal data includes location hints.

### Pricing Intelligence

Pricing is stored as `is_internal_only = true` and excluded from all outreach text. However, a future "Quick Quote" feature could use this data when you're chatting with a prospect and want to give a ballpark: "A rendered virtual tour for a project like yours typically runs in the $4,400-$8,500 range depending on scope." This is not part of the automated pipeline — it would only be triggered manually.

### Technical Changes

| File | Change |
|------|--------|
| New edge function: `ingest-knowledge-docs` | Parses the uploaded docs and inserts structured records into `client_knowledge_docs` |
| `workflow-event-router/index.ts` | Fix `enrichTalkingPoint()`: remove `client_id` check, improve project matching by state/product type |
| No migration needed | Table already exists with correct schema |

### What Happens After This

1. Knowledge docs get inserted into the database for deal room "The View Pro Strategic Partnership"
2. When George's Signal Scout sends a `signal.detected` event, the enrichment function will:
   - Pull your services, project examples, and guidelines
   - Find projects in the same state as the prospect
   - Generate a 2-sentence talking point referencing real View Pro work
   - Attach it to the HubSpot note instead of a generic message
3. Pricing stays locked away but available for future quoting features

