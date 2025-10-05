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
      crm_activities: {
        Row: {
          activity_type: string
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
        Relationships: []
      }
      crm_contacts: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
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
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          actual_close_date: string | null
          amount: number | null
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
          bd_id: string | null
          bd_id_verified: boolean | null
          bd_id_verified_at: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          bd_id?: string | null
          bd_id_verified?: boolean | null
          bd_id_verified_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          bd_id?: string | null
          bd_id_verified?: boolean | null
          bd_id_verified_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    },
  },
} as const
