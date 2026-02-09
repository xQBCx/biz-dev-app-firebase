export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_grants: {
        Row: {
          created_at: string
          expiry: string | null
          id: string
          product_id: string
          scope_json: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          expiry?: string | null
          id?: string
          product_id: string
          scope_json?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          expiry?: string | null
          id?: string
          product_id?: string
          scope_json?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_grants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "data_products"
            referencedColumns: ["id"]
          },
        ]
      }
      access_requests: {
        Row: {
          assigned_account_level:
            | Database["public"]["Enums"]["account_level"]
            | null
          company: string | null
          created_at: string
          default_permissions: Json | null
          email: string
          full_name: string
          id: string
          invite_code: string | null
          invite_expires_at: string | null
          reason: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_account_level?:
            | Database["public"]["Enums"]["account_level"]
            | null
          company?: string | null
          created_at?: string
          default_permissions?: Json | null
          email: string
          full_name: string
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          reason?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_account_level?:
            | Database["public"]["Enums"]["account_level"]
            | null
          company?: string | null
          created_at?: string
          default_permissions?: Json | null
          email?: string
          full_name?: string
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          reason?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_level:
        | "free_trial"
        | "basic"
        | "professional"
        | "enterprise"
        | "partner"
      activity_type:
        | "call"
        | "email"
        | "meeting"
        | "task"
        | "project_work"
        | "document"
        | "other"
      actor_type: "human" | "agent" | "system"
      agent_type:
        | "outbound"
        | "enrichment"
        | "follow_up"
        | "analysis"
        | "automation"
        | "scheduling"
        | "research"
      ai_card_status:
        | "pending"
        | "active"
        | "redeemed"
        | "expired"
        | "cancelled"
      ai_card_type: "digital" | "physical"
      ai_fulfillment_status:
        | "pending"
        | "processing"
        | "printed"
        | "shipped"
        | "delivered"
      ai_order_status:
        | "pending"
        | "paid"
        | "fulfilled"
        | "cancelled"
        | "refunded"
      ai_product_status: "pending" | "active" | "inactive"
      ai_provider_status: "pending" | "approved" | "rejected" | "suspended"
      app_role:
        | "admin"
        | "team_member"
        | "client_user"
        | "partner"
        | "utility_ops"
        | "planner"
        | "dispatcher"
        | "aggregator"
        | "site_owner"
        | "regulator"
        | "auditor"
        | "read_only"
      asset_status: "planned" | "installed" | "active" | "inactive" | "retired"
      asset_type:
        | "pm_generator"
        | "inverter"
        | "battery"
        | "evse"
        | "rose_panel"
        | "pmu"
        | "relay"
        | "meter"
        | "transformer"
        | "feeder"
        | "substation"
        | "rtu"
        | "recloser"
        | "edge_gateway"
      bet_status: "PENDING" | "WON" | "LOST" | "VOID" | "CASHED_OUT"
      bet_type: "SINGLE" | "PARLAY"
      bid_source_type: "email" | "buildingconnected" | "manual" | "ai_discovery"
      bid_status:
        | "draft"
        | "invited"
        | "submitted"
        | "won"
        | "lost"
        | "archived"
      binding_source_type:
        | "oracle_feed"
        | "entity_api"
        | "attestation"
        | "manual"
      business_spawn_status:
        | "draft"
        | "researching"
        | "generating_erp"
        | "generating_website"
        | "generating_content"
        | "pending_approval"
        | "approved"
        | "active"
        | "suspended"
        | "archived"
      calc_method: "true_power" | "ohmic_estimate"
      capital_allocation_type:
        | "reinvest"
        | "long_term_hold"
        | "ecosystem_company"
        | "co_investment"
        | "company_formation"
        | "withdrawal"
      card_material: "paper" | "plastic" | "aluminum" | "silver" | "gold"
      card_status: "draft" | "active" | "minted" | "traded"
      city_climate: "hot" | "temperate" | "cold" | "tropical"
      command_status: "pending" | "applied" | "failed"
      command_type:
        | "set_power"
        | "set_pf"
        | "set_var_curve"
        | "open"
        | "close"
        | "arm_island"
        | "disarm_island"
        | "price_signal"
        | "charge"
        | "discharge"
        | "workload_cap"
      commission_type: "percentage" | "flat_fee" | "tiered"
      commodity_deal_status:
        | "draft"
        | "escrow_funded"
        | "pop_verified"
        | "in_progress"
        | "completed"
        | "disputed"
        | "cancelled"
      commodity_escrow_status:
        | "pending"
        | "funded"
        | "partial_release"
        | "released"
        | "refunded"
        | "disputed"
      commodity_listing_status:
        | "draft"
        | "active"
        | "pending_verification"
        | "verified"
        | "sold"
        | "expired"
        | "cancelled"
      commodity_type:
        | "oil"
        | "natural_gas"
        | "electricity"
        | "carbon_credit"
        | "rin"
        | "water"
        | "minerals"
        | "agricultural"
        | "other"
      commodity_user_tier: "silver" | "gold" | "platinum"
      commodity_verification_status:
        | "unverified"
        | "document_verified"
        | "okari_live"
        | "fully_verified"
      company_relationship_type:
        | "parent_subsidiary"
        | "wholly_owned_subsidiary"
        | "distribution_rights"
        | "licensing_agreement"
        | "joint_venture"
        | "strategic_partnership"
        | "minority_stake"
        | "holding_company"
        | "sister_company"
        | "franchise"
      company_type: "owned" | "affiliate" | "strategic_advisor" | "partner"
      compensation_type:
        | "cash"
        | "commission"
        | "revenue_share"
        | "royalty"
        | "equity"
        | "licensing_fee"
        | "contribution_credit"
      compliance_mode: "standard" | "davis_bacon" | "prevailing_wage"
      compliance_standard:
        | "IEEE1547"
        | "UL1741SB"
        | "IEEE2030_5"
        | "ANSI_C12"
        | "IEEE519"
        | "NERC_CIP"
        | "FICTIONAL_IFX"
      connection_status:
        | "pending"
        | "active"
        | "completed"
        | "cancelled"
        | "disputed"
      connector_auth_type: "oauth2" | "oauth1" | "api_key" | "manual" | "webhook"
      connector_type:
        | "gmail"
        | "outlook"
        | "imap_smtp"
        | "hubspot"
        | "salesforce"
        | "zoho"
        | "pipedrive"
        | "dynamics"
        | "netsuite"
        | "odoo"
        | "sap"
        | "quickbooks"
        | "wordpress"
        | "webflow"
        | "contentful"
        | "notion"
        | "gdrive"
        | "sharepoint"
        | "mailchimp"
        | "klaviyo"
        | "zendesk"
        | "freshdesk"
      construction_asset_type:
        | "residential"
        | "commercial"
        | "industrial"
        | "multifamily"
        | "infrastructure"
      contact_relationship_type:
        | "prospect"
        | "customer"
        | "partner"
        | "inactive"
      contribution_classification:
        | "ingredient_one_time"
        | "ingredient_embedded"
        | "formulation_effort"
        | "process_governance"
        | "distribution_origination"
        | "execution_deployment"
        | "risk_assumption"
      contribution_event_type:
        | "task_created"
        | "task_completed"
        | "task_assigned"
        | "task_updated"
        | "email_drafted"
        | "email_sent"
        | "call_made"
        | "meeting_scheduled"
        | "meeting_held"
        | "lead_qualified"
        | "deal_created"
        | "deal_advanced"
        | "deal_closed_won"
        | "deal_closed_lost"
        | "content_created"
        | "document_authored"
        | "ip_submitted"
        | "agent_executed"
        | "agent_suggestion"
        | "agent_automation"
        | "data_enriched"
        | "integration_synced"
        | "workflow_triggered"
      contribution_type:
        | "time"
        | "technical"
        | "capital"
        | "network"
        | "risk_exposure"
      cost_type:
        | "material"
        | "labor"
        | "subcontractor"
        | "equipment"
        | "overhead"
        | "bond"
        | "insurance"
        | "warranty"
        | "permit"
      credit_type: "contribution" | "usage" | "value"
      deal_category:
        | "sales"
        | "platform_build"
        | "joint_venture"
        | "licensing"
        | "services"
        | "infrastructure"
        | "ip_creation"
      deal_participant_role:
        | "builder"
        | "seller"
        | "strategist"
        | "operator"
        | "investor"
        | "advisor"
      deal_room_access_level: "deal_room_only" | "full_profile"
      deal_room_invite_status:
        | "pending"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
      deal_room_message_channel:
        | "deal_room"
        | "biz_dev_messages"
        | "external_email"
      deal_room_status:
        | "draft"
        | "active"
        | "voting"
        | "approved"
        | "executed"
        | "cancelled"
        | "archived"
      deal_time_horizon: "one_time" | "recurring" | "perpetual"
      deal_vote_type: "approve" | "reject" | "modify"
      delegation_type: "human" | "ai" | "hybrid"
      der_tech: "pm_gen" | "pv" | "battery" | "ev" | "rose" | "microturbine"
      dr_program_type: "capacity" | "energy" | "fast_reg" | "volt_var"
      entity_api_type:
        | "publish_work_order"
        | "submit_bid"
        | "accept_bid"
        | "reject_bid"
        | "approve_completion"
        | "reject_completion"
        | "submit_invoice"
        | "approve_invoice"
        | "issue_payment"
        | "issue_change_order"
        | "approve_change_order"
        | "confirm_delivery"
        | "report_issue"
        | "custom"
      entity_auth_type: "api_key" | "oauth2" | "jwt" | "basic" | "none"
      entity_status:
        | "draft"
        | "pending"
        | "processing"
        | "approved"
        | "active"
        | "rejected"
      entity_type:
        | "LLC"
        | "S-Corp"
        | "C-Corp"
        | "Sole Proprietorship"
        | "Partnership"
        | "Nonprofit"
      eros_deployment_role:
        | "commander"
        | "team_lead"
        | "specialist"
        | "support"
        | "observer"
        | "coordinator"
      eros_deployment_status:
        | "requested"
        | "accepted"
        | "en_route"
        | "on_site"
        | "completed"
        | "cancelled"
        | "declined"
      eros_incident_status:
        | "active"
        | "resolved"
        | "escalated"
        | "closed"
        | "standby"
      eros_incident_type:
        | "natural_disaster"
        | "medical"
        | "security"
        | "infrastructure"
        | "community"
        | "industrial"
        | "environmental"
      eros_message_priority: "routine" | "urgent" | "flash" | "emergency"
      eros_responder_status:
        | "available"
        | "on_call"
        | "deployed"
        | "unavailable"
        | "standby"
      eros_severity: "critical" | "high" | "medium" | "low"
      eros_verification_status: "pending" | "verified" | "suspended" | "expired"
      ev_direction: "charge" | "discharge"
      event_category:
        | "navigation"
        | "interaction"
        | "transaction"
        | "communication"
        | "content"
        | "workflow"
        | "search"
        | "integration"
        | "system"
      event_severity: "info" | "warning" | "critical" | "emergency"
      forecast_horizon: "15min" | "day" | "week" | "year" | "10year"
      forecast_scope: "feeder" | "substation" | "city"
      formulation_scope:
        | "customer_specific"
        | "industry_specific"
        | "platform_wide"
      funding_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "funded"
      generation_method: "ai_generated" | "template_based" | "hybrid"
      ingredient_type:
        | "software_module"
        | "ai_agent"
        | "security_framework"
        | "industry_knowledge"
        | "capital"
        | "customer_relationships"
        | "execution_resources"
        | "brand_trademark"
        | "data_pipeline"
        | "governance_framework"
        | "visualization_system"
        | "other"
      kyc_status: "NOT_REQUIRED" | "PENDING" | "VERIFIED" | "REJECTED"
      listing_status: "draft" | "active" | "paused" | "closed"
      listing_type: "product" | "service"
      market_category: "SPORTS" | "STOCKS" | "CRYPTO" | "WORLD"
      market_status: "OPEN" | "SUSPENDED" | "SETTLED" | "VOID"
      message_direction: "inbound" | "outbound"
      migration_status: "pending" | "in_progress" | "completed" | "failed"
      node_type:
        | "substation"
        | "feeder"
        | "transformer"
        | "service_point"
        | "microgrid"
        | "dc_bus"
      operating_mode: "SIM" | "FIELD"
      oracle_attestation_type:
        | "field_supervisor"
        | "quality_inspector"
        | "auditor"
        | "compliance_officer"
        | "executive"
        | "third_party"
      oracle_provider_type:
        | "sensor"
        | "api"
        | "manual"
        | "attestation"
        | "price_feed"
        | "iot_device"
      oracle_trust_level: "bronze" | "silver" | "gold" | "platinum"
      outcome_result: "WIN" | "LOSE" | "PUSH" | "VOID"
      payout_method_type:
        | "bank_ach"
        | "stripe_connect"
        | "paypal"
        | "venmo"
        | "cashapp"
        | "zelle"
        | "apple_cash"
        | "crypto_btc"
        | "crypto_eth"
        | "crypto_xrp"
        | "manual"
      platform_category:
        | "social_media"
        | "messaging"
        | "video"
        | "professional"
        | "local_business"
        | "creative"
        | "audio"
        | "emerging"
        | "regional"
        | "niche"
      platform_module:
        | "dashboard"
        | "erp"
        | "workflows"
        | "xbuilderx"
        | "xbuilderx_home"
        | "xbuilderx_discovery"
        | "xbuilderx_engineering"
        | "xbuilderx_pipeline"
        | "xbuilderx_construction"
        | "xodiak"
        | "xodiak_assets"
        | "xodiak_compliance"
        | "directory"
        | "crm"
        | "portfolio"
        | "clients"
        | "client_portal"
        | "business_cards"
        | "franchises"
        | "franchise_applications"
        | "team"
        | "team_invitations"
        | "tasks"
        | "calendar"
        | "activity"
        | "tools"
        | "messages"
        | "ai_gift_cards"
        | "iplaunch"
        | "network"
        | "integrations"
        | "funding"
        | "theme_harvester"
        | "launchpad"
        | "app_store"
        | "my_apps"
        | "white_label_portal"
        | "earnings"
        | "true_odds"
        | "true_odds_explore"
        | "true_odds_picks"
        | "true_odds_signals"
        | "core"
        | "marketplace"
        | "grid_os"
        | "social"
        | "website_builder"
        | "ecosystem"
        | "admin"
        | "white_paper"
        | "module_white_papers"
        | "deal_rooms"
        | "xcommodity"
      platform_status:
        | "discovered"
        | "preview"
        | "claimed"
        | "active"
        | "suspended"
        | "transferred"
      post_status: "draft" | "scheduled" | "published" | "failed" | "deleted"
      privacy_level: "agg" | "dp"
      project_phase:
        | "discovery"
        | "design"
        | "estimating"
        | "bidding"
        | "construction"
        | "closeout"
        | "warranty"
      redemption_method:
        | "platform_credits"
        | "prepaid_card"
        | "bank_deposit"
        | "paypal"
        | "venmo"
      resource_type: "der" | "flex_load" | "ev" | "rose"
      roof_type:
        | "flat"
        | "pitched"
        | "metal"
        | "tile"
        | "shingle"
        | "membrane"
        | "other"
      settlement_trigger:
        | "revenue_received"
        | "invoice_paid"
        | "savings_verified"
        | "milestone_hit"
        | "usage_threshold"
        | "time_based"
        | "manual_approval"
      signal_kind:
        | "INJURY"
        | "WEATHER"
        | "EARNINGS"
        | "MERGER"
        | "SENTIMENT"
        | "TREND"
        | "NEWS"
        | "LINEUP"
      spawn_request_status: "pending" | "approved" | "rejected"
      switch_action: "open" | "close"
      sync_status: "pending" | "syncing" | "completed" | "failed" | "paused"
      takeoff_unit: "sqft" | "lf" | "cy" | "ea" | "sf" | "ton" | "ls"
      tariff_type: "flat" | "tou" | "rtp" | "demand"
      task_contributor_type: "human" | "agent" | "hybrid"
      task_value_category:
        | "lead"
        | "meeting"
        | "sale"
        | "ip"
        | "architecture"
        | "ops"
        | "research"
        | "outreach"
        | "analysis"
        | "automation"
      test_verdict: "pass" | "fail" | "inconclusive" | "transcendent"
      trade_status: "pending" | "executed" | "cancelled" | "expired"
      trade_type: "buy" | "sell" | "short" | "cover"
      trading_session_status: "simulation" | "live" | "paused" | "graduated"
      trading_skill_level:
        | "recruit"
        | "trainee"
        | "operator"
        | "specialist"
        | "commander"
        | "strategist"
      voting_rule: "unanimous" | "majority" | "weighted" | "founder_override"
      website_status: "draft" | "published" | "archived"
      workflow_item_type:
        | "rfi"
        | "submittal"
        | "change_order"
        | "daily_report"
        | "punch_list"
      workflow_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "closed"
      workload_class: "render" | "ml" | "edge" | "archive"
      xdk_account_type: "user" | "contract" | "validator" | "treasury"
      xdk_consensus_status: "proposing" | "voting" | "committed" | "finalized"
      xdk_tx_status: "pending" | "confirmed" | "failed"
      xdk_tx_type:
        | "transfer"
        | "stake"
        | "unstake"
        | "contract_call"
        | "asset_tokenization"
        | "genesis"
        | "reward"
        | "fund_contribution"
        | "mint_funding"
        | "withdrawal"
        | "settlement_payout"
        | "mint_invoice_payment"
        | "mint_treasury_routing"
        | "anchor"
        | "internal_transfer"
      xdk_validator_status: "active" | "jailed" | "inactive"
      xevents_category:
        | "workshop"
        | "summit"
        | "conference"
        | "webinar"
        | "roundtable"
        | "networking"
        | "private_dinner"
        | "training"
        | "launch_event"
        | "custom"
      xevents_participant_role:
        | "organizer"
        | "co_organizer"
        | "speaker"
        | "sponsor"
        | "staff"
        | "vip"
        | "attendee"
      xevents_registration_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "cancelled"
        | "refunded"
        | "waitlisted"
      xevents_status:
        | "draft"
        | "published"
        | "live"
        | "completed"
        | "cancelled"
        | "archived"
      xevents_visibility: "public" | "private" | "invite_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
