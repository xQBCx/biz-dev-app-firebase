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
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name: string
          id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
