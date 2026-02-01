
# Implementation Plan: Fix TypeScript Errors and Continue Phase 2

## Overview
This plan addresses the current TypeScript build errors in the Oracle components and then proceeds to implement **Phase 2: Entity API Framework** - the digital interface layer that wraps company SOPs as standardized API endpoints.

---

## Part 1: Fix TypeScript Errors (Immediate)

### Problem
The `OracleProviderRegistry.tsx` component has type errors because `usage_stats` is typed as `Record<string, unknown> | null`, which means accessing `.total_calls` and `.failed_calls` returns `unknown`.

### Solution
Update the `OracleProvider` interface in `useOracleNetwork.ts` to include a properly typed `usage_stats` interface:

```typescript
interface UsageStats {
  total_calls: number;
  failed_calls: number;
  last_success_at?: string;
  average_response_ms?: number;
}

export interface OracleProvider {
  // ... existing fields
  usage_stats: UsageStats;
  // ...
}
```

Then update the component to safely access these properties with default values.

**Files to modify:**
- `src/hooks/useOracleNetwork.ts` - Add `UsageStats` interface
- `src/components/oracle/OracleProviderRegistry.tsx` - Safe property access with defaults

---

## Part 2: Phase 2 - Entity API Framework

### Purpose
The Entity API Framework creates a standardized "digital wrapper" around each company's internal business processes (SOPs). This enables smart contracts to subscribe to company actions (like `publishWorkOrder`, `acceptBid`, `approveCompletion`) without requiring companies to replace their internal systems.

### 2.1 Database Schema

**New Tables:**

| Table | Purpose |
|-------|---------|
| `entity_api_endpoints` | Registered API endpoints for each company |
| `entity_sop_mappings` | Maps SOP documents to their trigger points |
| `entity_api_call_logs` | Audit trail of all API invocations |
| `smart_contract_bindings` | Links oracles/APIs to settlement contracts |

**Key Fields:**

**entity_api_endpoints:**
- `entity_id` - Company/organization ID
- `endpoint_name` - Human-readable name (e.g., "Approve Work Order")
- `endpoint_type` - Standard action type (publish_work_order, submit_bid, approve_completion, etc.)
- `http_method`, `endpoint_path` - Technical endpoint details
- `request_schema`, `response_schema` - JSON schemas for validation
- `auth_type` - API key, OAuth, JWT, etc.
- `webhook_url` - Optional outbound notification URL

**entity_sop_mappings:**
- `sop_name`, `sop_document_url` - The source SOP document
- `trigger_points` - JSON array of approval gates identified in the SOP
- `mapped_api_endpoints` - References to registered endpoints
- `ai_extracted` - Whether AI was used to identify trigger points

**smart_contract_bindings:**
- `settlement_contract_id` - Link to existing settlement_contracts table
- `binding_source_type` - 'oracle_feed', 'entity_api', 'attestation'
- `binding_source_id` - Reference to oracle feed or entity API
- `condition_expression` - Logic expression (e.g., `value >= 95%`)
- `action_on_trigger` - What happens when condition is met

### 2.2 Edge Functions

| Function | Purpose |
|----------|---------|
| `entity-api-register` | Register/update company API endpoints |
| `entity-api-invoke` | Securely proxy calls to registered entity APIs |
| `entity-api-webhook-receiver` | Receive callbacks from entity systems |
| `sop-mapper` | AI-assisted extraction of trigger points from SOPs |

**entity-api-invoke Flow:**
1. Receives request with `endpoint_id` and `payload`
2. Validates caller has permission to invoke
3. Retrieves endpoint configuration
4. Makes authenticated call to entity's system
5. Logs the invocation
6. Checks if any smart contract bindings should be triggered
7. Returns response

### 2.3 UI Components

| Component | Purpose |
|-----------|---------|
| `EntityAPIManager.tsx` | CRUD interface for company API endpoints |
| `SOPMappingWizard.tsx` | Visual tool to map SOP trigger points |
| `SmartContractBindingEditor.tsx` | Connect oracles/APIs to settlement contracts |
| `APITestingPanel.tsx` | Test registered endpoints with sample payloads |

### 2.4 Integration with Existing Settlement Contracts

The `smart_contract_bindings` table bridges the new Entity API system with the existing `settlement_contracts` table. When an entity API is invoked (e.g., BP's `approveWorkCompletion` API), the system:

1. Logs the API call
2. Checks `smart_contract_bindings` for any contracts subscribed to this API
3. Evaluates the `condition_expression` against the API response
4. If conditions are met, triggers `settlement-execute` with the appropriate data

---

## Implementation Sequence

### Step 1: Fix TypeScript Errors
- Update `useOracleNetwork.ts` with proper `UsageStats` type
- Update `OracleProviderRegistry.tsx` with safe property access

### Step 2: Database Migration
- Create enums: `entity_api_type`, `entity_auth_type`, `binding_source_type`
- Create tables: `entity_api_endpoints`, `entity_sop_mappings`, `entity_api_call_logs`, `smart_contract_bindings`
- Add RLS policies and indexes

### Step 3: Edge Functions
- `entity-api-register`
- `entity-api-invoke`
- `entity-api-webhook-receiver`

### Step 4: React Hooks
- `useEntityAPIs.ts` - TanStack Query hooks for CRUD operations

### Step 5: UI Components
- `EntityAPIManager.tsx`
- `SmartContractBindingEditor.tsx`

---

## Technical Specifications

### New Enums
```sql
CREATE TYPE entity_api_type AS ENUM (
  'publish_work_order', 'submit_bid', 'accept_bid', 
  'reject_bid', 'approve_completion', 'reject_completion',
  'submit_invoice', 'approve_invoice', 'issue_payment',
  'issue_change_order', 'approve_change_order',
  'confirm_delivery', 'report_issue', 'custom'
);

CREATE TYPE entity_auth_type AS ENUM (
  'api_key', 'oauth2', 'jwt', 'basic', 'none'
);

CREATE TYPE binding_source_type AS ENUM (
  'oracle_feed', 'entity_api', 'attestation', 'manual'
);
```

### Sample Smart Contract Binding
```json
{
  "settlement_contract_id": "uuid",
  "binding_source_type": "entity_api",
  "binding_source_id": "approve_completion_endpoint_uuid",
  "condition_expression": "response.status == 'approved' && response.amount > 0",
  "action_on_trigger": "execute_settlement",
  "priority": 1
}
```

---

## Files to Create/Modify

**Modify:**
- `src/hooks/useOracleNetwork.ts` - Fix UsageStats typing
- `src/components/oracle/OracleProviderRegistry.tsx` - Safe property access
- `supabase/config.toml` - Add new edge function configurations

**Create:**
- `supabase/migrations/XXXXXX_entity_api_framework.sql`
- `supabase/functions/entity-api-register/index.ts`
- `supabase/functions/entity-api-invoke/index.ts`
- `supabase/functions/entity-api-webhook-receiver/index.ts`
- `src/hooks/useEntityAPIs.ts`
- `src/components/entity-api/EntityAPIManager.tsx`
- `src/components/entity-api/SmartContractBindingEditor.tsx`
