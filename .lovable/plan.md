
# Master Build Plan: xCOMMODITYx System of Systems

## Executive Summary

Based on my analysis of your AI assistant conversations and the current codebase, you've described a transformative vision for industrial-scale smart contracts, government infrastructure automation, and human capital development. The great news: **approximately 60-70% of the core infrastructure already exists**. This plan identifies the gaps and provides a clear build sequence.

---

## Current State Assessment

### What's Already Built

| Component | Status | Coverage |
|-----------|--------|----------|
| XODIAK Blockchain | Complete | Block production, transactions, accounts, validators |
| Settlement Contracts | Complete | Trigger-based payouts, external confirmation, escrow |
| xCOMMODITYx Marketplace | Partial | Listings, deals, broker mandates, Okari GX integration |
| Deal Room Financial Rails | Complete | Fund requests, embedded payments, XDK treasury |
| Value Ledger | Complete | Multi-format exports, narrative entries, tokenization |
| Contribution Credits | Complete | Three-tier model (compute, action, outcome) |
| Drive-By Intelligence | Partial | Capture, queue, Tesla Fleet integration |

### What Needs to Be Built

1. **Oracle Network Infrastructure** — The bridge between SOPs and smart contracts
2. **Entity API Framework** — Standardized endpoints for each business entity
3. **Smart Contract Template Library** — Pre-built MSA, PSA, Transportation templates
4. **ESG Governance Module** — Goal ingestion, opportunity matching, auditing
5. **Project Sentinel Infrastructure** — Government work order automation
6. **Proof-of-Contribution (PoC) Token System** — Non-monetary reputation tokens

---

## Phase 1: Oracle Network Infrastructure (Foundation Layer)

This is the linchpin that makes everything work. Oracles are the trusted data feeds that tell smart contracts about real-world events.

### 1.1 Database Schema

**New Tables:**
```text
oracle_data_providers
├── id, name, provider_type (sensor, api, manual, attestation)
├── endpoint_url, auth_config (encrypted)
├── data_schema (JSON schema for validation)
├── trust_level (bronze, silver, gold, platinum)
├── is_certified, certified_at, certifier_id
└── usage_stats, last_polled_at

oracle_data_feeds
├── id, provider_id, feed_name, feed_type
├── commodity_type (oil, gas, electricity, carbon, etc.)
├── polling_frequency_seconds, last_value, last_updated
├── validation_rules (JSON)
└── deal_room_subscriptions (array of deal_room_ids)

oracle_attestations
├── id, provider_id, attester_id (user who signs off)
├── attestation_type (field_supervisor, quality_inspector, auditor)
├── subject_entity_type, subject_entity_id
├── attestation_data, signature_hash
├── xodiak_tx_hash (anchored to blockchain)
└── created_at, expires_at
```

### 1.2 Edge Functions

**oracle-register-provider** — Register new data providers (sensors, APIs, manual attesters)

**oracle-poll-feed** — Scheduled function to poll external data feeds and update values

**oracle-submit-attestation** — Human-in-the-loop attestation (e.g., BP field manager confirms work complete)

**oracle-verify-condition** — Smart contract queries this to check if conditions are met

### 1.3 UI Components

**OracleProviderRegistry.tsx** — Admin interface to manage certified oracle providers

**OracleFeedDashboard.tsx** — Real-time display of active data feeds

**AttestationPanel.tsx** — Mobile-friendly interface for field workers to submit attestations

---

## Phase 2: Entity API Framework (Digital Interface Layer)

This creates the standardized "digital wrapper" around each company's business processes.

### 2.1 Database Schema

**New Tables:**
```text
entity_api_endpoints
├── id, entity_id (company/organization)
├── endpoint_name, endpoint_type (publish_work_order, submit_bid, approve_completion)
├── http_method, endpoint_path
├── request_schema, response_schema (JSON schemas)
├── auth_type, is_active
└── last_called_at, call_count

entity_sop_mappings
├── id, entity_id, sop_name, sop_document_url
├── trigger_points (array of approval gates from the SOP)
├── mapped_api_endpoints (array of endpoint_ids)
└── is_verified, verified_by, verified_at

smart_contract_bindings
├── id, settlement_contract_id
├── trigger_oracle_id, trigger_api_endpoint_id
├── binding_type (oracle_feed, api_callback, manual_attestation)
├── condition_expression (e.g., "tank_level >= 95%")
└── is_active
```

### 2.2 Edge Functions

**entity-api-register** — Register a company's API endpoints

**entity-api-invoke** — Proxy to call registered entity APIs securely

**sop-mapper** — AI-assisted mapping of SOP documents to API trigger points

### 2.3 UI Components

**EntityAPIManager.tsx** — Interface for companies to register and test their APIs

**SOPMappingWizard.tsx** — Visual tool to map SOP approval gates to APIs

**SmartContractBindingEditor.tsx** — Connect oracles/APIs to settlement contracts

---

## Phase 3: Smart Contract Template Library

Pre-built, UCC-compliant templates that turn month-long negotiations into day-long configurations.

### 3.1 Database Schema

