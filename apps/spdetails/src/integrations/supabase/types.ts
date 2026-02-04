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
      availability_overrides: {
        Row: {
          business_id: string
          created_at: string
          end_time: string | null
          id: string
          is_available: boolean
          reason: string | null
          specific_date: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          reason?: string | null
          specific_date: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          reason?: string | null
          specific_date?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_overrides_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          ai_recommendations: Json | null
          assigned_staff_id: string | null
          business_id: string | null
          cancellation_hours: number | null
          cancellation_partial_hours: number | null
          cancellation_partial_refund_percent: number | null
          cancellation_refund_percent: number | null
          cancelled_at: string | null
          city: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          estimated_duration_minutes: number | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          payment_intent_id: string | null
          payment_status: string | null
          preferred_date: string
          preferred_time: string
          refund_amount: number | null
          refund_status: string | null
          reminder_sent: boolean | null
          selected_add_ons: Json | null
          service_type: string
          status: string
          updated_at: string
          user_id: string | null
          vehicle_condition: string | null
          vehicle_info: string | null
          vehicle_type: string | null
          zip_code: string
        }
        Insert: {
          address: string
          ai_recommendations?: Json | null
          assigned_staff_id?: string | null
          business_id?: string | null
          cancellation_hours?: number | null
          cancellation_partial_hours?: number | null
          cancellation_partial_refund_percent?: number | null
          cancellation_refund_percent?: number | null
          cancelled_at?: string | null
          city: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          estimated_duration_minutes?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          preferred_date: string
          preferred_time: string
          refund_amount?: number | null
          refund_status?: string | null
          reminder_sent?: boolean | null
          selected_add_ons?: Json | null
          service_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_condition?: string | null
          vehicle_info?: string | null
          vehicle_type?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          ai_recommendations?: Json | null
          assigned_staff_id?: string | null
          business_id?: string | null
          cancellation_hours?: number | null
          cancellation_partial_hours?: number | null
          cancellation_partial_refund_percent?: number | null
          cancellation_refund_percent?: number | null
          cancelled_at?: string | null
          city?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          estimated_duration_minutes?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          preferred_date?: string
          preferred_time?: string
          refund_amount?: number | null
          refund_status?: string | null
          reminder_sent?: boolean | null
          selected_add_ons?: Json | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          vehicle_condition?: string | null
          vehicle_info?: string | null
          vehicle_type?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_availability: {
        Row: {
          business_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_availability_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_pricing: {
        Row: {
          business_id: string
          created_at: string
          id: string
          price: number
          service_label: string
          service_type: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          price: number
          service_label: string
          service_type: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          price?: number
          service_label?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_pricing_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          business_email: string
          business_name: string
          business_phone: string | null
          cancellation_hours: number | null
          cancellation_partial_hours: number | null
          cancellation_partial_refund_percent: number | null
          cancellation_refund_percent: number | null
          city: string | null
          created_at: string
          id: string
          logo_url: string | null
          owner_id: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_email: string
          business_name: string
          business_phone?: string | null
          cancellation_hours?: number | null
          cancellation_partial_hours?: number | null
          cancellation_partial_refund_percent?: number | null
          cancellation_refund_percent?: number | null
          city?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          owner_id: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_email?: string
          business_name?: string
          business_phone?: string | null
          cancellation_hours?: number | null
          cancellation_partial_hours?: number | null
          cancellation_partial_refund_percent?: number | null
          cancellation_refund_percent?: number | null
          city?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          owner_id?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      job_photos: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          image_type: string
          image_url: string
          uploaded_by: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          image_type: string
          image_url: string
          uploaded_by: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          image_type?: string
          image_url?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          target_lead_types: Database["public"]["Enums"]["lead_type"][]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          target_lead_types?: Database["public"]["Enums"]["lead_type"][]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          target_lead_types?: Database["public"]["Enums"]["lead_type"][]
          updated_at?: string
        }
        Relationships: []
      }
      marketing_content: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          created_by: string | null
          id: string
          platforms: string[] | null
          published_at: string | null
          scheduled_for: string | null
          status: string
          target_audience: Database["public"]["Enums"]["lead_type"][] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          target_audience?: Database["public"]["Enums"]["lead_type"][] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          target_audience?: Database["public"]["Enums"]["lead_type"][] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          business_name: string
          city: string | null
          contact_name: string | null
          county: string | null
          created_at: string
          current_sequence_id: string | null
          email: string | null
          estimated_income: number | null
          fleet_size: number | null
          id: string
          last_contacted_at: string | null
          lead_type: Database["public"]["Enums"]["lead_type"]
          next_outreach_date: string | null
          notes: string | null
          phone: string | null
          sequence_step: number | null
          source: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          business_name: string
          city?: string | null
          contact_name?: string | null
          county?: string | null
          created_at?: string
          current_sequence_id?: string | null
          email?: string | null
          estimated_income?: number | null
          fleet_size?: number | null
          id?: string
          last_contacted_at?: string | null
          lead_type: Database["public"]["Enums"]["lead_type"]
          next_outreach_date?: string | null
          notes?: string | null
          phone?: string | null
          sequence_step?: number | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          business_name?: string
          city?: string | null
          contact_name?: string | null
          county?: string | null
          created_at?: string
          current_sequence_id?: string | null
          email?: string | null
          estimated_income?: number | null
          fleet_size?: number | null
          id?: string
          last_contacted_at?: string | null
          lead_type?: Database["public"]["Enums"]["lead_type"]
          next_outreach_date?: string | null
          notes?: string | null
          phone?: string | null
          sequence_step?: number | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_leads_current_sequence_id_fkey"
            columns: ["current_sequence_id"]
            isOneToOne: false
            referencedRelation: "outreach_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_history: {
        Row: {
          campaign_id: string | null
          id: string
          lead_id: string | null
          message: string | null
          outreach_type: Database["public"]["Enums"]["campaign_type"]
          responded_at: string | null
          response: string | null
          sent_at: string
          sent_by: string | null
          status: string
          subject: string | null
        }
        Insert: {
          campaign_id?: string | null
          id?: string
          lead_id?: string | null
          message?: string | null
          outreach_type: Database["public"]["Enums"]["campaign_type"]
          responded_at?: string | null
          response?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          campaign_id?: string | null
          id?: string
          lead_id?: string | null
          message?: string | null
          outreach_type?: Database["public"]["Enums"]["campaign_type"]
          responded_at?: string | null
          response?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketing_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_sequences: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          steps: Json
          target_lead_types: Database["public"]["Enums"]["lead_type"][] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          steps?: Json
          target_lead_types?: Database["public"]["Enums"]["lead_type"][] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json
          target_lead_types?: Database["public"]["Enums"]["lead_type"][] | null
          updated_at?: string
        }
        Relationships: []
      }
      partner_earnings: {
        Row: {
          available_balance: number
          business_id: string
          created_at: string
          id: string
          last_payout_date: string | null
          pending_balance: number
          stripe_account_id: string | null
          total_earned: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          available_balance?: number
          business_id: string
          created_at?: string
          id?: string
          last_payout_date?: string | null
          pending_balance?: number
          stripe_account_id?: string | null
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          available_balance?: number
          business_id?: string
          created_at?: string
          id?: string
          last_payout_date?: string | null
          pending_balance?: number
          stripe_account_id?: string | null
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_earnings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          customer_rating: number | null
          email: string | null
          full_name: string | null
          id: string
          payment_methods: Json | null
          phone: string | null
          phone_number: string | null
          preferences: Json | null
          total_bookings: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          customer_rating?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          payment_methods?: Json | null
          phone?: string | null
          phone_number?: string | null
          preferences?: Json | null
          total_bookings?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          customer_rating?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          payment_methods?: Json | null
          phone?: string | null
          phone_number?: string | null
          preferences?: Json | null
          total_bookings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rating_responses: {
        Row: {
          created_at: string
          id: string
          rating_id: string
          responder_id: string
          response_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating_id: string
          responder_id: string
          response_text: string
        }
        Update: {
          created_at?: string
          id?: string
          rating_id?: string
          responder_id?: string
          response_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "rating_responses_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          featured: boolean | null
          id: string
          rated_user_id: string
          rater_id: string
          rating: number
          rating_type: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          rated_user_id: string
          rater_id: string
          rating: number
          rating_type: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          rated_user_id?: string
          rater_id?: string
          rating?: number
          rating_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          created_at: string
          current_rank: number | null
          difficulty: number | null
          id: string
          keyword: string
          page_url: string | null
          search_volume: number | null
          target_rank: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          difficulty?: number | null
          id?: string
          keyword: string
          page_url?: string | null
          search_volume?: number | null
          target_rank?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          difficulty?: number | null
          id?: string
          keyword?: string
          page_url?: string | null
          search_volume?: number | null
          target_rank?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string
          connected_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          refresh_token: string | null
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          refresh_token?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          refresh_token?: string | null
        }
        Relationships: []
      }
      social_engagement: {
        Row: {
          clicks: number | null
          comments: number | null
          content_id: string | null
          id: string
          impressions: number | null
          likes: number | null
          platform: string
          post_id: string | null
          recorded_at: string
          shares: number | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          content_id?: string | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform: string
          post_id?: string | null
          recorded_at?: string
          shares?: number | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          content_id?: string | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform?: string
          post_id?: string | null
          recorded_at?: string
          shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_engagement_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "marketing_content"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          net_amount: number
          partner_business_id: string
          processed_at: string | null
          status: string
          stripe_fee: number | null
          stripe_payment_intent_id: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          net_amount: number
          partner_business_id: string
          processed_at?: string | null
          status?: string
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          net_amount?: number
          partner_business_id?: string
          processed_at?: string | null
          status?: string
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_partner_business_id_fkey"
            columns: ["partner_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_user_business_role: {
        Args: { _business_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_businesses: {
        Args: { _user_id: string }
        Returns: {
          business_id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_business: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "partner" | "staff"
      campaign_type:
        | "email"
        | "sms"
        | "direct_mail"
        | "phone"
        | "social_media"
        | "google_ads"
      content_type:
        | "social_post"
        | "email_template"
        | "ad_copy"
        | "direct_mail"
        | "sms_template"
      lead_status:
        | "new"
        | "contacted"
        | "interested"
        | "negotiating"
        | "converted"
        | "declined"
      lead_type:
        | "office_building"
        | "golf_course"
        | "high_income_neighborhood"
        | "dealership_small"
        | "dealership_luxury"
        | "fleet_company"
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
      app_role: ["admin", "user", "partner", "staff"],
      campaign_type: [
        "email",
        "sms",
        "direct_mail",
        "phone",
        "social_media",
        "google_ads",
      ],
      content_type: [
        "social_post",
        "email_template",
        "ad_copy",
        "direct_mail",
        "sms_template",
      ],
      lead_status: [
        "new",
        "contacted",
        "interested",
        "negotiating",
        "converted",
        "declined",
      ],
      lead_type: [
        "office_building",
        "golf_course",
        "high_income_neighborhood",
        "dealership_small",
        "dealership_luxury",
        "fleet_company",
      ],
    },
  },
} as const
