
# AI Usage Dashboard and Cost Limits Implementation Plan

## Overview
This plan implements a comprehensive AI cost management system for the Biz Dev platform, consisting of:
1. A new AI Usage Dashboard at `/admin/ai-usage`
2. Per-agent and per-workflow cost and run limits
3. Enforcement logic in edge functions
4. Configuration UI for limits

---

## 1. Database Schema Changes

### 1.1 Add Missing Columns to `instincts_agents`
Add two new columns for daily limits:
- `daily_cost_cap_usd` (numeric, default 10.00)
- `daily_run_cap` (integer, default 200)

### 1.2 Add Missing Columns to `workflows`
Add two new columns:
- `daily_run_cap` (integer, default 100)
- `enabled_for_ai` (boolean, default true)

### 1.3 Create `agent_daily_usage` Aggregate View/Function
A helper function to efficiently query daily usage per agent:
- Total runs today
- Total cost today
- Total tokens today

### 1.4 Create `workflow_daily_usage` Aggregate Function
Similar helper for workflow-level daily usage tracking.

---

## 2. Edge Function Updates

### 2.1 Update `model-gateway/index.ts`
Before making AI calls, add limit checks:
1. Query agent's current daily cost/runs from `agent_cost_tracking`
2. Compare against `daily_cost_cap_usd` and `daily_run_cap`
3. If limit exceeded, return error with `blocked_limit` status
4. Log blocked attempts for visibility

### 2.2 Update `run-agent/index.ts`
Add pre-execution limit checks:
1. Check agent's daily run count against `daily_run_cap`
2. Check agent's daily cost against `daily_cost_cap_usd`
3. If blocked, create run record with `status: 'blocked_limit'`
4. Return informative error to caller

### 2.3 Update `execute-workflow-v2/index.ts`
Add workflow-level checks:
1. Check if `enabled_for_ai` is false - skip AI nodes
2. Check workflow's daily run count against `daily_run_cap`
3. Log blocked runs with `status: 'blocked_limit'`

### 2.4 Create `_shared/limit-checker.ts`
Shared utility for limit checking logic:
- `checkAgentLimits(supabase, agentId)` - returns usage stats and whether limits exceeded
- `checkWorkflowLimits(supabase, workflowId)` - returns usage stats and limit status
- `recordBlockedRun(supabase, type, id, reason)` - logs blocked attempts

---

## 3. AI Usage Dashboard Page

### 3.1 Create `/admin/ai-usage` Route
New page at `src/pages/admin/AIUsageDashboard.tsx`

### 3.2 Dashboard Components

**Header Section:**
- Workspace selector (for multi-workspace admins)
- Date range picker (default: last 30 days)
- Export button (CSV/JSON)

**Summary Cards:**
- Total AI Requests (period)
- Total Tokens Used
- Estimated Cost ($)
- Blocked Runs (limit hits)

**Daily Trend Chart:**
Using existing `TimeSeriesChart` component:
- Line chart with requests, tokens, and cost
- Toggle between metrics
- Tooltip showing daily breakdown

**Top Workflows Table:**
| Workflow Name | Runs (24h/7d) | Tokens | Est. Cost | Avg Cost/Run | Limit Status |
|---------------|---------------|--------|-----------|--------------|--------------|
| Lead Enrichment | 45 / 312 | 125k | $0.38 | $0.001 | 85% daily |

- Clickable rows for drill-down
- Sort by any column
- Color-coded limit badges (green < 60%, yellow 60-80%, red > 80%)

**Top Agents Table:**
| Agent | Primary Model | Runs (24h/7d) | Tokens | Est. Cost | Physics Rail Blocks |
|-------|---------------|---------------|--------|-----------|---------------------|
| Signal Scout | Perplexity | 23 / 156 | 89k | $0.27 | 0 |

- Shows most used model provider
- Indicates Physics Rail blocks
- Click for drill-down

**Blocked Runs Alert Banner:**
Displayed when any agent/workflow has hit its daily cap:
- Red banner showing which automations are paused
- Link to adjust limits

### 3.3 Drill-Down Views

**Workflow Detail Modal:**
- Recent 50 runs with status, duration, tokens, cost
- Per-node breakdown for AI nodes
- Error details for failed runs
- Quick edit for limits

**Agent Detail Modal:**
- Recent runs with trigger type, model used, tokens, cost
- Contribution events linked to this agent
- Physics Rail decisions log
- Quick edit for limits

---

## 4. Limit Configuration UI

### 4.1 Agent Limits Editor
Add to Agent Marketplace or create new component `AgentLimitsEditor`:
- `max_tokens_per_run` (slider: 500-16000)
- `cost_ceiling_usd` per run (input: $0.01-$5.00)
- `daily_cost_cap_usd` (input: $0.50-$100.00)
- `daily_run_cap` (input: 10-1000)
- Save updates to `instincts_agents`

Placement: Add "Configure Limits" button to subscribed agents in `AgentMarketplace.tsx`