**New Tables:**
```text
smart_contract_templates
├── id, template_name, template_category (MSA, PSA, Transportation, Storage, JV)
├── industry_vertical (oil_gas, electricity, construction, general)
├── base_trigger_type, base_payout_rules
├── required_oracles (array of oracle types needed)
├── required_attestations (array of attestation types)
├── legal_jurisdiction, compliance_notes
└── is_public, created_by, version

template_clause_library
├── id, clause_name, clause_type (force_majeure, change_order, price_reconciliation)
├── clause_text, parameter_schema
├── trigger_conditions, payout_modifications
└── compatible_templates (array of template_ids)
```

### 3.2 Templates to Create

1. **Procure-to-Pay MSA** — Contractor work orders with supervisor attestation
2. **Commodity Sale Agreement** — Buyer/seller with Okari GX verification gates
3. **Transportation Contract** — GPS oracle triggers for delivery milestones
4. **Storage Agreement** — Tank level monitoring with periodic settlement
5. **Revenue Share JV** — Multi-party splits with external CRM confirmation
6. **Retainer Agreement** — Time-based automatic payments

### 3.3 UI Components

**ContractTemplateLibrary.tsx** — Browse and select templates

**ContractWizard.tsx** — Step-by-step configuration of templates

**ClauseBuilder.tsx** — Add/modify clauses with parameter configuration

---

## Phase 4: ESG Governance Module

The "moral compass" that ensures every deal can contribute to environmental and social goals.

### 4.1 Database Schema

**New Tables:**
```text
entity_esg_profiles
├── id, entity_id, entity_type (company, deal_room)
├── carbon_reduction_target, target_year
├── social_goals (JSON), governance_certifications
├── public_commitments_url
└── last_updated, verified_by

esg_opportunity_matches
├── id, deal_room_id, opportunity_type (carbon_offset, renewable_energy, rin_generation)
├── matched_provider_id, estimated_impact
├── estimated_cost_savings, status
└── presented_at, accepted_at, declined_at

esg_impact_ledger
├── id, deal_room_id, entity_id
├── impact_type (carbon_reduced, renewable_used, rin_generated)
├── impact_amount, impact_unit
├── verification_method, xodiak_tx_hash
└── created_at

virien_integrations (for Virien.com renewable energy)
├── id, entity_id, virien_account_id
├── generation_capacity_kw, carbon_offset_annual
├── api_endpoint, last_sync
```

### 4.2 Edge Functions

**esg-profile-sync** — Import ESG goals from public reports/APIs

**esg-opportunity-scanner** — During deal setup, scan for ESG improvement opportunities

**esg-impact-log** — Record verified ESG outcomes to blockchain

### 4.3 UI Components

**ESGGoalsDashboard.tsx** — Entity-level ESG goal tracking

**ESGOpportunityMatcher.tsx** — Shows matching opportunities during deal creation

**ESGImpactReport.tsx** — Exportable report for annual ESG disclosures

---

## Phase 5: Project Sentinel (Government Infrastructure)

The platform for municipal, state, and federal government work order automation.

### 5.1 Database Schema

**New Tables:**
```text
sentinel_incident_reports
├── id, incident_type (pothole, damage, maintenance_due)
├── geolocation, address, severity_level
├── source_type (sensor, tesla_fleet, citizen_report, inspection)
├── source_device_id, source_metadata
├── ai_analysis, estimated_scope
└── status, created_at

sentinel_work_orders
├── id, incident_id, work_order_number
├── scope_of_work, materials_required (JSON)
├── labor_estimate_hours, equipment_required
├── estimated_cost, funding_sources (array of wallet_ids)
├── assigned_contractor_id, status
└── created_at, started_at, completed_at

sentinel_funding_allocations
├── id, work_order_id
├── source_type (municipal, state, federal, grant, private)
├── source_wallet_address, allocated_amount
├── reserved_at, released_at
└── xodiak_tx_hash

sentinel_contractor_network
├── id, contractor_entity_id, service_categories
├── geographic_coverage, rating, completed_jobs
├── equipment_available, crew_size
├── is_verified, insurance_verified
```

### 5.2 Edge Functions

**sentinel-incident-ingest** — Receive incidents from sensors, Tesla Fleet, citizen reports

**sentinel-ai-scope** — AI generates scope of work and cost estimate

**sentinel-funding-query** — Query available funds across municipal/state/federal wallets

**sentinel-contractor-match** — Match work order to best available contractor

**sentinel-verify-completion** — Oracle/sensor verification of completed work

### 5.3 Integration Points

**Tesla Fleet API** — Camera data for road condition detection

**Municipal Budget APIs** — Query available funds in real-time

**xBUILDERx / xROOFx** — Contractor matching from existing verticals

---

## Phase 6: Proof-of-Contribution (PoC) Token System

Non-monetary reputation tokens for social impact activities.

### 6.1 Database Schema

