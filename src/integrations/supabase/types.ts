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
      crm_activities: {
        Row: {
          activity_type: string
          client_id: string | null
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          outcome: string | null
          priority: string | null
          status: string | null
          subject: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          outcome?: string | null
          priority?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          outcome?: string | null
          priority?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { product_id: string; qty: number }
        Returns: undefined
      }
      generate_ai_card_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ai_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_card_serial: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_verification_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      contact_relationship_type:
        | "prospect"
        | "customer"
        | "partner"
        | "inactive"
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
      message_direction: "inbound" | "outbound"
      migration_status: "pending" | "in_progress" | "completed" | "failed"
      sync_status: "pending" | "syncing" | "completed" | "failed" | "paused"
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
      contact_relationship_type: [
        "prospect",
        "customer",
        "partner",
        "inactive",
      ],
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
      message_direction: ["inbound", "outbound"],
      migration_status: ["pending", "in_progress", "completed", "failed"],
      sync_status: ["pending", "syncing", "completed", "failed", "paused"],
    },
  },
} as const
