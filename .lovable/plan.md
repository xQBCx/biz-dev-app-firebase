# Workflow-Agent Engine Implementation Plan

## Status: Phase 3 Complete ✅

**Implementation Date:** 2026-02-03

---

## Phase 3: Backend Infrastructure (COMPLETED)

### 3A: Database Schema Enhancements ✅

**Migration Applied:**
- Added to `instincts_agents`:
  - `impact_level` (low/medium/high/critical)
  - `guardrails` (jsonb)
  - `required_approval_for` (text[])
  - `model_preference` (default: perplexity)
  - `fallback_model` (default: gemini)
  - `max_tokens_per_run` (default: 4000)
  - `cost_ceiling_usd` (default: 0.50)

- Created new tables:
  - `workflow_triggers` - unified trigger management (schedule/event/webhook/manual)
  - `workspace_settings` - configurable cost ceilings per workspace
  - `agent_cost_tracking` - per-run cost monitoring
  - `approval_overrides` - custom approval routing per workspace

- Created helper functions:
  - `check_workspace_daily_cost()` - enforces $10/day default limit
  - `get_workspace_cost_ceiling()` - retrieves workspace-specific limits

### 3B: Physics Rail ✅

**File:** `supabase/functions/_shared/physics-rail.ts`

Validation layer that enforces:
1. **RBAC checks** - user permission verification
2. **Guardrail checks** - agent-specific action restrictions
3. **Impact level checks** - high-impact actions require approval
4. **Cost ceiling checks** - prevents runaway spending
5. **Rate limiting** - abuse prevention

**Action Risk Levels:**
| Risk | Actions |
|------|---------|
| Low | create_task, create_contact, web_research, scrape_url |
| Medium | create_deal, execute_agent, spawn_business |
| High | send_email, send_sms, call_webhook |
| Critical | delete_record, transfer_funds |

**Approval Routing:**
- High-impact actions → workspace admins
- Configurable via `approval_overrides` table
- Optional specific approver role override

### 3C: Model Gateway ✅

**File:** `supabase/functions/model-gateway/index.ts`

Unified AI routing with:
- **Perplexity = DEFAULT** for all research tasks (company, prospect, market, real-time)
- **Gemini = FALLBACK** when Perplexity unavailable
- **Claude = SCAFFOLDED** (not implemented until API key provided)
- **OpenAI = AVAILABLE** via Lovable gateway

**Task Type Routing:**
| Task Type | Primary Provider |
|-----------|-----------------|
| web_research, prospect_intelligence, company_research | Perplexity |
| complex_reasoning, tool_calling, multi_step_workflow | Gemini Pro |
| general_qa, summary, classification | Gemini Flash |
| content_generation, email_drafting | Gemini Flash |

**Cost Tracking:**
- Per-request tracking in `ai_model_usage`
- Per-workspace tracking in `agent_cost_tracking`

### 3D: Enhanced run-agent ✅

**File:** `supabase/functions/run-agent/index.ts`

Integrations:
- Physics Rail validation before execution
- Model Gateway for provider routing
- Contribution event logging for credits
- Cost tracking per run

**New Features:**
- Support for both `agent_id` and `agent_slug` lookup
- Proposed actions validated through Physics Rail
- Automatic credit calculation (1 credit per 100 tokens)
- Detailed run logging with model/token/cost data

### 3E: Workflow Templates ✅

**6 Templates Seeded:**

1. **Sandler Partners Revenue Engine** (sales/advanced)
   - 6-phase: Prospect Intel → Solution Match → Deck → GTM → Outreach → Deal Room
   - Est. 8 hours saved

2. **Lead Generation: No Website** (marketing/intermediate)
   - Daily/weekly scan for businesses without web presence
   - Auto-creates leads with mockups
   - Est. 4 hours saved

3. **Trademark Infringement Scanner** (legal/advanced)
   - Weekly IP monitoring
   - Auto-draft C&D letters (requires approval)
   - Est. 6 hours saved

4. **EV Charging Prospecting** (sales/intermediate)
   - Metro area property scanning
   - Opportunity scoring and outreach plans
   - Est. 5 hours saved

5. **Event Pre-Meeting Engine** (sales/intermediate)
   - Attendee list research
   - Personalized outreach with approval workflow
   - Est. 3 hours saved

6. **Content & Social OS** (marketing/advanced)
   - Trend-based content generation
   - Multi-format output (social, blog, carousel)
   - Est. 7 hours saved

---

## Phase 1: AI Chat Fixes (NEXT)

### 1A: Add Mandatory Research Rules
- Update `ai-assistant/index.ts` system prompt
- Force Perplexity for company/prospect lookups

### 1B: Add Tool Progress Events
- Emit `tool_start` and `tool_complete` events
- Enable real-time status updates

### 1C: Update Dashboard.tsx
- Add `toolStatus` state
- Display specific messages during tool execution

### 1D: Fix GlobalFloatingChat.tsx
- Add missing `web_research_result` handler
- Add tool progress indicators

---

## Phase 2: Sidebar Module Search (AFTER PHASE 1)

### 2A: Add Search to AppSidebar.tsx
- Filter `navGroups` based on search query
- Quick access to 175+ modules

---

## Configuration Defaults

| Setting | Default | Configurable |
|---------|---------|--------------|
| Cost ceiling per run | $0.50 | Per agent |
| Daily workspace limit | $10.00 | Per workspace |
| Research provider | Perplexity | Per agent |
| Fallback provider | Gemini | Per agent |
| High-impact approval | Workspace Admin | Per workspace + action |

---

## Architecture Overview

```
User Request
    ↓
┌─────────────────────────────────────────────┐
│           AI Assistant / Workflow           │
│  (Determines task type, gathers context)    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│              Model Gateway                  │
│  • Perplexity (research tasks - DEFAULT)    │
│  • Gemini Pro (reasoning, tools)            │
│  • Gemini Flash (general, fast)             │
│  • Claude (scaffolded for future)           │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│              Physics Rail                   │
│  • RBAC validation                          │
│  • Guardrail enforcement                    │
│  • Cost ceiling checks                      │
│  • Approval routing (high-impact)           │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│           Action Execution                  │
│  • CRM operations                           │
│  • Document generation                      │
│  • Task creation                            │
│  • Contribution event logging               │
└─────────────────────────────────────────────┘
```
