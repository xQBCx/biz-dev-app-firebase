

## Clarify Signal Enrichment Strategy with George + Implement Enrichment Pipeline

### Context
George is offering to send a fully formatted `note_body` field, but this defeats the purpose of building an enrichment pipeline. His Lindy agent lacks access to The View Pro's knowledge base (services, project examples, guidelines), so any `note_body` he generates will remain generic ("smart building solutions"). Instead, he should send **structured discovery data only**, and the Biz Dev App will handle the professional messaging.

### Part 1: Revised Message to George

**Key Points to Communicate:**

1. **Confirm his structured payload** — The webhook accepts all the fields he listed (company_name, signal_type, confidence, contact_email, etc.). These are perfect.

2. **Skip the `note_body`** — Tell him to NOT include `note_body`. Reason: The Biz Dev App now has a knowledge enrichment pipeline that will generate on-brand, specific talking points using The View Pro's actual services and project locations. His generic note would be replaced anyway.

3. **Reduce Lindy credits** — By skipping the note formatting step on his end, he reduces token usage per signal (no need for prompt tokens to "think" about how to write the note).

4. **Simplified payload** — His agent should send:
   ```json
   {
     "event_type": "signal.detected",
     "deal_room_id": "...",
     "lindy_agent_id": "signal_scout",
     "data": {
       "company_name": "...",
       "company_domain": "...",
       "signal_type": "ACQUISITION",
       "signal_title": "...",
       "confidence": 85,
       "priority": "HIGH",
       "talking_point": "[basic talking point or null]",
       "source_url": "...",
       "contact_name": "...",
       "contact_email": "...",
       "contact_title": "..."
     }
   }
   ```

5. **For `scan.completed`** — Yes, this event type will be handled to update `signal_scout_last_scanned` even when no signals are found. Same structured data format.

**Timeline expectation** — Ask for a delivery date. Given the 6+ week timeline and cost overrun, clarify:
- When will the Signal Scout agent be fully live and tested?
- What's the weekly cadence (how often does it scan, how many companies)?
- What's the rollback plan if issues arise?

### Part 2: Build the Enrichment Pipeline

Once George stops sending formatted notes, the app will generate them. This requires:

**Step 1: Parse and Store Your Knowledge Docs** (Prerequisite)
- Create `client_knowledge_docs` table (linked to `deal_rooms`)
- You upload:
  - Knowledge Base doc (services, value prop, communication guidelines)
  - Project Locations (Excel/Sheet with property types, states, unit counts)
  - Pricing (marked as internal-only)

**Step 2: Update `workflow-event-router`**
- When a `signal.detected` event arrives, extract:
  - Company name, signal type, location (if available), property type (inferred from signal_title or signal_type)
- Search the project locations table for matching projects (same property type, same region)
- Call Lovable AI with a focused prompt:
  ```
  You are writing a professional outreach message for a real estate prospect.
  
  SIGNAL: {company_name} just announced {signal_title}
  SIGNAL TYPE: {signal_type}
  PROPERTY TYPE: {inferred_type}
  LOCATION: {inferred_location}
  
  THE VIEW PRO SERVICES:
  {extracted services from knowledge base}
  
  RELEVANT PROJECT EXAMPLES:
  {top 2-3 matching projects from project location list}
  
  COMMUNICATION GUIDELINES:
  {guidelines excerpt}
  
  Write a 2-sentence professional talking point that:
  1. References their specific news/signal
  2. Connects it to a specific View Pro service or project example
  3. Does NOT mention pricing
  4. Sounds conversational, not generic
  
  Return ONLY the 2 sentences, no prefix/suffix.
  ```
- Use the enriched talking point in the HubSpot note

**Step 3: Update `lindy-webhook`**
- Accept `scan.completed` event type
- If event_type is `scan.completed` and `update_last_scanned` is true, update the company's `signal_scout_last_scanned` without creating a note or activity record

**Step 4: Add Knowledge Docs UI** (can be deferred)
- "Knowledge Base" tab in deal room settings
- Upload form for Knowledge Base, Project Locations, Pricing docs
- Mark docs as "internal-only" so pricing doesn't leak into outreach text

### Why This Works

- **George's job simplified:** Send raw signal data (what he's good at — discovery)
- **App's job:** Convert raw data into professional, on-brand messaging using local knowledge
- **Credit savings:** Lindy agent spends fewer tokens (no formatting logic)
- **Quality improvement:** Talking points reference actual View Pro projects and services, not generic phrases
- **Sustainability:** You control the talking points, messaging, and can iterate without waiting for George

### Files to Update

| File | Change |
|------|--------|
| New migration | Create `client_knowledge_docs` table |
| `supabase/functions/lindy-webhook/index.ts` | Handle `scan.completed` event type |
| `supabase/functions/workflow-event-router/index.ts` | Add `enrichTalkingPoint()` function before HubSpot sync |
| `supabase/functions/workflow-event-router/index.ts` | Update `syncToHubSpot()` to use enriched talking point in note body |
| New UI component | `KnowledgeDocsManager` in deal room settings (deferred if needed) |

### Immediate Next Steps

1. **Send George the clarified message** — No `note_body`, structured data only, confirmation of timeline
2. **Upload your docs** — Once you paste or link the Knowledge Base and Project Locations, the enrichment pipeline can be built immediately
3. **Deploy updates** — Webhook + router changes can go live while George finishes his agent