### 4.2 Workflow Limits Editor
Add to Workflow card or visual builder:
- `daily_run_cap` (input: 10-500)
- `enabled_for_ai` toggle
- Current usage display (X% of daily cap)

Placement: Add "Settings" button to workflow cards in `Workflows.tsx`

### 4.3 Warning Indicators
Display in relevant places:
- Badge on workflow/agent card when > 80% of cap used
- Inline warning in dashboard tables
- Toast notification when limit is hit during manual trigger

---

## 5. Sidebar Navigation Update

Add to Administration section in `AppSidebar.tsx`:
```typescript
{ path: "/admin/ai-usage", label: "AI Usage", icon: BarChart2, adminOnly: true, module: 'admin' }
```

---

## 6. File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/pages/admin/AIUsageDashboard.tsx` | Main dashboard page |
| `src/components/admin/DailyUsageChart.tsx` | 30-day trend visualization |
| `src/components/admin/TopWorkflowsTable.tsx` | Top workflows by usage |
| `src/components/admin/TopAgentsTable.tsx` | Top agents by usage |
| `src/components/admin/UsageDrillDown.tsx` | Detail modal for drill-down |
| `src/components/admin/LimitProgressBar.tsx` | Visual limit indicator |
| `src/components/workflows/WorkflowLimitsDialog.tsx` | Workflow limit editor |
| `src/components/agents/AgentLimitsDialog.tsx` | Agent limit editor |
| `src/hooks/useAIUsageAnalytics.ts` | Data fetching hook |
| `supabase/functions/_shared/limit-checker.ts` | Shared limit logic |

### Modified Files
| File | Changes |
|------|---------|
| `supabase/functions/model-gateway/index.ts` | Add limit checks before AI calls |
| `supabase/functions/run-agent/index.ts` | Add agent limit enforcement |
| `supabase/functions/execute-workflow-v2/index.ts` | Add workflow limit checks |
| `src/pages/Workflows.tsx` | Add limits settings button |
| `src/components/agents/AgentMarketplace.tsx` | Add limits config dialog |
| `src/components/AppSidebar.tsx` | Add AI Usage nav item |
| `src/App.tsx` | Add /admin/ai-usage route |

### Database Migration
One migration file adding:
- `instincts_agents.daily_cost_cap_usd`
- `instincts_agents.daily_run_cap`
- `workflows.daily_run_cap`
- `workflows.enabled_for_ai`
- Helper functions for usage aggregation

---

## 7. Technical Details

### Usage Aggregation Query
```sql
SELECT 
  agent_id,
  COUNT(*) as run_count,
  SUM(cost_usd) as total_cost,
  SUM(tokens_used) as total_tokens
FROM agent_cost_tracking
WHERE workspace_id = $1 
  AND created_at >= CURRENT_DATE
GROUP BY agent_id
```

### Limit Check Logic (Pseudocode)
```typescript
async function checkAgentLimits(agentId) {
  const agent = await getAgent(agentId);
  const usage = await getDailyUsage(agentId);
  
  return {
    costLimitReached: usage.totalCost >= agent.daily_cost_cap_usd,
    runLimitReached: usage.runCount >= agent.daily_run_cap,
    costPercentUsed: (usage.totalCost / agent.daily_cost_cap_usd) * 100,
    runPercentUsed: (usage.runCount / agent.daily_run_cap) * 100,
  };
}
```

### Blocked Run Logging
When a limit is hit, log to existing tables with special status:
- `instincts_agent_runs.status = 'blocked_limit'`
- `workflow_execution_runs.status = 'blocked_limit'`
- Include reason in error_message field

---

## 8. Where to Find Things After Implementation

| Need | Location |
|------|----------|
| View AI costs and trends | `/admin/ai-usage` |
| See top spending workflows | AI Usage Dashboard > Top Workflows tab |
| See top spending agents | AI Usage Dashboard > Top Agents tab |
| Check which automations hit caps | AI Usage Dashboard > Blocked Runs banner |
| Adjust agent limits | Agent Marketplace > [Agent Card] > Configure Limits |
| Adjust workflow limits | Workflows > [Workflow Card] > Settings icon |
| View blocked run details | AI Usage Dashboard > Click workflow/agent row |

---

## 9. Implementation Order

1. Database migration (new columns + helper functions)
2. Shared limit-checker utility
3. Update edge functions with enforcement
4. Create useAIUsageAnalytics hook
5. Build dashboard page components
6. Add limit configuration dialogs
7. Update sidebar and routes
8. Integration testing

---

## 10. Acceptance Criteria Verification

After implementation:
1. Navigate to `/admin/ai-usage` and see daily cost trends
2. See which workflows and agents drive the most usage
3. Edit limits on an agent (e.g., set `daily_run_cap: 5`)
4. Trigger the agent 6 times and confirm the 6th is blocked
5. Check dashboard shows the blocked run
6. Confirm cron jobs still run in cloud and respect limits
