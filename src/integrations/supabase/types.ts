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
      crm_activities: {
        Row: {
          activity_type: string
          attendee_emails: string[] | null
          client_id: string | null
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          end_time: string | null
          id: string
          location: string | null
          meeting_link: string | null
          outcome: string | null
          priority: string | null
          start_time: string | null
          status: string | null
          subject: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          attendee_emails?: string[] | null
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          outcome?: string | null
          priority?: string | null
          start_time?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          attendee_emails?: string[] | null
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          outcome?: string | null
          priority?: string | null
          start_time?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
      deal_room_participants: {
        Row: {
          company_id: string | null
          contribution_visible_to_others: boolean
          created_at: string
          deal_room_id: string
          email: string
          has_submitted_contribution: boolean
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          is_company: boolean
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          contribution_visible_to_others?: boolean
          created_at?: string
          deal_room_id: string
          email: string
          has_submitted_contribution?: boolean
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          is_company?: boolean
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          contribution_visible_to_others?: boolean
          created_at?: string
          deal_room_id?: string
          email?: string
          has_submitted_contribution?: boolean
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          is_company?: boolean
          name?: string
          updated_at?: string
          user_id?: string | null
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
      deal_rooms: {
        Row: {
          ai_analysis_enabled: boolean
          category: Database["public"]["Enums"]["deal_category"]
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
          voting_rule: Database["public"]["Enums"]["voting_rule"]
        }
        Insert: {
          ai_analysis_enabled?: boolean
          category: Database["public"]["Enums"]["deal_category"]
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
          voting_rule?: Database["public"]["Enums"]["voting_rule"]
        }
        Update: {
          ai_analysis_enabled?: boolean
          category?: Database["public"]["Enums"]["deal_category"]
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
      instincts_agent_runs: {
        Row: {
          agent_id: string
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          result: Json | null
          started_at: string | null
          status: string
          trigger_context: Json | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          trigger_context?: Json | null
          trigger_type: string
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          trigger_context?: Json | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: [
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
          capabilities: Json | null
          category: string
          config_schema: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          category: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          category?: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
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
      workflow_node_types: {
        Row: {
          category: string
          color: string | null
          config_schema: Json | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          input_schema: Json | null
          is_active: boolean | null
          is_trigger: boolean | null
          module: string | null
          name: string
          output_schema: Json | null
          requires_premium: boolean | null
          slug: string
        }
        Insert: {
          category: string
          color?: string | null
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_trigger?: boolean | null
          module?: string | null
          name: string
          output_schema?: Json | null
          requires_premium?: boolean | null
          slug: string
        }
        Update: {
          category?: string
          color?: string | null
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_trigger?: boolean | null
          module?: string | null
          name?: string
          output_schema?: Json | null
          requires_premium?: boolean | null
          slug?: string
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
    }
    Views: {
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
      complete_embedding_job: {
        Args: { error?: string; job_id: string; success: boolean }
        Returns: undefined
      }
      decrement_stock: {
        Args: { product_id: string; qty: number }
        Returns: undefined
      }
      generate_ai_card_code: { Args: never; Returns: string }
      generate_ai_order_number: { Args: never; Returns: string }
      generate_card_serial: { Args: never; Returns: string }
      generate_claim_url: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      generate_verification_code: { Args: never; Returns: string }
      generate_work_order_number: { Args: never; Returns: string }
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
      funding_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "funded"
      generation_method: "ai_generated" | "template_based" | "hybrid"
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
      signal_kind:
        | "INJURY"
        | "WEATHER"
        | "EARNINGS"
        | "MERGER"
        | "SENTIMENT"
        | "TREND"
        | "NEWS"
        | "LINEUP"
      switch_action: "open" | "close"
      sync_status: "pending" | "syncing" | "completed" | "failed" | "paused"
      takeoff_unit: "sqft" | "lf" | "cy" | "ea" | "sf" | "ton" | "ls"
      tariff_type: "flat" | "tou" | "rtp" | "demand"
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
      funding_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "funded",
      ],
      generation_method: ["ai_generated", "template_based", "hybrid"],
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
      switch_action: ["open", "close"],
      sync_status: ["pending", "syncing", "completed", "failed", "paused"],
      takeoff_unit: ["sqft", "lf", "cy", "ea", "sf", "ton", "ls"],
      tariff_type: ["flat", "tou", "rtp", "demand"],
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
    },
  },
} as const
