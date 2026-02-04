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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      asset_components: {
        Row: {
          asset_id: string
          can_print_in_field: boolean | null
          component_type: string
          created_at: string
          criticality: Database["public"]["Enums"]["component_criticality"]
          digital_twin_ref: string | null
          id: string
          name: string
          notes: string | null
          oem_part_number: string | null
          specs: Json | null
          updated_at: string
        }
        Insert: {
          asset_id: string
          can_print_in_field?: boolean | null
          component_type: string
          created_at?: string
          criticality?: Database["public"]["Enums"]["component_criticality"]
          digital_twin_ref?: string | null
          id?: string
          name: string
          notes?: string | null
          oem_part_number?: string | null
          specs?: Json | null
          updated_at?: string
        }
        Update: {
          asset_id?: string
          can_print_in_field?: boolean | null
          component_type?: string
          created_at?: string
          criticality?: Database["public"]["Enums"]["component_criticality"]
          digital_twin_ref?: string | null
          id?: string
          name?: string
          notes?: string | null
          oem_part_number?: string | null
          specs?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_components_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string
          description: string | null
          id: string
          identifier: string
          latitude: number | null
          location_address: string | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          longitude: number | null
          metadata: Json | null
          name: string | null
          organization_id: string
          qr_code_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          description?: string | null
          id?: string
          identifier: string
          latitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          longitude?: number | null
          metadata?: Json | null
          name?: string | null
          organization_id: string
          qr_code_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          description?: string | null
          id?: string
          identifier?: string
          latitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          longitude?: number | null
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          qr_code_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      cad_library: {
        Row: {
          category: string
          compatible_asset_types: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          dimensions: Json | null
          file_format: string | null
          file_url: string | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          name: string
          oem_part_numbers: string[] | null
          organization_id: string | null
          parent_id: string | null
          part_type: string
          print_specs: Json | null
          source: string | null
          thumbnail_url: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          category: string
          compatible_asset_types?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: Json | null
          file_format?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          name: string
          oem_part_numbers?: string[] | null
          organization_id?: string | null
          parent_id?: string | null
          part_type: string
          print_specs?: Json | null
          source?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string
          compatible_asset_types?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: Json | null
          file_format?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          name?: string
          oem_part_numbers?: string[] | null
          organization_id?: string | null
          parent_id?: string | null
          part_type?: string
          print_specs?: Json | null
          source?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cad_library_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cad_library_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cad_library"
            referencedColumns: ["id"]
          },
        ]
      }
      fabrication_units: {
        Row: {
          assigned_technician_id: string | null
          capabilities: string[] | null
          cnc_specs: Json | null
          created_at: string
          current_location: Json | null
          id: string
          materials_inventory: Json | null
          name: string
          organization_id: string | null
          printer_specs: Json | null
          status: string
          unit_type: string
          updated_at: string
        }
        Insert: {
          assigned_technician_id?: string | null
          capabilities?: string[] | null
          cnc_specs?: Json | null
          created_at?: string
          current_location?: Json | null
          id?: string
          materials_inventory?: Json | null
          name: string
          organization_id?: string | null
          printer_specs?: Json | null
          status?: string
          unit_type?: string
          updated_at?: string
        }
        Update: {
          assigned_technician_id?: string | null
          capabilities?: string[] | null
          cnc_specs?: Json | null
          created_at?: string
          current_location?: Json | null
          id?: string
          materials_inventory?: Json | null
          name?: string
          organization_id?: string | null
          printer_specs?: Json | null
          status?: string
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fabrication_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"] | null
          checklist: Json
          created_at: string
          id: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          is_global: boolean | null
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          asset_type?: Database["public"]["Enums"]["asset_type"] | null
          checklist?: Json
          created_at?: string
          id?: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          is_global?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"] | null
          checklist?: Json
          created_at?: string
          id?: string
          inspection_type?: Database["public"]["Enums"]["inspection_type"]
          is_global?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          asset_id: string
          checklist_responses: Json | null
          completed_at: string | null
          created_at: string
          findings: Json | null
          id: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          next_actions: Json | null
          organization_id: string
          performed_by_user_id: string | null
          risk_level: string | null
          status: string
          template_id: string | null
          updated_at: string
          via_session_id: string | null
        }
        Insert: {
          asset_id: string
          checklist_responses?: Json | null
          completed_at?: string | null
          created_at?: string
          findings?: Json | null
          id?: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          next_actions?: Json | null
          organization_id: string
          performed_by_user_id?: string | null
          risk_level?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          via_session_id?: string | null
        }
        Update: {
          asset_id?: string
          checklist_responses?: Json | null
          completed_at?: string | null
          created_at?: string
          findings?: Json | null
          id?: string
          inspection_type?: Database["public"]["Enums"]["inspection_type"]
          next_actions?: Json | null
          organization_id?: string
          performed_by_user_id?: string | null
          risk_level?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          via_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_via_session_id_fkey"
            columns: ["via_session_id"]
            isOneToOne: false
            referencedRelation: "remote_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      media: {
        Row: {
          annotations: Json | null
          asset_id: string | null
          component_id: string | null
          created_at: string
          file_size: number | null
          filename: string | null
          id: string
          inspection_id: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          metadata: Json | null
          organization_id: string | null
          remote_session_id: string | null
          uploaded_by: string | null
          url: string
          work_order_id: string | null
        }
        Insert: {
          annotations?: Json | null
          asset_id?: string | null
          component_id?: string | null
          created_at?: string
          file_size?: number | null
          filename?: string | null
          id?: string
          inspection_id?: string | null
          media_type: Database["public"]["Enums"]["media_type"]
          metadata?: Json | null
          organization_id?: string | null
          remote_session_id?: string | null
          uploaded_by?: string | null
          url: string
          work_order_id?: string | null
        }
        Update: {
          annotations?: Json | null
          asset_id?: string | null
          component_id?: string | null
          created_at?: string
          file_size?: number | null
          filename?: string | null
          id?: string
          inspection_id?: string | null
          media_type?: Database["public"]["Enums"]["media_type"]
          metadata?: Json | null
          organization_id?: string | null
          remote_session_id?: string | null
          uploaded_by?: string | null
          url?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "asset_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_remote_session_id_fkey"
            columns: ["remote_session_id"]
            isOneToOne: false
            referencedRelation: "remote_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["xrepairx_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["xrepairx_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["xrepairx_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          owner_id: string
          settings: Json | null
          state: string | null
          timezone: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          owner_id: string
          settings?: Json | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          owner_id?: string
          settings?: Json | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
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
      part_identifications: {
        Row: {
          analysis_result: Json | null
          asset_component_id: string | null
          asset_id: string | null
          can_print_in_field: boolean | null
          confidence_score: number | null
          created_at: string
          description: string | null
          id: string
          identified_manufacturer: string | null
          identified_model_number: string | null
          identified_part_name: string | null
          identified_part_type: string | null
          image_urls: string[]
          matched_cad_ids: string[] | null
          organization_id: string | null
          recommended_action: string | null
          work_order_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          asset_component_id?: string | null
          asset_id?: string | null
          can_print_in_field?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          identified_manufacturer?: string | null
          identified_model_number?: string | null
          identified_part_name?: string | null
          identified_part_type?: string | null
          image_urls: string[]
          matched_cad_ids?: string[] | null
          organization_id?: string | null
          recommended_action?: string | null
          work_order_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          asset_component_id?: string | null
          asset_id?: string | null
          can_print_in_field?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          identified_manufacturer?: string | null
          identified_model_number?: string | null
          identified_part_name?: string | null
          identified_part_type?: string | null
          image_urls?: string[]
          matched_cad_ids?: string[] | null
          organization_id?: string | null
          recommended_action?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_identifications_asset_component_id_fkey"
            columns: ["asset_component_id"]
            isOneToOne: false
            referencedRelation: "asset_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_identifications_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_identifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_identifications_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
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
      print_jobs: {
        Row: {
          actual_print_time_minutes: number | null
          ai_analysis: Json | null
          ai_match_confidence: number | null
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          asset_component_id: string | null
          before_photo_url: string | null
          cad_library_id: string | null
          completed_at: string | null
          created_at: string
          custom_cad_url: string | null
          custom_specs: Json | null
          estimated_print_time_minutes: number | null
          fabrication_unit_id: string | null
          id: string
          identified_part_name: string | null
          identified_part_type: string | null
          infill_percent: number | null
          installed_at: string | null
          installed_by: string | null
          installed_photo_url: string | null
          job_type: string
          layer_height_mm: number | null
          material_color: string | null
          material_type: string | null
          organization_id: string
          printed_part_photo_url: string | null
          priority: string
          quality_check_passed: boolean | null
          quality_notes: string | null
          quantity: number | null
          requested_at: string | null
          requested_by: string | null
          status: string
          supports_needed: boolean | null
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          actual_print_time_minutes?: number | null
          ai_analysis?: Json | null
          ai_match_confidence?: number | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          asset_component_id?: string | null
          before_photo_url?: string | null
          cad_library_id?: string | null
          completed_at?: string | null
          created_at?: string
          custom_cad_url?: string | null
          custom_specs?: Json | null
          estimated_print_time_minutes?: number | null
          fabrication_unit_id?: string | null
          id?: string
          identified_part_name?: string | null
          identified_part_type?: string | null
          infill_percent?: number | null
          installed_at?: string | null
          installed_by?: string | null
          installed_photo_url?: string | null
          job_type?: string
          layer_height_mm?: number | null
          material_color?: string | null
          material_type?: string | null
          organization_id: string
          printed_part_photo_url?: string | null
          priority?: string
          quality_check_passed?: boolean | null
          quality_notes?: string | null
          quantity?: number | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          supports_needed?: boolean | null
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          actual_print_time_minutes?: number | null
          ai_analysis?: Json | null
          ai_match_confidence?: number | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          asset_component_id?: string | null
          before_photo_url?: string | null
          cad_library_id?: string | null
          completed_at?: string | null
          created_at?: string
          custom_cad_url?: string | null
          custom_specs?: Json | null
          estimated_print_time_minutes?: number | null
          fabrication_unit_id?: string | null
          id?: string
          identified_part_name?: string | null
          identified_part_type?: string | null
          infill_percent?: number | null
          installed_at?: string | null
          installed_by?: string | null
          installed_photo_url?: string | null
          job_type?: string
          layer_height_mm?: number | null
          material_color?: string | null
          material_type?: string | null
          organization_id?: string
          printed_part_photo_url?: string | null
          priority?: string
          quality_check_passed?: boolean | null
          quality_notes?: string | null
          quantity?: number | null
          requested_at?: string | null
          requested_by?: string | null
          status?: string
          supports_needed?: boolean | null
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_asset_component_id_fkey"
            columns: ["asset_component_id"]
            isOneToOne: false
            referencedRelation: "asset_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_cad_library_id_fkey"
            columns: ["cad_library_id"]
            isOneToOne: false
            referencedRelation: "cad_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_fabrication_unit_id_fkey"
            columns: ["fabrication_unit_id"]
            isOneToOne: false
            referencedRelation: "fabrication_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
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
      remote_sessions: {
        Row: {
          ai_summary: Json | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          join_url_customer: string | null
          join_url_internal: string | null
          notes: string | null
          organization_id: string
          outcome: Database["public"]["Enums"]["session_outcome"] | null
          recording_url: string | null
          room_name: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          started_at: string | null
          started_by: Database["public"]["Enums"]["xrepairx_role"]
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          ai_summary?: Json | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          join_url_customer?: string | null
          join_url_internal?: string | null
          notes?: string | null
          organization_id: string
          outcome?: Database["public"]["Enums"]["session_outcome"] | null
          recording_url?: string | null
          room_name?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string | null
          started_by?: Database["public"]["Enums"]["xrepairx_role"]
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          ai_summary?: Json | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          join_url_customer?: string | null
          join_url_internal?: string | null
          notes?: string | null
          organization_id?: string
          outcome?: Database["public"]["Enums"]["session_outcome"] | null
          recording_url?: string | null
          room_name?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string | null
          started_by?: Database["public"]["Enums"]["xrepairx_role"]
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_sessions_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
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
      work_orders: {
        Row: {
          actual_duration_minutes: number | null
          ai_triage: Json | null
          asset_component_id: string | null
          asset_id: string | null
          assigned_remote_expert_id: string | null
          assigned_technician_id: string | null
          category: Database["public"]["Enums"]["work_order_category"]
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["work_order_priority"]
          requested_by_user_id: string | null
          requester_email: string | null
          requester_name: string | null
          requester_phone: string | null
          resolution_summary: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          source: Database["public"]["Enums"]["work_order_source"]
          status: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_duration_minutes?: number | null
          ai_triage?: Json | null
          asset_component_id?: string | null
          asset_id?: string | null
          assigned_remote_expert_id?: string | null
          assigned_technician_id?: string | null
          category?: Database["public"]["Enums"]["work_order_category"]
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["work_order_priority"]
          requested_by_user_id?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution_summary?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          source?: Database["public"]["Enums"]["work_order_source"]
          status?: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_duration_minutes?: number | null
          ai_triage?: Json | null
          asset_component_id?: string | null
          asset_id?: string | null
          assigned_remote_expert_id?: string | null
          assigned_technician_id?: string | null
          category?: Database["public"]["Enums"]["work_order_category"]
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["work_order_priority"]
          requested_by_user_id?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution_summary?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          source?: Database["public"]["Enums"]["work_order_source"]
          status?: Database["public"]["Enums"]["work_order_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_asset_component_id_fkey"
            columns: ["asset_component_id"]
            isOneToOne: false
            referencedRelation: "asset_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_organization_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_xrepairx_role: {
        Args: {
          _role: Database["public"]["Enums"]["xrepairx_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_xrepairx_admin: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_business: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      user_in_organization: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "partner" | "staff"
      asset_type:
        | "building"
        | "unit"
        | "railcar"
        | "equipment"
        | "system"
        | "vehicle"
        | "facility"
      campaign_type:
        | "email"
        | "sms"
        | "direct_mail"
        | "phone"
        | "social_media"
        | "google_ads"
      component_criticality: "non_critical" | "critical" | "safety_critical"
      content_type:
        | "social_post"
        | "email_template"
        | "ad_copy"
        | "direct_mail"
        | "sms_template"
      inspection_type:
        | "move_in"
        | "move_out"
        | "annual"
        | "safety"
        | "railcar_turn"
        | "equipment_check"
        | "compliance"
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
      media_type: "photo" | "video" | "snapshot" | "document"
      organization_type:
        | "property_manager"
        | "rail_operator"
        | "fleet"
        | "industrial_plant"
        | "equipment_manufacturer"
        | "construction"
        | "other"
      session_outcome:
        | "resolved"
        | "needs_field_visit"
        | "needs_follow_up_call"
        | "pending"
      session_type:
        | "remote_triage"
        | "remote_inspection"
        | "remote_guided_repair"
        | "remote_sales_demo"
      work_order_category:
        | "maintenance"
        | "repair"
        | "inspection"
        | "commissioning"
        | "installation"
      work_order_priority: "low" | "normal" | "high" | "emergency"
      work_order_source:
        | "remote_self_service"
        | "call_center"
        | "field_tech"
        | "system_alert"
        | "scheduled_maintenance"
      work_order_status:
        | "new"
        | "triage_in_progress"
        | "remote_resolved"
        | "scheduled_visit"
        | "in_field"
        | "completed"
        | "cancelled"
      xrepairx_role:
        | "admin"
        | "operator"
        | "field_technician"
        | "remote_expert"
        | "end_customer"
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
      asset_type: [
        "building",
        "unit",
        "railcar",
        "equipment",
        "system",
        "vehicle",
        "facility",
      ],
      campaign_type: [
        "email",
        "sms",
        "direct_mail",
        "phone",
        "social_media",
        "google_ads",
      ],
      component_criticality: ["non_critical", "critical", "safety_critical"],
      content_type: [
        "social_post",
        "email_template",
        "ad_copy",
        "direct_mail",
        "sms_template",
      ],
      inspection_type: [
        "move_in",
        "move_out",
        "annual",
        "safety",
        "railcar_turn",
        "equipment_check",
        "compliance",
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
      media_type: ["photo", "video", "snapshot", "document"],
      organization_type: [
        "property_manager",
        "rail_operator",
        "fleet",
        "industrial_plant",
        "equipment_manufacturer",
        "construction",
        "other",
      ],
      session_outcome: [
        "resolved",
        "needs_field_visit",
        "needs_follow_up_call",
        "pending",
      ],
      session_type: [
        "remote_triage",
        "remote_inspection",
        "remote_guided_repair",
        "remote_sales_demo",
      ],
      work_order_category: [
        "maintenance",
        "repair",
        "inspection",
        "commissioning",
        "installation",
      ],
      work_order_priority: ["low", "normal", "high", "emergency"],
      work_order_source: [
        "remote_self_service",
        "call_center",
        "field_tech",
        "system_alert",
        "scheduled_maintenance",
      ],
      work_order_status: [
        "new",
        "triage_in_progress",
        "remote_resolved",
        "scheduled_visit",
        "in_field",
        "completed",
        "cancelled",
      ],
      xrepairx_role: [
        "admin",
        "operator",
        "field_technician",
        "remote_expert",
        "end_customer",
      ],
    },
  },
} as const
