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
      access_requests: {
        Row: {
          assigned_account_level:
            | Database["public"]["Enums"]["account_level"]
            | null
          company: string | null
          created_at: string
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
      ai_gift_cards: {
        Row: {
          activated_at: string | null
          batch_id: string | null
          card_code: string
          card_type: Database["public"]["Enums"]["ai_card_type"]
          created_at: string | null
          expires_at: string
          face_value: number
          id: string
          last_activity_at: string | null
          metadata: Json | null
          order_id: string
          pin_code: string | null
          product_id: string
          provider_account_id: string | null
          provider_credits_applied: number | null
          provider_id: string
          qr_code_url: string | null
          redeemed_at: string | null
          redemption_count: number | null
          redemption_url: string
          remaining_value: number
          status: Database["public"]["Enums"]["ai_card_status"]
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          batch_id?: string | null
          card_code: string
          card_type: Database["public"]["Enums"]["ai_card_type"]
          created_at?: string | null
          expires_at: string
          face_value: number
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          order_id: string
          pin_code?: string | null
          product_id: string
          provider_account_id?: string | null
          provider_credits_applied?: number | null
          provider_id: string
          qr_code_url?: string | null
          redeemed_at?: string | null
          redemption_count?: number | null
          redemption_url: string
          remaining_value: number
          status?: Database["public"]["Enums"]["ai_card_status"]
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          batch_id?: string | null
          card_code?: string
          card_type?: Database["public"]["Enums"]["ai_card_type"]
          created_at?: string | null
          expires_at?: string
          face_value?: number
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          order_id?: string
          pin_code?: string | null
          product_id?: string
          provider_account_id?: string | null
          provider_credits_applied?: number | null
          provider_id?: string
          qr_code_url?: string | null
          redeemed_at?: string | null
          redemption_count?: number | null
          redemption_url?: string
          remaining_value?: number
          status?: Database["public"]["Enums"]["ai_card_status"]
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
        ]
      }
      ai_orders: {
        Row: {
          affiliate_code: string | null
          campaign_code: string | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          delivery_email: string | null
          delivery_method: string | null
          delivery_phone: string | null
          event_name: string | null
          fulfillment_status:
            | Database["public"]["Enums"]["ai_fulfillment_status"]
            | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
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
          campaign_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          delivery_email?: string | null
          delivery_method?: string | null
          delivery_phone?: string | null
          event_name?: string | null
          fulfillment_status?:
            | Database["public"]["Enums"]["ai_fulfillment_status"]
            | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
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
          campaign_code?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          delivery_email?: string | null
          delivery_method?: string | null
          delivery_phone?: string | null
          event_name?: string | null
          fulfillment_status?:
            | Database["public"]["Enums"]["ai_fulfillment_status"]
            | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
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
            foreignKeyName: "ai_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ai_products"
            referencedColumns: ["id"]
          },
        ]
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
          provider_account_created: boolean | null
          provider_account_id: string | null
          provider_transaction_id: string | null
          redeemed_at: string | null
          redeemed_by_user_id: string | null
          redeemed_email: string | null
          redemption_device: string | null
          redemption_ip: string | null
        }
        Insert: {
          affiliate_commission_due?: number | null
          affiliate_eligible?: boolean | null
          amount_redeemed: number
          gift_card_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          provider_account_created?: boolean | null
          provider_account_id?: string | null
          provider_transaction_id?: string | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          redeemed_email?: string | null
          redemption_device?: string | null
          redemption_ip?: string | null
        }
        Update: {
          affiliate_commission_due?: number | null
          affiliate_eligible?: boolean | null
          amount_redeemed?: number
          gift_card_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          provider_account_created?: boolean | null
          provider_account_id?: string | null
          provider_transaction_id?: string | null
          redeemed_at?: string | null
          redeemed_by_user_id?: string | null
          redeemed_email?: string | null
          redemption_device?: string | null
          redemption_ip?: string | null
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
          completion_date: string | null
          created_at: string
          currency: string | null
          id: string
          location: string | null
          metadata: Json | null
          name: string
          phase: Database["public"]["Enums"]["project_phase"] | null
          project_number: string | null
          region: string | null
          start_date: string | null
          total_estimated_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          asset_type: Database["public"]["Enums"]["construction_asset_type"]
          completion_date?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name: string
          phase?: Database["public"]["Enums"]["project_phase"] | null
          project_number?: string | null
          region?: string | null
          start_date?: string | null
          total_estimated_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          asset_type?: Database["public"]["Enums"]["construction_asset_type"]
          completion_date?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name?: string
          phase?: Database["public"]["Enums"]["project_phase"] | null
          project_number?: string | null
          region?: string | null
          start_date?: string | null
          total_estimated_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cost_items: {
        Row: {
          asset_type:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          created_at: string
          currency: string | null
          description: string
          equipment_cost: number | null
          id: string
          is_template: boolean | null
          item_code: string
          labor_cost: number | null
          material_cost: number | null
          metadata: Json | null
          region: string | null
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asset_type?:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          created_at?: string
          currency?: string | null
          description: string
          equipment_cost?: number | null
          id?: string
          is_template?: boolean | null
          item_code: string
          labor_cost?: number | null
          material_cost?: number | null
          metadata?: Json | null
          region?: string | null
          unit: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asset_type?:
            | Database["public"]["Enums"]["construction_asset_type"]
            | null
          created_at?: string
          currency?: string | null
          description?: string
          equipment_cost?: number | null
          id?: string
          is_template?: boolean | null
          item_code?: string
          labor_cost?: number | null
          material_cost?: number | null
          metadata?: Json | null
          region?: string | null
          unit?: Database["public"]["Enums"]["takeoff_unit"]
          unit_cost?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          state: string | null
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
          state?: string | null
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
          state?: string | null
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
      crm_deals: {
        Row: {
          actual_close_date: string | null
          amount: number | null
          client_id: string | null
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
          stage: string
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_close_date?: string | null
          amount?: number | null
          client_id?: string | null
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
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_close_date?: string | null
          amount?: number | null
          client_id?: string | null
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
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { product_id: string; qty: number }
        Returns: undefined
      }
      generate_ai_card_code: { Args: never; Returns: string }
      generate_ai_order_number: { Args: never; Returns: string }
      generate_card_serial: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      generate_verification_code: { Args: never; Returns: string }
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
      app_role: "admin" | "team_member" | "client_user" | "partner"
      bet_status: "PENDING" | "WON" | "LOST" | "VOID" | "CASHED_OUT"
      bet_type: "SINGLE" | "PARLAY"
      card_material: "paper" | "plastic" | "aluminum" | "silver" | "gold"
      card_status: "draft" | "active" | "minted" | "traded"
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
      delegation_type: "human" | "ai" | "hybrid"
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
      funding_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "funded"
      kyc_status: "NOT_REQUIRED" | "PENDING" | "VERIFIED" | "REJECTED"
      market_category: "SPORTS" | "STOCKS" | "CRYPTO" | "WORLD"
      market_status: "OPEN" | "SUSPENDED" | "SETTLED" | "VOID"
      message_direction: "inbound" | "outbound"
      migration_status: "pending" | "in_progress" | "completed" | "failed"
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
      platform_status:
        | "discovered"
        | "preview"
        | "claimed"
        | "active"
        | "suspended"
        | "transferred"
      post_status: "draft" | "scheduled" | "published" | "failed" | "deleted"
      project_phase:
        | "discovery"
        | "design"
        | "estimating"
        | "bidding"
        | "construction"
        | "closeout"
        | "warranty"
      signal_kind:
        | "INJURY"
        | "WEATHER"
        | "EARNINGS"
        | "MERGER"
        | "SENTIMENT"
        | "TREND"
        | "NEWS"
        | "LINEUP"
      sync_status: "pending" | "syncing" | "completed" | "failed" | "paused"
      takeoff_unit: "sqft" | "lf" | "cy" | "ea" | "sf" | "ton" | "ls"
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
      app_role: ["admin", "team_member", "client_user", "partner"],
      bet_status: ["PENDING", "WON", "LOST", "VOID", "CASHED_OUT"],
      bet_type: ["SINGLE", "PARLAY"],
      card_material: ["paper", "plastic", "aluminum", "silver", "gold"],
      card_status: ["draft", "active", "minted", "traded"],
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
      delegation_type: ["human", "ai", "hybrid"],
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
      funding_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "funded",
      ],
      kyc_status: ["NOT_REQUIRED", "PENDING", "VERIFIED", "REJECTED"],
      market_category: ["SPORTS", "STOCKS", "CRYPTO", "WORLD"],
      market_status: ["OPEN", "SUSPENDED", "SETTLED", "VOID"],
      message_direction: ["inbound", "outbound"],
      migration_status: ["pending", "in_progress", "completed", "failed"],
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
      project_phase: [
        "discovery",
        "design",
        "estimating",
        "bidding",
        "construction",
        "closeout",
        "warranty",
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
      sync_status: ["pending", "syncing", "completed", "failed", "paused"],
      takeoff_unit: ["sqft", "lf", "cy", "ea", "sf", "ton", "ls"],
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
    },
  },
} as const
