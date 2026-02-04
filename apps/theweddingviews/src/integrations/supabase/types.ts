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
      budget_items: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"] | null
          custom_label: string | null
          id: string
          notes: string | null
          price_cents: number
          product_id: string | null
          project_id: string
          qty: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          custom_label?: string | null
          id?: string
          notes?: string | null
          price_cents: number
          product_id?: string | null
          project_id: string
          qty?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          custom_label?: string | null
          id?: string
          notes?: string | null
          price_cents?: number
          product_id?: string | null
          project_id?: string
          qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          geo: unknown
          id: string
          kind: string
          name: string
          stripe_customer_id: string | null
          subscription_tier: Database["public"]["Enums"]["access_tier"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          geo?: unknown
          id?: string
          kind: string
          name: string
          stripe_customer_id?: string | null
          subscription_tier?: Database["public"]["Enums"]["access_tier"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          geo?: unknown
          id?: string
          kind?: string
          name?: string
          stripe_customer_id?: string | null
          subscription_tier?: Database["public"]["Enums"]["access_tier"] | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          asset_3d_url: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"] | null
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          price_cents: number
          unit: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          active?: boolean | null
          asset_3d_url?: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          price_cents: number
          unit: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          active?: boolean | null
          asset_3d_url?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          price_cents?: number
          unit?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_cents: number | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"] | null
          guest_count: number | null
          id: string
          is_public: boolean | null
          mode: string
          organization_id: string | null
          owner_id: string
          title: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          budget_cents?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          guest_count?: number | null
          id?: string
          is_public?: boolean | null
          mode: string
          organization_id?: string | null
          owner_id: string
          title: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          budget_cents?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          guest_count?: number | null
          id?: string
          is_public?: boolean | null
          mode?: string
          organization_id?: string | null
          owner_id?: string
          title?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scenes: {
        Row: {
          base_model_id: string | null
          created_at: string
          id: string
          lite_env_storage_path: string | null
          project_id: string
          state: Json | null
          updated_at: string
          version: number | null
        }
        Insert: {
          base_model_id?: string | null
          created_at?: string
          id?: string
          lite_env_storage_path?: string | null
          project_id: string
          state?: Json | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          base_model_id?: string | null
          created_at?: string
          id?: string
          lite_env_storage_path?: string | null
          project_id?: string
          state?: Json | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          active: boolean | null
          categories: Database["public"]["Enums"]["product_category"][]
          created_at: string
          delivery_radius_km: number | null
          id: string
          organization_id: string | null
          rating: number | null
          stripe_account_id: string | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          categories?: Database["public"]["Enums"]["product_category"][]
          created_at?: string
          delivery_radius_km?: number | null
          id?: string
          organization_id?: string | null
          rating?: number | null
          stripe_account_id?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          categories?: Database["public"]["Enums"]["product_category"][]
          created_at?: string
          delivery_radius_km?: number | null
          id?: string
          organization_id?: string | null
          rating?: number | null
          stripe_account_id?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
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
      [_ in never]: never
    }
    Enums: {
      access_tier: "free" | "lite" | "plus" | "pro" | "enterprise"
      booking_type: "instant" | "request"
      currency_code: "USD" | "EUR" | "GBP"
      model_type: "gaussian" | "mesh" | "hybrid"
      order_status: "pending" | "confirmed" | "cancelled" | "completed"
      product_category:
        | "flowers"
        | "furniture"
        | "linens"
        | "lighting"
        | "decor"
        | "tableware"
        | "catering"
        | "photo_video"
        | "music"
        | "fashion"
        | "other"
      user_role:
        | "couple"
        | "venue_admin"
        | "vendor_admin"
        | "planner"
        | "staff"
        | "admin"
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
      access_tier: ["free", "lite", "plus", "pro", "enterprise"],
      booking_type: ["instant", "request"],
      currency_code: ["USD", "EUR", "GBP"],
      model_type: ["gaussian", "mesh", "hybrid"],
      order_status: ["pending", "confirmed", "cancelled", "completed"],
      product_category: [
        "flowers",
        "furniture",
        "linens",
        "lighting",
        "decor",
        "tableware",
        "catering",
        "photo_video",
        "music",
        "fashion",
        "other",
      ],
      user_role: [
        "couple",
        "venue_admin",
        "vendor_admin",
        "planner",
        "staff",
        "admin",
      ],
    },
  },
} as const
