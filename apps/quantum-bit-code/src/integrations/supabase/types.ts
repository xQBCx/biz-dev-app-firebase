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
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          permissions: Json | null
          rate_limit_per_minute: number | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          checked_by: string | null
          control_id: string
          control_name: string
          created_at: string
          evidence_url: string | null
          framework: string
          id: string
          last_checked_at: string | null
          next_review_date: string | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          checked_by?: string | null
          control_id: string
          control_name: string
          created_at?: string
          evidence_url?: string | null
          framework: string
          id?: string
          last_checked_at?: string | null
          next_review_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          checked_by?: string | null
          control_id?: string
          control_name?: string
          created_at?: string
          evidence_url?: string | null
          framework?: string
          id?: string
          last_checked_at?: string | null
          next_review_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_product_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          glyph_claim_id: string | null
          id: string
          product_idea: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          glyph_claim_id?: string | null
          id?: string
          product_idea: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          glyph_claim_id?: string | null
          id?: string
          product_idea?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_product_requests_glyph_claim_id_fkey"
            columns: ["glyph_claim_id"]
            isOneToOne: false
            referencedRelation: "glyph_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      data_requests: {
        Row: {
          admin_notes: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          request_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          request_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          request_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          brand_accent_color: string | null
          brand_logo_url: string | null
          brand_primary_color: string | null
          created_at: string
          detailed_description: string | null
          id: string
          includes_digital_asset_acquisitions: boolean | null
          is_active: boolean | null
          short_description: string | null
          slug: string
          title: string
        }
        Insert: {
          brand_accent_color?: string | null
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          created_at?: string
          detailed_description?: string | null
          id?: string
          includes_digital_asset_acquisitions?: boolean | null
          is_active?: boolean | null
          short_description?: string | null
          slug: string
          title: string
        }
        Update: {
          brand_accent_color?: string | null
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          created_at?: string
          detailed_description?: string | null
          id?: string
          includes_digital_asset_acquisitions?: boolean | null
          is_active?: boolean | null
          short_description?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      decoder_licenses: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          lattice_ids: string[] | null
          license_key: string
          name: string | null
          org_id: string
          permissions: Json | null
          rate_limit_per_minute: number | null
          revoked: boolean | null
          revoked_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          lattice_ids?: string[] | null
          license_key?: string
          name?: string | null
          org_id: string
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          revoked?: boolean | null
          revoked_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          lattice_ids?: string[] | null
          license_key?: string
          name?: string | null
          org_id?: string
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          revoked?: boolean | null
          revoked_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decoder_licenses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_asset_narratives: {
        Row: {
          body: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      domain_appraisal_notes: {
        Row: {
          appraisal_source: string | null
          created_at: string
          domain_id: string | null
          estimated_value: number | null
          id: string
          notes: string | null
        }
        Insert: {
          appraisal_source?: string | null
          created_at?: string
          domain_id?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
        }
        Update: {
          appraisal_source?: string | null
          created_at?: string
          domain_id?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_appraisal_notes_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          domain_name: string
          estimated_value_high: number | null
          estimated_value_low: number | null
          id: string
          strategic_role: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          domain_name: string
          estimated_value_high?: number | null
          estimated_value_low?: number | null
          id?: string
          strategic_role?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          domain_name?: string
          estimated_value_high?: number | null
          estimated_value_low?: number | null
          id?: string
          strategic_role?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          deal_id: string
          file_type: string | null
          folder_id: string | null
          id: string
          name: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          file_type?: string | null
          folder_id?: string | null
          id?: string
          name: string
          storage_path: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          file_type?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          name: string
          parent_folder_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          name: string
          parent_folder_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      glyph_claims: {
        Row: {
          canonical_at: string | null
          canonical_by: string | null
          canonical_notes: string | null
          canonical_text: string
          content_hash: string
          created_at: string
          display_text: string
          id: string
          image_png_url: string | null
          image_svg_url: string | null
          is_canonical: boolean | null
          lattice_id: string
          lattice_version: number
          orientation_json: Json
          owner_user_id: string | null
          path_json: Json
          status: string
          style_json: Json
          updated_at: string
        }
        Insert: {
          canonical_at?: string | null
          canonical_by?: string | null
          canonical_notes?: string | null
          canonical_text: string
          content_hash: string
          created_at?: string
          display_text: string
          id?: string
          image_png_url?: string | null
          image_svg_url?: string | null
          is_canonical?: boolean | null
          lattice_id: string
          lattice_version?: number
          orientation_json?: Json
          owner_user_id?: string | null
          path_json: Json
          status?: string
          style_json?: Json
          updated_at?: string
        }
        Update: {
          canonical_at?: string | null
          canonical_by?: string | null
          canonical_notes?: string | null
          canonical_text?: string
          content_hash?: string
          created_at?: string
          display_text?: string
          id?: string
          image_png_url?: string | null
          image_svg_url?: string | null
          is_canonical?: boolean | null
          lattice_id?: string
          lattice_version?: number
          orientation_json?: Json
          owner_user_id?: string | null
          path_json?: Json
          status?: string
          style_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "glyph_claims_lattice_id_fkey"
            columns: ["lattice_id"]
            isOneToOne: false
            referencedRelation: "lattices"
            referencedColumns: ["id"]
          },
        ]
      }
      glyph_likes: {
        Row: {
          created_at: string
          glyph_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          glyph_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          glyph_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "glyph_likes_glyph_id_fkey"
            columns: ["glyph_id"]
            isOneToOne: false
            referencedRelation: "glyphs"
            referencedColumns: ["id"]
          },
        ]
      }
      glyph_messages: {
        Row: {
          created_at: string
          expires_at: string | null
          from_user_id: string | null
          glyph_id: string
          id: string
          is_read: boolean
          message: string | null
          share_token: string | null
          to_user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          from_user_id?: string | null
          glyph_id: string
          id?: string
          is_read?: boolean
          message?: string | null
          share_token?: string | null
          to_user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          from_user_id?: string | null
          glyph_id?: string
          id?: string
          is_read?: boolean
          message?: string | null
          share_token?: string | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glyph_messages_glyph_id_fkey"
            columns: ["glyph_id"]
            isOneToOne: false
            referencedRelation: "glyphs"
            referencedColumns: ["id"]
          },
        ]
      }
      glyphs: {
        Row: {
          created_at: string
          id: string
          lattice_id: string
          likes_count: number
          orientation_json: Json
          owner_user_id: string | null
          path_json: Json
          png_url: string | null
          style_json: Json
          svg_data: string | null
          tags: string[] | null
          text: string
          updated_at: string
          visibility: Database["public"]["Enums"]["glyph_visibility"]
        }
        Insert: {
          created_at?: string
          id?: string
          lattice_id: string
          likes_count?: number
          orientation_json?: Json
          owner_user_id?: string | null
          path_json: Json
          png_url?: string | null
          style_json?: Json
          svg_data?: string | null
          tags?: string[] | null
          text: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["glyph_visibility"]
        }
        Update: {
          created_at?: string
          id?: string
          lattice_id?: string
          likes_count?: number
          orientation_json?: Json
          owner_user_id?: string | null
          path_json?: Json
          png_url?: string | null
          style_json?: Json
          svg_data?: string | null
          tags?: string[] | null
          text?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["glyph_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "glyphs_lattice_id_fkey"
            columns: ["lattice_id"]
            isOneToOne: false
            referencedRelation: "lattices"
            referencedColumns: ["id"]
          },
        ]
      }
      government_leads: {
        Row: {
          agency: string | null
          clearance_level: string | null
          created_at: string
          email: string
          id: string
          interest_area: string | null
          message: string | null
          name: string
          phone: string | null
          preferred_contact: string | null
          request_classified_briefing: boolean | null
          role_title: string | null
          urgency_level: string | null
        }
        Insert: {
          agency?: string | null
          clearance_level?: string | null
          created_at?: string
          email: string
          id?: string
          interest_area?: string | null
          message?: string | null
          name: string
          phone?: string | null
          preferred_contact?: string | null
          request_classified_briefing?: boolean | null
          role_title?: string | null
          urgency_level?: string | null
        }
        Update: {
          agency?: string | null
          clearance_level?: string | null
          created_at?: string
          email?: string
          id?: string
          interest_area?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          preferred_contact?: string | null
          request_classified_briefing?: boolean | null
          role_title?: string | null
          urgency_level?: string | null
        }
        Relationships: []
      }
      investor_access: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_access_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_assets: {
        Row: {
          created_at: string
          description: string | null
          estimated_licensing_high_per_year: number | null
          estimated_licensing_low_per_year: number | null
          id: string
          markets: string | null
          name: string
          value_high: number
          value_low: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_licensing_high_per_year?: number | null
          estimated_licensing_low_per_year?: number | null
          id?: string
          markets?: string | null
          name: string
          value_high: number
          value_low: number
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_licensing_high_per_year?: number | null
          estimated_licensing_low_per_year?: number | null
          id?: string
          markets?: string | null
          name?: string
          value_high?: number
          value_low?: number
        }
        Relationships: []
      }
      ip_projects: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expiration_date: string | null
          filing_date: string | null
          grant_date: string | null
          id: string
          jurisdiction: string | null
          metadata: Json | null
          priority: string | null
          registration_number: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiration_date?: string | null
          filing_date?: string | null
          grant_date?: string | null
          id?: string
          jurisdiction?: string | null
          metadata?: Json | null
          priority?: string | null
          registration_number?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiration_date?: string | null
          filing_date?: string | null
          grant_date?: string | null
          id?: string
          jurisdiction?: string | null
          metadata?: Json | null
          priority?: string | null
          registration_number?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ip_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ip_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lattice_audit_log: {
        Row: {
          action: string
          api_key_id: string | null
          created_at: string | null
          decoder_license_id: string | null
          id: string
          input_hash: string | null
          ip_address: string | null
          lattice_id: string | null
          metadata: Json | null
          org_id: string | null
          output_hash: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          api_key_id?: string | null
          created_at?: string | null
          decoder_license_id?: string | null
          id?: string
          input_hash?: string | null
          ip_address?: string | null
          lattice_id?: string | null
          metadata?: Json | null
          org_id?: string | null
          output_hash?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          api_key_id?: string | null
          created_at?: string | null
          decoder_license_id?: string | null
          id?: string
          input_hash?: string | null
          ip_address?: string | null
          lattice_id?: string | null
          metadata?: Json | null
          org_id?: string | null
          output_hash?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lattice_audit_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lattice_audit_log_decoder_license_id_fkey"
            columns: ["decoder_license_id"]
            isOneToOne: false
            referencedRelation: "decoder_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lattice_audit_log_lattice_id_fkey"
            columns: ["lattice_id"]
            isOneToOne: false
            referencedRelation: "lattices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lattice_audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lattices: {
        Row: {
          anchors_3d_json: Json | null
          anchors_json: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          is_locked: boolean
          lattice_key: string
          name: string
          rules_json: Json
          style_json: Json
          updated_at: string
          version: number
        }
        Insert: {
          anchors_3d_json?: Json | null
          anchors_json: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_locked?: boolean
          lattice_key: string
          name: string
          rules_json?: Json
          style_json?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          anchors_3d_json?: Json | null
          anchors_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          is_locked?: boolean
          lattice_key?: string
          name?: string
          rules_json?: Json
          style_json?: Json
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          investor_type: string | null
          message: string | null
          name: string
          organization: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          investor_type?: string | null
          message?: string | null
          name: string
          organization?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          investor_type?: string | null
          message?: string | null
          name?: string
          organization?: string | null
        }
        Relationships: []
      }
      library_submissions: {
        Row: {
          created_at: string
          glyph_id: string
          id: string
          moderator_id: string | null
          notes: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["library_submission_status"]
          submitted_by: string | null
        }
        Insert: {
          created_at?: string
          glyph_id: string
          id?: string
          moderator_id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["library_submission_status"]
          submitted_by?: string | null
        }
        Update: {
          created_at?: string
          glyph_id?: string
          id?: string
          moderator_id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["library_submission_status"]
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_submissions_glyph_id_fkey"
            columns: ["glyph_id"]
            isOneToOne: false
            referencedRelation: "glyphs"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          glyph_claim_id: string
          id: string
          price: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          glyph_claim_id: string
          id?: string
          price: number
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          glyph_claim_id?: string
          id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_glyph_claim_id_fkey"
            columns: ["glyph_claim_id"]
            isOneToOne: false
            referencedRelation: "glyph_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      mints: {
        Row: {
          chain: string
          contract_address: string | null
          created_at: string
          glyph_claim_id: string
          id: string
          metadata_url: string | null
          status: string
          token_id: string | null
        }
        Insert: {
          chain: string
          contract_address?: string | null
          created_at?: string
          glyph_claim_id: string
          id?: string
          metadata_url?: string | null
          status?: string
          token_id?: string | null
        }
        Update: {
          chain?: string
          contract_address?: string | null
          created_at?: string
          glyph_claim_id?: string
          id?: string
          metadata_url?: string | null
          status?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mints_glyph_claim_id_fkey"
            columns: ["glyph_claim_id"]
            isOneToOne: false
            referencedRelation: "glyph_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      nda_signatures: {
        Row: {
          deal_id: string
          id: string
          ip_address: string | null
          nda_template_id: string
          signed_at: string
          signed_name: string
          user_id: string
        }
        Insert: {
          deal_id: string
          id?: string
          ip_address?: string | null
          nda_template_id: string
          signed_at?: string
          signed_name: string
          user_id: string
        }
        Update: {
          deal_id?: string
          id?: string
          ip_address?: string | null
          nda_template_id?: string
          signed_at?: string
          signed_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nda_signatures_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nda_signatures_nda_template_id_fkey"
            columns: ["nda_template_id"]
            isOneToOne: false
            referencedRelation: "nda_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      nda_templates: {
        Row: {
          body: string
          created_at: string
          deal_id: string | null
          id: string
          title: string
          version: number
        }
        Insert: {
          body: string
          created_at?: string
          deal_id?: string | null
          id?: string
          title: string
          version?: number
        }
        Update: {
          body?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "nda_templates_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_lattices: {
        Row: {
          custom_config: Json | null
          expires_at: string | null
          granted_at: string | null
          id: string
          is_custom: boolean | null
          lattice_id: string
          org_id: string
        }
        Insert: {
          custom_config?: Json | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_custom?: boolean | null
          lattice_id: string
          org_id: string
        }
        Update: {
          custom_config?: Json | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_custom?: boolean | null
          lattice_id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_lattices_lattice_id_fkey"
            columns: ["lattice_id"]
            isOneToOne: false
            referencedRelation: "lattices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_lattices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string | null
          custom_domain: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          plan_id: string | null
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          plan_id?: string | null
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          plan_id?: string | null
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          included_glyphs_monthly: number
          included_words_monthly: number
          is_active: boolean | null
          max_lattices: number | null
          max_members: number | null
          monthly_base_cents: number
          name: string
          per_glyph_cents: number
          per_word_cents: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          included_glyphs_monthly?: number
          included_words_monthly?: number
          is_active?: boolean | null
          max_lattices?: number | null
          max_members?: number | null
          monthly_base_cents?: number
          name: string
          per_glyph_cents?: number
          per_word_cents?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          included_glyphs_monthly?: number
          included_words_monthly?: number
          is_active?: boolean | null
          max_lattices?: number | null
          max_members?: number | null
          monthly_base_cents?: number
          name?: string
          per_glyph_cents?: number
          per_word_cents?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_mockups: {
        Row: {
          created_at: string
          glyph_claim_id: string
          id: string
          mockup_image_url: string | null
          product_type: string
          product_variant: string | null
          prompt_used: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          glyph_claim_id: string
          id?: string
          mockup_image_url?: string | null
          product_type: string
          product_variant?: string | null
          prompt_used?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          glyph_claim_id?: string
          id?: string
          mockup_image_url?: string | null
          product_type?: string
          product_variant?: string | null
          prompt_used?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_mockups_glyph_claim_id_fkey"
            columns: ["glyph_claim_id"]
            isOneToOne: false
            referencedRelation: "glyph_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_name: string | null
          created_at: string
          full_name: string
          id: string
          is_approved: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          created_at?: string
          full_name: string
          id: string
          is_approved?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_approved?: boolean | null
        }
        Relationships: []
      }
      share_info: {
        Row: {
          available_percentage: number
          id: string
          price_per_share: number | null
          shares_sold: number
          total_shares: number
          updated_at: string
        }
        Insert: {
          available_percentage?: number
          id?: string
          price_per_share?: number | null
          shares_sold?: number
          total_shares?: number
          updated_at?: string
        }
        Update: {
          available_percentage?: number
          id?: string
          price_per_share?: number | null
          shares_sold?: number
          total_shares?: number
          updated_at?: string
        }
        Relationships: []
      }
      tlds: {
        Row: {
          acquisition_target: boolean | null
          created_at: string
          estimated_cost_high: number | null
          estimated_cost_low: number | null
          id: string
          status: string | null
          strategic_value: string | null
          tld_name: string
        }
        Insert: {
          acquisition_target?: boolean | null
          created_at?: string
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          status?: string | null
          strategic_value?: string | null
          tld_name: string
        }
        Update: {
          acquisition_target?: boolean | null
          created_at?: string
          estimated_cost_high?: number | null
          estimated_cost_low?: number | null
          id?: string
          status?: string | null
          strategic_value?: string | null
          tld_name?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          created_at: string
          from_user_id: string | null
          glyph_claim_id: string
          id: string
          to_user_id: string | null
          tx_ref: string | null
        }
        Insert: {
          created_at?: string
          from_user_id?: string | null
          glyph_claim_id: string
          id?: string
          to_user_id?: string | null
          tx_ref?: string | null
        }
        Update: {
          created_at?: string
          from_user_id?: string | null
          glyph_claim_id?: string
          id?: string
          to_user_id?: string | null
          tx_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_glyph_claim_id_fkey"
            columns: ["glyph_claim_id"]
            isOneToOne: false
            referencedRelation: "glyph_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          byte_count: number | null
          created_at: string | null
          event_type: string
          glyph_count: number
          id: string
          lattice_id: string | null
          metadata: Json | null
          org_id: string
          user_id: string | null
          word_count: number
        }
        Insert: {
          byte_count?: number | null
          created_at?: string | null
          event_type: string
          glyph_count?: number
          id?: string
          lattice_id?: string | null
          metadata?: Json | null
          org_id: string
          user_id?: string | null
          word_count?: number
        }
        Update: {
          byte_count?: number | null
          created_at?: string | null
          event_type?: string
          glyph_count?: number
          id?: string
          lattice_id?: string | null
          metadata?: Json | null
          org_id?: string
          user_id?: string | null
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_lattice_id_fkey"
            columns: ["lattice_id"]
            isOneToOne: false
            referencedRelation: "lattices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      get_all_users_for_admin: {
        Args: never
        Returns: {
          approved_at: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          is_approved: boolean
        }[]
      }
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["org_role"]
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
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      glyph_visibility: "private" | "public" | "unlisted"
      library_submission_status: "pending" | "approved" | "rejected"
      org_role: "owner" | "admin" | "encoder" | "decoder" | "viewer"
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
      app_role: ["admin", "user"],
      glyph_visibility: ["private", "public", "unlisted"],
      library_submission_status: ["pending", "approved", "rejected"],
      org_role: ["owner", "admin", "encoder", "decoder", "viewer"],
    },
  },
} as const
