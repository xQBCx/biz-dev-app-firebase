export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
      achievement_interactions: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_interactions_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "bd_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          client_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          started_at: string
          title: string
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          title: string
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_impersonation_logs: {
        Row: {
          action: string
          admin_user_id: string
          context: string | null
          ended_at: string | null
          id: string
          ip_address: string | null
          started_at: string
          target_user_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          context?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          started_at?: string
          target_user_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          context?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          started_at?: string
          target_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      advisor_notes: {
        Row: {
          advisor_id: string
          content: string
          created_at: string
          deal_room_id: string
          id: string
          note_type: string
          visible_to_participant_ids: string[]
        }
        Insert: {
          advisor_id: string
          content: string
          created_at?: string
          deal_room_id: string
          id?: string
          note_type: string
          visible_to_participant_ids: string[]
        }
        Update: {
          advisor_id?: string
          content?: string
          created_at?: string
          deal_room_id?: string
          id?: string
          note_type?: string
          visible_to_participant_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "advisor_notes_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "deal_room_advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_notes_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_user_id: string
          app_id: string
          commission_amount: number
          commission_rate: number
          commission_tier: number
          created_at: string | null
          id: string
          license_id: string
          paid_at: string | null
          referred_user_id: string
          status: string
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_user_id: string
          app_id: string
          commission_amount: number
          commission_rate: number
          commission_tier: number
          created_at?: string | null
          id?: string
          license_id: string
          paid_at?: string | null
          referred_user_id: string
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_user_id?: string
          app_id?: string
          commission_amount?: number
          commission_rate?: number
          commission_tier?: number
          created_at?: string | null
          id?: string
          license_id?: string
          paid_at?: string | null
          referred_user_id?: string
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "app_licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_attribution_rules: {
        Row: {
          agent_id: string | null
          agent_slug: string | null
          base_amount: number | null
          conditions: Json | null
          created_at: string
          deal_room_id: string
          id: string
          is_active: boolean
          outcome_type: string
          percentage_of_deal: number | null
          split_rules: Json
        }
        Insert: {
          agent_id?: string | null
          agent_slug?: string | null
          base_amount?: number | null
          conditions?: Json | null
          created_at?: string
          deal_room_id: string
          id?: string
          is_active?: boolean
          outcome_type: string
          percentage_of_deal?: number | null
          split_rules?: Json
        }
        Update: {
          agent_id?: string | null
          agent_slug?: string | null
          base_amount?: number | null
          conditions?: Json | null
          created_at?: string
          deal_room_id?: string
          id?: string
          is_active?: boolean
          outcome_type?: string
          percentage_of_deal?: number | null
          split_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_attribution_rules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_attribution_rules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "instincts_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_attribution_rules_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_access_policies: {
        Row: {
          action: string
          active: boolean | null
          allowed_permissions: string[] | null
          allowed_roles: string[] | null
          conditions: Json | null
          created_at: string | null
          id: string
          policy_name: string
          policy_type: string
          priority: number | null
          resource_id: string | null
          resource_type: string
          time_restrictions: Json | null
          updated_at: string | null
        }
        Insert: {
          action: string
          active?: boolean | null
          allowed_permissions?: string[] | null
          allowed_roles?: string[] | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          policy_name: string
          policy_type: string
          priority?: number | null
          resource_id?: string | null
          resource_type: string
          time_restrictions?: Json | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          active?: boolean | null
          allowed_permissions?: string[] | null
          allowed_roles?: string[] | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          policy_name?: string
          policy_type?: string
          priority?: number | null
          resource_id?: string | null
          resource_type?: string
          time_restrictions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_affiliate_terms: {
        Row: {
          created_at: string | null
          effective_from: string | null
          effective_until: string | null
          first_purchase_bonus: number | null
          id: string
          lifetime_commission_percent: number
          min_payout_threshold: number | null
          provider_id: string
          tracking_cookie_days: number | null
        }
        Insert: {
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          first_purchase_bonus?: number | null
          id?: string
          lifetime_commission_percent?: number
          min_payout_threshold?: number | null
          provider_id: string
          tracking_cookie_days?: number | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          first_purchase_bonus?: number | null
          id?: string
          lifetime_commission_percent?: number
          min_payout_threshold?: number | null
          provider_id?: string
          tracking_cookie_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_affiliate_terms_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_registry: {
        Row: {
          active: boolean | null
          agent_name: string
          agent_slug: string
          agent_type: string
          anomaly_detection_enabled: boolean | null
          architecture_layer: number | null
          audit_enabled: boolean | null
          authentication_required: boolean | null
          created_at: string | null
          created_by: string | null
          data_isolation_level: string | null
          human_oversight_required: boolean | null
          id: string
          impact_level: number | null
          rate_limit_config: Json | null
          rbac_roles: string[] | null
          resource_limits: Json | null
          security_classification: string | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          active?: boolean | null
          agent_name: string
          agent_slug: string
          agent_type: string
          anomaly_detection_enabled?: boolean | null
          architecture_layer?: number | null
          audit_enabled?: boolean | null
          authentication_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data_isolation_level?: string | null
          human_oversight_required?: boolean | null
          id?: string
          impact_level?: number | null
          rate_limit_config?: Json | null
          rbac_roles?: string[] | null
          resource_limits?: Json | null
          security_classification?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          active?: boolean | null
          agent_name?: string
          agent_slug?: string
          agent_type?: string
          anomaly_detection_enabled?: boolean | null
          architecture_layer?: number | null
          audit_enabled?: boolean | null
          authentication_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data_isolation_level?: string | null
          human_oversight_required?: boolean | null
          id?: string
          impact_level?: number | null
          rate_limit_config?: Json | null
          rbac_roles?: string[] | null
          resource_limits?: Json | null
          security_classification?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      ai_agent_tasks: {
        Row: {
          context: Json | null
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          priority: number | null
          result: Json | null
          scheduled_for: string | null
          status: string
          task_description: string
          task_type: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          priority?: number | null
          result?: Json | null
          scheduled_for?: string | null
          status?: string
          task_description: string
          task_type: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          priority?: number | null
          result?: Json | null
          scheduled_for?: string | null
          status?: string
          task_description?: string
          task_type?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          active: boolean | null
          context: Json | null
          created_at: string
          id: string
          last_message_at: string | null
          message_count: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          context?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          context?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_cross_module_links: {
        Row: {
          confidence_score: number | null
          created_at: string
          discovered_by: string | null
          id: string
          link_type: string
          metadata: Json | null
          source_entity_id: string
          source_module: string
          target_entity_id: string
          target_module: string
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          discovered_by?: string | null
          id?: string
          link_type: string
          metadata?: Json | null
          source_entity_id: string
          source_module: string
          target_entity_id: string
          target_module: string
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          discovered_by?: string | null
          id?: string
          link_type?: string
          metadata?: Json | null
          source_entity_id?: string
          source_module?: string
          target_entity_id?: string
          target_module?: string
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: []
      }
      ai_data_lineage: {
        Row: {
          access_history: Json | null
          classification: string | null
          created_at: string | null
          created_by: string | null
          data_id: string
          data_source: string
          data_type: string
          encryption_status: string | null
          expires_at: string | null
          id: string
          pii_detected: boolean | null
          pii_types: string[] | null
          retention_policy: string | null
          transformation_chain: Json | null
        }
        Insert: {
          access_history?: Json | null
          classification?: string | null
          created_at?: string | null
          created_by?: string | null
          data_id: string
          data_source: string
          data_type: string
          encryption_status?: string | null
          expires_at?: string | null
          id?: string
          pii_detected?: boolean | null
          pii_types?: string[] | null
          retention_policy?: string | null
          transformation_chain?: Json | null
        }
        Update: {
          access_history?: Json | null
          classification?: string | null
          created_at?: string | null
          created_by?: string | null
          data_id?: string
          data_source?: string
          data_type?: string
          encryption_status?: string | null
          expires_at?: string | null
          id?: string
          pii_detected?: boolean | null
          pii_types?: string[] | null
          retention_policy?: string | null
          transformation_chain?: Json | null
        }
        Relationships: []
      }
      ai_extraction_log: {
        Row: {
          confidence_score: number | null
          created_at: string
          document_id: string | null
          extracted_data: Json | null
          extraction_type: string
          id: string
          model_used: string | null
          processing_time_ms: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          document_id?: string | null
          extracted_data?: Json | null
          extraction_type: string
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          document_id?: string | null
          extracted_data?: Json | null
          extraction_type?: string
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_extraction_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "construction_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_gift_cards: {
        Row: {
          activated_at: string | null
          actual_redemption_method:
            | Database["public"]["Enums"]["redemption_method"]
            | null
          batch_id: string | null
          card_code: string
          card_type: Database["public"]["Enums"]["ai_card_type"]
          claim_url: string | null
          claimed_at: string | null
          created_at: string | null
          delivery_method_actual: string | null
          email_sent_at: string | null
          expires_at: string
          face_value: number
          flexible_redemption_enabled: boolean | null
          id: string
          is_physical: boolean | null
          last_activity_at: string | null
          metadata: Json | null
          occasion_message: string | null
          occasion_theme: string | null
          occasion_title: string | null
          order_id: string
          pdf_url: string | null
          pin_code: string | null
          product_id: string
          provider_account_id: string | null
          provider_credits_applied: number | null
          provider_id: string
          qr_code_url: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          redeemed_at: string | null
          redemption_count: number | null
          redemption_url: string
          remaining_value: number
          sender_name: string | null
          sms_sent_at: string | null
          status: Database["public"]["Enums"]["ai_card_status"]
          suggested_provider_id: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          actual_redemption_method?:
            | Database["public"]["Enums"]["redemption_method"]
            | null
          batch_id?: string | null
          card_code: string
          card_type: Database["public"]["Enums"]["ai_card_type"]
          claim_url?: string | null
          claimed_at?: string | null
          created_at?: string | null
          delivery_method_actual?: string | null
          email_sent_at?: string | null
          expires_at: string
          face_value: number
          flexible_redemption_enabled?: boolean | null
          id?: string
          is_physical?: boolean | null
          last_activity_at?: string | null
          metadata?: Json | null
          occasion_message?: string | null
          occasion_theme?: string | null
          occasion_title?: string | null
          order_id: string
          pdf_url?: string | null
          pin_code?: string | null
          product_id: string
          provider_account_id?: string | null
          provider_credits_applied?: number | null
          provider_id: string
          qr_code_url?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          redeemed_at?: string | null
          redemption_count?: number | null
          redemption_url: string
          remaining_value: number
          sender_name?: string | null
          sms_sent_at?: string | null
          status?: Database["public"]["Enums"]["ai_card_status"]
          suggested_provider_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          actual_redemption_method?:
            | Database["public"]["Enums"]["redemption_method"]
            | null
          batch_id?: string | null
          card_code?: string
          card_type?: Database["public"]["Enums"]["ai_card_type"]
          claim_url?: string | null
          claimed_at?: string | null
          created_at?: string | null
          delivery_method_actual?: string | null
          email_sent_at?: string | null
          expires_at?: string
          face_value?: number
          flexible_redemption_enabled?: boolean | null
          id?: string
          is_physical?: boolean | null
          last_activity_at?: string | null
          metadata?: Json | null
          occasion_message?: string | null
          occasion_theme?: string | null
          occasion_title?: string | null
          order_id?: string
          pdf_url?: string | null
          pin_code?: string | null
          product_id?: string
          provider_account_id?: string | null
          provider_credits_applied?: number | null
          provider_id?: string
          qr_code_url?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          redeemed_at?: string | null
          redemption_count?: number | null
          redemption_url?: string
          remaining_value?: number
          sender_name?: string | null
          sms_sent_at?: string | null
          status?: Database["public"]["Enums"]["ai_card_status"]
          suggested_provider_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_gift_cards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ai_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_gift_cards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ai_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_gift_cards_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_gift_cards_suggested_provider_id_fkey"
            columns: ["suggested_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_governance_compliance: {
        Row: {
          control_description: string | null
          control_id: string
          control_name: string
          created_at: string | null
          evidence_url: string | null
          framework: string
          id: string
          implementation_status: string | null
          last_assessment_at: string | null
          next_assessment_at: string | null
          responsible_role: string | null
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          control_description?: string | null
          control_id: string
          control_name: string
          created_at?: string | null
          evidence_url?: string | null
          framework: string
          id?: string
          implementation_status?: string | null
          last_assessment_at?: string | null
          next_assessment_at?: string | null
          responsible_role?: string | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          control_description?: string | null
          control_id?: string
          control_name?: string
          created_at?: string | null
          evidence_url?: string | null
          framework?: string
          id?: string
          implementation_status?: string | null
          last_assessment_at?: string | null
          next_assessment_at?: string | null
          responsible_role?: string | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_guardrails: {
        Row: {
          active: boolean | null
          agent_id: string | null
          bypass_roles: string[] | null
          configuration: Json
          created_at: string | null
          enforcement_level: string | null
          guardrail_name: string
          guardrail_type: string
          id: string
          last_triggered_at: string | null
          triggered_count: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          agent_id?: string | null
          bypass_roles?: string[] | null
          configuration?: Json
          created_at?: string | null
          enforcement_level?: string | null
          guardrail_name: string
          guardrail_type: string
          id?: string
          last_triggered_at?: string | null
          triggered_count?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          agent_id?: string | null
          bypass_roles?: string[] | null
          configuration?: Json
          created_at?: string | null
          enforcement_level?: string | null
          guardrail_name?: string
          guardrail_type?: string
          id?: string
          last_triggered_at?: string | null
          triggered_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_guardrails_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_incidents: {
        Row: {
          affected_systems: string[] | null
          affected_users_count: number | null
          assigned_to: string | null
          contained_at: string | null
          created_at: string | null
          description: string
          detected_at: string
          id: string
          incident_id: string
          incident_type: string
          lessons_learned: string | null
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affected_systems?: string[] | null
          affected_users_count?: number | null
          assigned_to?: string | null
          contained_at?: string | null
          created_at?: string | null
          description: string
          detected_at: string
          id?: string
          incident_id: string
          incident_type: string
          lessons_learned?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affected_systems?: string[] | null
          affected_users_count?: number | null
          assigned_to?: string | null
          contained_at?: string | null
          created_at?: string | null
          description?: string
          detected_at?: string
          id?: string
          incident_id?: string
          incident_type?: string
          lessons_learned?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_learnings: {
        Row: {
          category: string | null
          confidence: number | null
          created_at: string
          id: string
          last_used_at: string | null
          learning_type: string
          metadata: Json | null
          pattern: string | null
          resolution: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          learning_type: string
          metadata?: Json | null
          pattern?: string | null
          resolution?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          learning_type?: string
          metadata?: Json | null
          pattern?: string | null
          resolution?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_message_feedback: {
        Row: {
          created_at: string
          feedback_reason: string | null
          feedback_type: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_reason?: string | null
          feedback_type: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_reason?: string | null
          feedback_type?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          images: string[] | null
          role: string
          tool_calls: Json | null
          tool_results: Json | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          images?: string[] | null
          role: string
          tool_calls?: Json | null
          tool_results?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          images?: string[] | null
          role?: string
          tool_calls?: Json | null
          tool_results?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_model_governance: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          cost_per_1k_tokens: number | null
          created_at: string | null
          data_restrictions: string[] | null
          id: string
          last_audit_at: string | null
          model_id: string
          model_name: string
          model_provider: string
          model_type: string
          model_version: string | null
          performance_metrics: Json | null
          risk_assessment: Json | null
          updated_at: string | null
          use_cases_allowed: string[] | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          data_restrictions?: string[] | null
          id?: string
          last_audit_at?: string | null
          model_id: string
          model_name: string
          model_provider: string
          model_type: string
          model_version?: string | null
          performance_metrics?: Json | null
          risk_assessment?: Json | null
          updated_at?: string | null
          use_cases_allowed?: string[] | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          data_restrictions?: string[] | null
          id?: string
          last_audit_at?: string | null
          model_id?: string
          model_name?: string
          model_provider?: string
          model_type?: string
          model_version?: string | null
          performance_metrics?: Json | null
          risk_assessment?: Json | null
          updated_at?: string | null
          use_cases_allowed?: string[] | null
        }
        Relationships: []
      }
      ai_model_usage: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          model_name: string
          model_provider: string
          requests_count: number | null
          revenue_generated: number | null
          tokens_input: number | null
          tokens_output: number | null
          total_cost: number | null
          usage_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_name: string
          model_provider: string
          requests_count?: number | null
          revenue_generated?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
          total_cost?: number | null
          usage_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_name?: string
          model_provider?: string
          requests_count?: number | null
          revenue_generated?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
          total_cost?: number | null
          usage_date?: string
        }
        Relationships: []
      }
      ai_orders: {
        Row: {
          affiliate_code: string | null
          brand_logo_url: string | null
          brand_name: string | null
          calculated_fees: Json | null
          campaign_code: string | null
          campaign_expiry: string | null
          campaign_name: string | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          delivery_email: string | null
          delivery_method: string | null
          delivery_phone: string | null
          escrow_released_at: string | null
          escrow_status: string | null
          event_name: string | null
          fulfillment_status:
            | Database["public"]["Enums"]["ai_fulfillment_status"]
            | null
          id: string
          is_black_friday_promo: boolean | null
          metadata: Json | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
          pricing_config_id: string | null
          product_id: string
          quantity: number
          shipping_address: Json | null
          status: Database["public"]["Enums"]["ai_order_status"]
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          unit_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_code?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          calculated_fees?: Json | null
          campaign_code?: string | null
          campaign_expiry?: string | null
          campaign_name?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          delivery_email?: string | null
          delivery_method?: string | null
          delivery_phone?: string | null
          escrow_released_at?: string | null
          escrow_status?: string | null
          event_name?: string | null
          fulfillment_status?:
            | Database["public"]["Enums"]["ai_fulfillment_status"]
            | null
          id?: string
          is_black_friday_promo?: boolean | null
          metadata?: Json | null
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          pricing_config_id?: string | null
          product_id: string
          quantity: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["ai_order_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          unit_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          calculated_fees?: Json | null
          campaign_code?: string | null
          campaign_expiry?: string | null
          campaign_name?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          delivery_email?: string | null
          delivery_method?: string | null
          delivery_phone?: string | null
          escrow_released_at?: string | null
          escrow_status?: string | null
          event_name?: string | null
          fulfillment_status?:
            | Database["public"]["Enums"]["ai_fulfillment_status"]
            | null
          id?: string
          is_black_friday_promo?: boolean | null
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          pricing_config_id?: string | null
          product_id?: string
          quantity?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["ai_order_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_orders_pricing_config_id_fkey"
            columns: ["pricing_config_id"]
            isOneToOne: false
            referencedRelation: "ai_pricing_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ai_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_outcome_tracking: {
        Row: {
          action_type: string
          conversation_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          executed_at: string | null
          id: string
          message_id: string | null
          outcome_metadata: Json | null
          outcome_success: boolean | null
          suggested_action: string
          updated_at: string
          user_id: string
          was_executed: boolean | null
        }
        Insert: {
          action_type: string
          conversation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          executed_at?: string | null
          id?: string
          message_id?: string | null
          outcome_metadata?: Json | null
          outcome_success?: boolean | null
          suggested_action: string
          updated_at?: string
          user_id: string
          was_executed?: boolean | null
        }
        Update: {
          action_type?: string
          conversation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          executed_at?: string | null
          id?: string
          message_id?: string | null
          outcome_metadata?: Json | null
          outcome_success?: boolean | null
          suggested_action?: string
          updated_at?: string
          user_id?: string
          was_executed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_outcome_tracking_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_outcome_tracking_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_payout_requests: {
        Row: {
          amount: number
          bank_account_last4: string | null
          bank_routing_last4: string | null
          completed_at: string | null
          created_at: string | null
          gift_card_id: string | null
          id: string
          notes: string | null
          payout_method: Database["public"]["Enums"]["redemption_method"]
          paypal_email: string | null
          processed_at: string | null
          processor_reference: string | null
          processor_response: Json | null
          recipient_email: string | null
          recipient_name: string | null
          redemption_id: string | null
          shipping_address: Json | null
          status: string | null
          venmo_handle: string | null
        }
        Insert: {
          amount: number
          bank_account_last4?: string | null
          bank_routing_last4?: string | null
          completed_at?: string | null
          created_at?: string | null
          gift_card_id?: string | null
          id?: string
          notes?: string | null
          payout_method: Database["public"]["Enums"]["redemption_method"]
          paypal_email?: string | null
          processed_at?: string | null
          processor_reference?: string | null
          processor_response?: Json | null
          recipient_email?: string | null
          recipient_name?: string | null
          redemption_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          venmo_handle?: string | null
        }
        Update: {
          amount?: number
          bank_account_last4?: string | null
          bank_routing_last4?: string | null
          completed_at?: string | null
          created_at?: string | null
          gift_card_id?: string | null
          id?: string
          notes?: string | null
          payout_method?: Database["public"]["Enums"]["redemption_method"]
          paypal_email?: string | null
          processed_at?: string | null
          processor_reference?: string | null
          processor_response?: Json | null
          recipient_email?: string | null
          recipient_name?: string | null
          redemption_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          venmo_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_payout_requests_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "ai_gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_payout_requests_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "ai_redemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_pricing_config: {
        Row: {
          base_packaging_cost: number
          base_print_cost: number
          base_sms_cost: number
          base_stripe_fee_fixed: number
          base_stripe_fee_percent: number
          black_friday_discount_percent: number | null
          black_friday_end: string | null
          black_friday_start: string | null
          config_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          profit_margin_fixed: number
          profit_margin_percent: number
          updated_at: string | null
        }
        Insert: {
          base_packaging_cost?: number
          base_print_cost?: number
          base_sms_cost?: number
          base_stripe_fee_fixed?: number
          base_stripe_fee_percent?: number
          black_friday_discount_percent?: number | null
          black_friday_end?: string | null
          black_friday_start?: string | null
          config_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profit_margin_fixed?: number
          profit_margin_percent?: number
          updated_at?: string | null
        }
        Update: {
          base_packaging_cost?: number
          base_print_cost?: number
          base_sms_cost?: number
          base_stripe_fee_fixed?: number
          base_stripe_fee_percent?: number
          black_friday_discount_percent?: number | null
          black_friday_end?: string | null
          black_friday_start?: string | null
          config_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          profit_margin_fixed?: number
          profit_margin_percent?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_proactive_notifications: {
        Row: {
          acted_at: string | null
          acted_on: boolean | null
          action_payload: Json | null
          action_type: string | null
          created_at: string
          dismissed: boolean | null
          expires_at: string | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          acted_on?: boolean | null
          action_payload?: Json | null
          action_type?: string | null
          created_at?: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          acted_at?: string | null
          acted_on?: boolean | null
          action_payload?: Json | null
          action_type?: string | null
          created_at?: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_products: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          card_type: Database["public"]["Enums"]["ai_card_type"]
          created_at: string | null
          description: string | null
          face_value: number
          id: string
          is_featured: boolean | null
          max_order_quantity: number | null
          metadata: Json | null
          min_order_quantity: number | null
          name: string
          provider_id: string
          retail_price: number
          sku: string
          status: Database["public"]["Enums"]["ai_product_status"]
          stock_quantity: number | null
          updated_at: string | null
          valid_days: number | null
          wholesale_price: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          card_type?: Database["public"]["Enums"]["ai_card_type"]
          created_at?: string | null
          description?: string | null
          face_value: number
          id?: string
          is_featured?: boolean | null
          max_order_quantity?: number | null
          metadata?: Json | null
          min_order_quantity?: number | null
          name: string
          provider_id: string
          retail_price: number
          sku: string
          status?: Database["public"]["Enums"]["ai_product_status"]
          stock_quantity?: number | null
          updated_at?: string | null
          valid_days?: number | null
          wholesale_price: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          card_type?: Database["public"]["Enums"]["ai_card_type"]
          created_at?: string | null
          description?: string | null
          face_value?: number
          id?: string
          is_featured?: boolean | null
          max_order_quantity?: number | null
          metadata?: Json | null
          min_order_quantity?: number | null
          name?: string
          provider_id?: string
          retail_price?: number
          sku?: string
          status?: Database["public"]["Enums"]["ai_product_status"]
          stock_quantity?: number | null
          updated_at?: string | null
          valid_days?: number | null
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_applications: {
        Row: {
          admin_notes: string | null
          application_data: Json | null
          business_registration: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          id: string
          provider_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string | null
          tax_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          application_data?: Json | null
          business_registration?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          provider_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          tax_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          application_data?: Json | null
          business_registration?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_applications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          approved_at: string | null
          approved_by: string | null
          banner_url: string | null
          company_name: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          logo_url: string | null
          primary_color: string | null
          redemption_url: string | null
          rejection_reason: string | null
          sandbox_enabled: boolean | null
          status: Database["public"]["Enums"]["ai_provider_status"]
          terms_accepted_at: string | null
          updated_at: string | null
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
          website: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          approved_at?: string | null
          approved_by?: string | null
          banner_url?: string | null
          company_name: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          redemption_url?: string | null
          rejection_reason?: string | null
          sandbox_enabled?: boolean | null
          status?: Database["public"]["Enums"]["ai_provider_status"]
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
          website?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          approved_at?: string | null
          approved_by?: string | null
          banner_url?: string | null
          company_name?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          redemption_url?: string | null
          rejection_reason?: string | null
          sandbox_enabled?: boolean | null
          status?: Database["public"]["Enums"]["ai_provider_status"]
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      ai_receptionist_config: {
        Row: {
          config_text: string
          created_at: string | null
          id: string
          is_active: boolean | null
          parsed_rules: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config_text: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          parsed_rules?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config_text?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          parsed_rules?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_redemptions: {
        Row: {
          affiliate_commission_due: number | null
          affiliate_eligible: boolean | null
          amount_redeemed: number
          gift_card_id: string
          id: string
          metadata: Json | null
          notes: string | null
          payout_completed_at: string | null
          payout_reference: string | null
          payout_status: string | null
          provider_account_created: boolean | null
          provider_account_id: string | null
          provider_transaction_id: string | null
          recipient_payout_details: Json | null
          redeemed_at: string | null
          redeemed_by_user_id: string | null
          redeemed_email: string | null
          redemption_device: string | null
          redemption_ip: string | null
          redemption_method:
            | Database["public"]["Enums"]["redemption_method"]
            | null
        }
        Insert: {
          affiliate_commission_due?: number | null
          affiliate_eligible?: boolean | null
          amount_redeemed: number
          gift_card_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          payout_completed_at?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          provider_account_created?: boolean | null
          provider_account_id?: string | null
          provider_transaction_id?: string | null
          recipient_payout_details?: Json | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          redeemed_email?: string | null
          redemption_device?: string | null
          redemption_ip?: string | null
          redemption_method?:
            | Database["public"]["Enums"]["redemption_method"]
            | null
        }
        Update: {
          affiliate_commission_due?: number | null
          affiliate_eligible?: boolean | null
          amount_redeemed?: number
          gift_card_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          payout_completed_at?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          provider_account_created?: boolean | null
          provider_account_id?: string | null
          provider_transaction_id?: string | null
          recipient_payout_details?: Json | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          redeemed_email?: string | null
          redemption_device?: string | null
          redemption_ip?: string | null
          redemption_method?:
            | Database["public"]["Enums"]["redemption_method"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_redemptions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "ai_gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_risk_register: {
        Row: {
          created_at: string | null
          id: string
          impact_score: number | null
          likelihood_score: number | null
          mitigation_status: string | null
          mitigation_strategy: string | null
          related_agent_id: string | null
          risk_category: string
          risk_description: string
          risk_id: string
          risk_owner_id: string | null
          risk_score: number | null
          risk_title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          mitigation_status?: string | null
          mitigation_strategy?: string | null
          related_agent_id?: string | null
          risk_category: string
          risk_description: string
          risk_id: string
          risk_owner_id?: string | null
          risk_score?: number | null
          risk_title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          mitigation_status?: string | null
          mitigation_strategy?: string | null
          related_agent_id?: string | null
          risk_category?: string
          risk_description?: string
          risk_id?: string
          risk_owner_id?: string | null
          risk_score?: number | null
          risk_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_security_events: {
        Row: {
          created_at: string | null
          event_action: string
          event_data: Json | null
          event_outcome: string
          event_source: string
          event_type: string
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          risk_score: number | null
          session_id: string | null
          severity: string | null
          threat_indicators: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_action: string
          event_data?: Json | null
          event_outcome: string
          event_source: string
          event_type: string
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          risk_score?: number | null
          session_id?: string | null
          severity?: string | null
          threat_indicators?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_action?: string
          event_data?: Json | null
          event_outcome?: string
          event_source?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          risk_score?: number | null
          session_id?: string | null
          severity?: string | null
          threat_indicators?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_success_patterns: {
        Row: {
          active: boolean | null
          adoption_success_rate: number | null
          applicable_contexts: string[] | null
          created_at: string
          id: string
          pattern_description: string | null
          pattern_name: string
          pattern_rules: Json
          pattern_type: string
          source_user_count: number | null
          success_rate: number | null
          times_adopted: number | null
          times_suggested: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          adoption_success_rate?: number | null
          applicable_contexts?: string[] | null
          created_at?: string
          id?: string
          pattern_description?: string | null
          pattern_name: string
          pattern_rules: Json
          pattern_type: string
          source_user_count?: number | null
          success_rate?: number | null
          times_adopted?: number | null
          times_suggested?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          adoption_success_rate?: number | null
          applicable_contexts?: string[] | null
          created_at?: string
          id?: string
          pattern_description?: string | null
          pattern_name?: string
          pattern_rules?: Json
          pattern_type?: string
          source_user_count?: number | null
          success_rate?: number | null
          times_adopted?: number | null
          times_suggested?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_system_improvements: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          category: string
          confidence_score: number | null
          created_at: string
          effectiveness_score: number | null
          id: string
          improvement_type: string
          insight: string
          metadata: Json | null
          source_conversations: string[] | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          category: string
          confidence_score?: number | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          improvement_type: string
          insight: string
          metadata?: Json | null
          source_conversations?: string[] | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          category?: string
          confidence_score?: number | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          improvement_type?: string
          insight?: string
          metadata?: Json | null
          source_conversations?: string[] | null
        }
        Relationships: []
      }
      ai_threat_intelligence: {
        Row: {
          active: boolean | null
          created_at: string | null
          detection_pattern: Json | null
          id: string
          ioc_indicators: Json | null
          last_seen_at: string | null
          mitigation_actions: string[] | null
          occurrence_count: number | null
          severity: string | null
          threat_description: string
          threat_name: string
          threat_type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          detection_pattern?: Json | null
          id?: string
          ioc_indicators?: Json | null
          last_seen_at?: string | null
          mitigation_actions?: string[] | null
          occurrence_count?: number | null
          severity?: string | null
          threat_description: string
          threat_name: string
          threat_type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          detection_pattern?: Json | null
          id?: string
          ioc_indicators?: Json | null
          last_seen_at?: string | null
          mitigation_actions?: string[] | null
          occurrence_count?: number | null
          severity?: string | null
          threat_description?: string
          threat_name?: string
          threat_type?: string
        }
        Relationships: []
      }
      ai_user_preferences: {
        Row: {
          auto_execute_tools: boolean | null
          communication_style: string | null
          created_at: string
          favorite_modules: string[] | null
          id: string
          interaction_count: number | null
          learned_shortcuts: Json | null
          preferred_agent: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_execute_tools?: boolean | null
          communication_style?: string | null
          created_at?: string
          favorite_modules?: string[] | null
          id?: string
          interaction_count?: number | null
          learned_shortcuts?: Json | null
          preferred_agent?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_execute_tools?: boolean | null
          communication_style?: string | null
          created_at?: string
          favorite_modules?: string[] | null
          id?: string
          interaction_count?: number | null
          learned_shortcuts?: Json | null
          preferred_agent?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_webhooks: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          provider_id: string
          response_body: string | null
          response_status: number | null
          retry_count: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          provider_id: string
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          provider_id?: string
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_webhooks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      app_analytics: {
        Row: {
          app_id: string
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_analytics_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      app_licenses: {
        Row: {
          app_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          license_type: string
          metadata: Json | null
          purchased_at: string | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          license_type: string
          metadata?: Json | null
          purchased_at?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          license_type?: string
          metadata?: Json | null
          purchased_at?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_licenses_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      app_registry: {
        Row: {
          affiliate_commission_tier1: number | null
          affiliate_commission_tier2: number | null
          app_name: string
          app_slug: string
          banner_url: string | null
          base_price: number | null
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          is_white_label_ready: boolean | null
          metadata: Json | null
          stripe_price_id: string | null
          stripe_white_label_price_id: string | null
          updated_at: string | null
          version: string | null
          white_label_price: number | null
        }
        Insert: {
          affiliate_commission_tier1?: number | null
          affiliate_commission_tier2?: number | null
          app_name: string
          app_slug: string
          banner_url?: string | null
          base_price?: number | null
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          is_white_label_ready?: boolean | null
          metadata?: Json | null
          stripe_price_id?: string | null
          stripe_white_label_price_id?: string | null
          updated_at?: string | null
          version?: string | null
          white_label_price?: number | null
        }
        Update: {
          affiliate_commission_tier1?: number | null
          affiliate_commission_tier2?: number | null
          app_name?: string
          app_slug?: string
          banner_url?: string | null
          base_price?: number | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          is_white_label_ready?: boolean | null
          metadata?: Json | null
          stripe_price_id?: string | null
          stripe_white_label_price_id?: string | null
          updated_at?: string | null
          version?: string | null
          white_label_price?: number | null
        }
        Relationships: []
      }
      archive_audit_events: {
        Row: {
          action: string
          actor_user_id: string
          id: string
          import_id: string | null
          metadata_json: Json
          object_id: string
          object_type: string
          occurred_at: string
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          id?: string
          import_id?: string | null
          metadata_json?: Json
          object_id: string
          object_type: string
          occurred_at?: string
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          id?: string
          import_id?: string | null
          metadata_json?: Json
          object_id?: string
          object_type?: string
          occurred_at?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_audit_events_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_business_aliases: {
        Row: {
          alias: string
          alias_type: string
          business_id: string
          created_at: string
          created_from_import_id: string | null
          id: string
        }
        Insert: {
          alias: string
          alias_type: string
          business_id: string
          created_at?: string
          created_from_import_id?: string | null
          id?: string
        }
        Update: {
          alias?: string
          alias_type?: string
          business_id?: string
          created_at?: string
          created_from_import_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_business_aliases_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "archive_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_business_aliases_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_business_mentions: {
        Row: {
          chunk_id: string
          confidence: number
          created_at: string
          detected_domain: string | null
          detected_name: string
          id: string
          import_id: string
          resolution_method: string | null
          resolved_business_id: string | null
        }
        Insert: {
          chunk_id: string
          confidence: number
          created_at?: string
          detected_domain?: string | null
          detected_name: string
          id?: string
          import_id: string
          resolution_method?: string | null
          resolved_business_id?: string | null
        }
        Update: {
          chunk_id?: string
          confidence?: number
          created_at?: string
          detected_domain?: string | null
          detected_name?: string
          id?: string
          import_id?: string
          resolution_method?: string | null
          resolved_business_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_business_mentions_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "archive_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_business_mentions_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_business_mentions_resolved_business_id_fkey"
            columns: ["resolved_business_id"]
            isOneToOne: false
            referencedRelation: "archive_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_businesses: {
        Row: {
          confidence: number | null
          created_at: string
          created_from_import_id: string | null
          description: string | null
          first_seen_at: string | null
          id: string
          name: string
          normalized_name: string
          organization_id: string | null
          owner_user_id: string
          primary_domain: string | null
          provenance_json: Json
          status: string
          tags: string[] | null
          updated_at: string
          vertical: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          created_from_import_id?: string | null
          description?: string | null
          first_seen_at?: string | null
          id?: string
          name: string
          normalized_name: string
          organization_id?: string | null
          owner_user_id: string
          primary_domain?: string | null
          provenance_json?: Json
          status?: string
          tags?: string[] | null
          updated_at?: string
          vertical?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          created_from_import_id?: string | null
          description?: string | null
          first_seen_at?: string | null
          id?: string
          name?: string
          normalized_name?: string
          organization_id?: string | null
          owner_user_id?: string
          primary_domain?: string | null
          provenance_json?: Json
          status?: string
          tags?: string[] | null
          updated_at?: string
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_businesses_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_chunks: {
        Row: {
          chunk_hash: string
          chunk_summary: string | null
          chunk_text: string
          conversation_id: string
          created_at: string
          embedding_id: string | null
          end_message_id: string
          id: string
          import_id: string
          occurred_end_at: string
          occurred_start_at: string
          start_message_id: string
          token_estimate: number
        }
        Insert: {
          chunk_hash: string
          chunk_summary?: string | null
          chunk_text: string
          conversation_id: string
          created_at?: string
          embedding_id?: string | null
          end_message_id: string
          id?: string
          import_id: string
          occurred_end_at: string
          occurred_start_at: string
          start_message_id: string
          token_estimate: number
        }
        Update: {
          chunk_hash?: string
          chunk_summary?: string | null
          chunk_text?: string
          conversation_id?: string
          created_at?: string
          embedding_id?: string | null
          end_message_id?: string
          id?: string
          import_id?: string
          occurred_end_at?: string
          occurred_start_at?: string
          start_message_id?: string
          token_estimate?: number
        }
        Relationships: [
          {
            foreignKeyName: "archive_chunks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "archive_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_chunks_end_message_id_fkey"
            columns: ["end_message_id"]
            isOneToOne: false
            referencedRelation: "archive_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_chunks_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_chunks_start_message_id_fkey"
            columns: ["start_message_id"]
            isOneToOne: false
            referencedRelation: "archive_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_companies: {
        Row: {
          confidence: number | null
          created_at: string
          created_from_import_id: string | null
          domain: string | null
          id: string
          industry: string | null
          name: string
          normalized_name: string
          organization_id: string | null
          owner_user_id: string
          provenance_json: Json
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          created_from_import_id?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          name: string
          normalized_name: string
          organization_id?: string | null
          owner_user_id: string
          provenance_json?: Json
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          created_from_import_id?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          name?: string
          normalized_name?: string
          organization_id?: string | null
          owner_user_id?: string
          provenance_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_companies_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_contacts: {
        Row: {
          company_id: string | null
          confidence: number
          created_at: string
          created_from_import_id: string | null
          email: string | null
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          organization_id: string | null
          owner_user_id: string
          phone: string | null
          provenance_json: Json
          relationship_type: string
          role_title: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          confidence?: number
          created_at?: string
          created_from_import_id?: string | null
          email?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          last_name?: string | null
          organization_id?: string | null
          owner_user_id: string
          phone?: string | null
          provenance_json?: Json
          relationship_type?: string
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          confidence?: number
          created_at?: string
          created_from_import_id?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          organization_id?: string | null
          owner_user_id?: string
          phone?: string | null
          provenance_json?: Json
          relationship_type?: string
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "archive_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_contacts_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          external_conversation_key: string
          id: string
          import_id: string
          started_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          external_conversation_key: string
          id?: string
          import_id: string
          started_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          external_conversation_key?: string
          id?: string
          import_id?: string
          started_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_conversations_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_embeddings: {
        Row: {
          created_at: string
          id: string
          model: string
          object_id: string
          object_type: string
          organization_id: string | null
          owner_user_id: string
          vector: string
        }
        Insert: {
          created_at?: string
          id?: string
          model: string
          object_id: string
          object_type: string
          organization_id?: string | null
          owner_user_id: string
          vector: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string
          object_id?: string
          object_type?: string
          organization_id?: string | null
          owner_user_id?: string
          vector?: string
        }
        Relationships: []
      }
      archive_import_files: {
        Row: {
          created_at: string
          file_type: string
          id: string
          import_id: string
          metadata_json: Json
          source_message_id: string | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_type: string
          id?: string
          import_id: string
          metadata_json?: Json
          source_message_id?: string | null
          storage_path: string
        }
        Update: {
          created_at?: string
          file_type?: string
          id?: string
          import_id?: string
          metadata_json?: Json
          source_message_id?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_import_files_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_imports: {
        Row: {
          created_at: string
          error: string | null
          id: string
          organization_id: string | null
          owner_user_id: string
          permission_scope: string
          stats_json: Json
          status: string
          storage_zip_path: string
          target_business_id: string | null
          target_workspace_type: string
          updated_at: string
          zip_sha256: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          organization_id?: string | null
          owner_user_id: string
          permission_scope?: string
          stats_json?: Json
          status?: string
          storage_zip_path: string
          target_business_id?: string | null
          target_workspace_type: string
          updated_at?: string
          zip_sha256: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          organization_id?: string | null
          owner_user_id?: string
          permission_scope?: string
          stats_json?: Json
          status?: string
          storage_zip_path?: string
          target_business_id?: string | null
          target_workspace_type?: string
          updated_at?: string
          zip_sha256?: string
        }
        Relationships: []
      }
      archive_interaction_events: {
        Row: {
          chunk_id: string | null
          company_id: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          event_type: string
          id: string
          import_id: string | null
          notes: string | null
          occurred_at: string
          sentiment: number | null
        }
        Insert: {
          chunk_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          import_id?: string | null
          notes?: string | null
          occurred_at: string
          sentiment?: number | null
        }
        Update: {
          chunk_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          import_id?: string | null
          notes?: string | null
          occurred_at?: string
          sentiment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_interaction_events_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "archive_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_interaction_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "archive_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_interaction_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "archive_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_interaction_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "archive_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_interaction_events_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_message_attachments: {
        Row: {
          attachment_kind: string
          created_at: string
          id: string
          import_file_id: string
          message_id: string
        }
        Insert: {
          attachment_kind: string
          created_at?: string
          id?: string
          import_file_id: string
          message_id: string
        }
        Update: {
          attachment_kind?: string
          created_at?: string
          id?: string
          import_file_id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_message_attachments_import_file_id_fkey"
            columns: ["import_file_id"]
            isOneToOne: false
            referencedRelation: "archive_import_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "archive_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_messages: {
        Row: {
          content_text: string | null
          content_type: string
          conversation_id: string
          created_at: string
          external_message_key: string
          id: string
          metadata_json: Json
          occurred_at: string
          role: string
          sequence_index: number
        }
        Insert: {
          content_text?: string | null
          content_type: string
          conversation_id: string
          created_at?: string
          external_message_key: string
          id?: string
          metadata_json?: Json
          occurred_at: string
          role: string
          sequence_index: number
        }
        Update: {
          content_text?: string | null
          content_type?: string
          conversation_id?: string
          created_at?: string
          external_message_key?: string
          id?: string
          metadata_json?: Json
          occurred_at?: string
          role?: string
          sequence_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "archive_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "archive_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_relationship_edges: {
        Row: {
          created_at: string
          created_from_import_id: string | null
          edge_type: string
          first_seen_at: string
          from_contact_id: string | null
          id: string
          last_seen_at: string
          linked_business_id: string | null
          organization_id: string | null
          owner_user_id: string
          provenance_json: Json
          strength: number
          to_company_id: string | null
          to_contact_id: string | null
        }
        Insert: {
          created_at?: string
          created_from_import_id?: string | null
          edge_type: string
          first_seen_at: string
          from_contact_id?: string | null
          id?: string
          last_seen_at: string
          linked_business_id?: string | null
          organization_id?: string | null
          owner_user_id: string
          provenance_json?: Json
          strength?: number
          to_company_id?: string | null
          to_contact_id?: string | null
        }
        Update: {
          created_at?: string
          created_from_import_id?: string | null
          edge_type?: string
          first_seen_at?: string
          from_contact_id?: string | null
          id?: string
          last_seen_at?: string
          linked_business_id?: string | null
          organization_id?: string | null
          owner_user_id?: string
          provenance_json?: Json
          strength?: number
          to_company_id?: string | null
          to_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_relationship_edges_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_relationship_edges_from_contact_id_fkey"
            columns: ["from_contact_id"]
            isOneToOne: false
            referencedRelation: "archive_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_relationship_edges_linked_business_id_fkey"
            columns: ["linked_business_id"]
            isOneToOne: false
            referencedRelation: "archive_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_relationship_edges_to_company_id_fkey"
            columns: ["to_company_id"]
            isOneToOne: false
            referencedRelation: "archive_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_relationship_edges_to_contact_id_fkey"
            columns: ["to_contact_id"]
            isOneToOne: false
            referencedRelation: "archive_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_relationship_scores: {
        Row: {
          components_json: Json
          computed_at: string
          contact_id: string
          created_at: string
          id: string
          organization_id: string | null
          owner_user_id: string
          score: number
        }
        Insert: {
          components_json: Json
          computed_at: string
          contact_id: string
          created_at?: string
          id?: string
          organization_id?: string | null
          owner_user_id: string
          score: number
        }
        Update: {
          components_json?: Json
          computed_at?: string
          contact_id?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          owner_user_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "archive_relationship_scores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "archive_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_review_queue: {
        Row: {
          assigned_to_user_id: string | null
          confidence: number
          created_at: string
          decided_at: string | null
          decision_notes: string | null
          evidence_chunk_ids: string[]
          id: string
          import_id: string
          item_type: string
          payload_json: Json
          status: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          confidence: number
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          evidence_chunk_ids?: string[]
          id?: string
          import_id: string
          item_type: string
          payload_json: Json
          status?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          confidence?: number
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          evidence_chunk_ids?: string[]
          id?: string
          import_id?: string
          item_type?: string
          payload_json?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_review_queue_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_roles: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
        }
        Relationships: []
      }
      archive_strategies: {
        Row: {
          confidence: number
          created_at: string
          created_from_import_id: string | null
          embedding_id: string | null
          id: string
          inputs_required: Json | null
          organization_id: string | null
          outputs_produced: Json | null
          owner_user_id: string
          playbook_steps: Json | null
          provenance_json: Json
          stage: string
          strategy_type: string
          summary: string
          templates: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          created_from_import_id?: string | null
          embedding_id?: string | null
          id?: string
          inputs_required?: Json | null
          organization_id?: string | null
          outputs_produced?: Json | null
          owner_user_id: string
          playbook_steps?: Json | null
          provenance_json?: Json
          stage?: string
          strategy_type: string
          summary: string
          templates?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          created_from_import_id?: string | null
          embedding_id?: string | null
          id?: string
          inputs_required?: Json | null
          organization_id?: string | null
          outputs_produced?: Json | null
          owner_user_id?: string
          playbook_steps?: Json | null
          provenance_json?: Json
          stage?: string
          strategy_type?: string
          summary?: string
          templates?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_strategies_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_strategy_links: {
        Row: {
          created_at: string
          created_from_import_id: string | null
          id: string
          linked_object_id: string
          linked_object_type: string
          strategy_id: string
          strength: number
        }
        Insert: {
          created_at?: string
          created_from_import_id?: string | null
          id?: string
          linked_object_id: string
          linked_object_type: string
          strategy_id: string
          strength?: number
        }
        Update: {
          created_at?: string
          created_from_import_id?: string | null
          id?: string
          linked_object_id?: string
          linked_object_type?: string
          strategy_id?: string
          strength?: number
        }
        Relationships: [
          {
            foreignKeyName: "archive_strategy_links_created_from_import_id_fkey"
            columns: ["created_from_import_id"]
            isOneToOne: false
            referencedRelation: "archive_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_strategy_links_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "archive_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role_name?: string
          user_id?: string
        }
        Relationships: []
      }
      archive_workspace_permissions: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          permission: string
          scope_id: string | null
          scope_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          permission: string
          scope_id?: string | null
          scope_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          permission?: string
          scope_id?: string | null
          scope_type?: string
          user_id?: string
        }
        Relationships: []
      }
      assemblies: {
        Row: {
          asset_type:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          created_at: string
          description: string | null
          id: string
          is_template: boolean | null
          name: string
          rules_json: Json
          system_type: string | null
          updated_at: string
          waste_defaults_json: Json | null
        }
        Insert: {
          asset_type?:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          created_at?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          rules_json: Json
          system_type?: string | null
          updated_at?: string
          waste_defaults_json?: Json | null
        }
        Update: {
          asset_type?:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          created_at?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          rules_json?: Json
          system_type?: string | null
          updated_at?: string
          waste_defaults_json?: Json | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string
          deleted_at: string | null
          firmware: string | null
          grid_node_id: string | null
          id: string
          location_geo: Json | null
          make: string | null
          mode: Database["public"]["Enums"]["operating_mode"]
          model: string | null
          nameplate_kvar: number | null
          nameplate_kw: number | null
          owner_tenant_id: string
          serial: string | null
          status: Database["public"]["Enums"]["asset_status"]
          updated_at: string
          voltage_class: string | null
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          deleted_at?: string | null
          firmware?: string | null
          grid_node_id?: string | null
          id?: string
          location_geo?: Json | null
          make?: string | null
          mode?: Database["public"]["Enums"]["operating_mode"]
          model?: string | null
          nameplate_kvar?: number | null
          nameplate_kw?: number | null
          owner_tenant_id: string
          serial?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
          voltage_class?: string | null
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          deleted_at?: string | null
          firmware?: string | null
          grid_node_id?: string | null
          id?: string
          location_geo?: Json | null
          make?: string | null
          mode?: Database["public"]["Enums"]["operating_mode"]
          model?: string | null
          nameplate_kvar?: number | null
          nameplate_kw?: number | null
          owner_tenant_id?: string
          serial?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
          voltage_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_grid_node_id_fkey"
            columns: ["grid_node_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      attribution_rules: {
        Row: {
          active: boolean
          classification: Database["public"]["Enums"]["contribution_classification"]
          compensation_type: Database["public"]["Enums"]["compensation_type"]
          created_at: string
          deal_room_id: string
          decay_rate: number | null
          fixed_amount: number | null
          id: string
          is_residual: boolean
          max_cap: number | null
          min_threshold: number | null
          participant_id: string
          per_usage_rate: number | null
          percentage: number | null
          priority: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          classification: Database["public"]["Enums"]["contribution_classification"]
          compensation_type: Database["public"]["Enums"]["compensation_type"]
          created_at?: string
          deal_room_id: string
          decay_rate?: number | null
          fixed_amount?: number | null
          id?: string
          is_residual?: boolean
          max_cap?: number | null
          min_threshold?: number | null
          participant_id: string
          per_usage_rate?: number | null
          percentage?: number | null
          priority?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          classification?: Database["public"]["Enums"]["contribution_classification"]
          compensation_type?: Database["public"]["Enums"]["compensation_type"]
          created_at?: string
          deal_room_id?: string
          decay_rate?: number | null
          fixed_amount?: number | null
          id?: string
          is_residual?: boolean
          max_cap?: number | null
          min_threshold?: number | null
          participant_id?: string
          per_usage_rate?: number | null
          percentage?: number | null
          priority?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attribution_rules_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_rules_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          diff_json: Json | null
          id: string
          record_id: string | null
          signature: string | null
          table_name: string
          ts: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          diff_json?: Json | null
          id?: string
          record_id?: string | null
          signature?: string | null
          table_name: string
          ts?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          diff_json?: Json | null
          id?: string
          record_id?: string | null
          signature?: string | null
          table_name?: string
          ts?: string
        }
        Relationships: []
      }
      bd_achievements: {
        Row: {
          achievement_type: string
          company_id: string | null
          created_at: string
          description: string | null
          execution_speed: number | null
          id: string
          metrics: Json | null
          risk_tolerance: number | null
          source_entity_id: string | null
          source_entity_type: string | null
          title: string
          updated_at: string
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          visibility: string | null
        }
        Insert: {
          achievement_type?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          execution_speed?: number | null
          id?: string
          metrics?: Json | null
          risk_tolerance?: number | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          title: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string | null
        }
        Update: {
          achievement_type?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          execution_speed?: number | null
          id?: string
          metrics?: Json | null
          risk_tolerance?: number | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_achievements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_line_items: {
        Row: {
          cost_item_id: string | null
          cost_type: Database["public"]["Enums"]["cost_type"]
          created_at: string
          csi_division: string | null
          description: string
          extended_price: number
          id: string
          metadata: Json | null
          notes: string | null
          quantity: number
          sort_order: number | null
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_price: number
          worksheet_id: string
        }
        Insert: {
          cost_item_id?: string | null
          cost_type: Database["public"]["Enums"]["cost_type"]
          created_at?: string
          csi_division?: string | null
          description: string
          extended_price: number
          id?: string
          metadata?: Json | null
          notes?: string | null
          quantity: number
          sort_order?: number | null
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_price: number
          worksheet_id: string
        }
        Update: {
          cost_item_id?: string | null
          cost_type?: Database["public"]["Enums"]["cost_type"]
          created_at?: string
          csi_division?: string | null
          description?: string
          extended_price?: number
          id?: string
          metadata?: Json | null
          notes?: string | null
          quantity?: number
          sort_order?: number | null
          unit?: Database["public"]["Enums"]["takeoff_unit"]
          unit_price?: number
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_line_items_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_line_items_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "estimate_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_sources: {
        Row: {
          bc_project_id: string | null
          created_at: string
          email_thread_id: string | null
          id: string
          project_id: string
          raw_data: Json | null
          source_reference: string | null
          source_type: Database["public"]["Enums"]["bid_source_type"]
        }
        Insert: {
          bc_project_id?: string | null
          created_at?: string
          email_thread_id?: string | null
          id?: string
          project_id: string
          raw_data?: Json | null
          source_reference?: string | null
          source_type: Database["public"]["Enums"]["bid_source_type"]
        }
        Update: {
          bc_project_id?: string | null
          created_at?: string
          email_thread_id?: string | null
          id?: string
          project_id?: string
          raw_data?: Json | null
          source_reference?: string | null
          source_type?: Database["public"]["Enums"]["bid_source_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bid_sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_team_members: {
        Row: {
          created_at: string
          id: string
          permissions: string[] | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_analyses: {
        Row: {
          analysis_result: Json
          analysis_type: string
          bill_id: string
          confidence_score: number | null
          cost_estimate: number | null
          created_at: string
          id: string
          model_used: string
          processing_time_ms: number | null
          tokens_used: number | null
        }
        Insert: {
          analysis_result: Json
          analysis_type: string
          bill_id: string
          confidence_score?: number | null
          cost_estimate?: number | null
          created_at?: string
          id?: string
          model_used: string
          processing_time_ms?: number | null
          tokens_used?: number | null
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          bill_id?: string
          confidence_score?: number | null
          cost_estimate?: number | null
          created_at?: string
          id?: string
          model_used?: string
          processing_time_ms?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_analyses_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "company_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_model_comparisons: {
        Row: {
          best_model: string | null
          bill_id: string
          comparison_result: Json
          created_at: string
          id: string
          models_used: string[]
        }
        Insert: {
          best_model?: string | null
          bill_id: string
          comparison_result: Json
          created_at?: string
          id?: string
          models_used: string[]
        }
        Update: {
          best_model?: string | null
          bill_id?: string
          comparison_result?: Json
          created_at?: string
          id?: string
          models_used?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "bill_model_comparisons_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "company_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_recommendations: {
        Row: {
          action_steps: Json | null
          bill_id: string | null
          confidence_score: number | null
          created_at: string
          current_cost: number | null
          id: string
          potential_savings: number | null
          projected_cost: number | null
          reasoning: string | null
          recommendation_type: string
          service_offering_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_steps?: Json | null
          bill_id?: string | null
          confidence_score?: number | null
          created_at?: string
          current_cost?: number | null
          id?: string
          potential_savings?: number | null
          projected_cost?: number | null
          reasoning?: string | null
          recommendation_type: string
          service_offering_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_steps?: Json | null
          bill_id?: string | null
          confidence_score?: number | null
          created_at?: string
          current_cost?: number | null
          id?: string
          potential_savings?: number | null
          projected_cost?: number | null
          reasoning?: string | null
          recommendation_type?: string
          service_offering_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_recommendations_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "company_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_recommendations_service_offering_id_fkey"
            columns: ["service_offering_id"]
            isOneToOne: false
            referencedRelation: "service_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      biz_company: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          parent_group: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          parent_group?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          parent_group?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blender_attribution_rules: {
        Row: {
          created_at: string
          credit_type: string
          deal_room_id: string
          id: string
          is_active: boolean | null
          max_payout: number | null
          min_payout: number | null
          participant_id: string
          payout_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_type?: string
          deal_room_id: string
          id?: string
          is_active?: boolean | null
          max_payout?: number | null
          min_payout?: number | null
          participant_id: string
          payout_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_type?: string
          deal_room_id?: string
          id?: string
          is_active?: boolean | null
          max_payout?: number | null
          min_payout?: number | null
          participant_id?: string
          payout_percentage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blender_attribution_rules_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blender_attribution_rules_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      blender_formulations: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          created_by: string | null
          deal_room_id: string | null
          description: string | null
          embedded_since: string | null
          formulation_status: string | null
          id: string
          is_active: boolean | null
          is_embedded: boolean
          name: string
          ownership_type: string
          scope: Database["public"]["Enums"]["formulation_scope"]
          total_weight_percent: number | null
          updated_at: string
          version: number | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by?: string | null
          deal_room_id?: string | null
          description?: string | null
          embedded_since?: string | null
          formulation_status?: string | null
          id?: string
          is_active?: boolean | null
          is_embedded?: boolean
          name: string
          ownership_type?: string
          scope?: Database["public"]["Enums"]["formulation_scope"]
          total_weight_percent?: number | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          created_by?: string | null
          deal_room_id?: string | null
          description?: string | null
          embedded_since?: string | null
          formulation_status?: string | null
          id?: string
          is_active?: boolean | null
          is_embedded?: boolean
          name?: string
          ownership_type?: string
          scope?: Database["public"]["Enums"]["formulation_scope"]
          total_weight_percent?: number | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blender_formulations_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      blender_ingredients: {
        Row: {
          contribution_weight: number | null
          created_at: string
          credit_multiplier: number | null
          deal_room_id: string | null
          description: string | null
          id: string
          ingredient_type: Database["public"]["Enums"]["ingredient_type"]
          ip_classification: string | null
          is_active: boolean | null
          is_pre_existing: boolean
          license_terms: Json | null
          metadata: Json | null
          name: string
          owner_company_id: string | null
          owner_id: string | null
          ownership_status: string
          updated_at: string
          value_category: string | null
        }
        Insert: {
          contribution_weight?: number | null
          created_at?: string
          credit_multiplier?: number | null
          deal_room_id?: string | null
          description?: string | null
          id?: string
          ingredient_type: Database["public"]["Enums"]["ingredient_type"]
          ip_classification?: string | null
          is_active?: boolean | null
          is_pre_existing?: boolean
          license_terms?: Json | null
          metadata?: Json | null
          name: string
          owner_company_id?: string | null
          owner_id?: string | null
          ownership_status?: string
          updated_at?: string
          value_category?: string | null
        }
        Update: {
          contribution_weight?: number | null
          created_at?: string
          credit_multiplier?: number | null
          deal_room_id?: string | null
          description?: string | null
          id?: string
          ingredient_type?: Database["public"]["Enums"]["ingredient_type"]
          ip_classification?: string | null
          is_active?: boolean | null
          is_pre_existing?: boolean
          license_terms?: Json | null
          metadata?: Json | null
          name?: string
          owner_company_id?: string | null
          owner_id?: string | null
          ownership_status?: string
          updated_at?: string
          value_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blender_ingredients_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blender_ingredients_owner_company_id_fkey"
            columns: ["owner_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      blender_knowledge_base: {
        Row: {
          category: string
          concept_key: string
          created_at: string
          display_order: number | null
          examples: Json | null
          icon_name: string | null
          id: string
          plain_english_explanation: string
          related_concepts: string[] | null
          technical_explanation: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          concept_key: string
          created_at?: string
          display_order?: number | null
          examples?: Json | null
          icon_name?: string | null
          id?: string
          plain_english_explanation: string
          related_concepts?: string[] | null
          technical_explanation?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          concept_key?: string
          created_at?: string
          display_order?: number | null
          examples?: Json | null
          icon_name?: string | null
          id?: string
          plain_english_explanation?: string
          related_concepts?: string[] | null
          technical_explanation?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blender_payout_calculations: {
        Row: {
          action_credits_in: number | null
          approved_at: string | null
          approved_by: string | null
          attribution_percentage: number | null
          calculated_payout: number | null
          calculation_date: string | null
          compute_credits_in: number | null
          created_at: string | null
          deal_room_id: string | null
          formulation_id: string | null
          id: string
          max_payout_applied: boolean | null
          min_payout_applied: boolean | null
          outcome_credits_in: number | null
          paid_at: string | null
          participant_id: string | null
          payment_reference: string | null
          status: string | null
          total_credits_in: number | null
        }
        Insert: {
          action_credits_in?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attribution_percentage?: number | null
          calculated_payout?: number | null
          calculation_date?: string | null
          compute_credits_in?: number | null
          created_at?: string | null
          deal_room_id?: string | null
          formulation_id?: string | null
          id?: string
          max_payout_applied?: boolean | null
          min_payout_applied?: boolean | null
          outcome_credits_in?: number | null
          paid_at?: string | null
          participant_id?: string | null
          payment_reference?: string | null
          status?: string | null
          total_credits_in?: number | null
        }
        Update: {
          action_credits_in?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attribution_percentage?: number | null
          calculated_payout?: number | null
          calculation_date?: string | null
          compute_credits_in?: number | null
          created_at?: string | null
          deal_room_id?: string | null
          formulation_id?: string | null
          id?: string
          max_payout_applied?: boolean | null
          min_payout_applied?: boolean | null
          outcome_credits_in?: number | null
          paid_at?: string | null
          participant_id?: string | null
          payment_reference?: string | null
          status?: string | null
          total_credits_in?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blender_payout_calculations_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blender_payout_calculations_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "blender_formulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blender_payout_calculations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      blender_usage_logs: {
        Row: {
          cost_incurred: number | null
          created_at: string
          id: string
          ingredient_id: string
          metadata: Json | null
          quantity: number
          recorded_at: string
          unit: string
          usage_type: string
        }
        Insert: {
          cost_incurred?: number | null
          created_at?: string
          id?: string
          ingredient_id: string
          metadata?: Json | null
          quantity?: number
          recorded_at?: string
          unit?: string
          usage_type?: string
        }
        Update: {
          cost_incurred?: number | null
          created_at?: string
          id?: string
          ingredient_id?: string
          metadata?: Json | null
          quantity?: number
          recorded_at?: string
          unit?: string
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "blender_usage_logs_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "blender_ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_marketing_config: {
        Row: {
          automation_enabled: boolean | null
          automation_schedule: string | null
          brand_voice: string | null
          content_themes: string[] | null
          content_types_enabled: string[] | null
          created_at: string
          franchise_id: string | null
          id: string
          last_content_generated_at: string | null
          logo_url: string | null
          notification_email: string | null
          notification_webhook_url: string | null
          physical_stations: string[] | null
          primary_color: string | null
          secondary_color: string | null
          signal_boost_enabled: boolean | null
          signal_boost_threshold: number | null
          social_platforms: string[] | null
          target_audiences: string[] | null
          updated_at: string
          upn_broadcast_enabled: boolean | null
          user_id: string
        }
        Insert: {
          automation_enabled?: boolean | null
          automation_schedule?: string | null
          brand_voice?: string | null
          content_themes?: string[] | null
          content_types_enabled?: string[] | null
          created_at?: string
          franchise_id?: string | null
          id?: string
          last_content_generated_at?: string | null
          logo_url?: string | null
          notification_email?: string | null
          notification_webhook_url?: string | null
          physical_stations?: string[] | null
          primary_color?: string | null
          secondary_color?: string | null
          signal_boost_enabled?: boolean | null
          signal_boost_threshold?: number | null
          social_platforms?: string[] | null
          target_audiences?: string[] | null
          updated_at?: string
          upn_broadcast_enabled?: boolean | null
          user_id: string
        }
        Update: {
          automation_enabled?: boolean | null
          automation_schedule?: string | null
          brand_voice?: string | null
          content_themes?: string[] | null
          content_types_enabled?: string[] | null
          created_at?: string
          franchise_id?: string | null
          id?: string
          last_content_generated_at?: string | null
          logo_url?: string | null
          notification_email?: string | null
          notification_webhook_url?: string | null
          physical_stations?: string[] | null
          primary_color?: string | null
          secondary_color?: string | null
          signal_boost_enabled?: boolean | null
          signal_boost_threshold?: number | null
          social_platforms?: string[] | null
          target_audiences?: string[] | null
          updated_at?: string
          upn_broadcast_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_marketing_config_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_interactions: {
        Row: {
          answer_sources: Json | null
          answer_text: string | null
          completion_rate: number | null
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          question_text: string | null
          segment_id: string
          user_id: string
          watch_duration_seconds: number | null
        }
        Insert: {
          answer_sources?: Json | null
          answer_text?: string | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          question_text?: string | null
          segment_id: string
          user_id: string
          watch_duration_seconds?: number | null
        }
        Update: {
          answer_sources?: Json | null
          answer_text?: string | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          question_text?: string | null
          segment_id?: string
          user_id?: string
          watch_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_interactions_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "broadcast_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_segments: {
        Row: {
          achievement_id: string | null
          content: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          published: boolean | null
          published_at: string | null
          sector: string | null
          segment_type: string
          source_data: Json | null
          source_urls: string[] | null
          summary: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_status: string | null
          video_url: string | null
        }
        Insert: {
          achievement_id?: string | null
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          sector?: string | null
          segment_type?: string
          source_data?: Json | null
          source_urls?: string[] | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_status?: string | null
          video_url?: string | null
        }
        Update: {
          achievement_id?: string | null
          content?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          sector?: string | null
          segment_type?: string
          source_data?: Json | null
          source_urls?: string[] | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_status?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_segments_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "bd_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      burnout_risk_scores: {
        Row: {
          behavioral_signals: Json | null
          calculated_at: string
          contributing_factors: Json | null
          created_at: string
          financial_stress_score: number | null
          id: string
          metadata: Json | null
          overall_risk_score: number
          overcommitment_score: number | null
          platform_dependence_score: number | null
          previous_score: number | null
          recommendations: Json | null
          recovery_deficit_score: number | null
          relationship_strain_score: number | null
          trend: string | null
          user_id: string
        }
        Insert: {
          behavioral_signals?: Json | null
          calculated_at?: string
          contributing_factors?: Json | null
          created_at?: string
          financial_stress_score?: number | null
          id?: string
          metadata?: Json | null
          overall_risk_score?: number
          overcommitment_score?: number | null
          platform_dependence_score?: number | null
          previous_score?: number | null
          recommendations?: Json | null
          recovery_deficit_score?: number | null
          relationship_strain_score?: number | null
          trend?: string | null
          user_id: string
        }
        Update: {
          behavioral_signals?: Json | null
          calculated_at?: string
          contributing_factors?: Json | null
          created_at?: string
          financial_stress_score?: number | null
          id?: string
          metadata?: Json | null
          overall_risk_score?: number
          overcommitment_score?: number | null
          platform_dependence_score?: number | null
          previous_score?: number | null
          recommendations?: Json | null
          recovery_deficit_score?: number | null
          relationship_strain_score?: number | null
          trend?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_cards: {
        Row: {
          background_color: string | null
          blockchain_network: string | null
          business_id: string | null
          card_name: string
          company_name: string | null
          created_at: string | null
          design_data: Json | null
          edition_number: number | null
          email: string | null
          id: string
          is_minted: boolean | null
          likes_count: number | null
          logo_url: string | null
          material: Database["public"]["Enums"]["card_material"]
          mint_transaction_hash: string | null
          minted_at: string | null
          nft_contract_address: string | null
          nft_token_id: string | null
          phone: string | null
          rarity_score: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["card_status"] | null
          text_color: string | null
          title: string | null
          total_editions: number | null
          updated_at: string | null
          user_id: string
          verification_code: string | null
          views_count: number | null
          website: string | null
        }
        Insert: {
          background_color?: string | null
          blockchain_network?: string | null
          business_id?: string | null
          card_name: string
          company_name?: string | null
          created_at?: string | null
          design_data?: Json | null
          edition_number?: number | null
          email?: string | null
          id?: string
          is_minted?: boolean | null
          likes_count?: number | null
          logo_url?: string | null
          material?: Database["public"]["Enums"]["card_material"]
          mint_transaction_hash?: string | null
          minted_at?: string | null
          nft_contract_address?: string | null
          nft_token_id?: string | null
          phone?: string | null
          rarity_score?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["card_status"] | null
          text_color?: string | null
          title?: string | null
          total_editions?: number | null
          updated_at?: string | null
          user_id: string
          verification_code?: string | null
          views_count?: number | null
          website?: string | null
        }
        Update: {
          background_color?: string | null
          blockchain_network?: string | null
          business_id?: string | null
          card_name?: string
          company_name?: string | null
          created_at?: string | null
          design_data?: Json | null
          edition_number?: number | null
          email?: string | null
          id?: string
          is_minted?: boolean | null
          likes_count?: number | null
          logo_url?: string | null
          material?: Database["public"]["Enums"]["card_material"]
          mint_transaction_hash?: string | null
          minted_at?: string | null
          nft_contract_address?: string | null
          nft_token_id?: string | null
          phone?: string | null
          rarity_score?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["card_status"] | null
          text_color?: string | null
          title?: string | null
          total_editions?: number | null
          updated_at?: string | null
          user_id?: string
          verification_code?: string | null
          views_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_cards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_discovery: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          business_website: string | null
          created_at: string | null
          digital_presence_score: number | null
          discovery_data: Json | null
          discovery_source: string | null
          ein: string | null
          id: string
          industry: string | null
          platforms_found: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          business_website?: string | null
          created_at?: string | null
          digital_presence_score?: number | null
          discovery_data?: Json | null
          discovery_source?: string | null
          ein?: string | null
          id?: string
          industry?: string | null
          platforms_found?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          business_website?: string | null
          created_at?: string | null
          digital_presence_score?: number | null
          discovery_data?: Json | null
          discovery_source?: string | null
          ein?: string | null
          id?: string
          industry?: string | null
          platforms_found?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_domains: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          custom_domain: string | null
          custom_domain_status: string | null
          dns_auto_configured: boolean | null
          dns_check_error: string | null
          dns_configuration_error: string | null
          dns_records_configured: boolean | null
          id: string
          is_primary: boolean | null
          last_dns_check: string | null
          oauth_state: string | null
          purchased_through_platform: boolean | null
          registrar_connection_id: string | null
          registrar_detected: string | null
          ssl_expires_at: string | null
          ssl_provisioned_at: string | null
          ssl_status: string | null
          subdomain: string
          subdomain_active: boolean
          updated_at: string
          verification_method: string | null
          verification_token: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          custom_domain?: string | null
          custom_domain_status?: string | null
          dns_auto_configured?: boolean | null
          dns_check_error?: string | null
          dns_configuration_error?: string | null
          dns_records_configured?: boolean | null
          id?: string
          is_primary?: boolean | null
          last_dns_check?: string | null
          oauth_state?: string | null
          purchased_through_platform?: boolean | null
          registrar_connection_id?: string | null
          registrar_detected?: string | null
          ssl_expires_at?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          subdomain: string
          subdomain_active?: boolean
          updated_at?: string
          verification_method?: string | null
          verification_token?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          custom_domain?: string | null
          custom_domain_status?: string | null
          dns_auto_configured?: boolean | null
          dns_check_error?: string | null
          dns_configuration_error?: string | null
          dns_records_configured?: boolean | null
          id?: string
          is_primary?: boolean | null
          last_dns_check?: string | null
          oauth_state?: string | null
          purchased_through_platform?: boolean | null
          registrar_connection_id?: string | null
          registrar_detected?: string | null
          ssl_expires_at?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          subdomain?: string
          subdomain_active?: boolean
          updated_at?: string
          verification_method?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_domains_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_domains_registrar_connection_id_fkey"
            columns: ["registrar_connection_id"]
            isOneToOne: false
            referencedRelation: "domain_registrar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      business_network_edges: {
        Row: {
          connected_at: string | null
          created_at: string | null
          edge_type: string
          id: string
          interaction_count: number | null
          last_interaction_at: string | null
          match_reasons: string[] | null
          match_score: number | null
          source_business_id: string
          status: string | null
          target_business_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          edge_type: string
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          match_reasons?: string[] | null
          match_score?: number | null
          source_business_id: string
          status?: string | null
          target_business_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          edge_type?: string
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          match_reasons?: string[] | null
          match_score?: number | null
          source_business_id?: string
          status?: string | null
          target_business_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_network_edges_source_business_id_fkey"
            columns: ["source_business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_network_edges_target_business_id_fkey"
            columns: ["target_business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_spawn_conversations: {
        Row: {
          content: string
          created_at: string | null
          extracted_insights: Json | null
          id: string
          phase: string | null
          role: string
          spawned_business_id: string
          tool_calls: Json | null
          tool_results: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          extracted_insights?: Json | null
          id?: string
          phase?: string | null
          role: string
          spawned_business_id: string
          tool_calls?: Json | null
          tool_results?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          extracted_insights?: Json | null
          id?: string
          phase?: string | null
          role?: string
          spawned_business_id?: string
          tool_calls?: Json | null
          tool_results?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_spawn_conversations_spawned_business_id_fkey"
            columns: ["spawned_business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_spawn_requests: {
        Row: {
          business_name: string
          business_type: string | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          reason_for_additional: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          spawned_business_id: string | null
          status: Database["public"]["Enums"]["spawn_request_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_name: string
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          reason_for_additional?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spawned_business_id?: string | null
          status?: Database["public"]["Enums"]["spawn_request_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_name?: string
          business_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          reason_for_additional?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spawned_business_id?: string | null
          status?: Database["public"]["Enums"]["spawn_request_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_spawn_requests_spawned_business_id_fkey"
            columns: ["spawned_business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_transfers: {
        Row: {
          accepted_at: string | null
          business_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          currency: string | null
          ecosystem_removal_completed: boolean | null
          escrow_status: string | null
          from_user_id: string
          id: string
          initiated_at: string
          notes: string | null
          proprietary_features_removed: boolean | null
          sale_price: number | null
          status: string
          stripe_transfer_id: string | null
          to_email: string | null
          to_user_id: string | null
          transfer_package_url: string | null
          transfer_type: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          business_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          ecosystem_removal_completed?: boolean | null
          escrow_status?: string | null
          from_user_id: string
          id?: string
          initiated_at?: string
          notes?: string | null
          proprietary_features_removed?: boolean | null
          sale_price?: number | null
          status?: string
          stripe_transfer_id?: string | null
          to_email?: string | null
          to_user_id?: string | null
          transfer_package_url?: string | null
          transfer_type: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          ecosystem_removal_completed?: boolean | null
          escrow_status?: string | null
          from_user_id?: string
          id?: string
          initiated_at?: string
          notes?: string | null
          proprietary_features_removed?: boolean | null
          sale_price?: number | null
          status?: string
          stripe_transfer_id?: string | null
          to_email?: string | null
          to_user_id?: string | null
          transfer_package_url?: string | null
          transfer_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_transfers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string | null
          ein: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: string
          incorporation_date: string | null
          industry: string | null
          name: string
          revenue: number | null
          state: string
          status: Database["public"]["Enums"]["entity_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ein?: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: string
          incorporation_date?: string | null
          industry?: string | null
          name: string
          revenue?: number | null
          state: string
          status?: Database["public"]["Enums"]["entity_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ein?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: string
          incorporation_date?: string | null
          industry?: string | null
          name?: string
          revenue?: number | null
          state?: string
          status?: Database["public"]["Enums"]["entity_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_type: string | null
          caller_number: string
          created_at: string | null
          direction: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          phone_number_id: string
          recording_url: string | null
          status: string
          transcription: string | null
          user_id: string
        }
        Insert: {
          call_type?: string | null
          caller_number: string
          created_at?: string | null
          direction: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          phone_number_id: string
          recording_url?: string | null
          status: string
          transcription?: string | null
          user_id: string
        }
        Update: {
          call_type?: string | null
          caller_number?: string
          created_at?: string | null
          direction?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          phone_number_id?: string
          recording_url?: string | null
          status?: string
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      call_participants: {
        Row: {
          call_id: string
          display_name: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          phone_number: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          call_id: string
          display_name?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          phone_number?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          call_id?: string
          display_name?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          phone_number?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_participants_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      call_recordings: {
        Row: {
          call_id: string
          channels: number | null
          checksum: string | null
          codec: string
          created_at: string | null
          duration_sec: number | null
          file_path: string
          id: string
          is_archive: boolean | null
          is_preview: boolean | null
          sample_rate: number | null
          size_bytes: number | null
          storage_bucket: string | null
        }
        Insert: {
          call_id: string
          channels?: number | null
          checksum?: string | null
          codec: string
          created_at?: string | null
          duration_sec?: number | null
          file_path: string
          id?: string
          is_archive?: boolean | null
          is_preview?: boolean | null
          sample_rate?: number | null
          size_bytes?: number | null
          storage_bucket?: string | null
        }
        Update: {
          call_id?: string
          channels?: number | null
          checksum?: string | null
          codec?: string
          created_at?: string | null
          duration_sec?: number | null
          file_path?: string
          id?: string
          is_archive?: boolean | null
          is_preview?: boolean | null
          sample_rate?: number | null
          size_bytes?: number | null
          storage_bucket?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcripts: {
        Row: {
          call_id: string
          created_at: string | null
          id: string
          language: string | null
          provider: string | null
          text_full: string | null
          words: Json | null
        }
        Insert: {
          call_id: string
          created_at?: string | null
          id?: string
          language?: string | null
          provider?: string | null
          text_full?: string | null
          words?: Json | null
        }
        Update: {
          call_id?: string
          created_at?: string | null
          id?: string
          language?: string | null
          provider?: string | null
          text_full?: string | null
          words?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          created_at: string | null
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          from_addr: string | null
          id: string
          metadata: Json | null
          modality: string
          owner_user_id: string
          pbx_call_id: string | null
          sfu_room_id: string | null
          started_at: string | null
          status: string | null
          to_addr: string | null
        }
        Insert: {
          created_at?: string | null
          direction: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_addr?: string | null
          id?: string
          metadata?: Json | null
          modality: string
          owner_user_id: string
          pbx_call_id?: string | null
          sfu_room_id?: string | null
          started_at?: string | null
          status?: string | null
          to_addr?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_addr?: string | null
          id?: string
          metadata?: Json | null
          modality?: string
          owner_user_id?: string
          pbx_call_id?: string | null
          sfu_room_id?: string | null
          started_at?: string | null
          status?: string | null
          to_addr?: string | null
        }
        Relationships: []
      }
      card_collections: {
        Row: {
          acquired_at: string | null
          acquisition_method: string | null
          acquisition_price: number | null
          card_id: string
          collector_id: string
          id: string
          notes: string | null
        }
        Insert: {
          acquired_at?: string | null
          acquisition_method?: string | null
          acquisition_price?: number | null
          card_id: string
          collector_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          acquired_at?: string | null
          acquisition_method?: string | null
          acquisition_price?: number | null
          card_id?: string
          collector_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_collections_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "business_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_trades: {
        Row: {
          card_id: string
          from_user_id: string | null
          id: string
          notes: string | null
          to_user_id: string | null
          trade_date: string | null
          trade_price: number | null
          transaction_hash: string | null
        }
        Insert: {
          card_id: string
          from_user_id?: string | null
          id?: string
          notes?: string | null
          to_user_id?: string | null
          trade_date?: string | null
          trade_price?: number | null
          transaction_hash?: string | null
        }
        Update: {
          card_id?: string
          from_user_id?: string | null
          id?: string
          notes?: string | null
          to_user_id?: string | null
          trade_date?: string | null
          trade_price?: number | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_trades_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "business_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      city_profiles: {
        Row: {
          base_peak_mw: number | null
          climate: Database["public"]["Enums"]["city_climate"]
          created_at: string
          ev_penetration_pct: number | null
          id: string
          name: string
          narrative: string | null
          pop_millions: number | null
          solar_w_per_capita: number | null
          updated_at: string
        }
        Insert: {
          base_peak_mw?: number | null
          climate: Database["public"]["Enums"]["city_climate"]
          created_at?: string
          ev_penetration_pct?: number | null
          id?: string
          name: string
          narrative?: string | null
          pop_millions?: number | null
          solar_w_per_capita?: number | null
          updated_at?: string
        }
        Update: {
          base_peak_mw?: number | null
          climate?: Database["public"]["Enums"]["city_climate"]
          created_at?: string
          ev_penetration_pct?: number | null
          id?: string
          name?: string
          narrative?: string | null
          pop_millions?: number | null
          solar_w_per_capita?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      client_activity_reports: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string
          id: string
          report_data: Json | null
          report_type: string
          start_date: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date: string
          id?: string
          report_data?: Json | null
          report_type: string
          start_date: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          report_data?: Json | null
          report_type?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          accepted_at: string | null
          access_level: string
          can_add_contacts: boolean | null
          can_add_tasks: boolean | null
          can_view_activities: boolean | null
          can_view_reports: boolean | null
          client_id: string
          id: string
          invited_at: string | null
          invited_by: string
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          access_level?: string
          can_add_contacts?: boolean | null
          can_add_tasks?: boolean | null
          can_view_activities?: boolean | null
          can_view_reports?: boolean | null
          client_id: string
          id?: string
          invited_at?: string | null
          invited_by: string
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          access_level?: string
          can_add_contacts?: boolean | null
          can_add_tasks?: boolean | null
          can_view_activities?: boolean | null
          can_view_reports?: boolean | null
          client_id?: string
          id?: string
          invited_at?: string | null
          invited_by?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_email: string | null
          created_at: string
          domain: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commands: {
        Row: {
          applied_ts: string | null
          cmd_type: Database["public"]["Enums"]["command_type"]
          corr_id: string | null
          created_at: string
          id: string
          payload_json: Json | null
          status: Database["public"]["Enums"]["command_status"]
          target_asset_id: string
          ts: string
        }
        Insert: {
          applied_ts?: string | null
          cmd_type: Database["public"]["Enums"]["command_type"]
          corr_id?: string | null
          created_at?: string
          id?: string
          payload_json?: Json | null
          status?: Database["public"]["Enums"]["command_status"]
          target_asset_id: string
          ts?: string
        }
        Update: {
          applied_ts?: string | null
          cmd_type?: Database["public"]["Enums"]["command_type"]
          corr_id?: string | null
          created_at?: string
          id?: string
          payload_json?: Json | null
          status?: Database["public"]["Enums"]["command_status"]
          target_asset_id?: string
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "commands_target_asset_id_fkey"
            columns: ["target_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_projects: {
        Row: {
          created_at: string
          error_message: string | null
          final_video_url: string | null
          id: string
          parsed_scenes: Json | null
          price_cents: number
          script_text: string
          status: string
          title: string
          total_duration_seconds: number | null
          updated_at: string
          user_id: string
          voice_id: string | null
          voiceover_duration_seconds: number | null
          voiceover_url: string | null
          watermarked_video_url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          final_video_url?: string | null
          id?: string
          parsed_scenes?: Json | null
          price_cents?: number
          script_text: string
          status?: string
          title?: string
          total_duration_seconds?: number | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
          voiceover_duration_seconds?: number | null
          voiceover_url?: string | null
          watermarked_video_url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          final_video_url?: string | null
          id?: string
          parsed_scenes?: Json | null
          price_cents?: number
          script_text?: string
          status?: string
          title?: string
          total_duration_seconds?: number | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          voiceover_duration_seconds?: number | null
          voiceover_url?: string | null
          watermarked_video_url?: string | null
        }
        Relationships: []
      }
      commercial_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          download_count: number | null
          id: string
          last_download_at: string | null
          project_id: string
          purchased_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          download_count?: number | null
          id?: string
          last_download_at?: string | null
          project_id: string
          purchased_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          download_count?: number | null
          id?: string
          last_download_at?: string | null
          project_id?: string
          purchased_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_purchases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "commercial_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_scenes: {
        Row: {
          created_at: string
          description: string
          duration_seconds: number
          error_message: string | null
          id: string
          project_id: string
          scene_order: number
          status: string
          video_clip_url: string | null
          visual_prompt: string | null
        }
        Insert: {
          created_at?: string
          description: string
          duration_seconds?: number
          error_message?: string | null
          id?: string
          project_id: string
          scene_order: number
          status?: string
          video_clip_url?: string | null
          visual_prompt?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          duration_seconds?: number
          error_message?: string | null
          id?: string
          project_id?: string
          scene_order?: number
          status?: string
          video_clip_url?: string | null
          visual_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "commercial_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_broker_mandates: {
        Row: {
          broker_id: string
          commission_rate: number
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          listing_id: string | null
          mandate_code: string
          mandate_type: string
          metadata: Json | null
          referred_buyer_id: string | null
          referred_seller_id: string | null
        }
        Insert: {
          broker_id: string
          commission_rate?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          listing_id?: string | null
          mandate_code: string
          mandate_type: string
          metadata?: Json | null
          referred_buyer_id?: string | null
          referred_seller_id?: string | null
        }
        Update: {
          broker_id?: string
          commission_rate?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          listing_id?: string | null
          mandate_code?: string
          mandate_type?: string
          metadata?: Json | null
          referred_buyer_id?: string | null
          referred_seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commodity_broker_mandates_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_broker_mandates_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "commodity_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_broker_mandates_referred_buyer_id_fkey"
            columns: ["referred_buyer_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_broker_mandates_referred_seller_id_fkey"
            columns: ["referred_seller_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_deal_messages: {
        Row: {
          content: string
          created_at: string
          deal_id: string
          document_name: string | null
          document_url: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id: string
          document_name?: string | null
          document_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string
          document_name?: string | null
          document_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commodity_deal_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "commodity_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_deals: {
        Row: {
          agreed_price: number
          buy_broker_commission: number | null
          buy_broker_id: string | null
          buy_broker_mandate_id: string | null
          buyer_id: string
          created_at: string
          currency: string | null
          deal_number: string
          dispute_reason: string | null
          dispute_resolution: string | null
          disputed_at: string | null
          escrow_amount: number | null
          escrow_funded_at: string | null
          escrow_status:
            | Database["public"]["Enums"]["commodity_escrow_status"]
            | null
          escrow_transaction_hash: string | null
          escrow_wallet_address: string | null
          id: string
          injection_completed_at: string | null
          injection_started_at: string | null
          listing_id: string | null
          metadata: Json | null
          okari_flow_data: Json | null
          platform_fee: number | null
          pop_verification_method: string | null
          pop_verified: boolean | null
          pop_verified_at: string | null
          product_type: string
          quantity: number
          quantity_unit: string
          sell_broker_commission: number | null
          sell_broker_id: string | null
          sell_broker_mandate_id: string | null
          seller_id: string
          settled_at: string | null
          settlement_status: string | null
          status: Database["public"]["Enums"]["commodity_deal_status"] | null
          title_transfer_document_url: string | null
          total_value: number
          updated_at: string
        }
        Insert: {
          agreed_price: number
          buy_broker_commission?: number | null
          buy_broker_id?: string | null
          buy_broker_mandate_id?: string | null
          buyer_id: string
          created_at?: string
          currency?: string | null
          deal_number: string
          dispute_reason?: string | null
          dispute_resolution?: string | null
          disputed_at?: string | null
          escrow_amount?: number | null
          escrow_funded_at?: string | null
          escrow_status?:
            | Database["public"]["Enums"]["commodity_escrow_status"]
            | null
          escrow_transaction_hash?: string | null
          escrow_wallet_address?: string | null
          id?: string
          injection_completed_at?: string | null
          injection_started_at?: string | null
          listing_id?: string | null
          metadata?: Json | null
          okari_flow_data?: Json | null
          platform_fee?: number | null
          pop_verification_method?: string | null
          pop_verified?: boolean | null
          pop_verified_at?: string | null
          product_type: string
          quantity: number
          quantity_unit: string
          sell_broker_commission?: number | null
          sell_broker_id?: string | null
          sell_broker_mandate_id?: string | null
          seller_id: string
          settled_at?: string | null
          settlement_status?: string | null
          status?: Database["public"]["Enums"]["commodity_deal_status"] | null
          title_transfer_document_url?: string | null
          total_value: number
          updated_at?: string
        }
        Update: {
          agreed_price?: number
          buy_broker_commission?: number | null
          buy_broker_id?: string | null
          buy_broker_mandate_id?: string | null
          buyer_id?: string
          created_at?: string
          currency?: string | null
          deal_number?: string
          dispute_reason?: string | null
          dispute_resolution?: string | null
          disputed_at?: string | null
          escrow_amount?: number | null
          escrow_funded_at?: string | null
          escrow_status?:
            | Database["public"]["Enums"]["commodity_escrow_status"]
            | null
          escrow_transaction_hash?: string | null
          escrow_wallet_address?: string | null
          id?: string
          injection_completed_at?: string | null
          injection_started_at?: string | null
          listing_id?: string | null
          metadata?: Json | null
          okari_flow_data?: Json | null
          platform_fee?: number | null
          pop_verification_method?: string | null
          pop_verified?: boolean | null
          pop_verified_at?: string | null
          product_type?: string
          quantity?: number
          quantity_unit?: string
          sell_broker_commission?: number | null
          sell_broker_id?: string | null
          sell_broker_mandate_id?: string | null
          seller_id?: string
          settled_at?: string | null
          settlement_status?: string | null
          status?: Database["public"]["Enums"]["commodity_deal_status"] | null
          title_transfer_document_url?: string | null
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commodity_deals_buy_broker_id_fkey"
            columns: ["buy_broker_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deals_buy_broker_mandate_id_fkey"
            columns: ["buy_broker_mandate_id"]
            isOneToOne: false
            referencedRelation: "commodity_broker_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deals_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "commodity_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deals_sell_broker_id_fkey"
            columns: ["sell_broker_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deals_sell_broker_mandate_id_fkey"
            columns: ["sell_broker_mandate_id"]
            isOneToOne: false
            referencedRelation: "commodity_broker_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_deals_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_document_verifications: {
        Row: {
          ai_extracted_data: Json | null
          created_at: string
          deal_id: string | null
          document_hash: string
          document_type: string
          document_url: string
          id: string
          listing_id: string | null
          metadata: Json | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          ai_extracted_data?: Json | null
          created_at?: string
          deal_id?: string | null
          document_hash: string
          document_type: string
          document_url: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          ai_extracted_data?: Json | null
          created_at?: string
          deal_id?: string | null
          document_hash?: string
          document_type?: string
          document_url?: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commodity_document_verifications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "commodity_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_document_verifications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "commodity_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_escrow_transactions: {
        Row: {
          amount: number
          blockchain_tx_hash: string | null
          created_at: string
          currency: string | null
          deal_id: string
          from_user_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          processed_at: string | null
          status: string | null
          to_user_id: string | null
          transaction_reference: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          blockchain_tx_hash?: string | null
          created_at?: string
          currency?: string | null
          deal_id: string
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string | null
          to_user_id?: string | null
          transaction_reference?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          blockchain_tx_hash?: string | null
          created_at?: string
          currency?: string | null
          deal_id?: string
          from_user_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string | null
          to_user_id?: string | null
          transaction_reference?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commodity_escrow_transactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "commodity_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_escrow_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commodity_escrow_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_listings: {
        Row: {
          created_at: string
          currency: string | null
          delivery_terms: string | null
          id: string
          inquiry_count: number | null
          last_okari_sync: string | null
          location: string
          metadata: Json | null
          min_order_quantity: number | null
          okari_device_id: string | null
          origin_country: string | null
          platts_discount: number | null
          platts_index: string | null
          price_per_unit: number | null
          price_type: string
          product_grade: string | null
          product_type: string
          quantity: number
          quantity_unit: string
          seller_id: string
          sgs_document_hash: string | null
          sgs_document_url: string | null
          sgs_verified_at: string | null
          status: Database["public"]["Enums"]["commodity_listing_status"] | null
          tank_level_percent: number | null
          updated_at: string
          valid_until: string | null
          verification_status:
            | Database["public"]["Enums"]["commodity_verification_status"]
            | null
          views_count: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          delivery_terms?: string | null
          id?: string
          inquiry_count?: number | null
          last_okari_sync?: string | null
          location: string
          metadata?: Json | null
          min_order_quantity?: number | null
          okari_device_id?: string | null
          origin_country?: string | null
          platts_discount?: number | null
          platts_index?: string | null
          price_per_unit?: number | null
          price_type: string
          product_grade?: string | null
          product_type: string
          quantity: number
          quantity_unit?: string
          seller_id: string
          sgs_document_hash?: string | null
          sgs_document_url?: string | null
          sgs_verified_at?: string | null
          status?:
            | Database["public"]["Enums"]["commodity_listing_status"]
            | null
          tank_level_percent?: number | null
          updated_at?: string
          valid_until?: string | null
          verification_status?:
            | Database["public"]["Enums"]["commodity_verification_status"]
            | null
          views_count?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          delivery_terms?: string | null
          id?: string
          inquiry_count?: number | null
          last_okari_sync?: string | null
          location?: string
          metadata?: Json | null
          min_order_quantity?: number | null
          okari_device_id?: string | null
          origin_country?: string | null
          platts_discount?: number | null
          platts_index?: string | null
          price_per_unit?: number | null
          price_type?: string
          product_grade?: string | null
          product_type?: string
          quantity?: number
          quantity_unit?: string
          seller_id?: string
          sgs_document_hash?: string | null
          sgs_document_url?: string | null
          sgs_verified_at?: string | null
          status?:
            | Database["public"]["Enums"]["commodity_listing_status"]
            | null
          tank_level_percent?: number | null
          updated_at?: string
          valid_until?: string | null
          verification_status?:
            | Database["public"]["Enums"]["commodity_verification_status"]
            | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commodity_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_okari_devices: {
        Row: {
          capacity: number | null
          capacity_unit: string | null
          created_at: string
          current_level: number | null
          current_level_percent: number | null
          device_id: string
          device_type: string
          facility_name: string | null
          id: string
          is_verified: boolean | null
          last_inspection: string | null
          last_telemetry_at: string | null
          location: string
          metadata: Json | null
          owner_user_id: string | null
          pressure: number | null
          product_grade: string | null
          product_type: string | null
          temperature: number | null
          updated_at: string
          valve_status: string | null
        }
        Insert: {
          capacity?: number | null
          capacity_unit?: string | null
          created_at?: string
          current_level?: number | null
          current_level_percent?: number | null
          device_id: string
          device_type: string
          facility_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_inspection?: string | null
          last_telemetry_at?: string | null
          location: string
          metadata?: Json | null
          owner_user_id?: string | null
          pressure?: number | null
          product_grade?: string | null
          product_type?: string | null
          temperature?: number | null
          updated_at?: string
          valve_status?: string | null
        }
        Update: {
          capacity?: number | null
          capacity_unit?: string | null
          created_at?: string
          current_level?: number | null
          current_level_percent?: number | null
          device_id?: string
          device_type?: string
          facility_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_inspection?: string | null
          last_telemetry_at?: string | null
          location?: string
          metadata?: Json | null
          owner_user_id?: string | null
          pressure?: number | null
          product_grade?: string | null
          product_type?: string | null
          temperature?: number | null
          updated_at?: string
          valve_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commodity_okari_devices_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "commodity_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_user_profiles: {
        Row: {
          broker_commission_rate: number | null
          company_name: string | null
          completed_deals: number | null
          created_at: string
          id: string
          kyc_verified: boolean | null
          kyc_verified_at: string | null
          metadata: Json | null
          okari_device_ids: string[] | null
          okari_enabled: boolean | null
          total_volume_traded: number | null
          trust_tier: Database["public"]["Enums"]["commodity_user_tier"] | null
          updated_at: string
          user_id: string
          user_type: string
          wallet_address: string | null
        }
        Insert: {
          broker_commission_rate?: number | null
          company_name?: string | null
          completed_deals?: number | null
          created_at?: string
          id?: string
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          metadata?: Json | null
          okari_device_ids?: string[] | null
          okari_enabled?: boolean | null
          total_volume_traded?: number | null
          trust_tier?: Database["public"]["Enums"]["commodity_user_tier"] | null
          updated_at?: string
          user_id: string
          user_type: string
          wallet_address?: string | null
        }
        Update: {
          broker_commission_rate?: number | null
          company_name?: string | null
          completed_deals?: number | null
          created_at?: string
          id?: string
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          metadata?: Json | null
          okari_device_ids?: string[] | null
          okari_enabled?: boolean | null
          total_volume_traded?: number | null
          trust_tier?: Database["public"]["Enums"]["commodity_user_tier"] | null
          updated_at?: string
          user_id?: string
          user_type?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          body: string | null
          campaign_id: string | null
          communication_type: string
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          direction: string | null
          id: string
          is_draft: boolean | null
          metadata: Json | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          ticket_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          campaign_id?: string | null
          communication_type: string
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string | null
          id?: string
          is_draft?: boolean | null
          metadata?: Json | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          ticket_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          campaign_id?: string | null
          communication_type?: string
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          direction?: string | null
          id?: string
          is_draft?: boolean | null
          metadata?: Json | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          ticket_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      company_bills: {
        Row: {
          amount: number | null
          bill_date: string | null
          bill_name: string
          bill_type: string
          company_id: string | null
          created_at: string
          currency: string | null
          due_date: string | null
          extracted_data: Json | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          metadata: Json | null
          status: string | null
          updated_at: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          amount?: number | null
          bill_date?: string | null
          bill_name: string
          bill_type: string
          company_id?: string | null
          created_at?: string
          currency?: string | null
          due_date?: string | null
          extracted_data?: Json | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number | null
          bill_date?: string | null
          bill_name?: string
          bill_type?: string
          company_id?: string | null
          created_at?: string
          currency?: string | null
          due_date?: string | null
          extracted_data?: Json | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_bills_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          company_id: string
          contact_id: string
          created_at: string | null
          id: string
          interest_level: number | null
          last_contacted: string | null
          metadata: Json | null
          next_followup: string | null
          notes: string | null
          products_interested_in: string[] | null
          relationship_type:
            | Database["public"]["Enums"]["contact_relationship_type"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          contact_id: string
          created_at?: string | null
          id?: string
          interest_level?: number | null
          last_contacted?: string | null
          metadata?: Json | null
          next_followup?: string | null
          notes?: string | null
          products_interested_in?: string[] | null
          relationship_type?:
            | Database["public"]["Enums"]["contact_relationship_type"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          contact_id?: string
          created_at?: string | null
          id?: string
          interest_level?: number | null
          last_contacted?: string | null
          metadata?: Json | null
          next_followup?: string | null
          notes?: string | null
          products_interested_in?: string[] | null
          relationship_type?:
            | Database["public"]["Enums"]["contact_relationship_type"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      company_erp_configs: {
        Row: {
          ai_assessment: Json | null
          company_id: string | null
          created_at: string | null
          folder_structure: Json
          id: string
          industry: string
          integrations: Json | null
          last_evolved_at: string | null
          status: string | null
          strategy: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string
          workflows: Json | null
        }
        Insert: {
          ai_assessment?: Json | null
          company_id?: string | null
          created_at?: string | null
          folder_structure?: Json
          id?: string
          industry: string
          integrations?: Json | null
          last_evolved_at?: string | null
          status?: string | null
          strategy?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
          workflows?: Json | null
        }
        Update: {
          ai_assessment?: Json | null
          company_id?: string | null
          created_at?: string | null
          folder_structure?: Json
          id?: string
          industry?: string
          integrations?: Json | null
          last_evolved_at?: string | null
          status?: string | null
          strategy?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
          workflows?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "company_erp_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_erp_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "erp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      company_products: {
        Row: {
          base_price: number | null
          category: string | null
          company_id: string
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          pitch_template: string | null
          pricing_model: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          pitch_template?: string | null
          pricing_model?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_price?: number | null
          category?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          pitch_template?: string | null
          pricing_model?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_relationships: {
        Row: {
          child_company_id: string
          contract_details: Json | null
          created_at: string | null
          effective_date: string | null
          end_date: string | null
          id: string
          liability_protection_notes: string | null
          notes: string | null
          ownership_percentage: number | null
          parent_company_id: string
          relationship_type: Database["public"]["Enums"]["company_relationship_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_company_id: string
          contract_details?: Json | null
          created_at?: string | null
          effective_date?: string | null
          end_date?: string | null
          id?: string
          liability_protection_notes?: string | null
          notes?: string | null
          ownership_percentage?: number | null
          parent_company_id: string
          relationship_type: Database["public"]["Enums"]["company_relationship_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_company_id?: string
          contract_details?: Json | null
          created_at?: string | null
          effective_date?: string | null
          end_date?: string | null
          id?: string
          liability_protection_notes?: string | null
          notes?: string | null
          ownership_percentage?: number | null
          parent_company_id?: string
          relationship_type?: Database["public"]["Enums"]["company_relationship_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_relationships_child_company_id_fkey"
            columns: ["child_company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_relationships_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_artifacts: {
        Row: {
          asset_id: string
          created_at: string
          doc_url: string | null
          expiry: string | null
          id: string
          issue_date: string | null
          standard: Database["public"]["Enums"]["compliance_standard"]
          updated_at: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          doc_url?: string | null
          expiry?: string | null
          id?: string
          issue_date?: string | null
          standard: Database["public"]["Enums"]["compliance_standard"]
          updated_at?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          doc_url?: string | null
          expiry?: string | null
          id?: string
          issue_date?: string | null
          standard?: Database["public"]["Enums"]["compliance_standard"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_artifacts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_controls: {
        Row: {
          control_description: string | null
          control_id: string
          control_name: string
          control_type: string | null
          created_at: string | null
          effectiveness_rating: string | null
          evidence_required: string | null
          framework: string
          id: string
          implementation_status: string | null
          last_test_date: string | null
          next_test_date: string | null
          owner_id: string | null
          test_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          control_description?: string | null
          control_id: string
          control_name: string
          control_type?: string | null
          created_at?: string | null
          effectiveness_rating?: string | null
          evidence_required?: string | null
          framework: string
          id?: string
          implementation_status?: string | null
          last_test_date?: string | null
          next_test_date?: string | null
          owner_id?: string | null
          test_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          control_description?: string | null
          control_id?: string
          control_name?: string
          control_type?: string | null
          created_at?: string | null
          effectiveness_rating?: string | null
          evidence_required?: string | null
          framework?: string
          id?: string
          implementation_status?: string | null
          last_test_date?: string | null
          next_test_date?: string | null
          owner_id?: string | null
          test_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      connection_messages: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          message: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "marketplace_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      connectors: {
        Row: {
          config: Json
          connector_type: Database["public"]["Enums"]["connector_type"]
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          sync_error: string | null
          sync_status: Database["public"]["Enums"]["sync_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          connector_type: Database["public"]["Enums"]["connector_type"]
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          sync_error?: string | null
          sync_status?: Database["public"]["Enums"]["sync_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          connector_type?: Database["public"]["Enums"]["connector_type"]
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          sync_error?: string | null
          sync_status?: Database["public"]["Enums"]["sync_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      consent_events: {
        Row: {
          call_id: string
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
        }
        Insert: {
          call_id: string
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          call_id?: string
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_logs: {
        Row: {
          claim_request_id: string | null
          consent_text: string
          consent_type: string
          id: string
          ip_address: string
          metadata: Json | null
          signature_data: string | null
          timestamp: string | null
          user_agent: string
          user_id: string | null
        }
        Insert: {
          claim_request_id?: string | null
          consent_text: string
          consent_type: string
          id?: string
          ip_address: string
          metadata?: Json | null
          signature_data?: string | null
          timestamp?: string | null
          user_agent: string
          user_id?: string | null
        }
        Update: {
          claim_request_id?: string | null
          consent_text?: string
          consent_type?: string
          id?: string
          ip_address?: string
          metadata?: Json | null
          signature_data?: string | null
          timestamp?: string | null
          user_agent?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_logs_claim_request_id_fkey"
            columns: ["claim_request_id"]
            isOneToOne: false
            referencedRelation: "platform_claim_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_documents: {
        Row: {
          created_at: string
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          ocr_content: string | null
          parent_version_id: string | null
          project_id: string
          title: string
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          ocr_content?: string | null
          parent_version_id?: string | null
          project_id: string
          title: string
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          ocr_content?: string | null
          parent_version_id?: string | null
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_documents_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "construction_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_projects: {
        Row: {
          actual_cost: number | null
          asset_type: Database["public"]["Enums"]["construction_asset_type"]
          bid_due_date: string | null
          bid_status: Database["public"]["Enums"]["bid_status"] | null
          bond_required: boolean | null
          company_id: string | null
          completion_date: string | null
          compliance_mode: Database["public"]["Enums"]["compliance_mode"] | null
          created_at: string
          currency: string | null
          gc_contact_id: string | null
          id: string
          location: string | null
          metadata: Json | null
          name: string
          phase: Database["public"]["Enums"]["project_phase"] | null
          probability_percent: number | null
          project_number: string | null
          region: string | null
          retainage_percent: number | null
          start_date: string | null
          total_estimated_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          asset_type: Database["public"]["Enums"]["construction_asset_type"]
          bid_due_date?: string | null
          bid_status?: Database["public"]["Enums"]["bid_status"] | null
          bond_required?: boolean | null
          company_id?: string | null
          completion_date?: string | null
          compliance_mode?:
            | Database["public"]["Enums"]["compliance_mode"]
            | null
          created_at?: string
          currency?: string | null
          gc_contact_id?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name: string
          phase?: Database["public"]["Enums"]["project_phase"] | null
          probability_percent?: number | null
          project_number?: string | null
          region?: string | null
          retainage_percent?: number | null
          start_date?: string | null
          total_estimated_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          asset_type?: Database["public"]["Enums"]["construction_asset_type"]
          bid_due_date?: string | null
          bid_status?: Database["public"]["Enums"]["bid_status"] | null
          bond_required?: boolean | null
          company_id?: string | null
          completion_date?: string | null
          compliance_mode?:
            | Database["public"]["Enums"]["compliance_mode"]
            | null
          created_at?: string
          currency?: string | null
          gc_contact_id?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name?: string
          phase?: Database["public"]["Enums"]["project_phase"] | null
          probability_percent?: number | null
          project_number?: string | null
          region?: string | null
          retainage_percent?: number | null
          start_date?: string | null
          total_estimated_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_projects_gc_contact_id_fkey"
            columns: ["gc_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_systems: {
        Row: {
          area_sqft: number | null
          created_at: string
          elevation_label: string | null
          id: string
          metadata: Json | null
          name: string
          project_id: string
          roof_type: Database["public"]["Enums"]["roof_type"] | null
          slope_ratio: number | null
          system_type: string
          updated_at: string
          warranty_years: number | null
        }
        Insert: {
          area_sqft?: number | null
          created_at?: string
          elevation_label?: string | null
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          roof_type?: Database["public"]["Enums"]["roof_type"] | null
          slope_ratio?: number | null
          system_type: string
          updated_at?: string
          warranty_years?: number | null
        }
        Update: {
          area_sqft?: number | null
          created_at?: string
          elevation_label?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          roof_type?: Database["public"]["Enums"]["roof_type"] | null
          slope_ratio?: number | null
          system_type?: string
          updated_at?: string
          warranty_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_systems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      continuity_plans: {
        Row: {
          created_at: string | null
          critical_process: string | null
          dependencies: string[] | null
          id: string
          last_test_date: string | null
          next_test_date: string | null
          owner_id: string | null
          plan_document_url: string | null
          plan_name: string
          plan_type: string | null
          recovery_steps: string | null
          rpo_hours: number | null
          rto_hours: number | null
          test_result: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          critical_process?: string | null
          dependencies?: string[] | null
          id?: string
          last_test_date?: string | null
          next_test_date?: string | null
          owner_id?: string | null
          plan_document_url?: string | null
          plan_name: string
          plan_type?: string | null
          recovery_steps?: string | null
          rpo_hours?: number | null
          rto_hours?: number | null
          test_result?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          critical_process?: string | null
          dependencies?: string[] | null
          id?: string
          last_test_date?: string | null
          next_test_date?: string | null
          owner_id?: string | null
          plan_document_url?: string | null
          plan_name?: string
          plan_type?: string | null
          recovery_steps?: string | null
          rpo_hours?: number | null
          rto_hours?: number | null
          test_result?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      contribution_events: {
        Row: {
          action_credits: number | null
          actor_id: string
          actor_type: Database["public"]["Enums"]["actor_type"]
          anchored_at: string | null
          attribution_tags: string[] | null
          attribution_weight: number | null
          compute_credits: number | null
          created_at: string | null
          deal_room_id: string | null
          event_description: string | null
          event_hash: string | null
          event_type: Database["public"]["Enums"]["contribution_event_type"]
          id: string
          merkle_batch_id: string | null
          opportunity_id: string | null
          outcome_credits: number | null
          payload: Json | null
          requires_xodiak_log: boolean | null
          task_id: string | null
          value_category:
            | Database["public"]["Enums"]["task_value_category"]
            | null
          workspace_id: string | null
          xodiak_anchor_status: string | null
          xodiak_tx_hash: string | null
        }
        Insert: {
          action_credits?: number | null
          actor_id: string
          actor_type: Database["public"]["Enums"]["actor_type"]
          anchored_at?: string | null
          attribution_tags?: string[] | null
          attribution_weight?: number | null
          compute_credits?: number | null
          created_at?: string | null
          deal_room_id?: string | null
          event_description?: string | null
          event_hash?: string | null
          event_type: Database["public"]["Enums"]["contribution_event_type"]
          id?: string
          merkle_batch_id?: string | null
          opportunity_id?: string | null
          outcome_credits?: number | null
          payload?: Json | null
          requires_xodiak_log?: boolean | null
          task_id?: string | null
          value_category?:
            | Database["public"]["Enums"]["task_value_category"]
            | null
          workspace_id?: string | null
          xodiak_anchor_status?: string | null
          xodiak_tx_hash?: string | null
        }
        Update: {
          action_credits?: number | null
          actor_id?: string
          actor_type?: Database["public"]["Enums"]["actor_type"]
          anchored_at?: string | null
          attribution_tags?: string[] | null
          attribution_weight?: number | null
          compute_credits?: number | null
          created_at?: string | null
          deal_room_id?: string | null
          event_description?: string | null
          event_hash?: string | null
          event_type?: Database["public"]["Enums"]["contribution_event_type"]
          id?: string
          merkle_batch_id?: string | null
          opportunity_id?: string | null
          outcome_credits?: number | null
          payload?: Json | null
          requires_xodiak_log?: boolean | null
          task_id?: string | null
          value_category?:
            | Database["public"]["Enums"]["task_value_category"]
            | null
          workspace_id?: string | null
          xodiak_anchor_status?: string | null
          xodiak_tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contribution_events_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_events_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "crm_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      control_tests: {
        Row: {
          control_id: string | null
          created_at: string | null
          evidence_urls: string[] | null
          findings: string | null
          id: string
          remediation_completed_date: string | null
          remediation_due_date: string | null
          remediation_required: boolean | null
          test_date: string
          test_result: string | null
          tester_id: string | null
          xodiak_anchor_hash: string | null
        }
        Insert: {
          control_id?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          findings?: string | null
          id?: string
          remediation_completed_date?: string | null
          remediation_due_date?: string | null
          remediation_required?: boolean | null
          test_date: string
          test_result?: string | null
          tester_id?: string | null
          xodiak_anchor_hash?: string | null
        }
        Update: {
          control_id?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          findings?: string | null
          id?: string
          remediation_completed_date?: string | null
          remediation_due_date?: string | null
          remediation_required?: boolean | null
          test_date?: string
          test_result?: string | null
          tester_id?: string | null
          xodiak_anchor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "control_tests_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "compliance_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_items: {
        Row: {
          asset_type:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          coverage_per_unit: number | null
          created_at: string
          csi_division: string | null
          currency: string | null
          description: string
          equipment_cost: number | null
          id: string
          is_template: boolean | null
          item_code: string
          item_group: string | null
          labor_cost: number | null
          material_cost: number | null
          metadata: Json | null
          r_value: number | null
          region: string | null
          sku: string | null
          thickness_inches: number | null
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost: number
          updated_at: string
          user_id: string | null
          vendor_id: string | null
          waste_percent: number | null
        }
        Insert: {
          asset_type?:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          coverage_per_unit?: number | null
          created_at?: string
          csi_division?: string | null
          currency?: string | null
          description: string
          equipment_cost?: number | null
          id?: string
          is_template?: boolean | null
          item_code: string
          item_group?: string | null
          labor_cost?: number | null
          material_cost?: number | null
          metadata?: Json | null
          r_value?: number | null
          region?: string | null
          sku?: string | null
          thickness_inches?: number | null
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
          waste_percent?: number | null
        }
        Update: {
          asset_type?:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          coverage_per_unit?: number | null
          created_at?: string
          csi_division?: string | null
          currency?: string | null
          description?: string
          equipment_cost?: number | null
          id?: string
          is_template?: boolean | null
          item_code?: string
          item_group?: string | null
          labor_cost?: number | null
          material_cost?: number | null
          metadata?: Json | null
          r_value?: number | null
          region?: string | null
          sku?: string | null
          thickness_inches?: number | null
          unit?: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost?: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
          waste_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_vault: {
        Row: {
          created_at: string | null
          encrypted_credentials: string
          expires_at: string | null
          id: string
          last_refreshed_at: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          social_account_id: string | null
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_credentials: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          social_account_id?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_credentials?: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          social_account_id?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credential_vault_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_balances: {
        Row: {
          action_credits_earned: number | null
          action_credits_used: number | null
          compute_credits_earned: number | null
          compute_credits_used: number | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          last_event_at: string | null
          outcome_credits_earned: number | null
          outcome_credits_used: number | null
          period_end: string
          period_start: string
          total_events: number | null
          updated_at: string | null
        }
        Insert: {
          action_credits_earned?: number | null
          action_credits_used?: number | null
          compute_credits_earned?: number | null
          compute_credits_used?: number | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          last_event_at?: string | null
          outcome_credits_earned?: number | null
          outcome_credits_used?: number | null
          period_end: string
          period_start: string
          total_events?: number | null
          updated_at?: string | null
        }
        Update: {
          action_credits_earned?: number | null
          action_credits_used?: number | null
          compute_credits_earned?: number | null
          compute_credits_used?: number | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          last_event_at?: string | null
          outcome_credits_earned?: number | null
          outcome_credits_used?: number | null
          period_end?: string
          period_start?: string
          total_events?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_contributions: {
        Row: {
          classification: Database["public"]["Enums"]["contribution_classification"]
          created_at: string
          credits_amount: number
          deal_room_id: string
          description: string | null
          expires_at: string | null
          formulation_id: string | null
          id: string
          ingredient_id: string | null
          is_active: boolean
          metadata: Json | null
          participant_id: string
          updated_at: string
          valuation_method: string | null
        }
        Insert: {
          classification: Database["public"]["Enums"]["contribution_classification"]
          created_at?: string
          credits_amount?: number
          deal_room_id: string
          description?: string | null
          expires_at?: string | null
          formulation_id?: string | null
          id?: string
          ingredient_id?: string | null
          is_active?: boolean
          metadata?: Json | null
          participant_id: string
          updated_at?: string
          valuation_method?: string | null
        }
        Update: {
          classification?: Database["public"]["Enums"]["contribution_classification"]
          created_at?: string
          credits_amount?: number
          deal_room_id?: string
          description?: string | null
          expires_at?: string | null
          formulation_id?: string | null
          id?: string
          ingredient_id?: string | null
          is_active?: boolean
          metadata?: Json | null
          participant_id?: string
          updated_at?: string
          valuation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_contributions_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_contributions_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "blender_formulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_contributions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "blender_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_contributions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string | null
          credit_type: string
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string | null
          credit_type: string
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string | null
          credit_type?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
        }
        Relationships: []
      }
      credit_usage: {
        Row: {
          compute_hours: number | null
          contribution_credit_id: string
          energy_kwh: number | null
          id: string
          recorded_at: string
          storage_bytes: number | null
          usage_context: Json | null
          usage_count: number
          usage_type: string
        }
        Insert: {
          compute_hours?: number | null
          contribution_credit_id: string
          energy_kwh?: number | null
          id?: string
          recorded_at?: string
          storage_bytes?: number | null
          usage_context?: Json | null
          usage_count?: number
          usage_type: string
        }
        Update: {
          compute_hours?: number | null
          contribution_credit_id?: string
          energy_kwh?: number | null
          id?: string
          recorded_at?: string
          storage_bytes?: number | null
          usage_context?: Json | null
          usage_count?: number
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_contribution_credit_id_fkey"
            columns: ["contribution_credit_id"]
            isOneToOne: false
            referencedRelation: "credit_contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_value: {
        Row: {
          amount: number
          contribution_credit_id: string | null
          created_at: string
          currency: string
          deal_room_id: string
          id: string
          metadata: Json | null
          source_description: string | null
          value_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          contribution_credit_id?: string | null
          created_at?: string
          currency?: string
          deal_room_id: string
          id?: string
          metadata?: Json | null
          source_description?: string | null
          value_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          contribution_credit_id?: string | null
          created_at?: string
          currency?: string
          deal_room_id?: string
          id?: string
          metadata?: Json | null
          source_description?: string | null
          value_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_value_contribution_credit_id_fkey"
            columns: ["contribution_credit_id"]
            isOneToOne: false
            referencedRelation: "credit_contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_value_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          activity_type: string
          assigned_agent_id: string | null
          attendee_emails: string[] | null
          client_id: string | null
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          contribution_emitted: boolean | null
          created_at: string
          credit_emitted: boolean | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          end_time: string | null
          estimated_value_weight: number | null
          id: string
          linked_agent_id: string | null
          linked_opportunity_id: string | null
          location: string | null
          meeting_link: string | null
          outcome: string | null
          priority: string | null
          requires_xodiak_log: boolean | null
          start_time: string | null
          status: string | null
          subject: string
          tags: string[] | null
          task_type: Database["public"]["Enums"]["task_contributor_type"] | null
          updated_at: string
          user_id: string
          value_category:
            | Database["public"]["Enums"]["task_value_category"]
            | null
        }
        Insert: {
          activity_type: string
          assigned_agent_id?: string | null
          attendee_emails?: string[] | null
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          contribution_emitted?: boolean | null
          created_at?: string
          credit_emitted?: boolean | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          estimated_value_weight?: number | null
          id?: string
          linked_agent_id?: string | null
          linked_opportunity_id?: string | null
          location?: string | null
          meeting_link?: string | null
          outcome?: string | null
          priority?: string | null
          requires_xodiak_log?: boolean | null
          start_time?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          task_type?:
            | Database["public"]["Enums"]["task_contributor_type"]
            | null
          updated_at?: string
          user_id: string
          value_category?:
            | Database["public"]["Enums"]["task_value_category"]
            | null
        }
        Update: {
          activity_type?: string
          assigned_agent_id?: string | null
          attendee_emails?: string[] | null
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          contribution_emitted?: boolean | null
          created_at?: string
          credit_emitted?: boolean | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          estimated_value_weight?: number | null
          id?: string
          linked_agent_id?: string | null
          linked_opportunity_id?: string | null
          location?: string | null
          meeting_link?: string | null
          outcome?: string | null
          priority?: string | null
          requires_xodiak_log?: boolean | null
          start_time?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          task_type?:
            | Database["public"]["Enums"]["task_contributor_type"]
            | null
          updated_at?: string
          user_id?: string
          value_category?:
            | Database["public"]["Enums"]["task_value_category"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "crm_activities_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "instincts_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_linked_agent_id_fkey"
            columns: ["linked_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "crm_activities_linked_agent_id_fkey"
            columns: ["linked_agent_id"]
            isOneToOne: false
            referencedRelation: "instincts_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_linked_opportunity_id_fkey"
            columns: ["linked_opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          city: string | null
          client_id: string | null
          country: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          email: string | null
          employee_count: number | null
          external_crm_id: string | null
          external_crm_type: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          source: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          client_id?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          external_crm_id?: string | null
          external_crm_type?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          client_id?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          external_crm_id?: string | null
          external_crm_type?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_companies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_company_relationships: {
        Row: {
          billing_entity: string | null
          child_company_id: string
          created_at: string
          id: string
          notes: string | null
          parent_company_id: string
          relationship_type: string
        }
        Insert: {
          billing_entity?: string | null
          child_company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_company_id: string
          relationship_type: string
        }
        Update: {
          billing_entity?: string | null
          child_company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_company_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_company_relationships_child_company_id_fkey"
            columns: ["child_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_company_relationships_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contact_notes: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          client_id: string | null
          company_id: string | null
          country: string | null
          created_at: string
          custom_fields: Json | null
          department: string | null
          email: string
          external_crm_id: string | null
          external_crm_type: string | null
          external_source_id: string | null
          first_name: string
          id: string
          last_name: string
          lead_score: number | null
          lead_source: string | null
          lead_status: string | null
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          source_ecosystem_app_id: string | null
          state: string | null
          sync_metadata: Json | null
          tags: string[] | null
          title: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          client_id?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email: string
          external_crm_id?: string | null
          external_crm_type?: string | null
          external_source_id?: string | null
          first_name: string
          id?: string
          last_name: string
          lead_score?: number | null
          lead_source?: string | null
          lead_status?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          source_ecosystem_app_id?: string | null
          state?: string | null
          sync_metadata?: Json | null
          tags?: string[] | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          client_id?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          department?: string | null
          email?: string
          external_crm_id?: string | null
          external_crm_type?: string | null
          external_source_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lead_score?: number | null
          lead_source?: string | null
          lead_status?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          source_ecosystem_app_id?: string | null
          state?: string | null
          sync_metadata?: Json | null
          tags?: string[] | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_source_ecosystem_app_id_fkey"
            columns: ["source_ecosystem_app_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_custom_properties: {
        Row: {
          created_at: string | null
          default_value: string | null
          description: string | null
          display_order: number | null
          entity_type: string
          field_type: string | null
          group_name: string | null
          id: string
          is_required: boolean | null
          is_unique: boolean | null
          options: Json | null
          property_label: string
          property_name: string
          property_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          display_order?: number | null
          entity_type: string
          field_type?: string | null
          group_name?: string | null
          id?: string
          is_required?: boolean | null
          is_unique?: boolean | null
          options?: Json | null
          property_label: string
          property_name: string
          property_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          display_order?: number | null
          entity_type?: string
          field_type?: string | null
          group_name?: string | null
          id?: string
          is_required?: boolean | null
          is_unique?: boolean | null
          options?: Json | null
          property_label?: string
          property_name?: string
          property_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_deal_documents: {
        Row: {
          client_id: string | null
          deal_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          notes: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          deal_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          notes?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          deal_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          deal_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          deal_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          deal_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          actual_close_date: string | null
          amount: number | null
          client_id: string | null
          commission_rate: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          currency: string | null
          custom_fields: Json | null
          deal_type: string | null
          description: string | null
          expected_close_date: string | null
          external_crm_id: string | null
          external_crm_type: string | null
          id: string
          name: string
          probability: number | null
          recurring_revenue: number | null
          recurring_type: string | null
          stage: string
          status: string | null
          tags: string[] | null
          updated_at: string
          upfront_amount: number | null
          user_id: string
        }
        Insert: {
          actual_close_date?: string | null
          amount?: number | null
          client_id?: string | null
          commission_rate?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          custom_fields?: Json | null
          deal_type?: string | null
          description?: string | null
          expected_close_date?: string | null
          external_crm_id?: string | null
          external_crm_type?: string | null
          id?: string
          name: string
          probability?: number | null
          recurring_revenue?: number | null
          recurring_type?: string | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          upfront_amount?: number | null
          user_id: string
        }
        Update: {
          actual_close_date?: string | null
          amount?: number | null
          client_id?: string | null
          commission_rate?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          custom_fields?: Json | null
          deal_type?: string | null
          description?: string | null
          expected_close_date?: string | null
          external_crm_id?: string | null
          external_crm_type?: string | null
          id?: string
          name?: string
          probability?: number | null
          recurring_revenue?: number | null
          recurring_type?: string | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          upfront_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_integrations: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          config: Json | null
          created_at: string
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          sync_errors: Json | null
          sync_status: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          sync_errors?: Json | null
          sync_status?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          sync_errors?: Json | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      crm_sync_logs: {
        Row: {
          completed_at: string | null
          error_details: Json | null
          id: string
          integration_id: string | null
          records_failed: number | null
          records_synced: number | null
          started_at: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          integration_id?: string | null
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string
          status: string
          sync_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          integration_id?: string | null
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "crm_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_products: {
        Row: {
          created_at: string
          id: string
          license_terms: string | null
          name: string
          privacy_level: Database["public"]["Enums"]["privacy_level"]
          purpose: string | null
          revenue_share_pct: number | null
          sampling: string | null
          schema_json: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_terms?: string | null
          name: string
          privacy_level?: Database["public"]["Enums"]["privacy_level"]
          purpose?: string | null
          revenue_share_pct?: number | null
          sampling?: string | null
          schema_json?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          license_terms?: string | null
          name?: string
          privacy_level?: Database["public"]["Enums"]["privacy_level"]
          purpose?: string | null
          revenue_share_pct?: number | null
          sampling?: string | null
          schema_json?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      deal_agreement_audit_log: {
        Row: {
          action: string
          created_at: string | null
          deal_room_id: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          participant_id: string | null
          term_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          deal_room_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          participant_id?: string | null
          term_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          deal_room_id?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          participant_id?: string | null
          term_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_agreement_audit_log_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_agreement_audit_log_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_agreement_audit_log_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "deal_room_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_agreements: {
        Row: {
          created_at: string
          deal_room_id: string
          executed_at: string | null
          id: string
          legal_contract_text: string | null
          plain_english_text: string | null
          smart_contract_logic: Json | null
          structure_id: string
        }
        Insert: {
          created_at?: string
          deal_room_id: string
          executed_at?: string | null
          id?: string
          legal_contract_text?: string | null
          plain_english_text?: string | null
          smart_contract_logic?: Json | null
          structure_id: string
        }
        Update: {
          created_at?: string
          deal_room_id?: string
          executed_at?: string | null
          id?: string
          legal_contract_text?: string | null
          plain_english_text?: string | null
          smart_contract_logic?: Json | null
          structure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_agreements_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_agreements_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "deal_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_ai_analyses: {
        Row: {
          analysis_data: Json
          analysis_type: string
          created_at: string
          deal_room_id: string
          fairness_score: number | null
          flags: string[] | null
          id: string
        }
        Insert: {
          analysis_data?: Json
          analysis_type: string
          created_at?: string
          deal_room_id: string
          fairness_score?: number | null
          flags?: string[] | null
          id?: string
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          created_at?: string
          deal_room_id?: string
          fairness_score?: number | null
          flags?: string[] | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_ai_analyses_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_audit_actions: {
        Row: {
          action_details: Json
          action_type: string
          auditor_user_id: string
          created_at: string
          deal_room_id: string
          id: string
          notes: string | null
          result: string | null
        }
        Insert: {
          action_details?: Json
          action_type: string
          auditor_user_id: string
          created_at?: string
          deal_room_id: string
          id?: string
          notes?: string | null
          result?: string | null
        }
        Update: {
          action_details?: Json
          action_type?: string
          auditor_user_id?: string
          created_at?: string
          deal_room_id?: string
          id?: string
          notes?: string | null
          result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_audit_actions_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_comments: {
        Row: {
          content: string
          created_at: string
          deal_room_id: string
          id: string
          is_voice_note: boolean
          parent_comment_id: string | null
          participant_id: string
          structure_id: string | null
          voice_note_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deal_room_id: string
          id?: string
          is_voice_note?: boolean
          parent_comment_id?: string | null
          participant_id: string
          structure_id?: string | null
          voice_note_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deal_room_id?: string
          id?: string
          is_voice_note?: boolean
          parent_comment_id?: string | null
          participant_id?: string
          structure_id?: string | null
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_comments_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "deal_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_comments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_comments_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "deal_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_contributions: {
        Row: {
          additional_notes: string | null
          capital_amount: number | null
          capital_resources: string | null
          created_at: string
          deal_room_id: string
          desired_compensations: Database["public"]["Enums"]["compensation_type"][]
          expected_role:
            | Database["public"]["Enums"]["deal_participant_role"]
            | null
          id: string
          is_current: boolean
          network_clients: string | null
          network_distribution: string | null
          network_partners: string | null
          participant_id: string
          risk_financial: string | null
          risk_legal: string | null
          risk_reputational: string | null
          technical_contribution: string | null
          technical_ip_description: string | null
          technical_ip_involved: boolean
          time_description: string | null
          time_hours_per_month: number | null
          time_percentage: number | null
          updated_at: string
          version: number
        }
        Insert: {
          additional_notes?: string | null
          capital_amount?: number | null
          capital_resources?: string | null
          created_at?: string
          deal_room_id: string
          desired_compensations?: Database["public"]["Enums"]["compensation_type"][]
          expected_role?:
            | Database["public"]["Enums"]["deal_participant_role"]
            | null
          id?: string
          is_current?: boolean
          network_clients?: string | null
          network_distribution?: string | null
          network_partners?: string | null
          participant_id: string
          risk_financial?: string | null
          risk_legal?: string | null
          risk_reputational?: string | null
          technical_contribution?: string | null
          technical_ip_description?: string | null
          technical_ip_involved?: boolean
          time_description?: string | null
          time_hours_per_month?: number | null
          time_percentage?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          additional_notes?: string | null
          capital_amount?: number | null
          capital_resources?: string | null
          created_at?: string
          deal_room_id?: string
          desired_compensations?: Database["public"]["Enums"]["compensation_type"][]
          expected_role?:
            | Database["public"]["Enums"]["deal_participant_role"]
            | null
          id?: string
          is_current?: boolean
          network_clients?: string | null
          network_distribution?: string | null
          network_partners?: string | null
          participant_id?: string
          risk_financial?: string | null
          risk_legal?: string | null
          risk_reputational?: string | null
          technical_contribution?: string | null
          technical_ip_description?: string | null
          technical_ip_involved?: boolean
          time_description?: string | null
          time_hours_per_month?: number | null
          time_percentage?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_contributions_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_contributions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_exits: {
        Row: {
          ai_exit_summary: string | null
          deal_room_id: string
          exit_reason: string | null
          exited_at: string
          id: string
          ip_boundaries: Json | null
          non_usage_confirmed: boolean
          participant_id: string
        }
        Insert: {
          ai_exit_summary?: string | null
          deal_room_id: string
          exit_reason?: string | null
          exited_at?: string
          id?: string
          ip_boundaries?: Json | null
          non_usage_confirmed?: boolean
          participant_id: string
        }
        Update: {
          ai_exit_summary?: string | null
          deal_room_id?: string
          exit_reason?: string | null
          exited_at?: string
          id?: string
          ip_boundaries?: Json | null
          non_usage_confirmed?: boolean
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_exits_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_exits_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_message_quality_ratings: {
        Row: {
          created_at: string
          id: string
          is_actionable: boolean | null
          is_garbage: boolean | null
          is_insightful: boolean | null
          message_id: string
          notes: string | null
          quality_score: number
          rated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_actionable?: boolean | null
          is_garbage?: boolean | null
          is_insightful?: boolean | null
          message_id: string
          notes?: string | null
          quality_score: number
          rated_by: string
        }
        Update: {
          created_at?: string
          id?: string
          is_actionable?: boolean | null
          is_garbage?: boolean | null
          is_insightful?: boolean | null
          message_id?: string
          notes?: string | null
          quality_score?: number
          rated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_message_quality_ratings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "deal_room_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_participant_consents: {
        Row: {
          consent_notes: string | null
          consent_status: string
          consented_at: string | null
          created_at: string
          deal_room_id: string
          formulation_id: string | null
          id: string
          participant_id: string
          updated_at: string
        }
        Insert: {
          consent_notes?: string | null
          consent_status: string
          consented_at?: string | null
          created_at?: string
          deal_room_id: string
          formulation_id?: string | null
          id?: string
          participant_id: string
          updated_at?: string
        }
        Update: {
          consent_notes?: string | null
          consent_status?: string
          consented_at?: string | null
          created_at?: string
          deal_room_id?: string
          formulation_id?: string | null
          id?: string
          participant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_participant_consents_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_participant_consents_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_payout_preferences: {
        Row: {
          bank_account_connected: boolean
          created_at: string
          crypto_wallet_connected: boolean
          id: string
          metadata: Json
          participant_id: string
          preferred_method: string | null
          tax_entity_type: string | null
          tax_jurisdiction: string | null
          updated_at: string
        }
        Insert: {
          bank_account_connected?: boolean
          created_at?: string
          crypto_wallet_connected?: boolean
          id?: string
          metadata?: Json
          participant_id: string
          preferred_method?: string | null
          tax_entity_type?: string | null
          tax_jurisdiction?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_connected?: boolean
          created_at?: string
          crypto_wallet_connected?: boolean
          id?: string
          metadata?: Json
          participant_id?: string
          preferred_method?: string | null
          tax_entity_type?: string | null
          tax_jurisdiction?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_payout_preferences_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_proposal_votes: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          participant_id: string
          proposal_id: string
          vote: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          participant_id: string
          proposal_id: string
          vote: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          participant_id?: string
          proposal_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_proposal_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "deal_room_change_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_reports: {
        Row: {
          attribution_breakdown: Json
          deal_room_id: string
          generated_at: string
          id: string
          ip_usage_log: Json
          payout_summary: Json
          report_period_end: string
          report_period_start: string
          total_revenue: number | null
        }
        Insert: {
          attribution_breakdown?: Json
          deal_room_id: string
          generated_at?: string
          id?: string
          ip_usage_log?: Json
          payout_summary?: Json
          report_period_end: string
          report_period_start: string
          total_revenue?: number | null
        }
        Update: {
          attribution_breakdown?: Json
          deal_room_id?: string
          generated_at?: string
          id?: string
          ip_usage_log?: Json
          payout_summary?: Json
          report_period_end?: string
          report_period_start?: string
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_reports_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_advisors: {
        Row: {
          accepted_at: string | null
          advisor_type: string
          created_at: string
          deal_room_id: string
          email: string
          firm_name: string | null
          id: string
          invitation_status: string
          invited_at: string
          invited_by_participant_id: string | null
          name: string
          permissions: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          advisor_type: string
          created_at?: string
          deal_room_id: string
          email: string
          firm_name?: string | null
          id?: string
          invitation_status?: string
          invited_at?: string
          invited_by_participant_id?: string | null
          name: string
          permissions?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          advisor_type?: string
          created_at?: string
          deal_room_id?: string
          email?: string
          firm_name?: string | null
          id?: string
          invitation_status?: string
          invited_at?: string
          invited_by_participant_id?: string | null
          name?: string
          permissions?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_advisors_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_advisors_invited_by_participant_id_fkey"
            columns: ["invited_by_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_attribution_rules: {
        Row: {
          applies_to_credit_type: string | null
          created_at: string | null
          formulation_id: string | null
          id: string
          priority: number | null
          rule_config: Json
          rule_name: string
          rule_type: string
        }
        Insert: {
          applies_to_credit_type?: string | null
          created_at?: string | null
          formulation_id?: string | null
          id?: string
          priority?: number | null
          rule_config?: Json
          rule_name: string
          rule_type: string
        }
        Update: {
          applies_to_credit_type?: string | null
          created_at?: string | null
          formulation_id?: string | null
          id?: string
          priority?: number | null
          rule_config?: Json
          rule_name?: string
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_attribution_rules_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "deal_room_formulations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_change_orders: {
        Row: {
          approved_by: Json | null
          change_description: string
          change_type: string
          created_at: string
          deal_room_id: string
          entity_id: string | null
          entity_type: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          rejected_by: string | null
          rejection_reason: string | null
          requested_by: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          approved_by?: Json | null
          change_description: string
          change_type: string
          created_at?: string
          deal_room_id: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          approved_by?: Json | null
          change_description?: string
          change_type?: string
          created_at?: string
          deal_room_id?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_change_orders_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_change_proposals: {
        Row: {
          admin_notes: string | null
          admin_visibility_decision: string | null
          admin_visibility_decision_at: string | null
          created_at: string
          current_state: Json | null
          deal_room_id: string
          description: string
          id: string
          proposal_type: string
          proposed_by_participant_id: string
          proposed_state: Json | null
          status: string
          supporting_message_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          admin_visibility_decision?: string | null
          admin_visibility_decision_at?: string | null
          created_at?: string
          current_state?: Json | null
          deal_room_id: string
          description: string
          id?: string
          proposal_type: string
          proposed_by_participant_id: string
          proposed_state?: Json | null
          status?: string
          supporting_message_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          admin_visibility_decision?: string | null
          admin_visibility_decision_at?: string | null
          created_at?: string
          current_state?: Json | null
          deal_room_id?: string
          description?: string
          id?: string
          proposal_type?: string
          proposed_by_participant_id?: string
          proposed_state?: Json | null
          status?: string
          supporting_message_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_change_proposals_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_change_proposals_proposed_by_participant_id_fkey"
            columns: ["proposed_by_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_change_proposals_supporting_message_id_fkey"
            columns: ["supporting_message_id"]
            isOneToOne: false
            referencedRelation: "deal_room_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_clarifications: {
        Row: {
          answered_at: string | null
          answered_by: string | null
          created_at: string
          deal_room_id: string
          id: string
          is_required: boolean
          question_key: string
          question_text: string
          response_options: Json | null
          response_text: string | null
          response_value: string | null
          target_participant_id: string | null
        }
        Insert: {
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          deal_room_id: string
          id?: string
          is_required?: boolean
          question_key: string
          question_text: string
          response_options?: Json | null
          response_text?: string | null
          response_value?: string | null
          target_participant_id?: string | null
        }
        Update: {
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          deal_room_id?: string
          id?: string
          is_required?: boolean
          question_key?: string
          question_text?: string
          response_options?: Json | null
          response_text?: string | null
          response_value?: string | null
          target_participant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_clarifications_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_clarifications_target_participant_id_fkey"
            columns: ["target_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_credit_rules: {
        Row: {
          action_to_usd: number | null
          active: boolean | null
          attribution_rules: Json | null
          compute_to_usd: number | null
          created_at: string | null
          deal_room_id: string
          id: string
          min_payout_threshold: number | null
          outcome_to_usd: number | null
          payout_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          action_to_usd?: number | null
          active?: boolean | null
          attribution_rules?: Json | null
          compute_to_usd?: number | null
          created_at?: string | null
          deal_room_id: string
          id?: string
          min_payout_threshold?: number | null
          outcome_to_usd?: number | null
          payout_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          action_to_usd?: number | null
          active?: boolean | null
          attribution_rules?: Json | null
          compute_to_usd?: number | null
          created_at?: string | null
          deal_room_id?: string
          id?: string
          min_payout_threshold?: number | null
          outcome_to_usd?: number | null
          payout_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deal_room_distributions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          deal_room_id: string
          distribution_rule: string | null
          formulation_id: string | null
          id: string
          inflow_id: string
          percentage_share: number
          recipient_participant_id: string
          recipient_wallet_id: string
          status: string
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          deal_room_id: string
          distribution_rule?: string | null
          formulation_id?: string | null
          id?: string
          inflow_id: string
          percentage_share: number
          recipient_participant_id: string
          recipient_wallet_id: string
          status?: string
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          deal_room_id?: string
          distribution_rule?: string | null
          formulation_id?: string | null
          id?: string
          inflow_id?: string
          percentage_share?: number
          recipient_participant_id?: string
          recipient_wallet_id?: string
          status?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_distributions_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_distributions_inflow_id_fkey"
            columns: ["inflow_id"]
            isOneToOne: false
            referencedRelation: "deal_room_inflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_distributions_recipient_participant_id_fkey"
            columns: ["recipient_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_distributions_recipient_wallet_id_fkey"
            columns: ["recipient_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_escrow: {
        Row: {
          created_at: string
          currency: string
          deal_room_id: string
          escrow_address: string | null
          escrow_chain: string | null
          escrow_type: string
          id: string
          release_conditions: Json | null
          required_signatures: number | null
          signers: string[] | null
          status: string
          total_deposited: number | null
          total_released: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          deal_room_id: string
          escrow_address?: string | null
          escrow_chain?: string | null
          escrow_type: string
          id?: string
          release_conditions?: Json | null
          required_signatures?: number | null
          signers?: string[] | null
          status?: string
          total_deposited?: number | null
          total_released?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          deal_room_id?: string
          escrow_address?: string | null
          escrow_chain?: string | null
          escrow_type?: string
          id?: string
          release_conditions?: Json | null
          required_signatures?: number | null
          signers?: string[] | null
          status?: string
          total_deposited?: number | null
          total_released?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_escrow_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_formulation_reviews: {
        Row: {
          created_at: string | null
          formulation_id: string | null
          id: string
          notes: string | null
          participant_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          formulation_id?: string | null
          id?: string
          notes?: string | null
          participant_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          formulation_id?: string | null
          id?: string
          notes?: string | null
          participant_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_formulation_reviews_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "deal_room_formulations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_formulations: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string | null
          created_by: string
          deal_room_id: string | null
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string | null
          version_number: number
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string | null
          created_by: string
          deal_room_id?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
          version_number?: number
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string | null
          created_by?: string
          deal_room_id?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_formulations_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_inbound_emails: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string
          deal_room_id: string | null
          from_email: string
          from_name: string | null
          id: string
          in_reply_to: string | null
          matched_outbound_id: string | null
          matched_participant_id: string | null
          message_id: string | null
          processed: boolean | null
          subject: string | null
          to_address: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          deal_room_id?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          in_reply_to?: string | null
          matched_outbound_id?: string | null
          matched_participant_id?: string | null
          message_id?: string | null
          processed?: boolean | null
          subject?: string | null
          to_address: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          deal_room_id?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          in_reply_to?: string | null
          matched_outbound_id?: string | null
          matched_participant_id?: string | null
          message_id?: string | null
          processed?: boolean | null
          subject?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_inbound_emails_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_inbound_emails_matched_outbound_id_fkey"
            columns: ["matched_outbound_id"]
            isOneToOne: false
            referencedRelation: "deal_room_outbound_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_inbound_emails_matched_participant_id_fkey"
            columns: ["matched_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_inflows: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deal_room_id: string
          external_payment_id: string | null
          id: string
          metadata_json: Json | null
          payer_participant_id: string | null
          payment_reference: string | null
          payment_type: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          deal_room_id: string
          external_payment_id?: string | null
          id?: string
          metadata_json?: Json | null
          payer_participant_id?: string | null
          payment_reference?: string | null
          payment_type: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deal_room_id?: string
          external_payment_id?: string | null
          id?: string
          metadata_json?: Json | null
          payer_participant_id?: string | null
          payment_reference?: string | null
          payment_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_inflows_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_inflows_payer_participant_id_fkey"
            columns: ["payer_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_ingredients: {
        Row: {
          contributor_id: string
          contributor_type: string
          created_at: string | null
          credit_multiplier: number | null
          description: string | null
          formulation_id: string | null
          id: string
          ingredient_type: string
          ownership_percent: number | null
          value_weight: number | null
        }
        Insert: {
          contributor_id: string
          contributor_type: string
          created_at?: string | null
          credit_multiplier?: number | null
          description?: string | null
          formulation_id?: string | null
          id?: string
          ingredient_type: string
          ownership_percent?: number | null
          value_weight?: number | null
        }
        Update: {
          contributor_id?: string
          contributor_type?: string
          created_at?: string | null
          credit_multiplier?: number | null
          description?: string | null
          formulation_id?: string | null
          id?: string
          ingredient_type?: string
          ownership_percent?: number | null
          value_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_ingredients_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "deal_room_formulations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_integrations: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          deal_room_id: string
          id: string
          integration_type: string
          is_connected: boolean | null
          last_sync_at: string | null
          sync_preferences: Json | null
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          deal_room_id: string
          id?: string
          integration_type: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          sync_preferences?: Json | null
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          deal_room_id?: string
          id?: string
          integration_type?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          sync_preferences?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_integrations_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          access_level:
            | Database["public"]["Enums"]["deal_room_access_level"]
            | null
          allow_full_profile_setup: boolean | null
          company: string | null
          created_at: string
          deal_room_id: string
          default_permissions: string[] | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          message: string | null
          name: string | null
          platform_permissions: Json | null
          role_in_deal: string | null
          status: Database["public"]["Enums"]["deal_room_invite_status"] | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          access_level?:
            | Database["public"]["Enums"]["deal_room_access_level"]
            | null
          allow_full_profile_setup?: boolean | null
          company?: string | null
          created_at?: string
          deal_room_id: string
          default_permissions?: string[] | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          message?: string | null
          name?: string | null
          platform_permissions?: Json | null
          role_in_deal?: string | null
          status?: Database["public"]["Enums"]["deal_room_invite_status"] | null
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          access_level?:
            | Database["public"]["Enums"]["deal_room_access_level"]
            | null
          allow_full_profile_setup?: boolean | null
          company?: string | null
          created_at?: string
          deal_room_id?: string
          default_permissions?: string[] | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          name?: string | null
          platform_permissions?: Json | null
          role_in_deal?: string | null
          status?: Database["public"]["Enums"]["deal_room_invite_status"] | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_invitations_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_learning_candidates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          confidence: number
          created_at: string
          deal_room_id: string
          extracted_pattern: string | null
          id: string
          is_approved_for_learning: boolean | null
          message_id: string
          pattern_category: string | null
          rejection_reason: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          confidence?: number
          created_at?: string
          deal_room_id: string
          extracted_pattern?: string | null
          id?: string
          is_approved_for_learning?: boolean | null
          message_id: string
          pattern_category?: string | null
          rejection_reason?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          confidence?: number
          created_at?: string
          deal_room_id?: string
          extracted_pattern?: string | null
          id?: string
          is_approved_for_learning?: boolean | null
          message_id?: string
          pattern_category?: string | null
          rejection_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_learning_candidates_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_learning_candidates_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "deal_room_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_messages: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          admin_approved_by: string | null
          ai_response: string | null
          content: string
          created_at: string
          deal_room_id: string
          id: string
          message_type: string
          parent_message_id: string | null
          participant_id: string | null
          requires_admin_approval: boolean | null
          sender_type: string
          unified_message_id: string | null
          updated_at: string
          visibility: string
          visible_to_participant_ids: string[] | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          ai_response?: string | null
          content: string
          created_at?: string
          deal_room_id: string
          id?: string
          message_type: string
          parent_message_id?: string | null
          participant_id?: string | null
          requires_admin_approval?: boolean | null
          sender_type: string
          unified_message_id?: string | null
          updated_at?: string
          visibility?: string
          visible_to_participant_ids?: string[] | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          ai_response?: string | null
          content?: string
          created_at?: string
          deal_room_id?: string
          id?: string
          message_type?: string
          parent_message_id?: string | null
          participant_id?: string | null
          requires_admin_approval?: boolean | null
          sender_type?: string
          unified_message_id?: string | null
          updated_at?: string
          visibility?: string
          visible_to_participant_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_messages_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "deal_room_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_messages_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_outbound_messages: {
        Row: {
          channels: Database["public"]["Enums"]["deal_room_message_channel"][]
          content: string
          created_at: string
          deal_room_id: string
          email_message_id: string | null
          id: string
          recipient_email: string | null
          recipient_participant_id: string | null
          recipient_user_id: string | null
          reply_to_address: string | null
          sender_id: string
          sent_via_biz_dev: boolean | null
          sent_via_deal_room: boolean | null
          sent_via_email: boolean | null
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          channels?: Database["public"]["Enums"]["deal_room_message_channel"][]
          content: string
          created_at?: string
          deal_room_id: string
          email_message_id?: string | null
          id?: string
          recipient_email?: string | null
          recipient_participant_id?: string | null
          recipient_user_id?: string | null
          reply_to_address?: string | null
          sender_id: string
          sent_via_biz_dev?: boolean | null
          sent_via_deal_room?: boolean | null
          sent_via_email?: boolean | null
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          channels?: Database["public"]["Enums"]["deal_room_message_channel"][]
          content?: string
          created_at?: string
          deal_room_id?: string
          email_message_id?: string | null
          id?: string
          recipient_email?: string | null
          recipient_participant_id?: string | null
          recipient_user_id?: string | null
          reply_to_address?: string | null
          sender_id?: string
          sent_via_biz_dev?: boolean | null
          sent_via_deal_room?: boolean | null
          sent_via_email?: boolean | null
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_outbound_messages_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_outbound_messages_recipient_participant_id_fkey"
            columns: ["recipient_participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_participant_deliverables: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          deal_room_id: string
          deliverable_name: string
          description: string | null
          due_date: string | null
          id: string
          participant_id: string
          priority: string | null
          status: string
          updated_at: string
          value_attribution: number | null
          verification_criteria: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          deal_room_id: string
          deliverable_name: string
          description?: string | null
          due_date?: string | null
          id?: string
          participant_id: string
          priority?: string | null
          status?: string
          updated_at?: string
          value_attribution?: number | null
          verification_criteria?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          deal_room_id?: string
          deliverable_name?: string
          description?: string | null
          due_date?: string | null
          id?: string
          participant_id?: string
          priority?: string | null
          status?: string
          updated_at?: string
          value_attribution?: number | null
          verification_criteria?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_participant_deliverables_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participant_deliverables_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participant_deliverables_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_participant_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          created_at: string
          deal_room_id: string
          id: string
          participant_id: string
          question: string
          question_type: string
          related_deliverable_id: string | null
          related_term_id: string | null
          status: string
          visibility: string
          visible_to_participants: Json | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          deal_room_id: string
          id?: string
          participant_id: string
          question: string
          question_type?: string
          related_deliverable_id?: string | null
          related_term_id?: string | null
          status?: string
          visibility?: string
          visible_to_participants?: Json | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          deal_room_id?: string
          id?: string
          participant_id?: string
          question?: string
          question_type?: string
          related_deliverable_id?: string | null
          related_term_id?: string | null
          status?: string
          visibility?: string
          visible_to_participants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_participant_questions_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participant_questions_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participant_questions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participant_questions_related_deliverable_id_fkey"
            columns: ["related_deliverable_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participant_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participant_questions_related_term_id_fkey"
            columns: ["related_term_id"]
            isOneToOne: false
            referencedRelation: "deal_room_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_participants: {
        Row: {
          can_add_to_crm: boolean | null
          company_display_name: string | null
          company_id: string | null
          contribution_visible_to_others: boolean
          created_at: string
          deal_room_id: string
          default_permissions: Json | null
          display_mode: string | null
          display_name_override: string | null
          email: string
          has_submitted_contribution: boolean
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          is_company: boolean
          name: string
          role_type: string | null
          updated_at: string
          user_id: string | null
          visibility_config: Json | null
          wallet_address: string | null
        }
        Insert: {
          can_add_to_crm?: boolean | null
          company_display_name?: string | null
          company_id?: string | null
          contribution_visible_to_others?: boolean
          created_at?: string
          deal_room_id: string
          default_permissions?: Json | null
          display_mode?: string | null
          display_name_override?: string | null
          email: string
          has_submitted_contribution?: boolean
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          is_company?: boolean
          name: string
          role_type?: string | null
          updated_at?: string
          user_id?: string | null
          visibility_config?: Json | null
          wallet_address?: string | null
        }
        Update: {
          can_add_to_crm?: boolean | null
          company_display_name?: string | null
          company_id?: string | null
          contribution_visible_to_others?: boolean
          created_at?: string
          deal_room_id?: string
          default_permissions?: Json | null
          display_mode?: string | null
          display_name_override?: string | null
          email?: string
          has_submitted_contribution?: boolean
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          is_company?: boolean
          name?: string
          role_type?: string | null
          updated_at?: string
          user_id?: string | null
          visibility_config?: Json | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_participants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_participants_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_payouts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          calculated_at: string | null
          deal_room_id: string | null
          formulation_id: string | null
          id: string
          paid_at: string | null
          payout_breakdown: Json
          period_end: string
          period_start: string
          status: string
          total_credits_distributed: number | null
          total_revenue: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string | null
          deal_room_id?: string | null
          formulation_id?: string | null
          id?: string
          paid_at?: string | null
          payout_breakdown?: Json
          period_end: string
          period_start: string
          status?: string
          total_credits_distributed?: number | null
          total_revenue?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string | null
          deal_room_id?: string | null
          formulation_id?: string | null
          id?: string
          paid_at?: string | null
          payout_breakdown?: Json
          period_end?: string
          period_start?: string
          status?: string
          total_credits_distributed?: number | null
          total_revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_payouts_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_payouts_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "deal_room_formulations"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_permission_overrides: {
        Row: {
          created_at: string | null
          created_by: string | null
          deal_room_id: string
          expires_at: string | null
          granted: boolean
          id: string
          participant_id: string
          permission_key: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deal_room_id: string
          expires_at?: string | null
          granted?: boolean
          id?: string
          participant_id: string
          permission_key: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deal_room_id?: string
          expires_at?: string | null
          granted?: boolean
          id?: string
          participant_id?: string
          permission_key?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_permission_overrides_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_permission_overrides_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_role_templates: {
        Row: {
          color: string | null
          created_at: string | null
          deal_room_id: string
          id: string
          is_default: boolean | null
          is_system_role: boolean | null
          permissions: Json | null
          role_description: string | null
          role_name: string
          updated_at: string | null
          visibility_config: Json | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          deal_room_id: string
          id?: string
          is_default?: boolean | null
          is_system_role?: boolean | null
          permissions?: Json | null
          role_description?: string | null
          role_name: string
          updated_at?: string | null
          visibility_config?: Json | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          deal_room_id?: string
          id?: string
          is_default?: boolean | null
          is_system_role?: boolean | null
          permissions?: Json | null
          role_description?: string | null
          role_name?: string
          updated_at?: string | null
          visibility_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_role_templates_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          deal_room_id: string
          id: string
          is_active: boolean | null
          permissions: Json
          role_type: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          deal_room_id: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role_type: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          deal_room_id?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_roles_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_terms: {
        Row: {
          agreed_by: Json
          content: string
          created_at: string
          deal_room_id: string
          id: string
          is_editable: boolean
          is_required: boolean
          section_order: number
          section_type: string
          title: string
          updated_at: string
        }
        Insert: {
          agreed_by?: Json
          content: string
          created_at?: string
          deal_room_id: string
          id?: string
          is_editable?: boolean
          is_required?: boolean
          section_order?: number
          section_type: string
          title: string
          updated_at?: string
        }
        Update: {
          agreed_by?: Json
          content?: string
          created_at?: string
          deal_room_id?: string
          id?: string
          is_editable?: boolean
          is_required?: boolean
          section_order?: number
          section_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_terms_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_voting_questions: {
        Row: {
          created_at: string
          created_by: string | null
          deal_room_id: string
          id: string
          is_active: boolean
          question_text: string
          question_type: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_room_id: string
          id?: string
          is_active?: boolean
          question_text: string
          question_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_room_id?: string
          id?: string
          is_active?: boolean
          question_text?: string
          question_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_voting_questions_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_voting_responses: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          question_id: string
          reasoning: string | null
          updated_at: string
          vote_value: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          question_id: string
          reasoning?: string | null
          updated_at?: string
          vote_value: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          question_id?: string
          reasoning?: string | null
          updated_at?: string
          vote_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_voting_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_room_voting_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "deal_room_voting_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_rooms: {
        Row: {
          ai_analysis_enabled: boolean
          category: Database["public"]["Enums"]["deal_category"]
          contract_locked: boolean
          contract_locked_at: string | null
          contract_locked_by: string | null
          created_at: string
          created_by: string
          description: string | null
          expected_deal_size_max: number | null
          expected_deal_size_min: number | null
          id: string
          name: string
          status: Database["public"]["Enums"]["deal_room_status"]
          time_horizon: Database["public"]["Enums"]["deal_time_horizon"]
          updated_at: string
          voting_enabled: boolean
          voting_rule: Database["public"]["Enums"]["voting_rule"]
        }
        Insert: {
          ai_analysis_enabled?: boolean
          category: Database["public"]["Enums"]["deal_category"]
          contract_locked?: boolean
          contract_locked_at?: string | null
          contract_locked_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          expected_deal_size_max?: number | null
          expected_deal_size_min?: number | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["deal_room_status"]
          time_horizon?: Database["public"]["Enums"]["deal_time_horizon"]
          updated_at?: string
          voting_enabled?: boolean
          voting_rule?: Database["public"]["Enums"]["voting_rule"]
        }
        Update: {
          ai_analysis_enabled?: boolean
          category?: Database["public"]["Enums"]["deal_category"]
          contract_locked?: boolean
          contract_locked_at?: string | null
          contract_locked_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          expected_deal_size_max?: number | null
          expected_deal_size_min?: number | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["deal_room_status"]
          time_horizon?: Database["public"]["Enums"]["deal_time_horizon"]
          updated_at?: string
          voting_enabled?: boolean
          voting_rule?: Database["public"]["Enums"]["voting_rule"]
        }
        Relationships: []
      }
      deal_signatures: {
        Row: {
          agreement_id: string
          id: string
          participant_id: string
          signature_data: Json | null
          signature_method: string | null
          signed_at: string | null
        }
        Insert: {
          agreement_id: string
          id?: string
          participant_id: string
          signature_data?: Json | null
          signature_method?: string | null
          signed_at?: string | null
        }
        Update: {
          agreement_id?: string
          id?: string
          participant_id?: string
          signature_data?: Json | null
          signature_method?: string | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_signatures_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "deal_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_signatures_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_structures: {
        Row: {
          allocation_rules: Json
          created_at: string
          created_by: string | null
          deal_room_id: string
          exit_terms: Json
          expansion_terms: Json
          id: string
          ip_terms: Json
          is_ai_generated: boolean
          is_selected: boolean
          name: string
          payment_terms: Json
          plain_english_summary: string | null
          structure_type: string | null
          updated_at: string
        }
        Insert: {
          allocation_rules?: Json
          created_at?: string
          created_by?: string | null
          deal_room_id: string
          exit_terms?: Json
          expansion_terms?: Json
          id?: string
          ip_terms?: Json
          is_ai_generated?: boolean
          is_selected?: boolean
          name: string
          payment_terms?: Json
          plain_english_summary?: string | null
          structure_type?: string | null
          updated_at?: string
        }
        Update: {
          allocation_rules?: Json
          created_at?: string
          created_by?: string | null
          deal_room_id?: string
          exit_terms?: Json
          expansion_terms?: Json
          id?: string
          ip_terms?: Json
          is_ai_generated?: boolean
          is_selected?: boolean
          name?: string
          payment_terms?: Json
          plain_english_summary?: string | null
          structure_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_structures_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_votes: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          proposed_modifications: Json | null
          reasoning: string | null
          structure_id: string
          updated_at: string
          vote_type: Database["public"]["Enums"]["deal_vote_type"]
          vote_weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          proposed_modifications?: Json | null
          reasoning?: string | null
          structure_id: string
          updated_at?: string
          vote_type: Database["public"]["Enums"]["deal_vote_type"]
          vote_weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          proposed_modifications?: Json | null
          reasoning?: string | null
          structure_id?: string
          updated_at?: string
          vote_type?: Database["public"]["Enums"]["deal_vote_type"]
          vote_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_votes_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "deal_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_versions: {
        Row: {
          business_id: string
          config_snapshot: Json | null
          created_at: string
          deployed_at: string
          deployed_by: string | null
          deployment_url: string | null
          id: string
          is_current: boolean | null
          notes: string | null
          preview_url: string | null
          version_label: string | null
          version_number: number
          website_snapshot: Json | null
        }
        Insert: {
          business_id: string
          config_snapshot?: Json | null
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          deployment_url?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          preview_url?: string | null
          version_label?: string | null
          version_number: number
          website_snapshot?: Json | null
        }
        Update: {
          business_id?: string
          config_snapshot?: Json | null
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          deployment_url?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          preview_url?: string | null
          version_label?: string | null
          version_number?: number
          website_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_versions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      der_devices: {
        Row: {
          control_profile_json: Json | null
          created_at: string
          id: string
          interconnection_status: string | null
          mode: Database["public"]["Enums"]["operating_mode"]
          nameplate_kw: number
          site_id: string
          tech: Database["public"]["Enums"]["der_tech"]
          telemetry_topic: string | null
          updated_at: string
        }
        Insert: {
          control_profile_json?: Json | null
          created_at?: string
          id?: string
          interconnection_status?: string | null
          mode?: Database["public"]["Enums"]["operating_mode"]
          nameplate_kw: number
          site_id: string
          tech: Database["public"]["Enums"]["der_tech"]
          telemetry_topic?: string | null
          updated_at?: string
        }
        Update: {
          control_profile_json?: Json | null
          created_at?: string
          id?: string
          interconnection_status?: string | null
          mode?: Database["public"]["Enums"]["operating_mode"]
          nameplate_kw?: number
          site_id?: string
          tech?: Database["public"]["Enums"]["der_tech"]
          telemetry_topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "der_devices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      distributors: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          region: string | null
          updated_at: string
          vendor_type: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          region?: string | null
          updated_at?: string
          vendor_type?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          region?: string | null
          updated_at?: string
          vendor_type?: string | null
        }
        Relationships: []
      }
      documentation_changelog: {
        Row: {
          change_notes: string | null
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          module_key: string
          new_version: number
          old_version: number | null
          related_feature: string | null
          version_id: string | null
        }
        Insert: {
          change_notes?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          module_key: string
          new_version: number
          old_version?: number | null
          related_feature?: string | null
          version_id?: string | null
        }
        Update: {
          change_notes?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          module_key?: string
          new_version?: number
          old_version?: number | null
          related_feature?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_changelog_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "documentation_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_versions: {
        Row: {
          change_summary: string | null
          changed_by: string | null
          content: Json
          created_at: string
          id: string
          module_key: string
          subtitle: string | null
          title: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          changed_by?: string | null
          content: Json
          created_at?: string
          id?: string
          module_key: string
          subtitle?: string | null
          title: string
          version: number
        }
        Update: {
          change_summary?: string | null
          changed_by?: string | null
          content?: Json
          created_at?: string
          id?: string
          module_key?: string
          subtitle?: string | null
          title?: string
          version?: number
        }
        Relationships: []
      }
      domain_purchases: {
        Row: {
          auto_renew: boolean | null
          business_id: string | null
          created_at: string
          currency: string | null
          dns_auto_configured: boolean | null
          domain_name: string
          expires_at: string | null
          id: string
          linked_to_business_domain_id: string | null
          our_markup_cents: number | null
          purchase_price_cents: number
          registrar: string
          registrar_order_id: string | null
          registration_years: number | null
          status: string
          stripe_payment_intent_id: string | null
          total_charged_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          business_id?: string | null
          created_at?: string
          currency?: string | null
          dns_auto_configured?: boolean | null
          domain_name: string
          expires_at?: string | null
          id?: string
          linked_to_business_domain_id?: string | null
          our_markup_cents?: number | null
          purchase_price_cents: number
          registrar: string
          registrar_order_id?: string | null
          registration_years?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_charged_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          business_id?: string | null
          created_at?: string
          currency?: string | null
          dns_auto_configured?: boolean | null
          domain_name?: string
          expires_at?: string | null
          id?: string
          linked_to_business_domain_id?: string | null
          our_markup_cents?: number | null
          purchase_price_cents?: number
          registrar?: string
          registrar_order_id?: string | null
          registration_years?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_charged_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_purchases_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_purchases_linked_to_business_domain_id_fkey"
            columns: ["linked_to_business_domain_id"]
            isOneToOne: false
            referencedRelation: "business_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_registrar_connections: {
        Row: {
          access_token_encrypted: string | null
          account_email: string | null
          account_id: string | null
          connected_at: string
          created_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          refresh_token_encrypted: string | null
          registrar_id: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_email?: string | null
          account_id?: string | null
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          refresh_token_encrypted?: string | null
          registrar_id: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_email?: string | null
          account_id?: string | null
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          refresh_token_encrypted?: string | null
          registrar_id?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_registrar_connections_registrar_id_fkey"
            columns: ["registrar_id"]
            isOneToOne: false
            referencedRelation: "registrar_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_suggestions: {
        Row: {
          business_id: string | null
          checked_at: string | null
          created_at: string
          currency: string | null
          domain_name: string
          full_domain: string
          id: string
          is_available: boolean | null
          is_premium: boolean | null
          price_cents: number | null
          purchased: boolean | null
          purchased_at: string | null
          registrar: string | null
          score: number | null
          suggestion_type: string | null
          tld: string
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          checked_at?: string | null
          created_at?: string
          currency?: string | null
          domain_name: string
          full_domain: string
          id?: string
          is_available?: boolean | null
          is_premium?: boolean | null
          price_cents?: number | null
          purchased?: boolean | null
          purchased_at?: string | null
          registrar?: string | null
          score?: number | null
          suggestion_type?: string | null
          tld: string
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          checked_at?: string | null
          created_at?: string
          currency?: string | null
          domain_name?: string
          full_domain?: string
          id?: string
          is_available?: boolean | null
          is_premium?: boolean | null
          price_cents?: number | null
          purchased?: boolean | null
          purchased_at?: string | null
          registrar?: string | null
          score?: number | null
          suggestion_type?: string | null
          tld?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_suggestions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_programs: {
        Row: {
          compensation_rules_json: Json | null
          created_at: string
          id: string
          min_kw: number | null
          name: string
          program_type: Database["public"]["Enums"]["dr_program_type"]
          response_time_s: number | null
          telemetry_req_json: Json | null
          updated_at: string
        }
        Insert: {
          compensation_rules_json?: Json | null
          created_at?: string
          id?: string
          min_kw?: number | null
          name: string
          program_type: Database["public"]["Enums"]["dr_program_type"]
          response_time_s?: number | null
          telemetry_req_json?: Json | null
          updated_at?: string
        }
        Update: {
          compensation_rules_json?: Json | null
          created_at?: string
          id?: string
          min_kw?: number | null
          name?: string
          program_type?: Database["public"]["Enums"]["dr_program_type"]
          response_time_s?: number | null
          telemetry_req_json?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      driveby_lead: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          normalized_id: string | null
          notes: string | null
          place_name: string | null
          place_phone: string | null
          quality_score: number | null
          soc_code: string | null
          source_capture_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          normalized_id?: string | null
          notes?: string | null
          place_name?: string | null
          place_phone?: string | null
          quality_score?: number | null
          soc_code?: string | null
          source_capture_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          normalized_id?: string | null
          notes?: string | null
          place_name?: string | null
          place_phone?: string | null
          quality_score?: number | null
          soc_code?: string | null
          source_capture_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driveby_lead_source_capture_id_fkey"
            columns: ["source_capture_id"]
            isOneToOne: false
            referencedRelation: "field_capture"
            referencedColumns: ["id"]
          },
        ]
      }
      driveby_work_item: {
        Row: {
          assignee_ref: string | null
          assignee_type: string
          completed_at: string | null
          created_at: string | null
          due_at: string | null
          id: string
          kind: string
          lead_id: string | null
          payload: Json | null
          status: string | null
        }
        Insert: {
          assignee_ref?: string | null
          assignee_type: string
          completed_at?: string | null
          created_at?: string | null
          due_at?: string | null
          id?: string
          kind: string
          lead_id?: string | null
          payload?: Json | null
          status?: string | null
        }
        Update: {
          assignee_ref?: string | null
          assignee_type?: string
          completed_at?: string | null
          created_at?: string | null
          due_at?: string | null
          id?: string
          kind?: string
          lead_id?: string | null
          payload?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driveby_work_item_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "driveby_lead"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_app_features: {
        Row: {
          config: Json | null
          created_at: string
          ecosystem_app_id: string
          enabled_at: string | null
          enabled_by: string | null
          feature_name: string
          id: string
          is_enabled: boolean
          last_sync_at: string | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          ecosystem_app_id: string
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          ecosystem_app_id?: string
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_app_features_ecosystem_app_id_fkey"
            columns: ["ecosystem_app_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_apps: {
        Row: {
          api_key_hash: string | null
          app_type: string
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          last_heartbeat: string | null
          metadata: Json | null
          name: string
          owner_user_id: string | null
          slug: string
          status: string
          supabase_url: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key_hash?: string | null
          app_type?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_heartbeat?: string | null
          metadata?: Json | null
          name: string
          owner_user_id?: string | null
          slug: string
          status?: string
          supabase_url?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key_hash?: string | null
          app_type?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_heartbeat?: string | null
          metadata?: Json | null
          name?: string
          owner_user_id?: string | null
          slug?: string
          status?: string
          supabase_url?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_apps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_contact_sync: {
        Row: {
          contact_id: string | null
          created_at: string
          direction: string
          error_message: string | null
          external_contact_id: string | null
          id: string
          source_app_id: string | null
          sync_data: Json | null
          sync_status: string
          synced_at: string | null
          target_app_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          direction: string
          error_message?: string | null
          external_contact_id?: string | null
          id?: string
          source_app_id?: string | null
          sync_data?: Json | null
          sync_status?: string
          synced_at?: string | null
          target_app_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          direction?: string
          error_message?: string | null
          external_contact_id?: string | null
          id?: string
          source_app_id?: string | null
          sync_data?: Json | null
          sync_status?: string
          synced_at?: string | null
          target_app_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_contact_sync_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_contact_sync_source_app_id_fkey"
            columns: ["source_app_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_contact_sync_target_app_id_fkey"
            columns: ["target_app_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      email_account_history: {
        Row: {
          action: string
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          performed_by: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_identities: {
        Row: {
          connector_type: Database["public"]["Enums"]["connector_type"]
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          imap_settings: Json | null
          is_active: boolean | null
          is_primary: boolean | null
          last_sync_at: string | null
          oauth_token_encrypted: string | null
          refresh_token_encrypted: string | null
          smtp_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connector_type: Database["public"]["Enums"]["connector_type"]
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          imap_settings?: Json | null
          is_active?: boolean | null
          is_primary?: boolean | null
          last_sync_at?: string | null
          oauth_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          smtp_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connector_type?: Database["public"]["Enums"]["connector_type"]
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          imap_settings?: Json | null
          is_active?: boolean | null
          is_primary?: boolean | null
          last_sync_at?: string | null
          oauth_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          smtp_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          consent_ts: string | null
          created_at: string
          customer_id: string
          id: string
          meter_id: string | null
          program_id: string
          site_id: string | null
          status: string
          telemetry_topic: string | null
          updated_at: string
        }
        Insert: {
          consent_ts?: string | null
          created_at?: string
          customer_id: string
          id?: string
          meter_id?: string | null
          program_id: string
          site_id?: string | null
          status?: string
          telemetry_topic?: string | null
          updated_at?: string
        }
        Update: {
          consent_ts?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          meter_id?: string | null
          program_id?: string
          site_id?: string | null
          status?: string
          telemetry_topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "dr_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_risks: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          impact_score: number | null
          inherent_risk_score: number | null
          likelihood_score: number | null
          linked_deal_rooms: string[] | null
          linked_workflows: string[] | null
          mitigation_strategy: string | null
          residual_risk_score: number | null
          review_date: string | null
          risk_appetite_threshold: number | null
          risk_id: string
          risk_owner_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          impact_score?: number | null
          inherent_risk_score?: number | null
          likelihood_score?: number | null
          linked_deal_rooms?: string[] | null
          linked_workflows?: string[] | null
          mitigation_strategy?: string | null
          residual_risk_score?: number | null
          review_date?: string | null
          risk_appetite_threshold?: number | null
          risk_id: string
          risk_owner_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          impact_score?: number | null
          inherent_risk_score?: number | null
          likelihood_score?: number | null
          linked_deal_rooms?: string[] | null
          linked_workflows?: string[] | null
          mitigation_strategy?: string | null
          residual_risk_score?: number | null
          review_date?: string | null
          risk_appetite_threshold?: number | null
          risk_id?: string
          risk_owner_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      erp_documents: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          erp_config_id: string | null
          extracted_data: Json | null
          file_name: string
          file_size: number | null
          file_type: string | null
          folder_id: string | null
          id: string
          routing_recommendation: Json | null
          status: string | null
          storage_path: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          erp_config_id?: string | null
          extracted_data?: Json | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          folder_id?: string | null
          id?: string
          routing_recommendation?: Json | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          erp_config_id?: string | null
          extracted_data?: Json | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          folder_id?: string | null
          id?: string
          routing_recommendation?: Json | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_documents_erp_config_id_fkey"
            columns: ["erp_config_id"]
            isOneToOne: false
            referencedRelation: "company_erp_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "erp_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_evolution_log: {
        Row: {
          ai_reasoning: string | null
          applied_at: string | null
          change_description: string | null
          change_type: string
          erp_config_id: string | null
          id: string
          new_state: Json | null
          previous_state: Json | null
          trigger_source: string | null
        }
        Insert: {
          ai_reasoning?: string | null
          applied_at?: string | null
          change_description?: string | null
          change_type: string
          erp_config_id?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          trigger_source?: string | null
        }
        Update: {
          ai_reasoning?: string | null
          applied_at?: string | null
          change_description?: string | null
          change_type?: string
          erp_config_id?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          trigger_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_evolution_log_erp_config_id_fkey"
            columns: ["erp_config_id"]
            isOneToOne: false
            referencedRelation: "company_erp_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_folders: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          erp_config_id: string | null
          folder_type: string | null
          icon: string | null
          id: string
          metadata: Json | null
          name: string
          parent_id: string | null
          path: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          erp_config_id?: string | null
          folder_type?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name: string
          parent_id?: string | null
          path: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          erp_config_id?: string | null
          folder_type?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          path?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_folders_erp_config_id_fkey"
            columns: ["erp_config_id"]
            isOneToOne: false
            referencedRelation: "company_erp_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "erp_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_notebook_links: {
        Row: {
          created_at: string
          erp_document_id: string | null
          id: string
          notebook_id: string | null
        }
        Insert: {
          created_at?: string
          erp_document_id?: string | null
          id?: string
          notebook_id?: string | null
        }
        Update: {
          created_at?: string
          erp_document_id?: string | null
          id?: string
          notebook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_notebook_links_erp_document_id_fkey"
            columns: ["erp_document_id"]
            isOneToOne: false
            referencedRelation: "erp_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erp_notebook_links_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_templates: {
        Row: {
          created_at: string | null
          description: string | null
          folder_structure: Json
          id: string
          industry: string
          is_default: boolean | null
          name: string
          recommended_integrations: string[] | null
          recommended_workflows: string[] | null
          strategy_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          folder_structure?: Json
          id?: string
          industry: string
          is_default?: boolean | null
          name: string
          recommended_integrations?: string[] | null
          recommended_workflows?: string[] | null
          strategy_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          folder_structure?: Json
          id?: string
          industry?: string
          is_default?: boolean | null
          name?: string
          recommended_integrations?: string[] | null
          recommended_workflows?: string[] | null
          strategy_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          blockchain_tx_hash: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          escrow_id: string
          external_wallet_id: string | null
          from_address: string | null
          id: string
          metadata: Json | null
          participant_id: string | null
          status: string
          to_address: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          blockchain_tx_hash?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency: string
          escrow_id: string
          external_wallet_id?: string | null
          from_address?: string | null
          id?: string
          metadata?: Json | null
          participant_id?: string | null
          status?: string
          to_address?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          blockchain_tx_hash?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          escrow_id?: string
          external_wallet_id?: string | null
          from_address?: string | null
          id?: string
          metadata?: Json | null
          participant_id?: string | null
          status?: string
          to_address?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "deal_room_escrow"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_external_wallet_id_fkey"
            columns: ["external_wallet_id"]
            isOneToOne: false
            referencedRelation: "external_wallet_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          cost_item_id: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          quantity: number
          takeoff_item_id: string | null
          total_cost: number
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost: number
          worksheet_id: string
        }
        Insert: {
          cost_item_id?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          quantity: number
          takeoff_item_id?: string | null
          total_cost: number
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost: number
          worksheet_id: string
        }
        Update: {
          cost_item_id?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          quantity?: number
          takeoff_item_id?: string | null
          total_cost?: number
          unit?: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost?: number
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_takeoff_item_id_fkey"
            columns: ["takeoff_item_id"]
            isOneToOne: false
            referencedRelation: "takeoff_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "estimate_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_worksheets: {
        Row: {
          contingency_percent: number | null
          created_at: string
          id: string
          markup_percent: number | null
          metadata: Json | null
          name: string
          overhead_percent: number | null
          project_id: string
          status: string | null
          subtotal: number | null
          total_estimate: number | null
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          contingency_percent?: number | null
          created_at?: string
          id?: string
          markup_percent?: number | null
          metadata?: Json | null
          name: string
          overhead_percent?: number | null
          project_id: string
          status?: string | null
          subtotal?: number | null
          total_estimate?: number | null
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          contingency_percent?: number | null
          created_at?: string
          id?: string
          markup_percent?: number | null
          metadata?: Json | null
          name?: string
          overhead_percent?: number | null
          project_id?: string
          status?: string | null
          subtotal?: number | null
          total_estimate?: number | null
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_worksheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ev_sessions: {
        Row: {
          charger_asset_id: string
          created_at: string
          direction: Database["public"]["Enums"]["ev_direction"]
          id: string
          kwh: number | null
          price: number | null
          site_id: string | null
          soc_end: number | null
          soc_start: number | null
          ts_end: string | null
          ts_start: string
          vehicle_hash: string
        }
        Insert: {
          charger_asset_id: string
          created_at?: string
          direction?: Database["public"]["Enums"]["ev_direction"]
          id?: string
          kwh?: number | null
          price?: number | null
          site_id?: string | null
          soc_end?: number | null
          soc_start?: number | null
          ts_end?: string | null
          ts_start: string
          vehicle_hash: string
        }
        Update: {
          charger_asset_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["ev_direction"]
          id?: string
          kwh?: number | null
          price?: number | null
          site_id?: string | null
          soc_end?: number | null
          soc_start?: number | null
          ts_end?: string | null
          ts_start?: string
          vehicle_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "ev_sessions_charger_asset_id_fkey"
            columns: ["charger_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ev_sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          acknowledged_by: string | null
          acknowledged_ts: string | null
          asset_id: string | null
          created_at: string
          event_type: string
          id: string
          node_id: string | null
          payload_json: Json | null
          severity: Database["public"]["Enums"]["event_severity"]
          ts: string
        }
        Insert: {
          acknowledged_by?: string | null
          acknowledged_ts?: string | null
          asset_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          node_id?: string | null
          payload_json?: Json | null
          severity?: Database["public"]["Enums"]["event_severity"]
          ts?: string
        }
        Update: {
          acknowledged_by?: string | null
          acknowledged_ts?: string | null
          asset_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          node_id?: string | null
          payload_json?: Json | null
          severity?: Database["public"]["Enums"]["event_severity"]
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          completed_at: string | null
          config: Json | null
          created_at: string | null
          expires_at: string | null
          export_type: string
          file_path: string | null
          format: string
          id: string
          size_bytes: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["sync_status"] | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          expires_at?: string | null
          export_type: string
          file_path?: string | null
          format: string
          id?: string
          size_bytes?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          format?: string
          id?: string
          size_bytes?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      external_agent_activities: {
        Row: {
          activity_data: Json
          activity_type: string
          agent_id: string | null
          agent_slug: string
          attributed_to_user_id: string | null
          created_at: string
          deal_room_id: string | null
          external_platform: string
          hubspot_sync_id: string | null
          id: string
          outcome_type: string | null
          outcome_value: number | null
          synced_to_hubspot: boolean | null
          target_company_id: string | null
          target_contact_id: string | null
          target_deal_id: string | null
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          agent_id?: string | null
          agent_slug: string
          attributed_to_user_id?: string | null
          created_at?: string
          deal_room_id?: string | null
          external_platform: string
          hubspot_sync_id?: string | null
          id?: string
          outcome_type?: string | null
          outcome_value?: number | null
          synced_to_hubspot?: boolean | null
          target_company_id?: string | null
          target_contact_id?: string | null
          target_deal_id?: string | null
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          agent_id?: string | null
          agent_slug?: string
          attributed_to_user_id?: string | null
          created_at?: string
          deal_room_id?: string | null
          external_platform?: string
          hubspot_sync_id?: string | null
          id?: string
          outcome_type?: string | null
          outcome_value?: number | null
          synced_to_hubspot?: boolean | null
          target_company_id?: string | null
          target_contact_id?: string | null
          target_deal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_agent_activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "external_agent_activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "instincts_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_agent_activities_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_agent_activities_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_agent_activities_target_contact_id_fkey"
            columns: ["target_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_agent_activities_target_deal_id_fkey"
            columns: ["target_deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      external_platform_registry: {
        Row: {
          api_base_url: string | null
          can_export_data: boolean | null
          can_import_data: boolean | null
          common_gaps: string[] | null
          created_at: string
          data_types_available: string[] | null
          description: string | null
          documentation_url: string | null
          id: string
          integration_type: string[] | null
          is_active: boolean | null
          logo_url: string | null
          monthly_active_users: string | null
          oauth_authorize_url: string | null
          oauth_token_url: string | null
          optimization_score: number | null
          platform_category: string
          platform_name: string
          platform_slug: string
          platform_subcategory: string | null
          popularity_rank: number | null
          pricing_model: string | null
          realtime_sync_capable: boolean | null
          recommended_modules: string[] | null
          supported_auth_methods: string[] | null
          supported_data_formats: string[] | null
          target_audience: string[] | null
          updated_at: string
          webhook_support: boolean | null
          website_url: string | null
        }
        Insert: {
          api_base_url?: string | null
          can_export_data?: boolean | null
          can_import_data?: boolean | null
          common_gaps?: string[] | null
          created_at?: string
          data_types_available?: string[] | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          integration_type?: string[] | null
          is_active?: boolean | null
          logo_url?: string | null
          monthly_active_users?: string | null
          oauth_authorize_url?: string | null
          oauth_token_url?: string | null
          optimization_score?: number | null
          platform_category: string
          platform_name: string
          platform_slug: string
          platform_subcategory?: string | null
          popularity_rank?: number | null
          pricing_model?: string | null
          realtime_sync_capable?: boolean | null
          recommended_modules?: string[] | null
          supported_auth_methods?: string[] | null
          supported_data_formats?: string[] | null
          target_audience?: string[] | null
          updated_at?: string
          webhook_support?: boolean | null
          website_url?: string | null
        }
        Update: {
          api_base_url?: string | null
          can_export_data?: boolean | null
          can_import_data?: boolean | null
          common_gaps?: string[] | null
          created_at?: string
          data_types_available?: string[] | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          integration_type?: string[] | null
          is_active?: boolean | null
          logo_url?: string | null
          monthly_active_users?: string | null
          oauth_authorize_url?: string | null
          oauth_token_url?: string | null
          optimization_score?: number | null
          platform_category?: string
          platform_name?: string
          platform_slug?: string
          platform_subcategory?: string | null
          popularity_rank?: number | null
          pricing_model?: string | null
          realtime_sync_capable?: boolean | null
          recommended_modules?: string[] | null
          supported_auth_methods?: string[] | null
          supported_data_formats?: string[] | null
          target_audience?: string[] | null
          updated_at?: string
          webhook_support?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      external_system_authorizations: {
        Row: {
          authorization_status: string
          authorized_at: string | null
          created_at: string
          ecosystem_app_id: string | null
          error_message: string | null
          id: string
          last_crawl_at: string | null
          last_refresh_at: string | null
          metadata: Json | null
          oauth_access_token_encrypted: string | null
          oauth_refresh_token_encrypted: string | null
          platform: string
          scopes_granted: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          authorization_status?: string
          authorized_at?: string | null
          created_at?: string
          ecosystem_app_id?: string | null
          error_message?: string | null
          id?: string
          last_crawl_at?: string | null
          last_refresh_at?: string | null
          metadata?: Json | null
          oauth_access_token_encrypted?: string | null
          oauth_refresh_token_encrypted?: string | null
          platform: string
          scopes_granted?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          authorization_status?: string
          authorized_at?: string | null
          created_at?: string
          ecosystem_app_id?: string | null
          error_message?: string | null
          id?: string
          last_crawl_at?: string | null
          last_refresh_at?: string | null
          metadata?: Json | null
          oauth_access_token_encrypted?: string | null
          oauth_refresh_token_encrypted?: string | null
          platform?: string
          scopes_granted?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_system_authorizations_ecosystem_app_id_fkey"
            columns: ["ecosystem_app_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      external_wallet_connections: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          is_primary: boolean | null
          metadata: Json | null
          updated_at: string
          user_id: string
          verification_signature: string | null
          verification_status: string
          verified_at: string | null
          wallet_address: string | null
          wallet_chain: string | null
          wallet_name: string | null
          wallet_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string
          user_id: string
          verification_signature?: string | null
          verification_status?: string
          verified_at?: string | null
          wallet_address?: string | null
          wallet_chain?: string | null
          wallet_name?: string | null
          wallet_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string
          user_id?: string
          verification_signature?: string | null
          verification_status?: string
          verified_at?: string | null
          wallet_address?: string | null
          wallet_chain?: string | null
          wallet_name?: string | null
          wallet_type?: string
        }
        Relationships: []
      }
      feature_audit_log: {
        Row: {
          audit_type: string
          auditor_id: string | null
          automated: boolean | null
          created_at: string
          feature_id: string | null
          findings: Json | null
          id: string
        }
        Insert: {
          audit_type: string
          auditor_id?: string | null
          automated?: boolean | null
          created_at?: string
          feature_id?: string | null
          findings?: Json | null
          id?: string
        }
        Update: {
          audit_type?: string
          auditor_id?: string | null
          automated?: boolean | null
          created_at?: string
          feature_id?: string | null
          findings?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_audit_log_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_completeness"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_completeness: {
        Row: {
          completed_at: string | null
          component_path: string | null
          created_at: string
          database_tables: string[] | null
          edge_function: string | null
          estimated_hours: number | null
          feature_name: string
          id: string
          issues: Json | null
          last_audited_at: string | null
          module_name: string
          notes: string | null
          page_path: string | null
          priority: number | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          component_path?: string | null
          created_at?: string
          database_tables?: string[] | null
          edge_function?: string | null
          estimated_hours?: number | null
          feature_name: string
          id?: string
          issues?: Json | null
          last_audited_at?: string | null
          module_name: string
          notes?: string | null
          page_path?: string | null
          priority?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          component_path?: string | null
          created_at?: string
          database_tables?: string[] | null
          edge_function?: string | null
          estimated_hours?: number | null
          feature_name?: string
          id?: string
          issues?: Json | null
          last_audited_at?: string | null
          module_name?: string
          notes?: string | null
          page_path?: string | null
          priority?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_capture: {
        Row: {
          address: string | null
          ai_tags: string[] | null
          captured_by: string
          confidence: number | null
          created_at: string | null
          id: string
          lat: number | null
          lon: number | null
          notes: string | null
          photo_url: string | null
          raw_ocr: Json | null
          status: string | null
          ts: string | null
          voice_note_url: string | null
        }
        Insert: {
          address?: string | null
          ai_tags?: string[] | null
          captured_by: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lon?: number | null
          notes?: string | null
          photo_url?: string | null
          raw_ocr?: Json | null
          status?: string | null
          ts?: string | null
          voice_note_url?: string | null
        }
        Update: {
          address?: string | null
          ai_tags?: string[] | null
          captured_by?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lon?: number | null
          notes?: string | null
          photo_url?: string | null
          raw_ocr?: Json | null
          status?: string | null
          ts?: string | null
          voice_note_url?: string | null
        }
        Relationships: []
      }
      field_reports: {
        Row: {
          created_at: string
          crew_count: number | null
          id: string
          issues: string | null
          metadata: Json | null
          photos: Json | null
          progress_percent: number | null
          project_id: string
          report_date: string
          user_id: string
          weather: string | null
          work_performed: string | null
        }
        Insert: {
          created_at?: string
          crew_count?: number | null
          id?: string
          issues?: string | null
          metadata?: Json | null
          photos?: Json | null
          progress_percent?: number | null
          project_id: string
          report_date: string
          user_id: string
          weather?: string | null
          work_performed?: string | null
        }
        Update: {
          created_at?: string
          crew_count?: number | null
          id?: string
          issues?: string | null
          metadata?: Json | null
          photos?: Json | null
          progress_percent?: number | null
          project_id?: string
          report_date?: string
          user_id?: string
          weather?: string | null
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          account_code: string | null
          account_name: string
          account_type: string
          balance: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          parent_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_code?: string | null
          account_name: string
          account_type: string
          balance?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_code?: string | null
          account_name?: string
          account_type?: string
          balance?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          currency: string | null
          deal_id: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_number: string | null
          status: string | null
          total_amount: number
          transaction_date: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_number?: string | null
          status?: string | null
          total_amount: number
          transaction_date?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_number?: string | null
          status?: string | null
          total_amount?: number
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_data_intake: {
        Row: {
          ai_analysis: Json | null
          captured_at: string | null
          confidence_score: number | null
          created_at: string | null
          data_type: string
          detected_issues: string[] | null
          id: string
          lead_id: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          partner_id: string | null
          processed_at: string | null
          processing_status: string | null
          source_url: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          captured_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_type: string
          detected_issues?: string[] | null
          id?: string
          lead_id?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          partner_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          source_url?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          captured_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_type?: string
          detected_issues?: string[] | null
          id?: string
          lead_id?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          partner_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_data_intake_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "fleet_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_partners: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          contact_email: string | null
          contact_name: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          data_types: string[] | null
          id: string
          metadata: Json | null
          partner_name: string
          partner_type: string
          revenue_share_percent: number | null
          status: string | null
          total_data_points_received: number | null
          total_leads_generated: number | null
          total_revenue_shared: number | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          data_types?: string[] | null
          id?: string
          metadata?: Json | null
          partner_name: string
          partner_type: string
          revenue_share_percent?: number | null
          status?: string | null
          total_data_points_received?: number | null
          total_leads_generated?: number | null
          total_revenue_shared?: number | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          data_types?: string[] | null
          id?: string
          metadata?: Json | null
          partner_name?: string
          partner_type?: string
          revenue_share_percent?: number | null
          status?: string | null
          total_data_points_received?: number | null
          total_leads_generated?: number | null
          total_revenue_shared?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fleet_work_orders: {
        Row: {
          assigned_at: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          customer_rating: number | null
          escrow_funded_at: string | null
          escrow_released_at: string | null
          estimated_cost: number | null
          franchise_id: string | null
          id: string
          intake_id: string | null
          issue_description: string | null
          issue_type: string
          labor_cost: number | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          materials_advance_amount: number | null
          materials_cost: number | null
          metadata: Json | null
          order_number: string
          partner_id: string | null
          priority: string | null
          proof_after_photos: string[] | null
          proof_before_photos: string[] | null
          proof_materials_receipts: string[] | null
          smart_contract_address: string | null
          smart_contract_tx_hash: string | null
          started_at: string | null
          status: string | null
          total_cost: number | null
          updated_at: string | null
          vendor_id: string | null
          verified_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_rating?: number | null
          escrow_funded_at?: string | null
          escrow_released_at?: string | null
          estimated_cost?: number | null
          franchise_id?: string | null
          id?: string
          intake_id?: string | null
          issue_description?: string | null
          issue_type: string
          labor_cost?: number | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          materials_advance_amount?: number | null
          materials_cost?: number | null
          metadata?: Json | null
          order_number: string
          partner_id?: string | null
          priority?: string | null
          proof_after_photos?: string[] | null
          proof_before_photos?: string[] | null
          proof_materials_receipts?: string[] | null
          smart_contract_address?: string | null
          smart_contract_tx_hash?: string | null
          started_at?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          verified_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_rating?: number | null
          escrow_funded_at?: string | null
          escrow_released_at?: string | null
          estimated_cost?: number | null
          franchise_id?: string | null
          id?: string
          intake_id?: string | null
          issue_description?: string | null
          issue_type?: string
          labor_cost?: number | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          materials_advance_amount?: number | null
          materials_cost?: number | null
          metadata?: Json | null
          order_number?: string
          partner_id?: string | null
          priority?: string | null
          proof_after_photos?: string[] | null
          proof_before_photos?: string[] | null
          proof_materials_receipts?: string[] | null
          smart_contract_address?: string | null
          smart_contract_tx_hash?: string | null
          started_at?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_work_orders_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "service_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_work_orders_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "fleet_data_intake"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_work_orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "fleet_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_work_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "service_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          created_at: string
          horizon: Database["public"]["Enums"]["forecast_horizon"]
          id: string
          payload_json: Json | null
          scope: Database["public"]["Enums"]["forecast_scope"]
          ts: string
        }
        Insert: {
          created_at?: string
          horizon: Database["public"]["Enums"]["forecast_horizon"]
          id?: string
          payload_json?: Json | null
          scope: Database["public"]["Enums"]["forecast_scope"]
          ts?: string
        }
        Update: {
          created_at?: string
          horizon?: Database["public"]["Enums"]["forecast_horizon"]
          id?: string
          payload_json?: Json | null
          scope?: Database["public"]["Enums"]["forecast_scope"]
          ts?: string
        }
        Relationships: []
      }
      formulation_ingredients: {
        Row: {
          created_at: string
          formulation_id: string
          id: string
          ingredient_id: string
          license_type: string | null
          usage_weight: number | null
        }
        Insert: {
          created_at?: string
          formulation_id: string
          id?: string
          ingredient_id: string
          license_type?: string | null
          usage_weight?: number | null
        }
        Update: {
          created_at?: string
          formulation_id?: string
          id?: string
          ingredient_id?: string
          license_type?: string | null
          usage_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formulation_ingredients_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "blender_formulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formulation_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "blender_ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      formulation_version_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          changes_json: Json | null
          formulation_id: string | null
          id: string
          version: number
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          changes_json?: Json | null
          formulation_id?: string | null
          id?: string
          version: number
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          changes_json?: Json | null
          formulation_id?: string | null
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "formulation_version_history_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "blender_formulations"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_applications: {
        Row: {
          application_data: Json | null
          business_id: string | null
          capital_available: number | null
          created_at: string
          desired_location: string | null
          experience_years: number | null
          franchise_id: string
          id: string
          investment_amount: number | null
          message: string | null
          reviewed_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_data?: Json | null
          business_id?: string | null
          capital_available?: number | null
          created_at?: string
          desired_location?: string | null
          experience_years?: number | null
          franchise_id: string
          id?: string
          investment_amount?: number | null
          message?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_data?: Json | null
          business_id?: string | null
          capital_available?: number | null
          created_at?: string
          desired_location?: string | null
          experience_years?: number | null
          franchise_id?: string
          id?: string
          investment_amount?: number | null
          message?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_applications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_applications_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          naics_code: string
          naics_title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          naics_code: string
          naics_title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          naics_code?: string
          naics_title?: string
        }
        Relationships: []
      }
      franchise_reviews: {
        Row: {
          created_at: string | null
          franchise_id: string
          helpful_count: number | null
          id: string
          rating: number
          review_text: string
          title: string
          updated_at: string | null
          user_id: string
          verified_franchisee: boolean | null
        }
        Insert: {
          created_at?: string | null
          franchise_id: string
          helpful_count?: number | null
          id?: string
          rating: number
          review_text: string
          title: string
          updated_at?: string | null
          user_id: string
          verified_franchisee?: boolean | null
        }
        Update: {
          created_at?: string | null
          franchise_id?: string
          helpful_count?: number | null
          id?: string
          rating?: number
          review_text?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          verified_franchisee?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_reviews_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchises: {
        Row: {
          applications_count: number | null
          banner_url: string | null
          brand_name: string
          category_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          franchise_fee: number
          franchise_since: number | null
          future_ready: boolean | null
          id: string
          industry: string
          investment_max: number
          investment_min: number
          is_featured: boolean | null
          logo_url: string | null
          naics_code: string | null
          name: string
          predicted_year: number | null
          rating: number | null
          royalty_fee_percent: number | null
          sop_content: string | null
          status: string
          support_provided: string | null
          territories_available: number | null
          total_units: number | null
          training_duration_weeks: number | null
          training_provided: boolean | null
          updated_at: string
          user_id: string | null
          views_count: number | null
          website: string | null
          year_established: number | null
        }
        Insert: {
          applications_count?: number | null
          banner_url?: string | null
          brand_name: string
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          franchise_fee: number
          franchise_since?: number | null
          future_ready?: boolean | null
          id?: string
          industry: string
          investment_max: number
          investment_min: number
          is_featured?: boolean | null
          logo_url?: string | null
          naics_code?: string | null
          name: string
          predicted_year?: number | null
          rating?: number | null
          royalty_fee_percent?: number | null
          sop_content?: string | null
          status?: string
          support_provided?: string | null
          territories_available?: number | null
          total_units?: number | null
          training_duration_weeks?: number | null
          training_provided?: boolean | null
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
          website?: string | null
          year_established?: number | null
        }
        Update: {
          applications_count?: number | null
          banner_url?: string | null
          brand_name?: string
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          franchise_fee?: number
          franchise_since?: number | null
          future_ready?: boolean | null
          id?: string
          industry?: string
          investment_max?: number
          investment_min?: number
          is_featured?: boolean | null
          logo_url?: string | null
          naics_code?: string | null
          name?: string
          predicted_year?: number | null
          rating?: number | null
          royalty_fee_percent?: number | null
          sop_content?: string | null
          status?: string
          support_provided?: string | null
          territories_available?: number | null
          total_units?: number | null
          training_duration_weeks?: number | null
          training_provided?: boolean | null
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
          website?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "franchises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "franchise_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_applications: {
        Row: {
          amount_requested: number | null
          business_id: string | null
          created_at: string | null
          funding_type: string
          id: string
          match_score: number | null
          status: Database["public"]["Enums"]["funding_status"] | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_requested?: number | null
          business_id?: string | null
          created_at?: string | null
          funding_type: string
          id?: string
          match_score?: number | null
          status?: Database["public"]["Enums"]["funding_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_requested?: number | null
          business_id?: string | null
          created_at?: string | null
          funding_type?: string
          id?: string
          match_score?: number | null
          status?: Database["public"]["Enums"]["funding_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_applications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_blueprints: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          integrations_needed: string[] | null
          is_template: boolean | null
          metadata: Json | null
          name: string
          parsed_content: Json | null
          shared_with: string[] | null
          source_files: string[] | null
          source_type: string
          stages: Json | null
          status: string | null
          updated_at: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          integrations_needed?: string[] | null
          is_template?: boolean | null
          metadata?: Json | null
          name: string
          parsed_content?: Json | null
          shared_with?: string[] | null
          source_files?: string[] | null
          source_type: string
          stages?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          integrations_needed?: string[] | null
          is_template?: boolean | null
          metadata?: Json | null
          name?: string
          parsed_content?: Json | null
          shared_with?: string[] | null
          source_files?: string[] | null
          source_type?: string
          stages?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_blueprints_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_schedules: {
        Row: {
          accepted: boolean | null
          created_at: string
          date: string
          id: string
          schedule_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string
          date: string
          id?: string
          schedule_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          created_at?: string
          date?: string
          id?: string
          schedule_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_websites: {
        Row: {
          ai_tokens_used: number | null
          business_description: string
          business_name: string
          client_id: string | null
          created_at: string | null
          domain_slug: string
          generation_cost: number | null
          generation_method:
            | Database["public"]["Enums"]["generation_method"]
            | null
          id: string
          images_generated: number | null
          industry: string | null
          meta_description: string | null
          published_at: string | null
          sections: Json
          status: Database["public"]["Enums"]["website_status"] | null
          target_audience: string | null
          template_id: string | null
          theme: Json
          title: string
          updated_at: string | null
          user_id: string
          white_label_config_id: string | null
        }
        Insert: {
          ai_tokens_used?: number | null
          business_description: string
          business_name: string
          client_id?: string | null
          created_at?: string | null
          domain_slug: string
          generation_cost?: number | null
          generation_method?:
            | Database["public"]["Enums"]["generation_method"]
            | null
          id?: string
          images_generated?: number | null
          industry?: string | null
          meta_description?: string | null
          published_at?: string | null
          sections?: Json
          status?: Database["public"]["Enums"]["website_status"] | null
          target_audience?: string | null
          template_id?: string | null
          theme?: Json
          title: string
          updated_at?: string | null
          user_id: string
          white_label_config_id?: string | null
        }
        Update: {
          ai_tokens_used?: number | null
          business_description?: string
          business_name?: string
          client_id?: string | null
          created_at?: string | null
          domain_slug?: string
          generation_cost?: number | null
          generation_method?:
            | Database["public"]["Enums"]["generation_method"]
            | null
          id?: string
          images_generated?: number | null
          industry?: string | null
          meta_description?: string | null
          published_at?: string | null
          sections?: Json
          status?: Database["public"]["Enums"]["website_status"] | null
          target_audience?: string | null
          template_id?: string | null
          theme?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
          white_label_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_websites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_websites_white_label_config_id_fkey"
            columns: ["white_label_config_id"]
            isOneToOne: false
            referencedRelation: "white_label_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      generator_tests: {
        Row: {
          ambient_c: number | null
          asset_id: string | null
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["operating_mode"]
          notes: string | null
          operator_id: string
          result_json: Json | null
          test_stand_id: string
          ts_end: string | null
          ts_start: string
          updated_at: string
          verdict: Database["public"]["Enums"]["test_verdict"] | null
        }
        Insert: {
          ambient_c?: number | null
          asset_id?: string | null
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          notes?: string | null
          operator_id: string
          result_json?: Json | null
          test_stand_id: string
          ts_end?: string | null
          ts_start: string
          updated_at?: string
          verdict?: Database["public"]["Enums"]["test_verdict"] | null
        }
        Update: {
          ambient_c?: number | null
          asset_id?: string | null
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          notes?: string | null
          operator_id?: string
          result_json?: Json | null
          test_stand_id?: string
          ts_end?: string | null
          ts_start?: string
          updated_at?: string
          verdict?: Database["public"]["Enums"]["test_verdict"] | null
        }
        Relationships: [
          {
            foreignKeyName: "generator_tests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generator_tests_test_stand_id_fkey"
            columns: ["test_stand_id"]
            isOneToOne: false
            referencedRelation: "test_stands"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_addons: {
        Row: {
          category: string
          config_schema: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_premium: boolean | null
          is_system: boolean | null
          name: string
          slug: string
          status: string | null
          tool_id: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          is_system?: boolean | null
          name: string
          slug: string
          status?: string | null
          tool_id?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          is_system?: boolean | null
          name?: string
          slug?: string
          status?: string | null
          tool_id?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      grid_nodes: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          id: string
          lat: number | null
          lon: number | null
          name: string
          node_type: Database["public"]["Enums"]["node_type"]
          parent_id: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          lat?: number | null
          lon?: number | null
          name: string
          node_type: Database["public"]["Enums"]["node_type"]
          parent_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          lat?: number | null
          lon?: number | null
          name?: string
          node_type?: Database["public"]["Enums"]["node_type"]
          parent_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grid_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_tools_config: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          is_favorite: boolean | null
          last_used_at: string | null
          settings: Json | null
          tool_id: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          settings?: Json | null
          tool_id: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          settings?: Json | null
          tool_id?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      grid_user_addons: {
        Row: {
          addon_id: string
          config: Json | null
          enabled: boolean | null
          id: string
          installed_at: string | null
          user_id: string
        }
        Insert: {
          addon_id: string
          config?: Json | null
          enabled?: boolean | null
          id?: string
          installed_at?: string | null
          user_id: string
        }
        Update: {
          addon_id?: string
          config?: Json | null
          enabled?: boolean | null
          id?: string
          installed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grid_user_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "grid_addons"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_best_practices: {
        Row: {
          color_schemes: Json | null
          content_guidelines: string | null
          created_at: string | null
          cta_examples: string[] | null
          id: string
          industry: string
          recommended_forms: string[] | null
          recommended_sections: string[] | null
          updated_at: string | null
        }
        Insert: {
          color_schemes?: Json | null
          content_guidelines?: string | null
          created_at?: string | null
          cta_examples?: string[] | null
          id?: string
          industry: string
          recommended_forms?: string[] | null
          recommended_sections?: string[] | null
          updated_at?: string | null
        }
        Update: {
          color_schemes?: Json | null
          content_guidelines?: string | null
          created_at?: string | null
          cta_examples?: string[] | null
          id?: string
          industry?: string
          recommended_forms?: string[] | null
          recommended_sections?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ingredient_change_proposals: {
        Row: {
          approvals: Json
          change_type: string
          created_at: string
          deal_room_id: string
          id: string
          ingredient_id: string | null
          justification: string | null
          proposed_by: string
          proposed_changes: Json
          resolved_at: string | null
          status: string
        }
        Insert: {
          approvals?: Json
          change_type: string
          created_at?: string
          deal_room_id: string
          id?: string
          ingredient_id?: string | null
          justification?: string | null
          proposed_by: string
          proposed_changes?: Json
          resolved_at?: string | null
          status?: string
        }
        Update: {
          approvals?: Json
          change_type?: string
          created_at?: string
          deal_room_id?: string
          id?: string
          ingredient_id?: string | null
          justification?: string | null
          proposed_by?: string
          proposed_changes?: Json
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_change_proposals_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_change_proposals_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "blender_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_change_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      instincts_agent_runs: {
        Row: {
          agent_id: string
          completed_at: string | null
          compute_credits_consumed: number | null
          contribution_event_id: string | null
          duration_ms: number | null
          error_message: string | null
          external_apis_called: Json | null
          id: string
          input_summary: string | null
          linked_opportunity_id: string | null
          linked_task_id: string | null
          model_used: string | null
          outputs_generated: Json | null
          result: Json | null
          run_version: string | null
          started_at: string | null
          status: string
          tokens_used: number | null
          tools_called: Json | null
          trigger_context: Json | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          compute_credits_consumed?: number | null
          contribution_event_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          external_apis_called?: Json | null
          id?: string
          input_summary?: string | null
          linked_opportunity_id?: string | null
          linked_task_id?: string | null
          model_used?: string | null
          outputs_generated?: Json | null
          result?: Json | null
          run_version?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          tools_called?: Json | null
          trigger_context?: Json | null
          trigger_type: string
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          compute_credits_consumed?: number | null
          contribution_event_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          external_apis_called?: Json | null
          id?: string
          input_summary?: string | null
          linked_opportunity_id?: string | null
          linked_task_id?: string | null
          model_used?: string | null
          outputs_generated?: Json | null
          result?: Json | null
          run_version?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
          tools_called?: Json | null
          trigger_context?: Json | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instincts_agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "instincts_agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "instincts_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      instincts_agents: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          capabilities: Json | null
          category: string
          config_schema: Json | null
          created_at: string | null
          default_compute_credits: number | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          owner_id: string | null
          reusable_flag: boolean | null
          slug: string
          system_prompt: string | null
          tools_config: Json | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          capabilities?: Json | null
          category: string
          config_schema?: Json | null
          created_at?: string | null
          default_compute_credits?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          owner_id?: string | null
          reusable_flag?: boolean | null
          slug: string
          system_prompt?: string | null
          tools_config?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          capabilities?: Json | null
          category?: string
          config_schema?: Json | null
          created_at?: string | null
          default_compute_credits?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          owner_id?: string | null
          reusable_flag?: boolean | null
          slug?: string
          system_prompt?: string | null
          tools_config?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      instincts_embedding_queue: {
        Row: {
          error_message: string | null
          id: string
          processed_at: string | null
          queued_at: string
          status: string
          user_id: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          processed_at?: string | null
          queued_at?: string
          status?: string
          user_id: string
        }
        Update: {
          error_message?: string | null
          id?: string
          processed_at?: string | null
          queued_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      instincts_entity_embedding: {
        Row: {
          created_at: string | null
          embedding_vector: number[]
          embedding_version: number | null
          entity_id: string
          entity_type: string
          id: string
          last_computed_at: string | null
          traits: Json | null
        }
        Insert: {
          created_at?: string | null
          embedding_vector?: number[]
          embedding_version?: number | null
          entity_id: string
          entity_type: string
          id?: string
          last_computed_at?: string | null
          traits?: Json | null
        }
        Update: {
          created_at?: string | null
          embedding_vector?: number[]
          embedding_version?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          last_computed_at?: string | null
          traits?: Json | null
        }
        Relationships: []
      }
      instincts_events: {
        Row: {
          action: string
          category: Database["public"]["Enums"]["event_category"]
          context: Json | null
          created_at: string
          device_type: string | null
          duration_ms: number | null
          embedding_processed: boolean | null
          embedding_version: number | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          module: Database["public"]["Enums"]["platform_module"]
          referrer_url: string | null
          related_entity_ids: string[] | null
          related_user_ids: string[] | null
          sequence_position: number | null
          session_id: string | null
          source_url: string | null
          user_id: string
          value_amount: number | null
          value_currency: string | null
        }
        Insert: {
          action: string
          category: Database["public"]["Enums"]["event_category"]
          context?: Json | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          embedding_processed?: boolean | null
          embedding_version?: number | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          module: Database["public"]["Enums"]["platform_module"]
          referrer_url?: string | null
          related_entity_ids?: string[] | null
          related_user_ids?: string[] | null
          sequence_position?: number | null
          session_id?: string | null
          source_url?: string | null
          user_id: string
          value_amount?: number | null
          value_currency?: string | null
        }
        Update: {
          action?: string
          category?: Database["public"]["Enums"]["event_category"]
          context?: Json | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          embedding_processed?: boolean | null
          embedding_version?: number | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          module?: Database["public"]["Enums"]["platform_module"]
          referrer_url?: string | null
          related_entity_ids?: string[] | null
          related_user_ids?: string[] | null
          sequence_position?: number | null
          session_id?: string | null
          source_url?: string | null
          user_id?: string
          value_amount?: number | null
          value_currency?: string | null
        }
        Relationships: []
      }
      instincts_graph_edges: {
        Row: {
          edge_type: string
          first_interaction: string | null
          id: string
          interaction_count: number | null
          last_interaction: string | null
          metadata: Json | null
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          weight: number | null
        }
        Insert: {
          edge_type: string
          first_interaction?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          metadata?: Json | null
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          weight?: number | null
        }
        Update: {
          edge_type?: string
          first_interaction?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          metadata?: Json | null
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          weight?: number | null
        }
        Relationships: []
      }
      instincts_recommendations: {
        Row: {
          action_path: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          dismissed_at: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          is_completed: boolean | null
          is_dismissed: boolean | null
          metadata: Json | null
          priority_score: number | null
          reason: string | null
          recommendation_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_path?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_dismissed?: boolean | null
          metadata?: Json | null
          priority_score?: number | null
          reason?: string | null
          recommendation_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_path?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_dismissed?: boolean | null
          metadata?: Json | null
          priority_score?: number | null
          reason?: string | null
          recommendation_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      instincts_user_agents: {
        Row: {
          agent_id: string
          config: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_run_at: string | null
          run_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_run_at?: string | null
          run_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_run_at?: string | null
          run_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instincts_user_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "instincts_user_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "instincts_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      instincts_user_embedding: {
        Row: {
          action_intensity: number | null
          behavior_vector: number[]
          created_at: string | null
          diversity_score: number | null
          embedding_version: number | null
          event_count_at_computation: number | null
          id: string
          last_computed_at: string | null
          module_vectors: Json
          traits: Json
          updated_at: string | null
          user_id: string
          value_generation: number | null
        }
        Insert: {
          action_intensity?: number | null
          behavior_vector?: number[]
          created_at?: string | null
          diversity_score?: number | null
          embedding_version?: number | null
          event_count_at_computation?: number | null
          id?: string
          last_computed_at?: string | null
          module_vectors?: Json
          traits?: Json
          updated_at?: string | null
          user_id: string
          value_generation?: number | null
        }
        Update: {
          action_intensity?: number | null
          behavior_vector?: number[]
          created_at?: string | null
          diversity_score?: number | null
          embedding_version?: number | null
          event_count_at_computation?: number | null
          id?: string
          last_computed_at?: string | null
          module_vectors?: Json
          traits?: Json
          updated_at?: string | null
          user_id?: string
          value_generation?: number | null
        }
        Relationships: []
      }
      instincts_user_stats: {
        Row: {
          action_sequence_signature: string | null
          avg_session_duration_ms: number | null
          behavior_embedding: number[] | null
          communication_count: number | null
          completion_rate: number | null
          content_count: number | null
          first_event_at: string | null
          id: string
          interaction_count: number | null
          last_event_at: string | null
          module_engagement: Json | null
          navigation_count: number | null
          peak_hours: number[] | null
          preferred_modules: string[] | null
          search_count: number | null
          total_transaction_value: number | null
          traits: Json | null
          transaction_count: number | null
          updated_at: string | null
          user_id: string
          workflow_count: number | null
        }
        Insert: {
          action_sequence_signature?: string | null
          avg_session_duration_ms?: number | null
          behavior_embedding?: number[] | null
          communication_count?: number | null
          completion_rate?: number | null
          content_count?: number | null
          first_event_at?: string | null
          id?: string
          interaction_count?: number | null
          last_event_at?: string | null
          module_engagement?: Json | null
          navigation_count?: number | null
          peak_hours?: number[] | null
          preferred_modules?: string[] | null
          search_count?: number | null
          total_transaction_value?: number | null
          traits?: Json | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id: string
          workflow_count?: number | null
        }
        Update: {
          action_sequence_signature?: string | null
          avg_session_duration_ms?: number | null
          behavior_embedding?: number[] | null
          communication_count?: number | null
          completion_rate?: number | null
          content_count?: number | null
          first_event_at?: string | null
          id?: string
          interaction_count?: number | null
          last_event_at?: string | null
          module_engagement?: Json | null
          navigation_count?: number | null
          peak_hours?: number[] | null
          preferred_modules?: string[] | null
          search_count?: number | null
          total_transaction_value?: number | null
          traits?: Json | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id?: string
          workflow_count?: number | null
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          broker_contact: string | null
          carrier: string
          coverage_limit: number | null
          covered_risks: string[] | null
          created_at: string | null
          deductible: number | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          notes: string | null
          policy_document_url: string | null
          policy_number: string
          policy_type: string | null
          premium_annual: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          broker_contact?: string | null
          carrier: string
          coverage_limit?: number | null
          covered_risks?: string[] | null
          created_at?: string | null
          deductible?: number | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          policy_document_url?: string | null
          policy_number: string
          policy_type?: string | null
          premium_annual?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          broker_contact?: string | null
          carrier?: string
          coverage_limit?: number | null
          covered_risks?: string[] | null
          created_at?: string | null
          deductible?: number | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          notes?: string | null
          policy_document_url?: string | null
          policy_number?: string
          policy_type?: string | null
          premium_annual?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      interval_readings: {
        Row: {
          created_at: string
          current_a: number | null
          freq_hz: number | null
          id: string
          kvar: number | null
          kw: number | null
          kwh: number | null
          meter_id: string
          mode: Database["public"]["Enums"]["operating_mode"]
          pf: number | null
          quality_flag: string | null
          thd_pct: number | null
          ts: string
          voltage_v: number | null
        }
        Insert: {
          created_at?: string
          current_a?: number | null
          freq_hz?: number | null
          id?: string
          kvar?: number | null
          kw?: number | null
          kwh?: number | null
          meter_id: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          pf?: number | null
          quality_flag?: string | null
          thd_pct?: number | null
          ts: string
          voltage_v?: number | null
        }
        Update: {
          created_at?: string
          current_a?: number | null
          freq_hz?: number | null
          id?: string
          kvar?: number | null
          kw?: number | null
          kwh?: number | null
          meter_id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          pf?: number | null
          quality_flag?: string | null
          thd_pct?: number | null
          ts?: string
          voltage_v?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "interval_readings_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      ip_applications: {
        Row: {
          ai_analysis: Json | null
          applicant_email: string
          applicant_name: string
          application_type: string
          created_at: string
          deal_signed_at: string | null
          deal_terms: Json | null
          equity_percentage: number | null
          goods_services_description: string | null
          id: string
          invention_description: string | null
          invention_title: string | null
          mark_text: string | null
          mark_type: string | null
          payment_model: string
          royalty_percentage: number | null
          status: string
          sub_type: string
          tm_classes: string | null
          updated_at: string
          user_id: string
          uspto_confirmation_number: string | null
          uspto_filing_date: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          applicant_email: string
          applicant_name: string
          application_type: string
          created_at?: string
          deal_signed_at?: string | null
          deal_terms?: Json | null
          equity_percentage?: number | null
          goods_services_description?: string | null
          id?: string
          invention_description?: string | null
          invention_title?: string | null
          mark_text?: string | null
          mark_type?: string | null
          payment_model: string
          royalty_percentage?: number | null
          status?: string
          sub_type: string
          tm_classes?: string | null
          updated_at?: string
          user_id: string
          uspto_confirmation_number?: string | null
          uspto_filing_date?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          applicant_email?: string
          applicant_name?: string
          application_type?: string
          created_at?: string
          deal_signed_at?: string | null
          deal_terms?: Json | null
          equity_percentage?: number | null
          goods_services_description?: string | null
          id?: string
          invention_description?: string | null
          invention_title?: string | null
          mark_text?: string | null
          mark_type?: string | null
          payment_model?: string
          royalty_percentage?: number | null
          status?: string
          sub_type?: string
          tm_classes?: string | null
          updated_at?: string
          user_id?: string
          uspto_confirmation_number?: string | null
          uspto_filing_date?: string | null
        }
        Relationships: []
      }
      ip_documents: {
        Row: {
          application_id: string
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          signed: boolean | null
          signed_at: string | null
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          signed?: boolean | null
          signed_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          signed?: boolean | null
          signed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "ip_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "ip_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          error_text: string | null
          finished_at: string | null
          id: string
          payload_json: Json
          started_at: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string | null
          error_text?: string | null
          finished_at?: string | null
          id?: string
          payload_json?: Json
          started_at?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string | null
          error_text?: string | null
          finished_at?: string | null
          id?: string
          payload_json?: Json
          started_at?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      key_risk_indicators: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string
          kri_name: string
          last_updated: string | null
          metric_source: string | null
          risk_id: string | null
          threshold_critical: number | null
          threshold_warning: number | null
          trend: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          kri_name: string
          last_updated?: string | null
          metric_source?: string | null
          risk_id?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          trend?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          kri_name?: string
          last_updated?: string | null
          metric_source?: string | null
          risk_id?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          trend?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "key_risk_indicators_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "enterprise_risks"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_articles: {
        Row: {
          category: string | null
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          published_at: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      knowledge_connections: {
        Row: {
          ai_generated: boolean | null
          connection_type: string
          created_at: string | null
          id: string
          notes: string | null
          source_item_id: string
          strength: number | null
          target_item_id: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          connection_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          source_item_id: string
          strength?: number | null
          target_item_id: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          connection_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          source_item_id?: string
          strength?: number | null
          target_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_connections_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_connections_target_item_id_fkey"
            columns: ["target_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_inbox: {
        Row: {
          captured_at: string | null
          content: string | null
          file_path: string | null
          id: string
          knowledge_item_id: string | null
          metadata: Json | null
          source_platform: string | null
          source_type: string
          source_url: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          captured_at?: string | null
          content?: string | null
          file_path?: string | null
          id?: string
          knowledge_item_id?: string | null
          metadata?: Json | null
          source_platform?: string | null
          source_type?: string
          source_url?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          captured_at?: string | null
          content?: string | null
          file_path?: string | null
          id?: string
          knowledge_item_id?: string | null
          metadata?: Json | null
          source_platform?: string | null
          source_type?: string
          source_url?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_inbox_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          ai_categories: string[] | null
          ai_tags: string[] | null
          content: string | null
          created_at: string | null
          ease_factor: number | null
          embedding: Json | null
          entities: Json | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          flashcards: Json | null
          id: string
          interval_days: number | null
          is_template: boolean | null
          key_points: Json | null
          last_reviewed_at: string | null
          mastery_level: number | null
          metadata: Json | null
          next_review_at: string | null
          notebook_id: string | null
          processing_status: string | null
          review_count: number | null
          shared_with: string[] | null
          source_platform: string | null
          source_type: string
          source_url: string | null
          summary: string | null
          title: string
          transcription: string | null
          transcription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_categories?: string[] | null
          ai_tags?: string[] | null
          content?: string | null
          created_at?: string | null
          ease_factor?: number | null
          embedding?: Json | null
          entities?: Json | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          flashcards?: Json | null
          id?: string
          interval_days?: number | null
          is_template?: boolean | null
          key_points?: Json | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          metadata?: Json | null
          next_review_at?: string | null
          notebook_id?: string | null
          processing_status?: string | null
          review_count?: number | null
          shared_with?: string[] | null
          source_platform?: string | null
          source_type?: string
          source_url?: string | null
          summary?: string | null
          title: string
          transcription?: string | null
          transcription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_categories?: string[] | null
          ai_tags?: string[] | null
          content?: string | null
          created_at?: string | null
          ease_factor?: number | null
          embedding?: Json | null
          entities?: Json | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          flashcards?: Json | null
          id?: string
          interval_days?: number | null
          is_template?: boolean | null
          key_points?: Json | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          metadata?: Json | null
          next_review_at?: string | null
          notebook_id?: string | null
          processing_status?: string | null
          review_count?: number | null
          shared_with?: string[] | null
          source_platform?: string | null
          source_type?: string
          source_url?: string | null
          summary?: string | null
          title?: string
          transcription?: string | null
          transcription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_recordings: {
        Row: {
          action_items: Json | null
          created_at: string | null
          duration_seconds: number | null
          file_path: string | null
          id: string
          insights: Json | null
          key_decisions: Json | null
          knowledge_item_id: string | null
          metadata: Json | null
          participants: Json | null
          recorded_at: string | null
          recording_type: string
          sentiment: string | null
          speaker_labels: Json | null
          summary: string | null
          title: string
          topics: string[] | null
          transcription: string | null
          transcription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          file_path?: string | null
          id?: string
          insights?: Json | null
          key_decisions?: Json | null
          knowledge_item_id?: string | null
          metadata?: Json | null
          participants?: Json | null
          recorded_at?: string | null
          recording_type?: string
          sentiment?: string | null
          speaker_labels?: Json | null
          summary?: string | null
          title: string
          topics?: string[] | null
          transcription?: string | null
          transcription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          file_path?: string | null
          id?: string
          insights?: Json | null
          key_decisions?: Json | null
          knowledge_item_id?: string | null
          metadata?: Json | null
          participants?: Json | null
          recorded_at?: string | null
          recording_type?: string
          sentiment?: string | null
          speaker_labels?: Json | null
          summary?: string | null
          title?: string
          topics?: string[] | null
          transcription?: string | null
          transcription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_recordings_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_reviews: {
        Row: {
          id: string
          knowledge_item_id: string
          quality_rating: number
          reviewed_at: string | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          id?: string
          knowledge_item_id: string
          quality_rating: number
          reviewed_at?: string | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          id?: string
          knowledge_item_id?: string
          quality_rating?: number
          reviewed_at?: string | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_reviews_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_entries: {
        Row: {
          base_rate: number | null
          burden_percent: number | null
          craft: string
          created_at: string
          fringe_rate: number | null
          hours: number
          id: string
          rate_source: string | null
          total_cost: number | null
          worksheet_id: string
        }
        Insert: {
          base_rate?: number | null
          burden_percent?: number | null
          craft: string
          created_at?: string
          fringe_rate?: number | null
          hours: number
          id?: string
          rate_source?: string | null
          total_cost?: number | null
          worksheet_id: string
        }
        Update: {
          base_rate?: number | null
          burden_percent?: number | null
          craft?: string
          created_at?: string
          fringe_rate?: number | null
          hours?: number
          id?: string
          rate_source?: string | null
          total_cost?: number | null
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "labor_entries_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "estimate_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignment: {
        Row: {
          assigned_by: string | null
          bundle_id: string | null
          company_id: string | null
          id: string
          lead_id: string | null
          rationale: string | null
          ts: string | null
        }
        Insert: {
          assigned_by?: string | null
          bundle_id?: string | null
          company_id?: string | null
          id?: string
          lead_id?: string | null
          rationale?: string | null
          ts?: string | null
        }
        Update: {
          assigned_by?: string | null
          bundle_id?: string | null
          company_id?: string | null
          id?: string
          lead_id?: string | null
          rationale?: string | null
          ts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignment_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "biz_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignment_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "driveby_lead"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          framework: string
          id: string
          is_approved: boolean | null
          last_commit_at: string | null
          license_spdx: string
          name: string
          npm_url: string | null
          repo_url: string | null
          slug: string
          stars: number | null
          tags: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          framework: string
          id?: string
          is_approved?: boolean | null
          last_commit_at?: string | null
          license_spdx: string
          name: string
          npm_url?: string | null
          repo_url?: string | null
          slug: string
          stars?: number | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          framework?: string
          id?: string
          is_approved?: boolean | null
          last_commit_at?: string | null
          license_spdx?: string
          name?: string
          npm_url?: string | null
          repo_url?: string | null
          slug?: string
          stars?: number | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      library_assets: {
        Row: {
          bytes: string | null
          checksum: string
          content_type: string
          created_at: string | null
          id: string
          library_version_id: string
          path: string
        }
        Insert: {
          bytes?: string | null
          checksum: string
          content_type: string
          created_at?: string | null
          id?: string
          library_version_id: string
          path: string
        }
        Update: {
          bytes?: string | null
          checksum?: string
          content_type?: string
          created_at?: string | null
          id?: string
          library_version_id?: string
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_assets_library_version_id_fkey"
            columns: ["library_version_id"]
            isOneToOne: false
            referencedRelation: "library_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      library_versions: {
        Row: {
          changelog: string | null
          checksum: string
          id: string
          imported_at: string | null
          library_id: string
          size_kb: number | null
          tarball_url: string | null
          version: string
        }
        Insert: {
          changelog?: string | null
          checksum: string
          id?: string
          imported_at?: string | null
          library_id: string
          size_kb?: number | null
          tarball_url?: string | null
          version: string
        }
        Update: {
          changelog?: string | null
          checksum?: string
          id?: string
          imported_at?: string | null
          library_id?: string
          size_kb?: number | null
          tarball_url?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_versions_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      license_configs: {
        Row: {
          created_at: string | null
          id: string
          is_allowed: boolean
          license_id: string
          notes: string | null
          special_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_allowed: boolean
          license_id: string
          notes?: string | null
          special_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_allowed?: boolean
          license_id?: string
          notes?: string | null
          special_rules?: Json | null
        }
        Relationships: []
      }
      lindy_integrations: {
        Row: {
          agent_id: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
          webhook_url: string
          workflow_id: string
        }
        Insert: {
          agent_id: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
          webhook_url: string
          workflow_id: string
        }
        Update: {
          agent_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string
          workflow_id?: string
        }
        Relationships: []
      }
      lindy_webhooks: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          integration_id: string | null
          payload: Json
          processed: boolean
          processed_at: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          integration_id?: string | null
          payload: Json
          processed?: boolean
          processed_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          integration_id?: string | null
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lindy_webhooks_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "lindy_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_billing_accounts: {
        Row: {
          account_identifier: string
          category: string
          company_id: string | null
          connection_status: string | null
          created_at: string
          credentials_encrypted: Json | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_identifier: string
          category: string
          company_id?: string | null
          connection_status?: string | null
          created_at?: string
          credentials_encrypted?: Json | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_identifier?: string
          category?: string
          company_id?: string | null
          connection_status?: string | null
          created_at?: string
          credentials_encrypted?: Json | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linked_billing_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      marketer_profiles: {
        Row: {
          bio: string | null
          business_name: string
          case_studies: Json | null
          created_at: string
          experience_years: number | null
          id: string
          marketing_channels: string[] | null
          metadata: Json | null
          min_commission_rate: number | null
          portfolio_url: string | null
          rating: number | null
          specialization: string[] | null
          target_industries: string[] | null
          total_deals: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          business_name: string
          case_studies?: Json | null
          created_at?: string
          experience_years?: number | null
          id?: string
          marketing_channels?: string[] | null
          metadata?: Json | null
          min_commission_rate?: number | null
          portfolio_url?: string | null
          rating?: number | null
          specialization?: string[] | null
          target_industries?: string[] | null
          total_deals?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          business_name?: string
          case_studies?: Json | null
          created_at?: string
          experience_years?: number | null
          id?: string
          marketing_channels?: string[] | null
          metadata?: Json | null
          min_commission_rate?: number | null
          portfolio_url?: string | null
          rating?: number | null
          specialization?: string[] | null
          target_industries?: string[] | null
          total_deals?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          created_at: string
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          campaign_type: string
          created_at?: string
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          created_at?: string
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_content_queue: {
        Row: {
          ai_model_used: string | null
          approved_at: string | null
          approved_by: string | null
          brand_config_id: string | null
          content: string | null
          content_type: string
          created_at: string
          generation_prompt: string | null
          id: string
          market_driver: string | null
          market_driver_signal_id: string | null
          media_url: string | null
          metadata: Json | null
          priority: string | null
          scheduled_for: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_config_id?: string | null
          content?: string | null
          content_type: string
          created_at?: string
          generation_prompt?: string | null
          id?: string
          market_driver?: string | null
          market_driver_signal_id?: string | null
          media_url?: string | null
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_config_id?: string | null
          content?: string | null
          content_type?: string
          created_at?: string
          generation_prompt?: string | null
          id?: string
          market_driver?: string | null
          market_driver_signal_id?: string | null
          media_url?: string | null
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_content_queue_brand_config_id_fkey"
            columns: ["brand_config_id"]
            isOneToOne: false
            referencedRelation: "brand_marketing_config"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_deployments: {
        Row: {
          brand_config_id: string | null
          content_id: string | null
          created_at: string
          deployed_at: string | null
          deployment_target: string
          engagement_metrics: Json | null
          error_message: string | null
          external_post_id: string | null
          id: string
          platform_slug: string | null
          station_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          brand_config_id?: string | null
          content_id?: string | null
          created_at?: string
          deployed_at?: string | null
          deployment_target: string
          engagement_metrics?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          platform_slug?: string | null
          station_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          brand_config_id?: string | null
          content_id?: string | null
          created_at?: string
          deployed_at?: string | null
          deployment_target?: string
          engagement_metrics?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          id?: string
          platform_slug?: string | null
          station_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_deployments_brand_config_id_fkey"
            columns: ["brand_config_id"]
            isOneToOne: false
            referencedRelation: "brand_marketing_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_deployments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "marketing_content_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_list_members: {
        Row: {
          added_at: string | null
          contact_id: string
          id: string
          list_id: string
          status: string | null
        }
        Insert: {
          added_at?: string | null
          contact_id: string
          id?: string
          list_id: string
          status?: string | null
        }
        Update: {
          added_at?: string | null
          contact_id?: string
          id?: string
          list_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "marketing_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_lists: {
        Row: {
          created_at: string
          description: string | null
          filter_criteria: Json | null
          id: string
          list_type: string | null
          member_count: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          list_type?: string | null
          member_count?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          list_type?: string | null
          member_count?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_connections: {
        Row: {
          commission_agreed: number | null
          commission_type: Database["public"]["Enums"]["commission_type"] | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          id: string
          listing_id: string
          marketer_id: string
          notes: string | null
          product_owner_id: string
          status: Database["public"]["Enums"]["connection_status"]
          terms: Json | null
          updated_at: string
        }
        Insert: {
          commission_agreed?: number | null
          commission_type?:
            | Database["public"]["Enums"]["commission_type"]
            | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          listing_id: string
          marketer_id: string
          notes?: string | null
          product_owner_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          terms?: Json | null
          updated_at?: string
        }
        Update: {
          commission_agreed?: number | null
          commission_type?:
            | Database["public"]["Enums"]["commission_type"]
            | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          marketer_id?: string
          notes?: string | null
          product_owner_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          terms?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_connections_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_connections_marketer_id_fkey"
            columns: ["marketer_id"]
            isOneToOne: false
            referencedRelation: "marketer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string | null
          commission_details: Json | null
          commission_type: Database["public"]["Enums"]["commission_type"]
          commission_value: number
          created_at: string
          description: string | null
          expected_volume: number | null
          id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          marketing_materials_url: string | null
          metadata: Json | null
          price_range: string | null
          status: Database["public"]["Enums"]["listing_status"]
          target_market: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          commission_details?: Json | null
          commission_type?: Database["public"]["Enums"]["commission_type"]
          commission_value: number
          created_at?: string
          description?: string | null
          expected_volume?: number | null
          id?: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          marketing_materials_url?: string | null
          metadata?: Json | null
          price_range?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          target_market?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          commission_details?: Json | null
          commission_type?: Database["public"]["Enums"]["commission_type"]
          commission_value?: number
          created_at?: string
          description?: string | null
          expected_volume?: number | null
          id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          marketing_materials_url?: string | null
          metadata?: Json | null
          price_range?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          target_market?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mcp_agents: {
        Row: {
          agent_id: string
          allowed_tools: Json | null
          capabilities: Json | null
          created_at: string | null
          is_active: boolean | null
          name: string
          policy: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          allowed_tools?: Json | null
          capabilities?: Json | null
          created_at?: string | null
          is_active?: boolean | null
          name: string
          policy?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          allowed_tools?: Json | null
          capabilities?: Json | null
          created_at?: string | null
          is_active?: boolean | null
          name?: string
          policy?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mcp_code_generations: {
        Row: {
          context: string | null
          created_at: string
          generated_code: Json
          id: string
          implemented_at: string | null
          requirement: string
          reviewed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          generated_code: Json
          id?: string
          implemented_at?: string | null
          requirement: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          generated_code?: Json
          id?: string
          implemented_at?: string | null
          requirement?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mcp_context_snapshots: {
        Row: {
          actor: string
          attachments: Json | null
          created_at: string | null
          goal: string | null
          id: string
          inputs: Json | null
          user_ctx: Json
          visibility: Json | null
        }
        Insert: {
          actor: string
          attachments?: Json | null
          created_at?: string | null
          goal?: string | null
          id?: string
          inputs?: Json | null
          user_ctx: Json
          visibility?: Json | null
        }
        Update: {
          actor?: string
          attachments?: Json | null
          created_at?: string | null
          goal?: string | null
          id?: string
          inputs?: Json | null
          user_ctx?: Json
          visibility?: Json | null
        }
        Relationships: []
      }
      mcp_permissions: {
        Row: {
          action: string
          created_at: string | null
          effect: string
          id: number
          principal: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          effect: string
          id?: number
          principal: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          effect?: string
          id?: number
          principal?: string
          resource?: string
        }
        Relationships: []
      }
      mcp_task_events: {
        Row: {
          created_at: string | null
          event: string
          id: number
          payload: Json | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: number
          payload?: Json | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: number
          payload?: Json | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_task_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "mcp_tasks"
            referencedColumns: ["task_id"]
          },
        ]
      }
      mcp_tasks: {
        Row: {
          agent_id: string
          callback_url: string | null
          created_at: string | null
          created_by: string | null
          input: Json | null
          output: Json | null
          status: string
          task_id: string
          tool_id: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          callback_url?: string | null
          created_at?: string | null
          created_by?: string | null
          input?: Json | null
          output?: Json | null
          status: string
          task_id?: string
          tool_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          callback_url?: string | null
          created_at?: string | null
          created_by?: string | null
          input?: Json | null
          output?: Json | null
          status?: string
          task_id?: string
          tool_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "mcp_agents"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "mcp_tasks_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "mcp_tools"
            referencedColumns: ["tool_id"]
          },
        ]
      }
      mcp_tools: {
        Row: {
          allowed_agents: Json | null
          auth_type: string | null
          created_at: string | null
          description: string | null
          is_active: boolean | null
          name: string
          openapi_url: string | null
          scopes: Json | null
          tool_id: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          allowed_agents?: Json | null
          auth_type?: string | null
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          name: string
          openapi_url?: string | null
          scopes?: Json | null
          tool_id: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          allowed_agents?: Json | null
          auth_type?: string | null
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          name?: string
          openapi_url?: string | null
          scopes?: Json | null
          tool_id?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      measurements: {
        Row: {
          calc_method: Database["public"]["Enums"]["calc_method"]
          checksum: string | null
          created_at: string
          i_rms: number | null
          id: string
          input_mech_w: number | null
          instrument_config_json: Json | null
          p_out_w: number | null
          pf: number | null
          rpm: number | null
          test_id: string
          thd_pct: number | null
          torque_nm: number | null
          ts: string
          v_rms: number | null
        }
        Insert: {
          calc_method: Database["public"]["Enums"]["calc_method"]
          checksum?: string | null
          created_at?: string
          i_rms?: number | null
          id?: string
          input_mech_w?: number | null
          instrument_config_json?: Json | null
          p_out_w?: number | null
          pf?: number | null
          rpm?: number | null
          test_id: string
          thd_pct?: number | null
          torque_nm?: number | null
          ts: string
          v_rms?: number | null
        }
        Update: {
          calc_method?: Database["public"]["Enums"]["calc_method"]
          checksum?: string | null
          created_at?: string
          i_rms?: number | null
          id?: string
          input_mech_w?: number | null
          instrument_config_json?: Json | null
          p_out_w?: number | null
          pf?: number | null
          rpm?: number | null
          test_id?: string
          thd_pct?: number | null
          torque_nm?: number | null
          ts?: string
          v_rms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "generator_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string | null
          external_id: string | null
          filename: string
          id: string
          message_id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          filename: string
          id?: string
          message_id: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          filename?: string
          id?: string
          message_id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          bcc_emails: Json | null
          body_html: string | null
          body_text: string | null
          cc_emails: Json | null
          created_at: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          external_id: string | null
          folder: string | null
          from_email: string
          from_name: string | null
          has_attachments: boolean | null
          id: string
          identity_id: string | null
          is_read: boolean | null
          is_starred: boolean | null
          labels: Json | null
          message_date: string
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_emails: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bcc_emails?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: Json | null
          created_at?: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          external_id?: string | null
          folder?: string | null
          from_email: string
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          identity_id?: string | null
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: Json | null
          message_date: string
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bcc_emails?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: Json | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          external_id?: string | null
          folder?: string | null
          from_email?: string
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          identity_id?: string | null
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: Json | null
          message_date?: string
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "email_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      meters: {
        Row: {
          comms_path: string | null
          created_at: string
          firmware: string | null
          id: string
          interval_secs: number
          mode: Database["public"]["Enums"]["operating_mode"]
          revenue_grade: boolean | null
          service_point_id: string
          updated_at: string
        }
        Insert: {
          comms_path?: string | null
          created_at?: string
          firmware?: string | null
          id?: string
          interval_secs?: number
          mode?: Database["public"]["Enums"]["operating_mode"]
          revenue_grade?: boolean | null
          service_point_id: string
          updated_at?: string
        }
        Update: {
          comms_path?: string | null
          created_at?: string
          firmware?: string | null
          id?: string
          interval_secs?: number
          mode?: Database["public"]["Enums"]["operating_mode"]
          revenue_grade?: boolean | null
          service_point_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meters_service_point_id_fkey"
            columns: ["service_point_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_jobs: {
        Row: {
          completed_at: string | null
          config: Json | null
          connector_id: string | null
          created_at: string | null
          error_log: Json | null
          failed_records: number | null
          id: string
          migration_type: string
          processed_records: number | null
          source_system: string
          started_at: string | null
          status: Database["public"]["Enums"]["migration_status"] | null
          total_records: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          connector_id?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number | null
          id?: string
          migration_type: string
          processed_records?: number | null
          source_system: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["migration_status"] | null
          total_records?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          connector_id?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number | null
          id?: string
          migration_type?: string
          processed_records?: number | null
          source_system?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["migration_status"] | null
          total_records?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "migration_jobs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_conversations: {
        Row: {
          citations: Json | null
          content: string
          created_at: string
          id: string
          notebook_id: string
          role: string
          user_id: string
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string
          id?: string
          notebook_id: string
          role: string
          user_id: string
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string
          id?: string
          notebook_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_conversations_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_outputs: {
        Row: {
          audio_url: string | null
          content: Json
          created_at: string
          id: string
          metadata: Json | null
          notebook_id: string
          output_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          notebook_id: string
          output_type: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content?: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          notebook_id?: string
          output_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_outputs_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      notebook_sources: {
        Row: {
          content: string | null
          created_at: string
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          notebook_id: string
          platform_entity_id: string | null
          platform_entity_type: string | null
          processed_at: string | null
          processing_status: string | null
          source_type: string
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          notebook_id: string
          platform_entity_id?: string | null
          platform_entity_type?: string | null
          processed_at?: string | null
          processing_status?: string | null
          source_type: string
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          notebook_id?: string
          platform_entity_id?: string | null
          platform_entity_type?: string | null
          processed_at?: string | null
          processing_status?: string | null
          source_type?: string
          source_url?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebook_sources_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      notebooks: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          settings: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          settings?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          settings?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offers_bids: {
        Row: {
          created_at: string
          id: string
          location_node_id: string | null
          market_window: string
          price: number
          qty_kw: number
          resource_id: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          status: string
          ts: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_node_id?: string | null
          market_window: string
          price: number
          qty_kw: number
          resource_id: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          status?: string
          ts?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_node_id?: string | null
          market_window?: string
          price?: number
          qty_kw?: number
          resource_id?: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          status?: string
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_bids_location_node_id_fkey"
            columns: ["location_node_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      overhead_costs: {
        Row: {
          created_at: string
          extended_price: number | null
          id: string
          name: string
          quantity: number | null
          unit: string | null
          unit_price: number
          worksheet_id: string
        }
        Insert: {
          created_at?: string
          extended_price?: number | null
          id?: string
          name: string
          quantity?: number | null
          unit?: string | null
          unit_price: number
          worksheet_id: string
        }
        Update: {
          created_at?: string
          extended_price?: number | null
          id?: string
          name?: string
          quantity?: number | null
          unit?: string | null
          unit_price?: number
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "overhead_costs_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "estimate_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_data_requests: {
        Row: {
          created_at: string
          deal_room_id: string
          export_file_path: string | null
          id: string
          participant_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          request_type: string
          status: string
        }
        Insert: {
          created_at?: string
          deal_room_id: string
          export_file_path?: string | null
          id?: string
          participant_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          request_type: string
          status?: string
        }
        Update: {
          created_at?: string
          deal_room_id?: string
          export_file_path?: string | null
          id?: string
          participant_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          request_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_data_requests_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_data_requests_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_wallet_connections: {
        Row: {
          auto_distribute_enabled: boolean
          created_at: string
          deal_room_id: string | null
          id: string
          is_primary: boolean
          user_id: string
          wallet_id: string
        }
        Insert: {
          auto_distribute_enabled?: boolean
          created_at?: string
          deal_room_id?: string | null
          id?: string
          is_primary?: boolean
          user_id: string
          wallet_id: string
        }
        Update: {
          auto_distribute_enabled?: boolean
          created_at?: string
          deal_room_id?: string | null
          id?: string
          is_primary?: boolean
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_wallet_connections_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_wallet_connections_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          commission_earned: number | null
          commission_paid: boolean | null
          connection_id: string
          conversions: number | null
          created_at: string
          id: string
          leads_generated: number | null
          metadata: Json | null
          metric_date: string
          notes: string | null
          revenue_generated: number | null
          roi_percentage: number | null
        }
        Insert: {
          commission_earned?: number | null
          commission_paid?: boolean | null
          connection_id: string
          conversions?: number | null
          created_at?: string
          id?: string
          leads_generated?: number | null
          metadata?: Json | null
          metric_date?: string
          notes?: string | null
          revenue_generated?: number | null
          roi_percentage?: number | null
        }
        Update: {
          commission_earned?: number | null
          commission_paid?: boolean | null
          connection_id?: string
          conversions?: number | null
          created_at?: string
          id?: string
          leads_generated?: number | null
          metadata?: Json | null
          metric_date?: string
          notes?: string | null
          revenue_generated?: number | null
          roi_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "marketplace_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_asset_snapshots: {
        Row: {
          available_hours_weekly: number | null
          content_pieces_count: number | null
          created_at: string
          credit_balance: number | null
          documented_knowledge_count: number | null
          energy_score: number | null
          focus_capacity_score: number | null
          id: string
          key_relationships: Json | null
          metadata: Json | null
          network_size: number | null
          peak_productivity_hours: Json | null
          pending_payouts: number | null
          relationship_strength_avg: number | null
          skill_scores: Json | null
          skills_inventory: Json | null
          snapshot_date: string
          spawned_businesses_count: number | null
          sustainability_index: number | null
          total_asset_value: number | null
          total_earnings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_hours_weekly?: number | null
          content_pieces_count?: number | null
          created_at?: string
          credit_balance?: number | null
          documented_knowledge_count?: number | null
          energy_score?: number | null
          focus_capacity_score?: number | null
          id?: string
          key_relationships?: Json | null
          metadata?: Json | null
          network_size?: number | null
          peak_productivity_hours?: Json | null
          pending_payouts?: number | null
          relationship_strength_avg?: number | null
          skill_scores?: Json | null
          skills_inventory?: Json | null
          snapshot_date?: string
          spawned_businesses_count?: number | null
          sustainability_index?: number | null
          total_asset_value?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_hours_weekly?: number | null
          content_pieces_count?: number | null
          created_at?: string
          credit_balance?: number | null
          documented_knowledge_count?: number | null
          energy_score?: number | null
          focus_capacity_score?: number | null
          id?: string
          key_relationships?: Json | null
          metadata?: Json | null
          network_size?: number | null
          peak_productivity_hours?: Json | null
          pending_payouts?: number | null
          relationship_strength_avg?: number | null
          skill_scores?: Json | null
          skills_inventory?: Json | null
          snapshot_date?: string
          spawned_businesses_count?: number | null
          sustainability_index?: number | null
          total_asset_value?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_liabilities: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          estimated_impact: number | null
          id: string
          liability_type: string
          metadata: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_impact?: number | null
          id?: string
          liability_type: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_impact?: number | null
          id?: string
          liability_type?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_pnl_entries: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          entry_date: string
          entry_type: string
          id: string
          metadata: Json | null
          source_entity_id: string | null
          source_entity_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_type: string
          id?: string
          metadata?: Json | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_type?: string
          id?: string
          metadata?: Json | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_workflows: {
        Row: {
          created_at: string
          description: string | null
          efficiency_score: number | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          metadata: Json | null
          name: string
          outcomes: Json | null
          steps: Json | null
          time_invested_weekly: number | null
          trigger_conditions: Json | null
          updated_at: string
          user_id: string
          value_generated_weekly: number | null
          workflow_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          efficiency_score?: number | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          metadata?: Json | null
          name: string
          outcomes?: Json | null
          steps?: Json | null
          time_invested_weekly?: number | null
          trigger_conditions?: Json | null
          updated_at?: string
          user_id: string
          value_generated_weekly?: number | null
          workflow_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          efficiency_score?: number | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          metadata?: Json | null
          name?: string
          outcomes?: Json | null
          steps?: Json | null
          time_invested_weekly?: number | null
          trigger_conditions?: Json | null
          updated_at?: string
          user_id?: string
          value_generated_weekly?: number | null
          workflow_type?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          label: string
          lindy_integration_id: string | null
          phone_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          label: string
          lindy_integration_id?: string | null
          phone_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          label?: string
          lindy_integration_id?: string | null
          phone_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_lindy_integration_id_fkey"
            columns: ["lindy_integration_id"]
            isOneToOne: false
            referencedRelation: "lindy_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sheets: {
        Row: {
          ai_extracted_data: Json | null
          created_at: string
          discipline: string | null
          document_id: string
          id: string
          page_number: number | null
          scale_locked: boolean | null
          scale_ratio: number | null
          sheet_number: string
          sheet_title: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ai_extracted_data?: Json | null
          created_at?: string
          discipline?: string | null
          document_id: string
          id?: string
          page_number?: number | null
          scale_locked?: boolean | null
          scale_ratio?: number | null
          sheet_number: string
          sheet_title?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_extracted_data?: Json | null
          created_at?: string
          discipline?: string | null
          document_id?: string
          id?: string
          page_number?: number | null
          scale_locked?: boolean | null
          scale_ratio?: number | null
          sheet_number?: string
          sheet_title?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_sheets_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "construction_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_claim_requests: {
        Row: {
          business_discovery_id: string | null
          consent_given: boolean | null
          consent_ip: string | null
          consent_timestamp: string | null
          consent_user_agent: string | null
          created_at: string | null
          dpa_accepted: boolean | null
          id: string
          platform_id: string | null
          rejection_reason: string | null
          requester_email: string
          requester_name: string
          requester_phone: string | null
          requester_title: string | null
          status: Database["public"]["Enums"]["platform_status"] | null
          terms_accepted: boolean | null
          updated_at: string | null
          verification_code: string
          verification_expires_at: string | null
          verification_sent_at: string | null
          verified_at: string | null
        }
        Insert: {
          business_discovery_id?: string | null
          consent_given?: boolean | null
          consent_ip?: string | null
          consent_timestamp?: string | null
          consent_user_agent?: string | null
          created_at?: string | null
          dpa_accepted?: boolean | null
          id?: string
          platform_id?: string | null
          rejection_reason?: string | null
          requester_email: string
          requester_name: string
          requester_phone?: string | null
          requester_title?: string | null
          status?: Database["public"]["Enums"]["platform_status"] | null
          terms_accepted?: boolean | null
          updated_at?: string | null
          verification_code: string
          verification_expires_at?: string | null
          verification_sent_at?: string | null
          verified_at?: string | null
        }
        Update: {
          business_discovery_id?: string | null
          consent_given?: boolean | null
          consent_ip?: string | null
          consent_timestamp?: string | null
          consent_user_agent?: string | null
          created_at?: string | null
          dpa_accepted?: boolean | null
          id?: string
          platform_id?: string | null
          rejection_reason?: string | null
          requester_email?: string
          requester_name?: string
          requester_phone?: string | null
          requester_title?: string | null
          status?: Database["public"]["Enums"]["platform_status"] | null
          terms_accepted?: boolean | null
          updated_at?: string | null
          verification_code?: string
          verification_expires_at?: string | null
          verification_sent_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_claim_requests_business_discovery_id_fkey"
            columns: ["business_discovery_id"]
            isOneToOne: false
            referencedRelation: "business_discovery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_claim_requests_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_delegations: {
        Row: {
          ai_agent_config: Json | null
          created_at: string | null
          delegated_to_user: string | null
          delegation_type: Database["public"]["Enums"]["delegation_type"]
          id: string
          is_active: boolean | null
          notes: string | null
          permissions: Json | null
          platform_id: string | null
          social_account_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_agent_config?: Json | null
          created_at?: string | null
          delegated_to_user?: string | null
          delegation_type: Database["public"]["Enums"]["delegation_type"]
          id?: string
          is_active?: boolean | null
          notes?: string | null
          permissions?: Json | null
          platform_id?: string | null
          social_account_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_agent_config?: Json | null
          created_at?: string | null
          delegated_to_user?: string | null
          delegation_type?: Database["public"]["Enums"]["delegation_type"]
          id?: string
          is_active?: boolean | null
          notes?: string | null
          permissions?: Json | null
          platform_id?: string | null
          social_account_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_delegations_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_delegations_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_gap_analysis: {
        Row: {
          collaboration_impact_description: string | null
          connection_id: string | null
          created_at: string
          gap_category: string
          gap_description: string | null
          gap_severity: string | null
          gap_title: string
          gap_type: string
          id: string
          impacts_collaboration: boolean | null
          impacts_liability: boolean | null
          impacts_revenue: boolean | null
          impacts_time: boolean | null
          implementation_time_estimate: string | null
          import_id: string | null
          liability_impact_description: string | null
          recommended_solution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          revenue_impact_estimate: string | null
          solution_complexity: string | null
          solution_module_slug: string | null
          status: string | null
          time_impact_estimate: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_impact_description?: string | null
          connection_id?: string | null
          created_at?: string
          gap_category: string
          gap_description?: string | null
          gap_severity?: string | null
          gap_title: string
          gap_type: string
          id?: string
          impacts_collaboration?: boolean | null
          impacts_liability?: boolean | null
          impacts_revenue?: boolean | null
          impacts_time?: boolean | null
          implementation_time_estimate?: string | null
          import_id?: string | null
          liability_impact_description?: string | null
          recommended_solution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          revenue_impact_estimate?: string | null
          solution_complexity?: string | null
          solution_module_slug?: string | null
          status?: string | null
          time_impact_estimate?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_impact_description?: string | null
          connection_id?: string | null
          created_at?: string
          gap_category?: string
          gap_description?: string | null
          gap_severity?: string | null
          gap_title?: string
          gap_type?: string
          id?: string
          impacts_collaboration?: boolean | null
          impacts_liability?: boolean | null
          impacts_revenue?: boolean | null
          impacts_time?: boolean | null
          implementation_time_estimate?: string | null
          import_id?: string | null
          liability_impact_description?: string | null
          recommended_solution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          revenue_impact_estimate?: string | null
          solution_complexity?: string | null
          solution_module_slug?: string | null
          status?: string | null
          time_impact_estimate?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_gap_analysis_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_gap_analysis_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "platform_project_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_project_imports: {
        Row: {
          analysis_data: Json | null
          analysis_score: number | null
          collaboration_improvements: string[] | null
          connection_id: string
          created_at: string
          external_created_at: string | null
          external_project_id: string
          external_project_name: string
          external_project_url: string | null
          external_updated_at: string | null
          id: string
          identified_gaps: Json | null
          import_completed_at: string | null
          import_error: string | null
          import_started_at: string | null
          import_status: string | null
          is_actively_monitored: boolean | null
          last_analyzed_at: string | null
          optimization_opportunities: Json | null
          recommended_modules: Json | null
          revenue_potential_estimate: string | null
          risk_reduction_areas: string[] | null
          time_savings_estimate: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          analysis_score?: number | null
          collaboration_improvements?: string[] | null
          connection_id: string
          created_at?: string
          external_created_at?: string | null
          external_project_id: string
          external_project_name: string
          external_project_url?: string | null
          external_updated_at?: string | null
          id?: string
          identified_gaps?: Json | null
          import_completed_at?: string | null
          import_error?: string | null
          import_started_at?: string | null
          import_status?: string | null
          is_actively_monitored?: boolean | null
          last_analyzed_at?: string | null
          optimization_opportunities?: Json | null
          recommended_modules?: Json | null
          revenue_potential_estimate?: string | null
          risk_reduction_areas?: string[] | null
          time_savings_estimate?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          analysis_score?: number | null
          collaboration_improvements?: string[] | null
          connection_id?: string
          created_at?: string
          external_created_at?: string | null
          external_project_id?: string
          external_project_name?: string
          external_project_url?: string | null
          external_updated_at?: string | null
          id?: string
          identified_gaps?: Json | null
          import_completed_at?: string | null
          import_error?: string | null
          import_started_at?: string | null
          import_status?: string | null
          is_actively_monitored?: boolean | null
          last_analyzed_at?: string | null
          optimization_opportunities?: Json | null
          recommended_modules?: Json | null
          revenue_potential_estimate?: string | null
          risk_reduction_areas?: string[] | null
          time_savings_estimate?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_project_imports_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_platform_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_recommendations: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          confidence_score: number | null
          connection_id: string | null
          created_at: string
          description: string | null
          detailed_action_plan: Json | null
          effort_level: string | null
          estimated_value: string | null
          expires_at: string | null
          generated_by: string | null
          generation_context: Json | null
          id: string
          import_id: string | null
          module_features_used: string[] | null
          primary_benefit: string | null
          priority: string | null
          recommendation_type: string
          related_module_slug: string | null
          roi_score: number | null
          status: string | null
          title: string
          updated_at: string
          user_feedback: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          connection_id?: string | null
          created_at?: string
          description?: string | null
          detailed_action_plan?: Json | null
          effort_level?: string | null
          estimated_value?: string | null
          expires_at?: string | null
          generated_by?: string | null
          generation_context?: Json | null
          id?: string
          import_id?: string | null
          module_features_used?: string[] | null
          primary_benefit?: string | null
          priority?: string | null
          recommendation_type: string
          related_module_slug?: string | null
          roi_score?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_feedback?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          connection_id?: string | null
          created_at?: string
          description?: string | null
          detailed_action_plan?: Json | null
          effort_level?: string | null
          estimated_value?: string | null
          expires_at?: string | null
          generated_by?: string | null
          generation_context?: Json | null
          id?: string
          import_id?: string | null
          module_features_used?: string[] | null
          primary_benefit?: string | null
          priority?: string | null
          recommendation_type?: string
          related_module_slug?: string | null
          roi_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_feedback?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_recommendations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_recommendations_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "platform_project_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_usage_logs: {
        Row: {
          created_at: string | null
          estimated_cost_usd: number | null
          id: string
          metadata: Json | null
          quantity: number
          resource_subtype: string | null
          resource_type: string
          spawned_business_id: string | null
          unit: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_cost_usd?: number | null
          id?: string
          metadata?: Json | null
          quantity: number
          resource_subtype?: string | null
          resource_type: string
          spawned_business_id?: string | null
          unit: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_cost_usd?: number | null
          id?: string
          metadata?: Json | null
          quantity?: number
          resource_subtype?: string | null
          resource_type?: string
          spawned_business_id?: string | null
          unit?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_usage_logs_spawned_business_id_fkey"
            columns: ["spawned_business_id"]
            isOneToOne: false
            referencedRelation: "spawned_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_white_papers: {
        Row: {
          audio_url: string | null
          copy_enabled_for_users: boolean | null
          created_at: string | null
          id: string
          is_copyable: boolean | null
          is_published: boolean | null
          is_shareable: boolean | null
          last_code_hash: string | null
          last_generated_at: string | null
          module_description: string | null
          module_key: string
          module_name: string
          share_enabled_for_users: boolean | null
          updated_at: string | null
          version: number | null
          white_paper_content: string
          white_paper_markdown: string | null
        }
        Insert: {
          audio_url?: string | null
          copy_enabled_for_users?: boolean | null
          created_at?: string | null
          id?: string
          is_copyable?: boolean | null
          is_published?: boolean | null
          is_shareable?: boolean | null
          last_code_hash?: string | null
          last_generated_at?: string | null
          module_description?: string | null
          module_key: string
          module_name: string
          share_enabled_for_users?: boolean | null
          updated_at?: string | null
          version?: number | null
          white_paper_content: string
          white_paper_markdown?: string | null
        }
        Update: {
          audio_url?: string | null
          copy_enabled_for_users?: boolean | null
          created_at?: string | null
          id?: string
          is_copyable?: boolean | null
          is_published?: boolean | null
          is_shareable?: boolean | null
          last_code_hash?: string | null
          last_generated_at?: string | null
          module_description?: string | null
          module_key?: string
          module_name?: string
          share_enabled_for_users?: boolean | null
          updated_at?: string | null
          version?: number | null
          white_paper_content?: string
          white_paper_markdown?: string | null
        }
        Relationships: []
      }
      pmu_streams: {
        Row: {
          angle_deg: number | null
          created_at: string
          freq_hz: number | null
          i_phasor_json: Json | null
          id: string
          mode: Database["public"]["Enums"]["operating_mode"]
          node_id: string
          quality_flag: string | null
          rocof_hz_s: number | null
          ts: string
          v_phasor_json: Json | null
        }
        Insert: {
          angle_deg?: number | null
          created_at?: string
          freq_hz?: number | null
          i_phasor_json?: Json | null
          id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          node_id: string
          quality_flag?: string | null
          rocof_hz_s?: number | null
          ts: string
          v_phasor_json?: Json | null
        }
        Update: {
          angle_deg?: number | null
          created_at?: string
          freq_hz?: number | null
          i_phasor_json?: Json | null
          id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          node_id?: string
          quality_flag?: string | null
          rocof_hz_s?: number | null
          ts?: string
          v_phasor_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pmu_streams_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_companies: {
        Row: {
          commission_rate: number | null
          company_type: Database["public"]["Enums"]["company_type"]
          created_at: string | null
          description: string | null
          email_domains: string[] | null
          entity_structure_notes: string | null
          id: string
          is_active: boolean | null
          is_holding_company: boolean | null
          is_operating_company: boolean | null
          liability_shield_strategy: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          primary_color: string | null
          tax_optimization_notes: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          commission_rate?: number | null
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string | null
          description?: string | null
          email_domains?: string[] | null
          entity_structure_notes?: string | null
          id?: string
          is_active?: boolean | null
          is_holding_company?: boolean | null
          is_operating_company?: boolean | null
          liability_shield_strategy?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          primary_color?: string | null
          tax_optimization_notes?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          commission_rate?: number | null
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string | null
          description?: string | null
          email_domains?: string[] | null
          entity_structure_notes?: string | null
          id?: string
          is_active?: boolean | null
          is_holding_company?: boolean | null
          is_operating_company?: boolean | null
          liability_shield_strategy?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          primary_color?: string | null
          tax_optimization_notes?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          shares_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          shares_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          shares_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_list_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manufacturer: string | null
          metadata: Json | null
          price_list_id: string
          sku: string
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          metadata?: Json | null
          price_list_id: string
          sku: string
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          metadata?: Json | null
          price_list_id?: string
          sku?: string
          unit?: Database["public"]["Enums"]["takeoff_unit"]
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string
          effective_date: string | null
          expiration_date: string | null
          id: string
          is_current: boolean | null
          metadata: Json | null
          name: string
          price_factor: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          name: string
          price_factor?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          name?: string
          price_factor?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_lists_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundle: {
        Row: {
          benefits: string[] | null
          category: string | null
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          pain_points: string[] | null
          playbook_slug: string | null
          script_checkpoints: string[] | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          pain_points?: string[] | null
          playbook_slug?: string | null
          script_checkpoints?: string[] | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pain_points?: string[] | null
          playbook_slug?: string | null
          script_checkpoints?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_bundle_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "biz_company"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_expires_at: string | null
          account_level: Database["public"]["Enums"]["account_level"] | null
          bd_id: string | null
          bd_id_verified: boolean | null
          bd_id_verified_at: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          grid_settings: Json | null
          id: string
          modules_access: Json | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          account_expires_at?: string | null
          account_level?: Database["public"]["Enums"]["account_level"] | null
          bd_id?: string | null
          bd_id_verified?: boolean | null
          bd_id_verified_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          grid_settings?: Json | null
          id: string
          modules_access?: Json | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          account_expires_at?: string | null
          account_level?: Database["public"]["Enums"]["account_level"] | null
          bd_id?: string | null
          bd_id_verified?: boolean | null
          bd_id_verified_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          grid_settings?: Json | null
          id?: string
          modules_access?: Json | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_analytics: {
        Row: {
          actual_cost: number | null
          cost_variance: number | null
          created_at: string
          estimated_cost: number | null
          id: string
          productivity_metrics: Json | null
          progress_percent: number | null
          project_id: string
          snapshot_date: string
        }
        Insert: {
          actual_cost?: number | null
          cost_variance?: number | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          productivity_metrics?: Json | null
          progress_percent?: number | null
          project_id: string
          snapshot_date?: string
        }
        Update: {
          actual_cost?: number | null
          cost_variance?: number | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          productivity_metrics?: Json | null
          progress_percent?: number | null
          project_id?: string
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_sections: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          is_alternate: boolean | null
          plan_references_json: Json | null
          project_id: string
          scope_markdown: string | null
          section_number: number | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          is_alternate?: boolean | null
          plan_references_json?: Json | null
          project_id: string
          scope_markdown?: string | null
          section_number?: number | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          is_alternate?: boolean | null
          plan_references_json?: Json | null
          project_id?: string
          scope_markdown?: string | null
          section_number?: number | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_factors: {
        Row: {
          applies_to: string | null
          created_at: string
          id: string
          name: string
          rate_type: string
          value: number
          worksheet_id: string
        }
        Insert: {
          applies_to?: string | null
          created_at?: string
          id?: string
          name: string
          rate_type: string
          value: number
          worksheet_id: string
        }
        Update: {
          applies_to?: string | null
          created_at?: string
          id?: string
          name?: string
          rate_type?: string
          value?: number
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_factors_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "estimate_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      registrar_registry: {
        Row: {
          api_base_url: string | null
          created_at: string
          display_name: string
          id: string
          logo_url: string | null
          oauth_authorize_url: string | null
          oauth_enabled: boolean | null
          oauth_token_url: string | null
          registrar_name: string
          required_scopes: string[] | null
          setup_instructions: string | null
        }
        Insert: {
          api_base_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          logo_url?: string | null
          oauth_authorize_url?: string | null
          oauth_enabled?: boolean | null
          oauth_token_url?: string | null
          registrar_name: string
          required_scopes?: string[] | null
          setup_instructions?: string | null
        }
        Update: {
          api_base_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          logo_url?: string | null
          oauth_authorize_url?: string | null
          oauth_enabled?: boolean | null
          oauth_token_url?: string | null
          registrar_name?: string
          required_scopes?: string[] | null
          setup_instructions?: string | null
        }
        Relationships: []
      }
      resource_usage_log: {
        Row: {
          deal_room_id: string | null
          formulation_id: string | null
          id: string
          metadata: Json | null
          provider: string | null
          quantity: number
          recorded_at: string
          resource_type: string
          total_cost: number | null
          unit: string
          unit_cost: number | null
        }
        Insert: {
          deal_room_id?: string | null
          formulation_id?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          quantity: number
          recorded_at?: string
          resource_type: string
          total_cost?: number | null
          unit: string
          unit_cost?: number | null
        }
        Update: {
          deal_room_id?: string | null
          formulation_id?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          quantity?: number
          recorded_at?: string
          resource_type?: string
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_usage_log_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_usage_log_formulation_id_fkey"
            columns: ["formulation_id"]
            isOneToOne: false
            referencedRelation: "blender_formulations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_distribution: {
        Row: {
          amount: number
          blockchain_tx_hash: string | null
          created_at: string | null
          distribution_type: string
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          percentage_of_total: number | null
          processed_at: string | null
          recipient_id: string | null
          recipient_name: string | null
          recipient_type: string
          transaction_status: string | null
          work_order_id: string | null
        }
        Insert: {
          amount: number
          blockchain_tx_hash?: string | null
          created_at?: string | null
          distribution_type: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          percentage_of_total?: number | null
          processed_at?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_type: string
          transaction_status?: string | null
          work_order_id?: string | null
        }
        Update: {
          amount?: number
          blockchain_tx_hash?: string | null
          created_at?: string | null
          distribution_type?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          percentage_of_total?: number | null
          processed_at?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_type?: string
          transaction_status?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_distribution_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "fleet_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rose_panels: {
        Row: {
          api_endpoint: string | null
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["operating_mode"]
          power_cap_w: number
          site_id: string
          status: string
          thermal_kw: number | null
          updated_at: string
          workload_class: Database["public"]["Enums"]["workload_class"]
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          power_cap_w: number
          site_id: string
          status?: string
          thermal_kw?: number | null
          updated_at?: string
          workload_class: Database["public"]["Enums"]["workload_class"]
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["operating_mode"]
          power_cap_w?: number
          site_id?: string
          status?: string
          thermal_kw?: number | null
          updated_at?: string
          workload_class?: Database["public"]["Enums"]["workload_class"]
        }
        Relationships: [
          {
            foreignKeyName: "rose_panels_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          city_id: string
          created_at: string
          duration_h: number
          id: string
          name: string
          notes: string | null
          outage_pattern: Json | null
          pm_overunity_factor: number | null
          price_model: Json | null
          start_ts: string
          updated_at: string
          weather_seed: number | null
        }
        Insert: {
          city_id: string
          created_at?: string
          duration_h: number
          id?: string
          name: string
          notes?: string | null
          outage_pattern?: Json | null
          pm_overunity_factor?: number | null
          price_model?: Json | null
          start_ts: string
          updated_at?: string
          weather_seed?: number | null
        }
        Update: {
          city_id?: string
          created_at?: string
          duration_h?: number
          id?: string
          name?: string
          notes?: string | null
          outage_pattern?: Json | null
          pm_overunity_factor?: number | null
          price_model?: Json | null
          start_ts?: string
          updated_at?: string
          weather_seed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_incidents: {
        Row: {
          affected_systems: string[] | null
          affected_users_count: number | null
          assignee_id: string | null
          category: string | null
          contained_at: string | null
          created_at: string | null
          description: string | null
          detected_at: string | null
          id: string
          incident_id: string
          lessons_learned: string | null
          linked_risks: string[] | null
          remediation_steps: string | null
          reported_at: string | null
          reporter_id: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affected_systems?: string[] | null
          affected_users_count?: number | null
          assignee_id?: string | null
          category?: string | null
          contained_at?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          incident_id: string
          lessons_learned?: string | null
          linked_risks?: string[] | null
          remediation_steps?: string | null
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affected_systems?: string[] | null
          affected_users_count?: number | null
          assignee_id?: string | null
          category?: string | null
          contained_at?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          incident_id?: string
          lessons_learned?: string | null
          linked_risks?: string[] | null
          remediation_steps?: string | null
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seed_libraries: {
        Row: {
          created_at: string | null
          homepage: string
          id: string
          is_active: boolean | null
          license: string
          name: string
          npm_package: string | null
          priority: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          homepage: string
          id?: string
          is_active?: boolean | null
          license: string
          name: string
          npm_package?: string | null
          priority?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          homepage?: string
          id?: string
          is_active?: boolean | null
          license?: string
          name?: string
          npm_package?: string | null
          priority?: number | null
          type?: string
        }
        Relationships: []
      }
      service_franchises: {
        Row: {
          category: string
          certification_required: boolean | null
          created_at: string | null
          description: string | null
          franchise_code: string
          franchise_name: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          material_referral_percent: number | null
          materials_advance_percent: number | null
          metadata: Json | null
          partner_data_share_percent: number | null
          platform_fee_percent: number | null
          proof_requirements: string[] | null
          typical_job_value_max: number | null
          typical_job_value_min: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          certification_required?: boolean | null
          created_at?: string | null
          description?: string | null
          franchise_code: string
          franchise_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          material_referral_percent?: number | null
          materials_advance_percent?: number | null
          metadata?: Json | null
          partner_data_share_percent?: number | null
          platform_fee_percent?: number | null
          proof_requirements?: string[] | null
          typical_job_value_max?: number | null
          typical_job_value_min?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          certification_required?: boolean | null
          created_at?: string | null
          description?: string | null
          franchise_code?: string
          franchise_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          material_referral_percent?: number | null
          materials_advance_percent?: number | null
          metadata?: Json | null
          partner_data_share_percent?: number | null
          platform_fee_percent?: number | null
          proof_requirements?: string[] | null
          typical_job_value_max?: number | null
          typical_job_value_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_offerings: {
        Row: {
          base_price: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          pricing_model: string | null
          subcategory: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          base_price?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          pricing_model?: string | null
          subcategory?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          pricing_model?: string | null
          subcategory?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          first_response_at: string | null
          id: string
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_vendors: {
        Row: {
          avg_completion_time_hours: number | null
          bank_account_last4: string | null
          business_name: string
          certifications: string[] | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          franchise_ids: string[] | null
          id: string
          metadata: Json | null
          rating: number | null
          service_area_geo: Json | null
          service_radius_miles: number | null
          total_jobs_completed: number | null
          total_revenue_earned: number | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          wallet_address: string | null
        }
        Insert: {
          avg_completion_time_hours?: number | null
          bank_account_last4?: string | null
          business_name: string
          certifications?: string[] | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          franchise_ids?: string[] | null
          id?: string
          metadata?: Json | null
          rating?: number | null
          service_area_geo?: Json | null
          service_radius_miles?: number | null
          total_jobs_completed?: number | null
          total_revenue_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          wallet_address?: string | null
        }
        Update: {
          avg_completion_time_hours?: number | null
          bank_account_last4?: string | null
          business_name?: string
          certifications?: string[] | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          franchise_ids?: string[] | null
          id?: string
          metadata?: Json | null
          rating?: number | null
          service_area_geo?: Json | null
          service_radius_miles?: number | null
          total_jobs_completed?: number | null
          total_revenue_earned?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      settlement_adjustments: {
        Row: {
          adjustment_type: string
          amount: number
          approvals: Json
          created_at: string
          deal_room_id: string
          description: string
          id: string
          justification: string | null
          proposed_by: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          adjustment_type: string
          amount: number
          approvals?: Json
          created_at?: string
          deal_room_id: string
          description: string
          id?: string
          justification?: string | null
          proposed_by: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          adjustment_type?: string
          amount?: number
          approvals?: Json
          created_at?: string
          deal_room_id?: string
          description?: string
          id?: string
          justification?: string | null
          proposed_by?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_adjustments_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_adjustments_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_contracts: {
        Row: {
          created_at: string
          deal_room_id: string
          distribution_logic: Json
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          structure_id: string | null
          total_distributed: number | null
          trigger_conditions: Json
          trigger_type: Database["public"]["Enums"]["settlement_trigger"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_room_id: string
          distribution_logic?: Json
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          structure_id?: string | null
          total_distributed?: number | null
          trigger_conditions?: Json
          trigger_type: Database["public"]["Enums"]["settlement_trigger"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_room_id?: string
          distribution_logic?: Json
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          structure_id?: string | null
          total_distributed?: number | null
          trigger_conditions?: Json
          trigger_type?: Database["public"]["Enums"]["settlement_trigger"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_contracts_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_contracts_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "deal_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_executions: {
        Row: {
          contract_id: string
          created_at: string
          currency: string
          error_message: string | null
          executed_at: string | null
          id: string
          status: string
          total_amount: number
          trigger_event: Json
        }
        Insert: {
          contract_id: string
          created_at?: string
          currency?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          total_amount: number
          trigger_event: Json
        }
        Update: {
          contract_id?: string
          created_at?: string
          currency?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          total_amount?: number
          trigger_event?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settlement_executions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "settlement_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_payouts: {
        Row: {
          amount: number
          attribution_rule_id: string | null
          calculation_breakdown: Json | null
          created_at: string
          currency: string
          execution_id: string
          id: string
          paid_at: string | null
          participant_id: string
          payout_method: string | null
          payout_reference: string | null
          status: string
        }
        Insert: {
          amount: number
          attribution_rule_id?: string | null
          calculation_breakdown?: Json | null
          created_at?: string
          currency?: string
          execution_id: string
          id?: string
          paid_at?: string | null
          participant_id: string
          payout_method?: string | null
          payout_reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          attribution_rule_id?: string | null
          calculation_breakdown?: Json | null
          created_at?: string
          currency?: string
          execution_id?: string
          id?: string
          paid_at?: string | null
          participant_id?: string
          payout_method?: string | null
          payout_reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_payouts_attribution_rule_id_fkey"
            columns: ["attribution_rule_id"]
            isOneToOne: false
            referencedRelation: "attribution_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_payouts_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "settlement_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_payouts_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "deal_room_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          adjustments_json: Json | null
          clearing_price: number
          created_at: string
          credits: number
          id: string
          qty_kwh: number
          resource_id: string
          settlement_window: string
        }
        Insert: {
          adjustments_json?: Json | null
          clearing_price: number
          created_at?: string
          credits: number
          id?: string
          qty_kwh: number
          resource_id: string
          settlement_window: string
        }
        Update: {
          adjustments_json?: Json | null
          clearing_price?: number
          created_at?: string
          credits?: number
          id?: string
          qty_kwh?: number
          resource_id?: string
          settlement_window?: string
        }
        Relationships: []
      }
      sheet_metal_breakout: {
        Row: {
          category: string
          created_at: string
          fabrication_rate: number | null
          id: string
          installation_rate: number | null
          linear_feet: number | null
          material_price: number | null
          material_sheets: number | null
          total_cost: number | null
          worksheet_id: string
        }
        Insert: {
          category: string
          created_at?: string
          fabrication_rate?: number | null
          id?: string
          installation_rate?: number | null
          linear_feet?: number | null
          material_price?: number | null
          material_sheets?: number | null
          total_cost?: number | null
          worksheet_id: string
        }
        Update: {
          category?: string
          created_at?: string
          fabrication_rate?: number | null
          id?: string
          installation_rate?: number | null
          linear_feet?: number | null
          material_price?: number | null
          material_sheets?: number | null
          total_cost?: number | null
          worksheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sheet_metal_breakout_worksheet_id_fkey"
            columns: ["worksheet_id"]
            isOneToOne: false
            referencedRelation: "estimate_worksheets"
            referencedColumns: ["id"]
          },
        ]
      }
      situation_actions: {
        Row: {
          action_type: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string
          due_at: string | null
          id: string
          is_automated: boolean | null
          outcome: string | null
          situation_id: string | null
          status: string
          updated_at: string
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          action_type: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          due_at?: string | null
          id?: string
          is_automated?: boolean | null
          outcome?: string | null
          situation_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          action_type?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          due_at?: string | null
          id?: string
          is_automated?: boolean | null
          outcome?: string | null
          situation_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "situation_actions_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      situation_signals: {
        Row: {
          ai_interpretation: string | null
          content: string
          created_at: string
          id: string
          processed: boolean | null
          relevance_score: number | null
          severity: string | null
          signal_type: string
          situation_id: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          ai_interpretation?: string | null
          content: string
          created_at?: string
          id?: string
          processed?: boolean | null
          relevance_score?: number | null
          severity?: string | null
          signal_type: string
          situation_id?: string | null
          source: string
          user_id?: string | null
        }
        Update: {
          ai_interpretation?: string | null
          content?: string
          created_at?: string
          id?: string
          processed?: boolean | null
          relevance_score?: number | null
          severity?: string | null
          signal_type?: string
          situation_id?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "situation_signals_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      situation_simulations: {
        Row: {
          assumptions: Json | null
          best_outcome: string | null
          confidence_score: number | null
          created_at: string
          id: string
          predicted_outcomes: Json | null
          recommended_path: string | null
          risk_factors: Json | null
          scenario_description: string | null
          scenario_name: string
          situation_id: string | null
          user_id: string | null
          variables: Json | null
          worst_outcome: string | null
        }
        Insert: {
          assumptions?: Json | null
          best_outcome?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_outcomes?: Json | null
          recommended_path?: string | null
          risk_factors?: Json | null
          scenario_description?: string | null
          scenario_name: string
          situation_id?: string | null
          user_id?: string | null
          variables?: Json | null
          worst_outcome?: string | null
        }
        Update: {
          assumptions?: Json | null
          best_outcome?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_outcomes?: Json | null
          recommended_path?: string | null
          risk_factors?: Json | null
          scenario_description?: string | null
          scenario_name?: string
          situation_id?: string | null
          user_id?: string | null
          variables?: Json | null
          worst_outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "situation_simulations_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      situations: {
        Row: {
          action_options: Json | null
          assigned_to: string | null
          constraints: Json | null
          context_summary: string | null
          created_at: string
          description: string | null
          id: string
          linked_company_id: string | null
          linked_deal_id: string | null
          linked_feature_id: string | null
          metadata: Json | null
          recommended_action: string | null
          resolution_notes: string | null
          resolution_outcome: string | null
          resolved_at: string | null
          risk_level: string | null
          root_cause: string | null
          severity: string
          situation_type: string
          stakeholders: Json | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          urgency_score: number | null
          user_id: string | null
        }
        Insert: {
          action_options?: Json | null
          assigned_to?: string | null
          constraints?: Json | null
          context_summary?: string | null
          created_at?: string
          description?: string | null
          id?: string
          linked_company_id?: string | null
          linked_deal_id?: string | null
          linked_feature_id?: string | null
          metadata?: Json | null
          recommended_action?: string | null
          resolution_notes?: string | null
          resolution_outcome?: string | null
          resolved_at?: string | null
          risk_level?: string | null
          root_cause?: string | null
          severity?: string
          situation_type?: string
          stakeholders?: Json | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          urgency_score?: number | null
          user_id?: string | null
        }
        Update: {
          action_options?: Json | null
          assigned_to?: string | null
          constraints?: Json | null
          context_summary?: string | null
          created_at?: string
          description?: string | null
          id?: string
          linked_company_id?: string | null
          linked_deal_id?: string | null
          linked_feature_id?: string | null
          metadata?: Json | null
          recommended_action?: string | null
          resolution_notes?: string | null
          resolution_outcome?: string | null
          resolved_at?: string | null
          risk_level?: string | null
          root_cause?: string | null
          severity?: string
          situation_type?: string
          stakeholders?: Json | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          urgency_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      smart_contract_clause_library: {
        Row: {
          clause_name: string
          clause_type: string
          content_template: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_standard: boolean
          updated_at: string
          variables: Json | null
        }
        Insert: {
          clause_name: string
          clause_type: string
          content_template: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_standard?: boolean
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          clause_name?: string
          clause_type?: string
          content_template?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_standard?: boolean
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      sms_conversations: {
        Row: {
          contact_name: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          our_number: string
          owner_user_id: string
          peer_number: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          our_number: string
          owner_user_id: string
          peer_number: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          our_number?: string
          owner_user_id?: string
          peer_number?: string
        }
        Relationships: []
      }
      sms_messages: {
        Row: {
          body: string | null
          carrier_msg_id: string | null
          conversation_id: string
          created_at: string | null
          direction: string
          dlr_code: string | null
          error_detail: string | null
          from_number: string
          id: string
          media: Json | null
          status: string | null
          to_number: string
        }
        Insert: {
          body?: string | null
          carrier_msg_id?: string | null
          conversation_id: string
          created_at?: string | null
          direction: string
          dlr_code?: string | null
          error_detail?: string | null
          from_number: string
          id?: string
          media?: Json | null
          status?: string | null
          to_number: string
        }
        Update: {
          body?: string | null
          carrier_msg_id?: string | null
          conversation_id?: string
          created_at?: string | null
          direction?: string
          dlr_code?: string | null
          error_detail?: string | null
          from_number?: string
          id?: string
          media?: Json | null
          status?: string | null
          to_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "sms_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_optouts: {
        Row: {
          created_at: string | null
          id: string
          opted_in_at: string | null
          phone_number: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          opted_in_at?: string | null
          phone_number: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          opted_in_at?: string | null
          phone_number?: string
          reason?: string | null
        }
        Relationships: []
      }
      soc_codes: {
        Row: {
          code: string
          occupational_group: string
        }
        Insert: {
          code: string
          occupational_group: string
        }
        Update: {
          code?: string
          occupational_group?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          account_handle: string | null
          account_name: string | null
          account_url: string | null
          business_discovery_id: string | null
          claim_request_id: string | null
          created_at: string | null
          credential_vault_id: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          is_business_account: boolean | null
          is_verified: boolean | null
          last_synced_at: string | null
          metadata: Json | null
          platform_id: string | null
          post_count: number | null
          profile_image_url: string | null
          status: Database["public"]["Enums"]["platform_status"] | null
          sync_error: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_handle?: string | null
          account_name?: string | null
          account_url?: string | null
          business_discovery_id?: string | null
          claim_request_id?: string | null
          created_at?: string | null
          credential_vault_id?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          is_business_account?: boolean | null
          is_verified?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          platform_id?: string | null
          post_count?: number | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["platform_status"] | null
          sync_error?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_handle?: string | null
          account_name?: string | null
          account_url?: string | null
          business_discovery_id?: string | null
          claim_request_id?: string | null
          created_at?: string | null
          credential_vault_id?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          is_business_account?: boolean | null
          is_verified?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          platform_id?: string | null
          post_count?: number | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["platform_status"] | null
          sync_error?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_credential_vault"
            columns: ["credential_vault_id"]
            isOneToOne: false
            referencedRelation: "credential_vault"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_business_discovery_id_fkey"
            columns: ["business_discovery_id"]
            isOneToOne: false
            referencedRelation: "business_discovery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_claim_request_id_fkey"
            columns: ["claim_request_id"]
            isOneToOne: false
            referencedRelation: "platform_claim_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      social_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          created_at: string | null
          date: string
          engagement_count: number | null
          followers_gained: number | null
          followers_lost: number | null
          id: string
          impressions: number | null
          likes: number | null
          platform_id: string
          raw_data: Json | null
          reach: number | null
          saves: number | null
          shares: number | null
          social_account_id: string
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          created_at?: string | null
          date: string
          engagement_count?: number | null
          followers_gained?: number | null
          followers_lost?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform_id: string
          raw_data?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          social_account_id: string
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          created_at?: string | null
          date?: string
          engagement_count?: number | null
          followers_gained?: number | null
          followers_lost?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform_id?: string
          raw_data?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          social_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_analytics_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_analytics_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_platforms: {
        Row: {
          api_available: boolean | null
          auth_type: Database["public"]["Enums"]["connector_auth_type"]
          category: Database["public"]["Enums"]["platform_category"]
          connector_config: Json | null
          created_at: string | null
          display_order: number
          handover_instructions: string | null
          id: string
          logo_url: string | null
          media_constraints: Json | null
          platform_name: string
          platform_slug: string
          rate_limits: Json | null
          requires_app_review: boolean | null
          supports_analytics: boolean | null
          supports_messaging: boolean | null
          supports_posting: boolean | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          api_available?: boolean | null
          auth_type: Database["public"]["Enums"]["connector_auth_type"]
          category: Database["public"]["Enums"]["platform_category"]
          connector_config?: Json | null
          created_at?: string | null
          display_order: number
          handover_instructions?: string | null
          id?: string
          logo_url?: string | null
          media_constraints?: Json | null
          platform_name: string
          platform_slug: string
          rate_limits?: Json | null
          requires_app_review?: boolean | null
          supports_analytics?: boolean | null
          supports_messaging?: boolean | null
          supports_posting?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          api_available?: boolean | null
          auth_type?: Database["public"]["Enums"]["connector_auth_type"]
          category?: Database["public"]["Enums"]["platform_category"]
          connector_config?: Json | null
          created_at?: string | null
          display_order?: number
          handover_instructions?: string | null
          id?: string
          logo_url?: string | null
          media_constraints?: Json | null
          platform_name?: string
          platform_slug?: string
          rate_limits?: Json | null
          requires_app_review?: boolean | null
          supports_analytics?: boolean | null
          supports_messaging?: boolean | null
          supports_posting?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          ai_generated: boolean | null
          ai_prompt: string | null
          content: string
          created_at: string | null
          delegated_to_human: string | null
          engagement_data: Json | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          platform_id: string
          platform_post_id: string | null
          platform_url: string | null
          published_at: string | null
          retry_count: number | null
          scheduled_for: string | null
          social_account_id: string
          status: Database["public"]["Enums"]["post_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          content: string
          created_at?: string | null
          delegated_to_human?: string | null
          engagement_data?: Json | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          platform_id: string
          platform_post_id?: string | null
          platform_url?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          social_account_id: string
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          content?: string
          created_at?: string | null
          delegated_to_human?: string | null
          engagement_data?: Json | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          platform_id?: string
          platform_post_id?: string | null
          platform_url?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          social_account_id?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          based_on_activities: Json | null
          category: string | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          frequency: string | null
          id: string
          is_approved: boolean | null
          steps: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          based_on_activities?: Json | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_approved?: boolean | null
          steps?: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          based_on_activities?: Json | null
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_approved?: boolean | null
          steps?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spawned_businesses: {
        Row: {
          business_embedding: number[] | null
          business_name: string
          business_slug: string | null
          business_type: string | null
          capabilities: string[] | null
          city: string | null
          client_id: string | null
          content_assets: Json | null
          country: string | null
          created_at: string | null
          current_version_id: string | null
          custom_domain: string | null
          deployment_status: string | null
          description: string | null
          detached_at: string | null
          detachment_reason: string | null
          domain_status: string | null
          ecosystem_member: boolean | null
          enabled_modules: Json | null
          equity_agreement_signed_at: string | null
          erp_structure: Json | null
          estimated_cost_usd: number | null
          feature_route: string | null
          id: string
          industry: string | null
          is_detached: boolean | null
          is_platform_feature: boolean | null
          last_activity_at: string | null
          launched_at: string | null
          mission_statement: string | null
          needs_tags: string[] | null
          offers_tags: string[] | null
          platform_equity_percent: number | null
          primary_email: string | null
          primary_phone: string | null
          products_services: string[] | null
          region: string | null
          research_data: Json | null
          spawn_log: Json | null
          spawn_progress: number | null
          status: Database["public"]["Enums"]["business_spawn_status"] | null
          subdomain: string | null
          target_market: string[] | null
          timezone: string | null
          total_ai_tokens_used: number | null
          total_storage_bytes: number | null
          transferable: boolean | null
          updated_at: string | null
          user_id: string
          website_data: Json | null
        }
        Insert: {
          business_embedding?: number[] | null
          business_name: string
          business_slug?: string | null
          business_type?: string | null
          capabilities?: string[] | null
          city?: string | null
          client_id?: string | null
          content_assets?: Json | null
          country?: string | null
          created_at?: string | null
          current_version_id?: string | null
          custom_domain?: string | null
          deployment_status?: string | null
          description?: string | null
          detached_at?: string | null
          detachment_reason?: string | null
          domain_status?: string | null
          ecosystem_member?: boolean | null
          enabled_modules?: Json | null
          equity_agreement_signed_at?: string | null
          erp_structure?: Json | null
          estimated_cost_usd?: number | null
          feature_route?: string | null
          id?: string
          industry?: string | null
          is_detached?: boolean | null
          is_platform_feature?: boolean | null
          last_activity_at?: string | null
          launched_at?: string | null
          mission_statement?: string | null
          needs_tags?: string[] | null
          offers_tags?: string[] | null
          platform_equity_percent?: number | null
          primary_email?: string | null
          primary_phone?: string | null
          products_services?: string[] | null
          region?: string | null
          research_data?: Json | null
          spawn_log?: Json | null
          spawn_progress?: number | null
          status?: Database["public"]["Enums"]["business_spawn_status"] | null
          subdomain?: string | null
          target_market?: string[] | null
          timezone?: string | null
          total_ai_tokens_used?: number | null
          total_storage_bytes?: number | null
          transferable?: boolean | null
          updated_at?: string | null
          user_id: string
          website_data?: Json | null
        }
        Update: {
          business_embedding?: number[] | null
          business_name?: string
          business_slug?: string | null
          business_type?: string | null
          capabilities?: string[] | null
          city?: string | null
          client_id?: string | null
          content_assets?: Json | null
          country?: string | null
          created_at?: string | null
          current_version_id?: string | null
          custom_domain?: string | null
          deployment_status?: string | null
          description?: string | null
          detached_at?: string | null
          detachment_reason?: string | null
          domain_status?: string | null
          ecosystem_member?: boolean | null
          enabled_modules?: Json | null
          equity_agreement_signed_at?: string | null
          erp_structure?: Json | null
          estimated_cost_usd?: number | null
          feature_route?: string | null
          id?: string
          industry?: string | null
          is_detached?: boolean | null
          is_platform_feature?: boolean | null
          last_activity_at?: string | null
          launched_at?: string | null
          mission_statement?: string | null
          needs_tags?: string[] | null
          offers_tags?: string[] | null
          platform_equity_percent?: number | null
          primary_email?: string | null
          primary_phone?: string | null
          products_services?: string[] | null
          region?: string | null
          research_data?: Json | null
          spawn_log?: Json | null
          spawn_progress?: number | null
          status?: Database["public"]["Enums"]["business_spawn_status"] | null
          subdomain?: string | null
          target_market?: string[] | null
          timezone?: string | null
          total_ai_tokens_used?: number | null
          total_storage_bytes?: number | null
          transferable?: boolean | null
          updated_at?: string | null
          user_id?: string
          website_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "spawned_businesses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      store_launch_builds: {
        Row: {
          artifact_url: string | null
          build_logs: string | null
          build_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          platform: string
          project_id: string
          started_at: string | null
          status: string
          version_code: number
          version_name: string
        }
        Insert: {
          artifact_url?: string | null
          build_logs?: string | null
          build_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platform: string
          project_id: string
          started_at?: string | null
          status?: string
          version_code?: number
          version_name?: string
        }
        Update: {
          artifact_url?: string | null
          build_logs?: string | null
          build_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          platform?: string
          project_id?: string
          started_at?: string | null
          status?: string
          version_code?: number
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_launch_builds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "store_launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      store_launch_developer_accounts: {
        Row: {
          account_email: string | null
          account_name: string | null
          created_at: string
          credentials_metadata: Json | null
          id: string
          is_connected: boolean
          last_verified_at: string | null
          platform: string
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email?: string | null
          account_name?: string | null
          created_at?: string
          credentials_metadata?: Json | null
          id?: string
          is_connected?: boolean
          last_verified_at?: string | null
          platform: string
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string | null
          account_name?: string | null
          created_at?: string
          credentials_metadata?: Json | null
          id?: string
          is_connected?: boolean
          last_verified_at?: string | null
          platform?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_launch_listing_checklist: {
        Row: {
          age_rating_completed: boolean
          created_at: string
          data_disclosures_completed: boolean
          description_completed: boolean
          id: string
          internal_testing_track_created: boolean | null
          platform: string
          privacy_policy_url: string | null
          project_id: string
          review_notes: string | null
          screenshots_uploaded: boolean
          testflight_group_created: boolean | null
          updated_at: string
        }
        Insert: {
          age_rating_completed?: boolean
          created_at?: string
          data_disclosures_completed?: boolean
          description_completed?: boolean
          id?: string
          internal_testing_track_created?: boolean | null
          platform: string
          privacy_policy_url?: string | null
          project_id: string
          review_notes?: string | null
          screenshots_uploaded?: boolean
          testflight_group_created?: boolean | null
          updated_at?: string
        }
        Update: {
          age_rating_completed?: boolean
          created_at?: string
          data_disclosures_completed?: boolean
          description_completed?: boolean
          id?: string
          internal_testing_track_created?: boolean | null
          platform?: string
          privacy_policy_url?: string | null
          project_id?: string
          review_notes?: string | null
          screenshots_uploaded?: boolean
          testflight_group_created?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_launch_listing_checklist_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "store_launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      store_launch_native_features: {
        Row: {
          config: Json | null
          created_at: string
          feature_key: string
          id: string
          is_enabled: boolean
          project_id: string
          setup_completed: boolean
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          feature_key: string
          id?: string
          is_enabled?: boolean
          project_id: string
          setup_completed?: boolean
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          feature_key?: string
          id?: string
          is_enabled?: boolean
          project_id?: string
          setup_completed?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_launch_native_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "store_launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      store_launch_payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_payout_id: string | null
          id: string
          paid_at: string | null
          payout_method: string | null
          period_end: string
          period_start: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_payout_id?: string | null
          id?: string
          paid_at?: string | null
          payout_method?: string | null
          period_end: string
          period_start: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_payout_id?: string | null
          id?: string
          paid_at?: string | null
          payout_method?: string | null
          period_end?: string
          period_start?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      store_launch_projects: {
        Row: {
          app_icon_url: string | null
          bundle_id_ios: string | null
          connected_source_type: string
          created_at: string
          github_repo: string | null
          id: string
          name: string
          package_name_android: string | null
          platforms: string[]
          source_url: string | null
          splash_screen_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_icon_url?: string | null
          bundle_id_ios?: string | null
          connected_source_type: string
          created_at?: string
          github_repo?: string | null
          id?: string
          name: string
          package_name_android?: string | null
          platforms?: string[]
          source_url?: string | null
          splash_screen_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_icon_url?: string | null
          bundle_id_ios?: string | null
          connected_source_type?: string
          created_at?: string
          github_repo?: string | null
          id?: string
          name?: string
          package_name_android?: string | null
          platforms?: string[]
          source_url?: string | null
          splash_screen_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_launch_revenue_agreements: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          is_verified: boolean
          project_id: string
          revenue_share_percent: number
          user_id: string
          verification_account_id: string | null
          verification_method: string | null
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          project_id: string
          revenue_share_percent?: number
          user_id: string
          verification_account_id?: string | null
          verification_method?: string | null
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          project_id?: string
          revenue_share_percent?: number
          user_id?: string
          verification_account_id?: string | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_launch_revenue_agreements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "store_launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      store_launch_revenue_events: {
        Row: {
          created_at: string
          currency: string
          event_date: string
          event_type: string
          external_transaction_id: string | null
          gross_amount: number
          id: string
          net_amount: number
          platform_share: number
          project_id: string
          source: string
          store_fee: number | null
        }
        Insert: {
          created_at?: string
          currency?: string
          event_date: string
          event_type: string
          external_transaction_id?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          platform_share: number
          project_id: string
          source: string
          store_fee?: number | null
        }
        Update: {
          created_at?: string
          currency?: string
          event_date?: string
          event_type?: string
          external_transaction_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          platform_share?: number
          project_id?: string
          source?: string
          store_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_launch_revenue_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "store_launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          connector_id: string | null
          error_details: Json | null
          id: string
          records_failed: number | null
          records_synced: number | null
          started_at: string
          status: Database["public"]["Enums"]["sync_status"]
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connector_id?: string | null
          error_details?: Json | null
          id?: string
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string
          status: Database["public"]["Enums"]["sync_status"]
          sync_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connector_id?: string | null
          error_details?: Json | null
          id?: string
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_status"]
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      system_discovery_sessions: {
        Row: {
          analysis_result: Json | null
          authorization_id: string
          completed_at: string | null
          created_at: string
          discovered_data: Json | null
          discovery_status: string
          error_log: Json | null
          id: string
          migration_roadmap: Json | null
          recommendations: Json | null
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          authorization_id: string
          completed_at?: string | null
          created_at?: string
          discovered_data?: Json | null
          discovery_status?: string
          error_log?: Json | null
          id?: string
          migration_roadmap?: Json | null
          recommendations?: Json | null
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          authorization_id?: string
          completed_at?: string | null
          created_at?: string
          discovered_data?: Json | null
          discovery_status?: string
          error_log?: Json | null
          id?: string
          migration_roadmap?: Json | null
          recommendations?: Json | null
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_discovery_sessions_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: false
            referencedRelation: "external_system_authorizations"
            referencedColumns: ["id"]
          },
        ]
      }
      takeoff_areas: {
        Row: {
          color_hex: string | null
          created_at: string
          flat_sqft: number | null
          geometry_json: Json
          id: string
          notes: string | null
          page_reference: string | null
          plan_sheet_id: string | null
          project_id: string
          slope_ratio: number | null
          system_id: string | null
          true_sqft: number | null
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          flat_sqft?: number | null
          geometry_json: Json
          id?: string
          notes?: string | null
          page_reference?: string | null
          plan_sheet_id?: string | null
          project_id: string
          slope_ratio?: number | null
          system_id?: string | null
          true_sqft?: number | null
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          flat_sqft?: number | null
          geometry_json?: Json
          id?: string
          notes?: string | null
          page_reference?: string | null
          plan_sheet_id?: string | null
          project_id?: string
          slope_ratio?: number | null
          system_id?: string | null
          true_sqft?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "takeoff_areas_plan_sheet_id_fkey"
            columns: ["plan_sheet_id"]
            isOneToOne: false
            referencedRelation: "plan_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeoff_areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeoff_areas_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "construction_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      takeoff_items: {
        Row: {
          ai_detected: boolean | null
          category: string | null
          coordinates: Json | null
          created_at: string
          document_id: string | null
          id: string
          item_name: string
          metadata: Json | null
          project_id: string
          quantity: number
          unit: Database["public"]["Enums"]["takeoff_unit"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_detected?: boolean | null
          category?: string | null
          coordinates?: Json | null
          created_at?: string
          document_id?: string | null
          id?: string
          item_name: string
          metadata?: Json | null
          project_id: string
          quantity: number
          unit: Database["public"]["Enums"]["takeoff_unit"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_detected?: boolean | null
          category?: string | null
          coordinates?: Json | null
          created_at?: string
          document_id?: string | null
          id?: string
          item_name?: string
          metadata?: Json | null
          project_id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["takeoff_unit"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "takeoff_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "construction_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "takeoff_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tariffs: {
        Row: {
          created_at: string
          id: string
          name: string
          rules_json: Json | null
          tariff_type: Database["public"]["Enums"]["tariff_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          rules_json?: Json | null
          tariff_type: Database["public"]["Enums"]["tariff_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          rules_json?: Json | null
          tariff_type?: Database["public"]["Enums"]["tariff_type"]
          updated_at?: string
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          activity_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      task_completion_logs: {
        Row: {
          actual_duration_minutes: number | null
          actual_end: string | null
          actual_start: string | null
          completion_notes: string | null
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          location_lat: number | null
          location_lng: number | null
          scheduled_start: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          actual_end?: string | null
          actual_start?: string | null
          completion_notes?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          scheduled_start?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          actual_duration_minutes?: number | null
          actual_end?: string | null
          actual_start?: string | null
          completion_notes?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          scheduled_start?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completion_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notes: {
        Row: {
          activity_id: string
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_subtasks: {
        Row: {
          activity_id: string
          completed: boolean | null
          created_at: string
          id: string
          position: number | null
          title: string
        }
        Insert: {
          activity_id: string
          completed?: boolean | null
          created_at?: string
          id?: string
          position?: number | null
          title: string
        }
        Update: {
          activity_id?: string
          completed?: boolean | null
          created_at?: string
          id?: string
          position?: number | null
          title?: string
        }
        Relationships: []
      }
      task_time_tracking: {
        Row: {
          actual_duration_minutes: number | null
          completed_at: string | null
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          location: string | null
          location_lat: number | null
          location_lng: number | null
          started_at: string | null
          task_id: string
          task_type: string | null
          user_id: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          started_at?: string | null
          task_id: string
          task_type?: string | null
          user_id: string
        }
        Update: {
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          started_at?: string | null
          task_id?: string
          task_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          audio_url: string | null
          category: string
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          audio_url?: string | null
          category?: string
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          audio_url?: string | null
          category?: string
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          assigned_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string | null
          default_permissions: Json | null
          expires_at: string | null
          id: string
          invitation_token: string | null
          invitee_email: string
          invitee_name: string | null
          inviter_id: string
          message: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string | null
          default_permissions?: Json | null
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invitee_email: string
          invitee_name?: string | null
          inviter_id: string
          message?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string | null
          default_permissions?: Json | null
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invitee_email?: string
          invitee_name?: string | null
          inviter_id?: string
          message?: string | null
          status?: string | null
        }
        Relationships: []
      }
      test_stands: {
        Row: {
          calibration_date: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          power_analyzer_model: string | null
          scope_model: string | null
          torque_cert_url: string | null
          torque_sensor_model: string | null
          updated_at: string
        }
        Insert: {
          calibration_date?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          power_analyzer_model?: string | null
          scope_model?: string | null
          torque_cert_url?: string | null
          torque_sensor_model?: string | null
          updated_at?: string
        }
        Update: {
          calibration_date?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          power_analyzer_model?: string | null
          scope_model?: string | null
          torque_cert_url?: string | null
          torque_sensor_model?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      theme_validations: {
        Row: {
          created_at: string | null
          id: string
          passes_accessibility: boolean
          passes_layout: boolean
          report_json: Json
          theme_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          passes_accessibility: boolean
          passes_layout: boolean
          report_json?: Json
          theme_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          passes_accessibility?: boolean
          passes_layout?: boolean
          report_json?: Json
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_validations_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string | null
          css_content: string | null
          id: string
          is_published: boolean | null
          library_version_id: string | null
          name: string
          palette_json: Json
          published_url: string | null
          source_type: string
          tokens_json: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          css_content?: string | null
          id?: string
          is_published?: boolean | null
          library_version_id?: string | null
          name: string
          palette_json?: Json
          published_url?: string | null
          source_type: string
          tokens_json?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          css_content?: string | null
          id?: string
          is_published?: boolean | null
          library_version_id?: string | null
          name?: string
          palette_json?: Json
          published_url?: string | null
          source_type?: string
          tokens_json?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "themes_library_version_id_fkey"
            columns: ["library_version_id"]
            isOneToOne: false
            referencedRelation: "library_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      topology_switches: {
        Row: {
          action: Database["public"]["Enums"]["switch_action"]
          auto: boolean | null
          created_at: string
          device_asset_id: string | null
          feeder_id: string
          id: string
          operator_id: string | null
          reason: string | null
          ts: string
        }
        Insert: {
          action: Database["public"]["Enums"]["switch_action"]
          auto?: boolean | null
          created_at?: string
          device_asset_id?: string | null
          feeder_id: string
          id?: string
          operator_id?: string | null
          reason?: string | null
          ts?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["switch_action"]
          auto?: boolean | null
          created_at?: string
          device_asset_id?: string | null
          feeder_id?: string
          id?: string
          operator_id?: string | null
          reason?: string | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "topology_switches_device_asset_id_fkey"
            columns: ["device_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topology_switches_feeder_id_fkey"
            columns: ["feeder_id"]
            isOneToOne: false
            referencedRelation: "grid_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_entries: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          transaction_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          transaction_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      trueodds_audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      trueodds_bet_legs: {
        Row: {
          bet_id: string
          created_at: string
          id: string
          locked_odds: number
          market_id: string
          outcome_id: string
          result: Database["public"]["Enums"]["outcome_result"] | null
        }
        Insert: {
          bet_id: string
          created_at?: string
          id?: string
          locked_odds: number
          market_id: string
          outcome_id: string
          result?: Database["public"]["Enums"]["outcome_result"] | null
        }
        Update: {
          bet_id?: string
          created_at?: string
          id?: string
          locked_odds?: number
          market_id?: string
          outcome_id?: string
          result?: Database["public"]["Enums"]["outcome_result"] | null
        }
        Relationships: [
          {
            foreignKeyName: "trueodds_bet_legs_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "trueodds_bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trueodds_bet_legs_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trueodds_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trueodds_bet_legs_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "trueodds_outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      trueodds_bets: {
        Row: {
          actual_payout: number | null
          created_at: string
          id: string
          potential_payout: number
          settled_at: string | null
          stake: number
          status: Database["public"]["Enums"]["bet_status"]
          type: Database["public"]["Enums"]["bet_type"]
          user_id: string
        }
        Insert: {
          actual_payout?: number | null
          created_at?: string
          id?: string
          potential_payout: number
          settled_at?: string | null
          stake: number
          status?: Database["public"]["Enums"]["bet_status"]
          type?: Database["public"]["Enums"]["bet_type"]
          user_id: string
        }
        Update: {
          actual_payout?: number | null
          created_at?: string
          id?: string
          potential_payout?: number
          settled_at?: string | null
          stake?: number
          status?: Database["public"]["Enums"]["bet_status"]
          type?: Database["public"]["Enums"]["bet_type"]
          user_id?: string
        }
        Relationships: []
      }
      trueodds_markets: {
        Row: {
          base_odds: number
          category: Database["public"]["Enums"]["market_category"]
          close_at: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          label: string
          live_odds: number
          metadata: Json | null
          open_at: string
          settle_at: string | null
          signal_score: number
          status: Database["public"]["Enums"]["market_status"]
          updated_at: string
        }
        Insert: {
          base_odds?: number
          category: Database["public"]["Enums"]["market_category"]
          close_at: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          label: string
          live_odds?: number
          metadata?: Json | null
          open_at?: string
          settle_at?: string | null
          signal_score?: number
          status?: Database["public"]["Enums"]["market_status"]
          updated_at?: string
        }
        Update: {
          base_odds?: number
          category?: Database["public"]["Enums"]["market_category"]
          close_at?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          label?: string
          live_odds?: number
          metadata?: Json | null
          open_at?: string
          settle_at?: string | null
          signal_score?: number
          status?: Database["public"]["Enums"]["market_status"]
          updated_at?: string
        }
        Relationships: []
      }
      trueodds_outcomes: {
        Row: {
          created_at: string
          id: string
          label: string
          live_odds: number
          market_id: string
          result: Database["public"]["Enums"]["outcome_result"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          live_odds?: number
          market_id: string
          result?: Database["public"]["Enums"]["outcome_result"] | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          live_odds?: number
          market_id?: string
          result?: Database["public"]["Enums"]["outcome_result"] | null
        }
        Relationships: [
          {
            foreignKeyName: "trueodds_outcomes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trueodds_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trueodds_player_history: {
        Row: {
          created_at: string
          game_date: string
          id: string
          opponent: string
          player_id: string
          stat_type: string
          stat_value: number
        }
        Insert: {
          created_at?: string
          game_date: string
          id?: string
          opponent: string
          player_id: string
          stat_type: string
          stat_value: number
        }
        Update: {
          created_at?: string
          game_date?: string
          id?: string
          opponent?: string
          player_id?: string
          stat_type?: string
          stat_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "trueodds_player_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "trueodds_players"
            referencedColumns: ["id"]
          },
        ]
      }
      trueodds_player_props: {
        Row: {
          created_at: string
          game_date: string
          game_opponent: string
          id: string
          over_odds: number
          player_id: string
          player_name: string
          projection: number
          stat_type: string
          team: string
          under_odds: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_date: string
          game_opponent: string
          id?: string
          over_odds?: number
          player_id: string
          player_name: string
          projection: number
          stat_type: string
          team: string
          under_odds?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_date?: string
          game_opponent?: string
          id?: string
          over_odds?: number
          player_id?: string
          player_name?: string
          projection?: number
          stat_type?: string
          team?: string
          under_odds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trueodds_player_props_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "trueodds_players"
            referencedColumns: ["id"]
          },
        ]
      }
      trueodds_players: {
        Row: {
          created_at: string
          id: string
          name: string
          next_game: string | null
          next_opponent: string | null
          position: string
          status: string | null
          team: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          next_game?: string | null
          next_opponent?: string | null
          position: string
          status?: string | null
          team: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          next_game?: string | null
          next_opponent?: string | null
          position?: string
          status?: string | null
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      trueodds_signals: {
        Row: {
          created_at: string
          id: string
          impact: number
          kind: Database["public"]["Enums"]["signal_kind"]
          market_id: string
          source: string
          summary: string
          url: string | null
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          impact?: number
          kind: Database["public"]["Enums"]["signal_kind"]
          market_id: string
          source: string
          summary: string
          url?: string | null
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          impact?: number
          kind?: Database["public"]["Enums"]["signal_kind"]
          market_id?: string
          source?: string
          summary?: string
          url?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "trueodds_signals_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "trueodds_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trueodds_user_prefs: {
        Row: {
          created_at: string
          feature_real_money: boolean
          id: string
          jurisdiction: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_real_money?: boolean
          id?: string
          jurisdiction?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_real_money?: boolean
          id?: string
          jurisdiction?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unified_companies: {
        Row: {
          annual_revenue: number | null
          created_at: string | null
          domain: string | null
          employee_count: number | null
          external_id: string | null
          id: string
          industry: string | null
          name: string
          properties: Json | null
          source_connector_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue?: number | null
          created_at?: string | null
          domain?: string | null
          employee_count?: number | null
          external_id?: string | null
          id?: string
          industry?: string | null
          name: string
          properties?: Json | null
          source_connector_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue?: number | null
          created_at?: string | null
          domain?: string | null
          employee_count?: number | null
          external_id?: string | null
          id?: string
          industry?: string | null
          name?: string
          properties?: Json | null
          source_connector_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_companies_source_connector_id_fkey"
            columns: ["source_connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_contacts: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          external_id: string | null
          id: string
          last_contacted_at: string | null
          name: string
          phone: string | null
          properties: Json | null
          source_connector_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          last_contacted_at?: string | null
          name: string
          phone?: string | null
          properties?: Json | null
          source_connector_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          last_contacted_at?: string | null
          name?: string
          phone?: string | null
          properties?: Json | null
          source_connector_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_contacts_source_connector_id_fkey"
            columns: ["source_connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_deals: {
        Row: {
          amount: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          currency: string | null
          expected_close_date: string | null
          external_id: string | null
          id: string
          name: string
          probability: number | null
          properties: Json | null
          source_connector_id: string | null
          stage: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          external_id?: string | null
          id?: string
          name: string
          probability?: number | null
          properties?: Json | null
          source_connector_id?: string | null
          stage?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          external_id?: string | null
          id?: string
          name?: string
          probability?: number | null
          properties?: Json | null
          source_connector_id?: string | null
          stage?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "unified_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "unified_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_deals_source_connector_id_fkey"
            columns: ["source_connector_id"]
            isOneToOne: false
            referencedRelation: "connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          connected_user_id: string
          connection_type: string
          created_at: string | null
          created_by: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_user_id: string
          connection_type?: string
          created_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_user_id?: string
          connection_type?: string
          created_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feature_toggles: {
        Row: {
          created_at: string
          enabled_at: string | null
          enabled_by: string | null
          feature_name: string
          id: string
          is_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          invite_code: string
          invited_user_id: string | null
          invitee_email: string
          invitee_name: string | null
          inviter_id: string
          message: string | null
          role: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_user_id?: string | null
          invitee_email: string
          invitee_name?: string | null
          inviter_id: string
          message?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_user_id?: string | null
          invitee_email?: string
          invitee_name?: string | null
          inviter_id?: string
          message?: string | null
          role?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_default: boolean | null
          lat: number
          lng: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          lat: number
          lng: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          lat?: number
          lng?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          module: Database["public"]["Enums"]["platform_module"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          module: Database["public"]["Enums"]["platform_module"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          module?: Database["public"]["Enums"]["platform_module"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_platform_connections: {
        Row: {
          access_token_encrypted: string | null
          api_key_encrypted: string | null
          auth_method: string | null
          auto_sync_enabled: boolean | null
          connection_name: string | null
          connection_status: string | null
          created_at: string
          discovered_capabilities: Json | null
          discovered_projects: Json | null
          discovery_completed_at: string | null
          external_account_id: string | null
          external_account_name: string | null
          external_workspace_id: string | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          platform_id: string
          platform_metadata: Json | null
          refresh_token_encrypted: string | null
          sync_frequency_minutes: number | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          webhook_secret_encrypted: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          auth_method?: string | null
          auto_sync_enabled?: boolean | null
          connection_name?: string | null
          connection_status?: string | null
          created_at?: string
          discovered_capabilities?: Json | null
          discovered_projects?: Json | null
          discovery_completed_at?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          external_workspace_id?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          platform_id: string
          platform_metadata?: Json | null
          refresh_token_encrypted?: string | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          webhook_secret_encrypted?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          api_key_encrypted?: string | null
          auth_method?: string | null
          auto_sync_enabled?: boolean | null
          connection_name?: string | null
          connection_status?: string | null
          created_at?: string
          discovered_capabilities?: Json | null
          discovered_projects?: Json | null
          discovery_completed_at?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          external_workspace_id?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          platform_id?: string
          platform_metadata?: Json | null
          refresh_token_encrypted?: string | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          webhook_secret_encrypted?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_platform_connections_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "external_platform_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scheduling_preferences: {
        Row: {
          avg_task_completion_accuracy: number | null
          batch_similar_tasks: boolean | null
          commute_buffer_minutes: number | null
          created_at: string
          default_location: string | null
          default_location_lat: number | null
          default_location_lng: number | null
          focus_block_duration_minutes: number | null
          id: string
          low_energy_time: string | null
          lunch_duration_minutes: number | null
          lunch_start_time: string | null
          max_meetings_per_day: number | null
          min_buffer_between_meetings_minutes: number | null
          peak_energy_time: string | null
          prefer_focus_time_morning: boolean | null
          preferred_task_order: string | null
          short_break_duration_minutes: number | null
          short_break_frequency_hours: number | null
          task_time_estimates_json: Json | null
          total_tasks_tracked: number | null
          updated_at: string
          user_id: string
          work_days: number[]
          work_end_time: string
          work_start_time: string
        }
        Insert: {
          avg_task_completion_accuracy?: number | null
          batch_similar_tasks?: boolean | null
          commute_buffer_minutes?: number | null
          created_at?: string
          default_location?: string | null
          default_location_lat?: number | null
          default_location_lng?: number | null
          focus_block_duration_minutes?: number | null
          id?: string
          low_energy_time?: string | null
          lunch_duration_minutes?: number | null
          lunch_start_time?: string | null
          max_meetings_per_day?: number | null
          min_buffer_between_meetings_minutes?: number | null
          peak_energy_time?: string | null
          prefer_focus_time_morning?: boolean | null
          preferred_task_order?: string | null
          short_break_duration_minutes?: number | null
          short_break_frequency_hours?: number | null
          task_time_estimates_json?: Json | null
          total_tasks_tracked?: number | null
          updated_at?: string
          user_id: string
          work_days?: number[]
          work_end_time?: string
          work_start_time?: string
        }
        Update: {
          avg_task_completion_accuracy?: number | null
          batch_similar_tasks?: boolean | null
          commute_buffer_minutes?: number | null
          created_at?: string
          default_location?: string | null
          default_location_lat?: number | null
          default_location_lng?: number | null
          focus_block_duration_minutes?: number | null
          id?: string
          low_energy_time?: string | null
          lunch_duration_minutes?: number | null
          lunch_start_time?: string | null
          max_meetings_per_day?: number | null
          min_buffer_between_meetings_minutes?: number | null
          peak_energy_time?: string | null
          prefer_focus_time_morning?: boolean | null
          preferred_task_order?: string | null
          short_break_duration_minutes?: number | null
          short_break_frequency_hours?: number | null
          task_time_estimates_json?: Json | null
          total_tasks_tracked?: number | null
          updated_at?: string
          user_id?: string
          work_days?: number[]
          work_end_time?: string
          work_start_time?: string
        }
        Relationships: []
      }
      user_security_profiles: {
        Row: {
          account_locked_until: string | null
          allowed_ip_ranges: unknown[] | null
          created_at: string | null
          failed_login_attempts: number | null
          id: string
          last_failed_login_at: string | null
          last_security_training_at: string | null
          max_concurrent_sessions: number | null
          mfa_enabled: boolean | null
          mfa_methods: string[] | null
          risk_score: number | null
          security_clearance: string | null
          security_training_status: string | null
          session_timeout_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          allowed_ip_ranges?: unknown[] | null
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_failed_login_at?: string | null
          last_security_training_at?: string | null
          max_concurrent_sessions?: number | null
          mfa_enabled?: boolean | null
          mfa_methods?: string[] | null
          risk_score?: number | null
          security_clearance?: string | null
          security_training_status?: string | null
          session_timeout_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          allowed_ip_ranges?: unknown[] | null
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_failed_login_at?: string | null
          last_security_training_at?: string | null
          max_concurrent_sessions?: number | null
          mfa_enabled?: boolean | null
          mfa_methods?: string[] | null
          risk_score?: number | null
          security_clearance?: string | null
          security_training_status?: string | null
          session_timeout_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_terms_acceptance: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      value_registry_assets: {
        Row: {
          asset_type: string
          component_count: number | null
          created_at: string
          created_by: string | null
          current_value: number | null
          custom_category: string | null
          description: string | null
          external_id: string | null
          gpc_code: string | null
          hs_code: string | null
          id: string
          is_composite: boolean | null
          jurisdiction: string | null
          last_valued_at: string | null
          location_geo: Json | null
          metadata: Json | null
          naics_code: string | null
          name: string
          owner_id: string | null
          owner_type: string | null
          parent_asset_id: string | null
          serial_number: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          valuation_method: string | null
          value_confidence: number | null
          value_currency: string | null
        }
        Insert: {
          asset_type: string
          component_count?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          custom_category?: string | null
          description?: string | null
          external_id?: string | null
          gpc_code?: string | null
          hs_code?: string | null
          id?: string
          is_composite?: boolean | null
          jurisdiction?: string | null
          last_valued_at?: string | null
          location_geo?: Json | null
          metadata?: Json | null
          naics_code?: string | null
          name: string
          owner_id?: string | null
          owner_type?: string | null
          parent_asset_id?: string | null
          serial_number?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          valuation_method?: string | null
          value_confidence?: number | null
          value_currency?: string | null
        }
        Update: {
          asset_type?: string
          component_count?: number | null
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          custom_category?: string | null
          description?: string | null
          external_id?: string | null
          gpc_code?: string | null
          hs_code?: string | null
          id?: string
          is_composite?: boolean | null
          jurisdiction?: string | null
          last_valued_at?: string | null
          location_geo?: Json | null
          metadata?: Json | null
          naics_code?: string | null
          name?: string
          owner_id?: string | null
          owner_type?: string | null
          parent_asset_id?: string | null
          serial_number?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          valuation_method?: string | null
          value_confidence?: number | null
          value_currency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "value_registry_assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "value_registry_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      value_registry_classifications: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          level: number | null
          metadata: Json | null
          name: string
          parent_code: string | null
          path: string[] | null
          taxonomy: string
          typical_depreciation_rate: number | null
          typical_valuation_methods: string[] | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          level?: number | null
          metadata?: Json | null
          name: string
          parent_code?: string | null
          path?: string[] | null
          taxonomy: string
          typical_depreciation_rate?: number | null
          typical_valuation_methods?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: number | null
          metadata?: Json | null
          name?: string
          parent_code?: string | null
          path?: string[] | null
          taxonomy?: string
          typical_depreciation_rate?: number | null
          typical_valuation_methods?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "value_registry_classifications_parent_code_fkey"
            columns: ["parent_code"]
            isOneToOne: false
            referencedRelation: "value_registry_classifications"
            referencedColumns: ["code"]
          },
        ]
      }
      value_registry_events: {
        Row: {
          asset_id: string
          created_at: string
          event_at: string
          event_data: Json
          event_type: string
          from_owner_id: string | null
          id: string
          to_owner_id: string | null
          value_after: number | null
          value_before: number | null
          value_change: number | null
          verification_hash: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          event_at?: string
          event_data?: Json
          event_type: string
          from_owner_id?: string | null
          id?: string
          to_owner_id?: string | null
          value_after?: number | null
          value_before?: number | null
          value_change?: number | null
          verification_hash?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          event_at?: string
          event_data?: Json
          event_type?: string
          from_owner_id?: string | null
          id?: string
          to_owner_id?: string | null
          value_after?: number | null
          value_before?: number | null
          value_change?: number | null
          verification_hash?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "value_registry_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "value_registry_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      value_registry_history: {
        Row: {
          asset_id: string
          confidence_score: number | null
          context: Json | null
          created_at: string
          currency: string | null
          data_source: string | null
          id: string
          notes: string | null
          source_reference: string | null
          valuation_method: string
          value: number
          valued_at: string
          valued_by: string | null
        }
        Insert: {
          asset_id: string
          confidence_score?: number | null
          context?: Json | null
          created_at?: string
          currency?: string | null
          data_source?: string | null
          id?: string
          notes?: string | null
          source_reference?: string | null
          valuation_method: string
          value: number
          valued_at?: string
          valued_by?: string | null
        }
        Update: {
          asset_id?: string
          confidence_score?: number | null
          context?: Json | null
          created_at?: string
          currency?: string | null
          data_source?: string | null
          id?: string
          notes?: string | null
          source_reference?: string | null
          valuation_method?: string
          value?: number
          valued_at?: string
          valued_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "value_registry_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "value_registry_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_assessments: {
        Row: {
          assessment_type: string | null
          assessor_id: string | null
          created_at: string | null
          financial_health_score: number | null
          gdpr_compliance: string | null
          id: string
          iso27001_status: string | null
          last_assessment_date: string | null
          next_assessment_date: string | null
          notes: string | null
          overall_risk_score: number | null
          soc2_status: string | null
          updated_at: string | null
          vendor_company_id: string | null
          vendor_name: string
        }
        Insert: {
          assessment_type?: string | null
          assessor_id?: string | null
          created_at?: string | null
          financial_health_score?: number | null
          gdpr_compliance?: string | null
          id?: string
          iso27001_status?: string | null
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          notes?: string | null
          overall_risk_score?: number | null
          soc2_status?: string | null
          updated_at?: string | null
          vendor_company_id?: string | null
          vendor_name: string
        }
        Update: {
          assessment_type?: string | null
          assessor_id?: string | null
          created_at?: string | null
          financial_health_score?: number | null
          gdpr_compliance?: string | null
          id?: string
          iso27001_status?: string | null
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          notes?: string | null
          overall_risk_score?: number | null
          soc2_status?: string | null
          updated_at?: string | null
          vendor_company_id?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      voice_narration_cache: {
        Row: {
          audio_url: string
          cache_key: string
          content_hash: string
          created_at: string
          file_path: string
          id: string
          persona: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          cache_key: string
          content_hash: string
          created_at?: string
          file_path: string
          id?: string
          persona?: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          cache_key?: string
          content_hash?: string
          created_at?: string
          file_path?: string
          id?: string
          persona?: string
          updated_at?: string
        }
        Relationships: []
      }
      wage_tables: {
        Row: {
          base_rate: number
          craft: string
          created_at: string
          effective_date: string
          expiration_date: string | null
          fringe_rate: number
          geo_code: string
          id: string
          metadata: Json | null
        }
        Insert: {
          base_rate: number
          craft: string
          created_at?: string
          effective_date: string
          expiration_date?: string | null
          fringe_rate: number
          geo_code: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          base_rate?: number
          craft?: string
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          fringe_rate?: number
          geo_code?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          is_simulation: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_simulation?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_simulation?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      website_sections: {
        Row: {
          ai_generation_prompt: string | null
          content_template: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          section_type: string
        }
        Insert: {
          ai_generation_prompt?: string | null
          content_template: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          section_type: string
        }
        Update: {
          ai_generation_prompt?: string | null
          content_template?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          section_type?: string
        }
        Relationships: []
      }
      website_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          preview_image_url: string | null
          sections: Json
          theme: Json
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
          sections?: Json
          theme?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
          sections?: Json
          theme?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      website_usage_tracking: {
        Row: {
          action_type: string
          ai_tokens: number | null
          cost: number | null
          created_at: string | null
          id: string
          user_id: string
          website_id: string | null
        }
        Insert: {
          action_type: string
          ai_tokens?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          user_id: string
          website_id?: string | null
        }
        Update: {
          action_type?: string
          ai_tokens?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          user_id?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_usage_tracking_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "generated_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_configs: {
        Row: {
          app_id: string
          brand_name: string
          created_at: string | null
          custom_domain: string | null
          custom_pricing: number | null
          id: string
          is_active: boolean | null
          license_id: string
          logo_url: string | null
          metadata: Json | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id: string
          brand_name: string
          created_at?: string | null
          custom_domain?: string | null
          custom_pricing?: number | null
          id?: string
          is_active?: boolean | null
          license_id: string
          logo_url?: string | null
          metadata?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          brand_name?: string
          created_at?: string | null
          custom_domain?: string | null
          custom_pricing?: number | null
          id?: string
          is_active?: boolean | null
          license_id?: string
          logo_url?: string | null
          metadata?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "white_label_configs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "white_label_configs_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: true
            referencedRelation: "app_licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      white_paper_change_log: {
        Row: {
          change_summary: string | null
          change_type: string
          created_at: string | null
          id: string
          new_version: number | null
          previous_version: number | null
          triggered_by: string | null
          white_paper_id: string | null
        }
        Insert: {
          change_summary?: string | null
          change_type: string
          created_at?: string | null
          id?: string
          new_version?: number | null
          previous_version?: number | null
          triggered_by?: string | null
          white_paper_id?: string | null
        }
        Update: {
          change_summary?: string | null
          change_type?: string
          created_at?: string | null
          id?: string
          new_version?: number | null
          previous_version?: number | null
          triggered_by?: string | null
          white_paper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "white_paper_change_log_white_paper_id_fkey"
            columns: ["white_paper_id"]
            isOneToOne: false
            referencedRelation: "platform_white_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_approvals: {
        Row: {
          approval_type: string
          assigned_to: string | null
          context_data: Json | null
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          description: string | null
          escalate_to: string | null
          escalated_at: string | null
          expires_at: string | null
          id: string
          node_execution_id: string | null
          notification_sent: boolean | null
          required_role: string | null
          run_id: string
          status: string
          title: string
        }
        Insert: {
          approval_type?: string
          assigned_to?: string | null
          context_data?: Json | null
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          description?: string | null
          escalate_to?: string | null
          escalated_at?: string | null
          expires_at?: string | null
          id?: string
          node_execution_id?: string | null
          notification_sent?: boolean | null
          required_role?: string | null
          run_id: string
          status?: string
          title: string
        }
        Update: {
          approval_type?: string
          assigned_to?: string | null
          context_data?: Json | null
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          description?: string | null
          escalate_to?: string | null
          escalated_at?: string | null
          expires_at?: string | null
          id?: string
          node_execution_id?: string | null
          notification_sent?: boolean | null
          required_role?: string | null
          run_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_approvals_node_execution_id_fkey"
            columns: ["node_execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_node_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_execution_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_event_subscriptions: {
        Row: {
          created_at: string | null
          event_type: string
          filter_config: Json | null
          id: string
          is_active: boolean | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          filter_config?: Json | null
          id?: string
          is_active?: boolean | null
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          filter_config?: Json | null
          id?: string
          is_active?: boolean | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_event_subscriptions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_runs: {
        Row: {
          completed_at: string | null
          correlation_id: string | null
          created_at: string | null
          created_by: string | null
          credits_consumed: number | null
          duration_ms: number | null
          error_message: string | null
          error_stack: string | null
          id: string
          input_data: Json | null
          max_retries: number | null
          node_count: number | null
          nodes_completed: number | null
          nodes_failed: number | null
          output_data: Json | null
          parent_run_id: string | null
          priority: number | null
          resource_usage: Json | null
          retry_count: number | null
          run_number: number
          started_at: string | null
          status: string
          trigger_data: Json | null
          trigger_type: string
          updated_at: string | null
          version_id: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credits_consumed?: number | null
          duration_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          input_data?: Json | null
          max_retries?: number | null
          node_count?: number | null
          nodes_completed?: number | null
          nodes_failed?: number | null
          output_data?: Json | null
          parent_run_id?: string | null
          priority?: number | null
          resource_usage?: Json | null
          retry_count?: number | null
          run_number?: number
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type?: string
          updated_at?: string | null
          version_id?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credits_consumed?: number | null
          duration_ms?: number | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          input_data?: Json | null
          max_retries?: number | null
          node_count?: number | null
          nodes_completed?: number | null
          nodes_failed?: number | null
          output_data?: Json | null
          parent_run_id?: string | null
          priority?: number | null
          resource_usage?: Json | null
          retry_count?: number | null
          run_number?: number
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type?: string
          updated_at?: string | null
          version_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_execution_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_execution_runs_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "workflow_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_execution_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_items: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          cost_impact: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          item_number: string
          item_type: Database["public"]["Enums"]["workflow_item_type"]
          metadata: Json | null
          project_id: string
          status: Database["public"]["Enums"]["workflow_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          cost_impact?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          item_number: string
          item_type: Database["public"]["Enums"]["workflow_item_type"]
          metadata?: Json | null
          project_id: string
          status?: Database["public"]["Enums"]["workflow_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          cost_impact?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          item_number?: string
          item_type?: Database["public"]["Enums"]["workflow_item_type"]
          metadata?: Json | null
          project_id?: string
          status?: Database["public"]["Enums"]["workflow_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "construction_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_marketplace_listings: {
        Row: {
          average_rating: number | null
          category: string
          compliance_level: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          documentation_url: string | null
          featured: boolean | null
          icon_url: string | null
          id: string
          long_description: string | null
          name: string
          preview_images: string[] | null
          price_cents: number | null
          pricing_model: string
          published_at: string | null
          publisher_id: string
          review_count: number | null
          security_classification: string | null
          status: string
          subscription_interval: string | null
          support_email: string | null
          tags: string[] | null
          total_installs: number | null
          total_runs: number | null
          updated_at: string | null
          usage_rate_cents: number | null
          version: string
          workflow_id: string
        }
        Insert: {
          average_rating?: number | null
          category?: string
          compliance_level?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          documentation_url?: string | null
          featured?: boolean | null
          icon_url?: string | null
          id?: string
          long_description?: string | null
          name: string
          preview_images?: string[] | null
          price_cents?: number | null
          pricing_model?: string
          published_at?: string | null
          publisher_id: string
          review_count?: number | null
          security_classification?: string | null
          status?: string
          subscription_interval?: string | null
          support_email?: string | null
          tags?: string[] | null
          total_installs?: number | null
          total_runs?: number | null
          updated_at?: string | null
          usage_rate_cents?: number | null
          version?: string
          workflow_id: string
        }
        Update: {
          average_rating?: number | null
          category?: string
          compliance_level?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          documentation_url?: string | null
          featured?: boolean | null
          icon_url?: string | null
          id?: string
          long_description?: string | null
          name?: string
          preview_images?: string[] | null
          price_cents?: number | null
          pricing_model?: string
          published_at?: string | null
          publisher_id?: string
          review_count?: number | null
          security_classification?: string | null
          status?: string
          subscription_interval?: string | null
          support_email?: string | null
          tags?: string[] | null
          total_installs?: number | null
          total_runs?: number | null
          updated_at?: string | null
          usage_rate_cents?: number | null
          version?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_marketplace_listings_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_marketplace_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          listing_id: string
          rating: number
          review_text: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          listing_id: string
          rating: number
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          listing_id?: string
          rating?: number
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_marketplace_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "workflow_marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_node_executions: {
        Row: {
          ai_model_used: string | null
          completed_at: string | null
          cost_cents: number | null
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          execution_order: number
          external_call_logs: Json | null
          id: string
          input_data: Json | null
          node_id: string
          node_name: string | null
          node_type: string
          output_data: Json | null
          retry_attempt: number | null
          run_id: string
          started_at: string | null
          status: string
          tokens_consumed: number | null
        }
        Insert: {
          ai_model_used?: string | null
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          execution_order?: number
          external_call_logs?: Json | null
          id?: string
          input_data?: Json | null
          node_id: string
          node_name?: string | null
          node_type: string
          output_data?: Json | null
          retry_attempt?: number | null
          run_id: string
          started_at?: string | null
          status?: string
          tokens_consumed?: number | null
        }
        Update: {
          ai_model_used?: string | null
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          execution_order?: number
          external_call_logs?: Json | null
          id?: string
          input_data?: Json | null
          node_id?: string
          node_name?: string | null
          node_type?: string
          output_data?: Json | null
          retry_attempt?: number | null
          run_id?: string
          started_at?: string | null
          status?: string
          tokens_consumed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_node_executions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_execution_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_node_types: {
        Row: {
          category: string
          color: string | null
          config_schema: Json | null
          cost_per_execution: number | null
          created_at: string | null
          description: string | null
          execution_handler: string | null
          icon: string
          id: string
          input_schema: Json | null
          is_active: boolean | null
          is_trigger: boolean | null
          module: string | null
          name: string
          output_schema: Json | null
          requires_approval: boolean | null
          requires_premium: boolean | null
          retry_config: Json | null
          security_level: string | null
          slug: string
          supported_integrations: string[] | null
          timeout_seconds: number | null
        }
        Insert: {
          category: string
          color?: string | null
          config_schema?: Json | null
          cost_per_execution?: number | null
          created_at?: string | null
          description?: string | null
          execution_handler?: string | null
          icon: string
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_trigger?: boolean | null
          module?: string | null
          name: string
          output_schema?: Json | null
          requires_approval?: boolean | null
          requires_premium?: boolean | null
          retry_config?: Json | null
          security_level?: string | null
          slug: string
          supported_integrations?: string[] | null
          timeout_seconds?: number | null
        }
        Update: {
          category?: string
          color?: string | null
          config_schema?: Json | null
          cost_per_execution?: number | null
          created_at?: string | null
          description?: string | null
          execution_handler?: string | null
          icon?: string
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_trigger?: boolean | null
          module?: string | null
          name?: string
          output_schema?: Json | null
          requires_approval?: boolean | null
          requires_premium?: boolean | null
          retry_config?: Json | null
          security_level?: string | null
          slug?: string
          supported_integrations?: string[] | null
          timeout_seconds?: number | null
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          error_node_id: string | null
          id: string
          metadata: Json | null
          node_results: Json | null
          started_at: string | null
          status: string
          trigger_data: Json | null
          trigger_type: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          error_node_id?: string | null
          id?: string
          metadata?: Json | null
          node_results?: Json | null
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          error_node_id?: string | null
          id?: string
          metadata?: Json | null
          node_results?: Json | null
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          timezone: string | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          timezone?: string | null
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          timezone?: string | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_schedules_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          listing_id: string
          metadata: Json | null
          payment_method: string | null
          started_at: string | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          listing_id: string
          metadata?: Json | null
          payment_method?: string | null
          started_at?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          listing_id?: string
          metadata?: Json | null
          payment_method?: string | null
          started_at?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_subscriptions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "workflow_marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string
          complexity: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_time_saved_hours: number | null
          icon: string | null
          id: string
          is_featured: boolean | null
          is_system: boolean | null
          name: string
          rating: number | null
          rating_count: number | null
          required_modules: string[] | null
          slug: string
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          use_count: number | null
        }
        Insert: {
          category: string
          complexity?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_time_saved_hours?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_system?: boolean | null
          name: string
          rating?: number | null
          rating_count?: number | null
          required_modules?: string[] | null
          slug: string
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          use_count?: number | null
        }
        Update: {
          category?: string
          complexity?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_time_saved_hours?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_system?: boolean | null
          name?: string
          rating?: number | null
          rating_count?: number | null
          required_modules?: string[] | null
          slug?: string
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          use_count?: number | null
        }
        Relationships: []
      }
      workflow_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          changelog: string | null
          config: Json | null
          created_at: string | null
          created_by: string
          deployment_state: string | null
          edges: Json | null
          id: string
          is_published: boolean | null
          nodes: Json
          version: string
          version_number: number
          workflow_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          changelog?: string | null
          config?: Json | null
          created_at?: string | null
          created_by: string
          deployment_state?: string | null
          edges?: Json | null
          id?: string
          is_published?: boolean | null
          nodes?: Json
          version: string
          version_number?: number
          workflow_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          changelog?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string
          deployment_state?: string | null
          edges?: Json | null
          id?: string
          is_published?: boolean | null
          nodes?: Json
          version?: string
          version_number?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_versions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_webhooks: {
        Row: {
          allowed_ips: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          rate_limit: number | null
          rate_limit_window_seconds: number | null
          secret_key: string | null
          transform_script: string | null
          trigger_count: number | null
          updated_at: string | null
          validation_schema: Json | null
          webhook_key: string
          workflow_id: string
        }
        Insert: {
          allowed_ips?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          rate_limit?: number | null
          rate_limit_window_seconds?: number | null
          secret_key?: string | null
          transform_script?: string | null
          trigger_count?: number | null
          updated_at?: string | null
          validation_schema?: Json | null
          webhook_key?: string
          workflow_id: string
        }
        Update: {
          allowed_ips?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          rate_limit?: number | null
          rate_limit_window_seconds?: number | null
          secret_key?: string | null
          transform_script?: string | null
          trigger_count?: number | null
          updated_at?: string | null
          validation_schema?: Json | null
          webhook_key?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_webhooks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          edges: Json
          error_count: number | null
          id: string
          is_active: boolean | null
          is_draft: boolean | null
          last_run_at: string | null
          name: string
          nodes: Json
          run_count: number | null
          settings: Json | null
          success_count: number | null
          template_id: string | null
          trigger_config: Json | null
          updated_at: string | null
          user_id: string
          variables: Json | null
          version: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          edges?: Json
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          is_draft?: boolean | null
          last_run_at?: string | null
          name: string
          nodes?: Json
          run_count?: number | null
          settings?: Json | null
          success_count?: number | null
          template_id?: string | null
          trigger_config?: Json | null
          updated_at?: string | null
          user_id: string
          variables?: Json | null
          version?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          edges?: Json
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          is_draft?: boolean | null
          last_run_at?: string | null
          name?: string
          nodes?: Json
          run_count?: number | null
          settings?: Json | null
          success_count?: number | null
          template_id?: string | null
          trigger_config?: Json | null
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      xodiak_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["xdk_account_type"]
          address: string
          balance: number
          code_hash: string | null
          created_at: string
          metadata: Json | null
          nonce: number
          staked_amount: number
          storage_root: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["xdk_account_type"]
          address: string
          balance?: number
          code_hash?: string | null
          created_at?: string
          metadata?: Json | null
          nonce?: number
          staked_amount?: number
          storage_root?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["xdk_account_type"]
          address?: string
          balance?: number
          code_hash?: string | null
          created_at?: string
          metadata?: Json | null
          nonce?: number
          staked_amount?: number
          storage_root?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      xodiak_anchor_queue: {
        Row: {
          anchor_threshold: number | null
          anchored_at: string | null
          approved_at: string | null
          approved_by: string | null
          combined_value: number | null
          contribution_event_id: string | null
          created_at: string | null
          event_hash: string
          id: string
          merkle_batch_id: string | null
          merkle_proof: Json | null
          merkle_root: string | null
          requires_approval: boolean | null
          status: string | null
          updated_at: string | null
          xodiak_block_number: number | null
          xodiak_tx_hash: string | null
        }
        Insert: {
          anchor_threshold?: number | null
          anchored_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          combined_value?: number | null
          contribution_event_id?: string | null
          created_at?: string | null
          event_hash: string
          id?: string
          merkle_batch_id?: string | null
          merkle_proof?: Json | null
          merkle_root?: string | null
          requires_approval?: boolean | null
          status?: string | null
          updated_at?: string | null
          xodiak_block_number?: number | null
          xodiak_tx_hash?: string | null
        }
        Update: {
          anchor_threshold?: number | null
          anchored_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          combined_value?: number | null
          contribution_event_id?: string | null
          created_at?: string | null
          event_hash?: string
          id?: string
          merkle_batch_id?: string | null
          merkle_proof?: Json | null
          merkle_root?: string | null
          requires_approval?: boolean | null
          status?: string | null
          updated_at?: string | null
          xodiak_block_number?: number | null
          xodiak_tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xodiak_anchor_queue_contribution_event_id_fkey"
            columns: ["contribution_event_id"]
            isOneToOne: false
            referencedRelation: "contribution_events"
            referencedColumns: ["id"]
          },
        ]
      }
      xodiak_blocks: {
        Row: {
          block_hash: string
          block_number: number
          created_at: string
          difficulty: number | null
          extra_data: Json | null
          gas_limit: number | null
          gas_used: number | null
          id: string
          merkle_root: string
          nonce: number | null
          previous_hash: string
          state_root: string
          timestamp: string
          transaction_count: number
          validator_id: string | null
        }
        Insert: {
          block_hash: string
          block_number: number
          created_at?: string
          difficulty?: number | null
          extra_data?: Json | null
          gas_limit?: number | null
          gas_used?: number | null
          id?: string
          merkle_root: string
          nonce?: number | null
          previous_hash: string
          state_root: string
          timestamp?: string
          transaction_count?: number
          validator_id?: string | null
        }
        Update: {
          block_hash?: string
          block_number?: number
          created_at?: string
          difficulty?: number | null
          extra_data?: Json | null
          gas_limit?: number | null
          gas_used?: number | null
          id?: string
          merkle_root?: string
          nonce?: number | null
          previous_hash?: string
          state_root?: string
          timestamp?: string
          transaction_count?: number
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xodiak_blocks_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "xodiak_validators"
            referencedColumns: ["id"]
          },
        ]
      }
      xodiak_chain_state: {
        Row: {
          active_validators: number
          block_time_ms: number
          chain_id: string
          chain_name: string
          circulating_supply: number
          current_block_number: number
          genesis_timestamp: string | null
          id: string
          last_block_timestamp: string | null
          min_stake_amount: number
          parameters: Json | null
          total_staked: number
          total_supply: number
          total_transactions: number
          total_validators: number
        }
        Insert: {
          active_validators?: number
          block_time_ms?: number
          chain_id?: string
          chain_name?: string
          circulating_supply?: number
          current_block_number?: number
          genesis_timestamp?: string | null
          id?: string
          last_block_timestamp?: string | null
          min_stake_amount?: number
          parameters?: Json | null
          total_staked?: number
          total_supply?: number
          total_transactions?: number
          total_validators?: number
        }
        Update: {
          active_validators?: number
          block_time_ms?: number
          chain_id?: string
          chain_name?: string
          circulating_supply?: number
          current_block_number?: number
          genesis_timestamp?: string | null
          id?: string
          last_block_timestamp?: string | null
          min_stake_amount?: number
          parameters?: Json | null
          total_staked?: number
          total_supply?: number
          total_transactions?: number
          total_validators?: number
        }
        Relationships: []
      }
      xodiak_consensus_rounds: {
        Row: {
          block_number: number
          finalized_at: string | null
          id: string
          proposed_block_hash: string | null
          proposer_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["xdk_consensus_status"]
          total_stake_voted: number | null
          vote_count: number | null
          votes: Json | null
        }
        Insert: {
          block_number: number
          finalized_at?: string | null
          id?: string
          proposed_block_hash?: string | null
          proposer_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["xdk_consensus_status"]
          total_stake_voted?: number | null
          vote_count?: number | null
          votes?: Json | null
        }
        Update: {
          block_number?: number
          finalized_at?: string | null
          id?: string
          proposed_block_hash?: string | null
          proposer_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["xdk_consensus_status"]
          total_stake_voted?: number | null
          vote_count?: number | null
          votes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "xodiak_consensus_rounds_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "xodiak_validators"
            referencedColumns: ["id"]
          },
        ]
      }
      xodiak_tokenized_assets: {
        Row: {
          asset_type: string
          circulating_supply: number
          compliance_metadata: Json | null
          created_at: string
          decimals: number
          id: string
          is_frozen: boolean | null
          issuer_address: string
          name: string
          symbol: string
          token_address: string
          total_supply: number
          underlying_asset_id: string | null
          updated_at: string
        }
        Insert: {
          asset_type: string
          circulating_supply?: number
          compliance_metadata?: Json | null
          created_at?: string
          decimals?: number
          id?: string
          is_frozen?: boolean | null
          issuer_address: string
          name: string
          symbol: string
          token_address: string
          total_supply?: number
          underlying_asset_id?: string | null
          updated_at?: string
        }
        Update: {
          asset_type?: string
          circulating_supply?: number
          compliance_metadata?: Json | null
          created_at?: string
          decimals?: number
          id?: string
          is_frozen?: boolean | null
          issuer_address?: string
          name?: string
          symbol?: string
          token_address?: string
          total_supply?: number
          underlying_asset_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xodiak_tokenized_assets_issuer_address_fkey"
            columns: ["issuer_address"]
            isOneToOne: false
            referencedRelation: "xodiak_accounts"
            referencedColumns: ["address"]
          },
        ]
      }
      xodiak_transactions: {
        Row: {
          amount: number
          block_id: string | null
          block_number: number | null
          confirmed_at: string | null
          created_at: string
          data: Json | null
          error_message: string | null
          from_address: string
          gas_limit: number | null
          gas_price: number | null
          gas_used: number | null
          id: string
          signature: string
          status: Database["public"]["Enums"]["xdk_tx_status"]
          to_address: string | null
          tx_hash: string
          tx_index: number | null
          tx_type: Database["public"]["Enums"]["xdk_tx_type"]
        }
        Insert: {
          amount?: number
          block_id?: string | null
          block_number?: number | null
          confirmed_at?: string | null
          created_at?: string
          data?: Json | null
          error_message?: string | null
          from_address: string
          gas_limit?: number | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          signature: string
          status?: Database["public"]["Enums"]["xdk_tx_status"]
          to_address?: string | null
          tx_hash: string
          tx_index?: number | null
          tx_type: Database["public"]["Enums"]["xdk_tx_type"]
        }
        Update: {
          amount?: number
          block_id?: string | null
          block_number?: number | null
          confirmed_at?: string | null
          created_at?: string
          data?: Json | null
          error_message?: string | null
          from_address?: string
          gas_limit?: number | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          signature?: string
          status?: Database["public"]["Enums"]["xdk_tx_status"]
          to_address?: string | null
          tx_hash?: string
          tx_index?: number | null
          tx_type?: Database["public"]["Enums"]["xdk_tx_type"]
        }
        Relationships: [
          {
            foreignKeyName: "xodiak_transactions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "xodiak_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xodiak_transactions_from_address_fkey"
            columns: ["from_address"]
            isOneToOne: false
            referencedRelation: "xodiak_accounts"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "xodiak_transactions_to_address_fkey"
            columns: ["to_address"]
            isOneToOne: false
            referencedRelation: "xodiak_accounts"
            referencedColumns: ["address"]
          },
        ]
      }
      xodiak_validators: {
        Row: {
          address: string
          blocks_produced: number | null
          commission_rate: number | null
          id: string
          last_active_at: string | null
          metadata: Json | null
          name: string | null
          registered_at: string
          rewards_earned: number | null
          stake_amount: number
          status: Database["public"]["Enums"]["xdk_validator_status"]
          uptime_percentage: number | null
          user_id: string | null
        }
        Insert: {
          address: string
          blocks_produced?: number | null
          commission_rate?: number | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          name?: string | null
          registered_at?: string
          rewards_earned?: number | null
          stake_amount?: number
          status?: Database["public"]["Enums"]["xdk_validator_status"]
          uptime_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string
          blocks_produced?: number | null
          commission_rate?: number | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          name?: string | null
          registered_at?: string
          rewards_earned?: number | null
          stake_amount?: number
          status?: Database["public"]["Enums"]["xdk_validator_status"]
          uptime_percentage?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      agent_execution_summary: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          avg_duration_ms: number | null
          failed_runs: number | null
          last_run_at: string | null
          owner_id: string | null
          successful_runs: number | null
          total_compute_credits: number | null
          total_runs: number | null
          total_tokens: number | null
        }
        Relationships: []
      }
      v_interval_hourly_city: {
        Row: {
          avg_kw: number | null
          avg_voltage_v: number | null
          city_tenant_id: string | null
          hour: string | null
          meter_count: number | null
          total_kwh: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_gift_card_price: {
        Args: {
          config_name?: string
          delivery_method: string
          face_value: number
        }
        Returns: Json
      }
      can_access_import: {
        Args: { p_import_id: string; p_user_id: string }
        Returns: boolean
      }
      can_spawn_business: { Args: { p_user_id: string }; Returns: boolean }
      check_access_policy: {
        Args: {
          p_action: string
          p_resource_id: string
          p_resource_type: string
        }
        Returns: boolean
      }
      claim_embedding_jobs: {
        Args: { batch_size?: number }
        Returns: {
          error_message: string | null
          id: string
          processed_at: string | null
          queued_at: string
          status: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "instincts_embedding_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_agent_run: {
        Args: {
          p_additional_tokens?: number
          p_error_message?: string
          p_outputs_generated?: Json
          p_result?: Json
          p_run_id: string
          p_status: string
        }
        Returns: boolean
      }
      complete_embedding_job: {
        Args: { error?: string; job_id: string; success: boolean }
        Returns: undefined
      }
      compute_relationship_score: {
        Args: {
          p_deal_signal: number
          p_frequency: number
          p_recency: number
          p_responsiveness: number
          p_sentiment: number
        }
        Returns: Json
      }
      decrement_stock: {
        Args: { product_id: string; qty: number }
        Returns: undefined
      }
      emit_contribution_event: {
        Args: {
          p_action_credits?: number
          p_actor_id: string
          p_actor_type: Database["public"]["Enums"]["actor_type"]
          p_attribution_tags?: string[]
          p_compute_credits?: number
          p_deal_room_id?: string
          p_event_description?: string
          p_event_type: Database["public"]["Enums"]["contribution_event_type"]
          p_opportunity_id?: string
          p_outcome_credits?: number
          p_payload?: Json
          p_task_id?: string
          p_value_category?: Database["public"]["Enums"]["task_value_category"]
          p_workspace_id?: string
        }
        Returns: string
      }
      generate_ai_card_code: { Args: never; Returns: string }
      generate_ai_order_number: { Args: never; Returns: string }
      generate_business_subdomain: {
        Args: { business_name: string }
        Returns: string
      }
      generate_card_serial: { Args: never; Returns: string }
      generate_claim_url: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      generate_verification_code: { Args: never; Returns: string }
      generate_work_order_number: { Args: never; Returns: string }
      generate_xdk_address: { Args: never; Returns: string }
      generate_xdk_block_hash: {
        Args: {
          p_block_number: number
          p_merkle_root: string
          p_previous_hash: string
          p_timestamp: string
        }
        Returns: string
      }
      generate_xdk_tx_hash: {
        Args: {
          p_amount: number
          p_data: Json
          p_from: string
          p_nonce: number
          p_to: string
        }
        Returns: string
      }
      get_next_version_number: {
        Args: { p_business_id: string }
        Returns: number
      }
      get_next_workflow_run_number: {
        Args: { p_workflow_id: string }
        Returns: number
      }
      get_user_business_count: { Args: { p_user_id: string }; Returns: number }
      has_archive_permission: {
        Args: {
          p_org_id?: string
          p_permission: string
          p_scope_id?: string
          p_scope_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_module_permission: {
        Args: {
          _module: Database["public"]["Enums"]["platform_module"]
          _permission_type: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_deal_room_admin: {
        Args: { p_deal_room_id: string; p_user_id: string }
        Returns: boolean
      }
      is_deal_room_participant: {
        Args: { check_user_id?: string; room_id: string }
        Returns: boolean
      }
      is_security_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_security_manager: { Args: { check_user_id: string }; Returns: boolean }
      log_agent_execution: {
        Args: {
          p_agent_id: string
          p_external_apis?: Json
          p_input_summary?: string
          p_linked_opportunity_id?: string
          p_linked_task_id?: string
          p_model_used?: string
          p_tokens_used?: number
          p_tools_called?: Json
          p_trigger_context?: Json
          p_trigger_type: string
          p_user_id: string
        }
        Returns: string
      }
      log_archive_audit: {
        Args: {
          p_action: string
          p_actor_user_id: string
          p_import_id?: string
          p_metadata?: Json
          p_object_id: string
          p_object_type: string
          p_org_id?: string
        }
        Returns: string
      }
      log_platform_usage: {
        Args: {
          p_business_id: string
          p_cost_usd?: number
          p_metadata?: Json
          p_quantity: number
          p_resource_subtype: string
          p_resource_type: string
          p_unit: string
          p_user_id: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_event_action: string
          p_event_data?: Json
          p_event_outcome: string
          p_event_source: string
          p_event_type: string
          p_severity: string
        }
        Returns: string
      }
      normalize_business_name: { Args: { p_name: string }; Returns: string }
      process_auto_anchor_queue: { Args: never; Returns: number }
      reconcile_deal_room_participants: {
        Args: never
        Returns: {
          fixed_invitations: number
          fixed_participants: number
        }[]
      }
      reconcile_my_invitations: { Args: never; Returns: Json }
      upsert_instincts_graph_edge: {
        Args: {
          p_edge_type: string
          p_metadata?: Json
          p_source_id: string
          p_source_type: string
          p_target_id: string
          p_target_type: string
          p_weight?: number
        }
        Returns: string
      }
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
      connector_auth_type:
        | "oauth2"
        | "oauth1"
        | "api_key"
        | "manual"
        | "webhook"
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
      outcome_result: "WIN" | "LOSE" | "PUSH" | "VOID"
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
      xdk_validator_status: "active" | "jailed" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_level: [
        "free_trial",
        "basic",
        "professional",
        "enterprise",
        "partner",
      ],
      activity_type: [
        "call",
        "email",
        "meeting",
        "task",
        "project_work",
        "document",
        "other",
      ],
      actor_type: ["human", "agent", "system"],
      agent_type: [
        "outbound",
        "enrichment",
        "follow_up",
        "analysis",
        "automation",
        "scheduling",
        "research",
      ],
      ai_card_status: ["pending", "active", "redeemed", "expired", "cancelled"],
      ai_card_type: ["digital", "physical"],
      ai_fulfillment_status: [
        "pending",
        "processing",
        "printed",
        "shipped",
        "delivered",
      ],
      ai_order_status: [
        "pending",
        "paid",
        "fulfilled",
        "cancelled",
        "refunded",
      ],
      ai_product_status: ["pending", "active", "inactive"],
      ai_provider_status: ["pending", "approved", "rejected", "suspended"],
      app_role: [
        "admin",
        "team_member",
        "client_user",
        "partner",
        "utility_ops",
        "planner",
        "dispatcher",
        "aggregator",
        "site_owner",
        "regulator",
        "auditor",
        "read_only",
      ],
      asset_status: ["planned", "installed", "active", "inactive", "retired"],
      asset_type: [
        "pm_generator",
        "inverter",
        "battery",
        "evse",
        "rose_panel",
        "pmu",
        "relay",
        "meter",
        "transformer",
        "feeder",
        "substation",
        "rtu",
        "recloser",
        "edge_gateway",
      ],
      bet_status: ["PENDING", "WON", "LOST", "VOID", "CASHED_OUT"],
      bet_type: ["SINGLE", "PARLAY"],
      bid_source_type: ["email", "buildingconnected", "manual", "ai_discovery"],
      bid_status: ["draft", "invited", "submitted", "won", "lost", "archived"],
      business_spawn_status: [
        "draft",
        "researching",
        "generating_erp",
        "generating_website",
        "generating_content",
        "pending_approval",
        "approved",
        "active",
        "suspended",
        "archived",
      ],
      calc_method: ["true_power", "ohmic_estimate"],
      card_material: ["paper", "plastic", "aluminum", "silver", "gold"],
      card_status: ["draft", "active", "minted", "traded"],
      city_climate: ["hot", "temperate", "cold", "tropical"],
      command_status: ["pending", "applied", "failed"],
      command_type: [
        "set_power",
        "set_pf",
        "set_var_curve",
        "open",
        "close",
        "arm_island",
        "disarm_island",
        "price_signal",
        "charge",
        "discharge",
        "workload_cap",
      ],
      commission_type: ["percentage", "flat_fee", "tiered"],
      commodity_deal_status: [
        "draft",
        "escrow_funded",
        "pop_verified",
        "in_progress",
        "completed",
        "disputed",
        "cancelled",
      ],
      commodity_escrow_status: [
        "pending",
        "funded",
        "partial_release",
        "released",
        "refunded",
        "disputed",
      ],
      commodity_listing_status: [
        "draft",
        "active",
        "pending_verification",
        "verified",
        "sold",
        "expired",
        "cancelled",
      ],
      commodity_user_tier: ["silver", "gold", "platinum"],
      commodity_verification_status: [
        "unverified",
        "document_verified",
        "okari_live",
        "fully_verified",
      ],
      company_relationship_type: [
        "parent_subsidiary",
        "wholly_owned_subsidiary",
        "distribution_rights",
        "licensing_agreement",
        "joint_venture",
        "strategic_partnership",
        "minority_stake",
        "holding_company",
        "sister_company",
        "franchise",
      ],
      company_type: ["owned", "affiliate", "strategic_advisor", "partner"],
      compensation_type: [
        "cash",
        "commission",
        "revenue_share",
        "royalty",
        "equity",
        "licensing_fee",
        "contribution_credit",
      ],
      compliance_mode: ["standard", "davis_bacon", "prevailing_wage"],
      compliance_standard: [
        "IEEE1547",
        "UL1741SB",
        "IEEE2030_5",
        "ANSI_C12",
        "IEEE519",
        "NERC_CIP",
        "FICTIONAL_IFX",
      ],
      connection_status: [
        "pending",
        "active",
        "completed",
        "cancelled",
        "disputed",
      ],
      connector_auth_type: ["oauth2", "oauth1", "api_key", "manual", "webhook"],
      connector_type: [
        "gmail",
        "outlook",
        "imap_smtp",
        "hubspot",
        "salesforce",
        "zoho",
        "pipedrive",
        "dynamics",
        "netsuite",
        "odoo",
        "sap",
        "quickbooks",
        "wordpress",
        "webflow",
        "contentful",
        "notion",
        "gdrive",
        "sharepoint",
        "mailchimp",
        "klaviyo",
        "zendesk",
        "freshdesk",
      ],
      construction_asset_type: [
        "residential",
        "commercial",
        "industrial",
        "multifamily",
        "infrastructure",
      ],
      contact_relationship_type: [
        "prospect",
        "customer",
        "partner",
        "inactive",
      ],
      contribution_classification: [
        "ingredient_one_time",
        "ingredient_embedded",
        "formulation_effort",
        "process_governance",
        "distribution_origination",
        "execution_deployment",
        "risk_assumption",
      ],
      contribution_event_type: [
        "task_created",
        "task_completed",
        "task_assigned",
        "task_updated",
        "email_drafted",
        "email_sent",
        "call_made",
        "meeting_scheduled",
        "meeting_held",
        "lead_qualified",
        "deal_created",
        "deal_advanced",
        "deal_closed_won",
        "deal_closed_lost",
        "content_created",
        "document_authored",
        "ip_submitted",
        "agent_executed",
        "agent_suggestion",
        "agent_automation",
        "data_enriched",
        "integration_synced",
        "workflow_triggered",
      ],
      contribution_type: [
        "time",
        "technical",
        "capital",
        "network",
        "risk_exposure",
      ],
      cost_type: [
        "material",
        "labor",
        "subcontractor",
        "equipment",
        "overhead",
        "bond",
        "insurance",
        "warranty",
        "permit",
      ],
      credit_type: ["contribution", "usage", "value"],
      deal_category: [
        "sales",
        "platform_build",
        "joint_venture",
        "licensing",
        "services",
        "infrastructure",
        "ip_creation",
      ],
      deal_participant_role: [
        "builder",
        "seller",
        "strategist",
        "operator",
        "investor",
        "advisor",
      ],
      deal_room_access_level: ["deal_room_only", "full_profile"],
      deal_room_invite_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "cancelled",
      ],
      deal_room_message_channel: [
        "deal_room",
        "biz_dev_messages",
        "external_email",
      ],
      deal_room_status: [
        "draft",
        "active",
        "voting",
        "approved",
        "executed",
        "cancelled",
        "archived",
      ],
      deal_time_horizon: ["one_time", "recurring", "perpetual"],
      deal_vote_type: ["approve", "reject", "modify"],
      delegation_type: ["human", "ai", "hybrid"],
      der_tech: ["pm_gen", "pv", "battery", "ev", "rose", "microturbine"],
      dr_program_type: ["capacity", "energy", "fast_reg", "volt_var"],
      entity_status: [
        "draft",
        "pending",
        "processing",
        "approved",
        "active",
        "rejected",
      ],
      entity_type: [
        "LLC",
        "S-Corp",
        "C-Corp",
        "Sole Proprietorship",
        "Partnership",
        "Nonprofit",
      ],
      ev_direction: ["charge", "discharge"],
      event_category: [
        "navigation",
        "interaction",
        "transaction",
        "communication",
        "content",
        "workflow",
        "search",
        "integration",
        "system",
      ],
      event_severity: ["info", "warning", "critical", "emergency"],
      forecast_horizon: ["15min", "day", "week", "year", "10year"],
      forecast_scope: ["feeder", "substation", "city"],
      formulation_scope: [
        "customer_specific",
        "industry_specific",
        "platform_wide",
      ],
      funding_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "funded",
      ],
      generation_method: ["ai_generated", "template_based", "hybrid"],
      ingredient_type: [
        "software_module",
        "ai_agent",
        "security_framework",
        "industry_knowledge",
        "capital",
        "customer_relationships",
        "execution_resources",
        "brand_trademark",
        "data_pipeline",
        "governance_framework",
        "visualization_system",
        "other",
      ],
      kyc_status: ["NOT_REQUIRED", "PENDING", "VERIFIED", "REJECTED"],
      listing_status: ["draft", "active", "paused", "closed"],
      listing_type: ["product", "service"],
      market_category: ["SPORTS", "STOCKS", "CRYPTO", "WORLD"],
      market_status: ["OPEN", "SUSPENDED", "SETTLED", "VOID"],
      message_direction: ["inbound", "outbound"],
      migration_status: ["pending", "in_progress", "completed", "failed"],
      node_type: [
        "substation",
        "feeder",
        "transformer",
        "service_point",
        "microgrid",
        "dc_bus",
      ],
      operating_mode: ["SIM", "FIELD"],
      outcome_result: ["WIN", "LOSE", "PUSH", "VOID"],
      platform_category: [
        "social_media",
        "messaging",
        "video",
        "professional",
        "local_business",
        "creative",
        "audio",
        "emerging",
        "regional",
        "niche",
      ],
      platform_module: [
        "dashboard",
        "erp",
        "workflows",
        "xbuilderx",
        "xbuilderx_home",
        "xbuilderx_discovery",
        "xbuilderx_engineering",
        "xbuilderx_pipeline",
        "xbuilderx_construction",
        "xodiak",
        "xodiak_assets",
        "xodiak_compliance",
        "directory",
        "crm",
        "portfolio",
        "clients",
        "client_portal",
        "business_cards",
        "franchises",
        "franchise_applications",
        "team",
        "team_invitations",
        "tasks",
        "calendar",
        "activity",
        "tools",
        "messages",
        "ai_gift_cards",
        "iplaunch",
        "network",
        "integrations",
        "funding",
        "theme_harvester",
        "launchpad",
        "app_store",
        "my_apps",
        "white_label_portal",
        "earnings",
        "true_odds",
        "true_odds_explore",
        "true_odds_picks",
        "true_odds_signals",
        "core",
        "marketplace",
        "grid_os",
        "social",
        "website_builder",
        "ecosystem",
        "admin",
        "white_paper",
        "module_white_papers",
        "deal_rooms",
        "xcommodity",
      ],
      platform_status: [
        "discovered",
        "preview",
        "claimed",
        "active",
        "suspended",
        "transferred",
      ],
      post_status: ["draft", "scheduled", "published", "failed", "deleted"],
      privacy_level: ["agg", "dp"],
      project_phase: [
        "discovery",
        "design",
        "estimating",
        "bidding",
        "construction",
        "closeout",
        "warranty",
      ],
      redemption_method: [
        "platform_credits",
        "prepaid_card",
        "bank_deposit",
        "paypal",
        "venmo",
      ],
      resource_type: ["der", "flex_load", "ev", "rose"],
      roof_type: [
        "flat",
        "pitched",
        "metal",
        "tile",
        "shingle",
        "membrane",
        "other",
      ],
      settlement_trigger: [
        "revenue_received",
        "invoice_paid",
        "savings_verified",
        "milestone_hit",
        "usage_threshold",
        "time_based",
        "manual_approval",
      ],
      signal_kind: [
        "INJURY",
        "WEATHER",
        "EARNINGS",
        "MERGER",
        "SENTIMENT",
        "TREND",
        "NEWS",
        "LINEUP",
      ],
      spawn_request_status: ["pending", "approved", "rejected"],
      switch_action: ["open", "close"],
      sync_status: ["pending", "syncing", "completed", "failed", "paused"],
      takeoff_unit: ["sqft", "lf", "cy", "ea", "sf", "ton", "ls"],
      tariff_type: ["flat", "tou", "rtp", "demand"],
      task_contributor_type: ["human", "agent", "hybrid"],
      task_value_category: [
        "lead",
        "meeting",
        "sale",
        "ip",
        "architecture",
        "ops",
        "research",
        "outreach",
        "analysis",
        "automation",
      ],
      test_verdict: ["pass", "fail", "inconclusive", "transcendent"],
      voting_rule: ["unanimous", "majority", "weighted", "founder_override"],
      website_status: ["draft", "published", "archived"],
      workflow_item_type: [
        "rfi",
        "submittal",
        "change_order",
        "daily_report",
        "punch_list",
      ],
      workflow_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "closed",
      ],
      workload_class: ["render", "ml", "edge", "archive"],
      xdk_account_type: ["user", "contract", "validator", "treasury"],
      xdk_consensus_status: ["proposing", "voting", "committed", "finalized"],
      xdk_tx_status: ["pending", "confirmed", "failed"],
      xdk_tx_type: [
        "transfer",
        "stake",
        "unstake",
        "contract_call",
        "asset_tokenization",
        "genesis",
        "reward",
      ],
      xdk_validator_status: ["active", "jailed", "inactive"],
    },
  },
} as const