**New Tables:**
```text
poc_token_types
├── id, token_name, token_category (volunteer, training, environmental, civic)
├── description, icon_url
├── earning_criteria, redemption_options
└── is_transferable, created_at

poc_token_balances
├── id, user_id, token_type_id
├── balance, lifetime_earned
└── last_updated

poc_token_transactions
├── id, user_id, token_type_id
├── transaction_type (earned, redeemed, expired)
├── amount, reference_type, reference_id
├── narrative, xodiak_tx_hash
└── created_at

poc_redemption_catalog
├── id, redemption_name, redemption_type (training_access, housing_priority, tool_discount)
├── token_type_required, token_amount_required
├── available_quantity, is_active
└── partner_entity_id
```

### 6.2 Token Types to Create

1. **Volunteer Hours** — Community service, food bank, habitat builds
2. **Skill Development** — Completing training courses
3. **Environmental Action** — Tree planting, clean-up events
4. **Civic Engagement** — Voting, town halls, jury duty
5. **Mentorship** — Helping others succeed

### 6.3 UI Components

**PoCWallet.tsx** — User's PoC token balances and history

**PoCEarnOpportunities.tsx** — Available activities to earn PoC tokens

**PoCRedemptionCatalog.tsx** — Redeem tokens for benefits

---

## Implementation Sequence

```text
Week 1-2: Phase 1 - Oracle Network Infrastructure
├── Database migrations
├── Edge functions (register, poll, attest, verify)
└── Basic UI components

Week 3-4: Phase 2 - Entity API Framework  
├── API registration system
├── SOP mapping tools
└── Smart contract bindings

Week 5-6: Phase 3 - Smart Contract Templates
├── Template library database
├── Procure-to-Pay template
├── Commodity Sale template
└── Contract wizard UI

Week 7-8: Phase 4 - ESG Governance Module
├── ESG profile system
├── Opportunity matching
├── Impact ledger integration

Week 9-10: Phase 5 - Project Sentinel
├── Incident ingestion
├── AI scoping
├── Funding integration
└── Contractor matching

Week 11-12: Phase 6 - PoC Token System
├── Token type definitions
├── Earning/redemption flows
├── Wallet UI
```

---

## External Integration Points (Hardware/Third-Party)

These are the items that require external setup but will plug into our prepared interfaces:

| Integration | Our Preparation | External Requirement |
|-------------|-----------------|---------------------|
| Okari GX Sensors | Oracle data feed schema ready | Physical sensor deployment |
| Tesla Fleet API | Sentinel incident ingest ready | Tesla partnership/API access |
| SGS Verification | Document verification flow ready | SGS account setup |
| Platts Price Feeds | Oracle provider schema ready | Platts API subscription |
| Municipal Budget APIs | Sentinel funding query ready | Government API partnerships |
| Virien.com | ESG integration schema ready | Virien account setup |
| CBDC/Stablecoin Rails | XODIAK wallet infrastructure ready | Regulatory approval |

---

## Technical Specifications

### New Edge Functions to Create

1. `oracle-register-provider`
2. `oracle-poll-feed`
3. `oracle-submit-attestation`
4. `oracle-verify-condition`
5. `entity-api-register`
6. `entity-api-invoke`
7. `sop-mapper`
8. `esg-profile-sync`
9. `esg-opportunity-scanner`
10. `esg-impact-log`
11. `sentinel-incident-ingest`
12. `sentinel-ai-scope`
13. `sentinel-funding-query`
14. `sentinel-contractor-match`
15. `sentinel-verify-completion`
16. `poc-earn-tokens`
17. `poc-redeem-tokens`

### New UI Components to Create

1. `OracleProviderRegistry.tsx`
2. `OracleFeedDashboard.tsx`
3. `AttestationPanel.tsx`
4. `EntityAPIManager.tsx`
5. `SOPMappingWizard.tsx`
6. `SmartContractBindingEditor.tsx`
7. `ContractTemplateLibrary.tsx`
8. `ContractWizard.tsx`
9. `ClauseBuilder.tsx`
10. `ESGGoalsDashboard.tsx`
11. `ESGOpportunityMatcher.tsx`
12. `ESGImpactReport.tsx`
13. `SentinelDashboard.tsx`
14. `SentinelIncidentMap.tsx`
15. `SentinelWorkOrderManager.tsx`
16. `PoCWallet.tsx`
17. `PoCEarnOpportunities.tsx`
18. `PoCRedemptionCatalog.tsx`

---

## Monetization Model Implementation

| Revenue Stream | Implementation |
|----------------|----------------|
| Smart Contract Setup Fee | Invoice creation via existing Financial Rails |
| Per-Barrel/Per-Unit Fee | Settlement contract with fractional payout to platform |
| Platform Subscription | Stripe subscription via existing integration |
| Oracle Network Fee | Usage-based billing in oracle-poll-feed |

---

## Summary

You've described a complete Financial Operating System for industrial-scale commerce. The Biz Dev App already has 60-70% of the core infrastructure. This plan provides the roadmap to complete the remaining components in a logical sequence, with each phase building on the previous.

The key insight is that the **Oracle Network** is the foundation—without trusted real-world data feeds, smart contracts can't execute. Once that's in place, everything else (Entity APIs, ESG, Sentinel, PoC) connects naturally.

Ready to start with Phase 1: Oracle Network Infrastructure?
