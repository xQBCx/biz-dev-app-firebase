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
      buyer_outreach_messages: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          message_body: string
          property_id: string
          status: Database["public"]["Enums"]["outreach_status"] | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          message_body: string
          property_id: string
          status?: Database["public"]["Enums"]["outreach_status"] | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          message_body?: string
          property_id?: string
          status?: Database["public"]["Enums"]["outreach_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_outreach_messages_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_outreach_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          max_price: number | null
          min_price: number | null
          name: string
          notes: string | null
          phone: string | null
          property_types: string | null
          status: Database["public"]["Enums"]["buyer_status"] | null
          target_counties: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          property_types?: string | null
          status?: Database["public"]["Enums"]["buyer_status"] | null
          target_counties?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          max_price?: number | null
          min_price?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          property_types?: string | null
          status?: Database["public"]["Enums"]["buyer_status"] | null
          target_counties?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          body: string
          created_at: string | null
          id: string
          property_id: string
          status: Database["public"]["Enums"]["contract_status"] | null
          type: Database["public"]["Enums"]["contract_type"]
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          property_id: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          type: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          property_id?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          type?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          arv_estimate: number | null
          buyer_ask_price: number | null
          city: string | null
          county: string | null
          created_at: string | null
          deal_score: number | null
          id: string
          list_price: number | null
          motivation_score: number | null
          notes: string | null
          seller_email: string | null
          seller_name: string | null
          seller_offer_price: number | null
          seller_phone: string | null
          spread: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          updated_at: string | null
          user_id: string
          zip: string | null
        }
        Insert: {
          address: string
          arv_estimate?: number | null
          buyer_ask_price?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          deal_score?: number | null
          id?: string
          list_price?: number | null
          motivation_score?: number | null
          notes?: string | null
          seller_email?: string | null
          seller_name?: string | null
          seller_offer_price?: number | null
          seller_phone?: string | null
          spread?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          updated_at?: string | null
          user_id: string
          zip?: string | null
        }
        Update: {
          address?: string
          arv_estimate?: number | null
          buyer_ask_price?: number | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          deal_score?: number | null
          id?: string
          list_price?: number | null
          motivation_score?: number | null
          notes?: string | null
          seller_email?: string | null
          seller_name?: string | null
          seller_offer_price?: number | null
          seller_phone?: string | null
          spread?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          updated_at?: string | null
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      seller_outreach_messages: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          message_body: string
          property_id: string
          status: Database["public"]["Enums"]["outreach_status"] | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          message_body: string
          property_id: string
          status?: Database["public"]["Enums"]["outreach_status"] | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          message_body?: string
          property_id?: string
          status?: Database["public"]["Enums"]["outreach_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_outreach_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      buyer_status: "ACTIVE" | "INACTIVE"
      contract_status: "DRAFT" | "SENT_FOR_SIGNATURE" | "SIGNED" | "VOID"
      contract_type: "PURCHASE" | "ASSIGNMENT"
      outreach_status: "DRAFT" | "SENT" | "REJECTED"
      property_status:
        | "NEW_LEAD"
        | "ANALYZED"
        | "SELLER_OUTREACH"
        | "SELLER_NEGOTIATING"
        | "UNDER_CONTRACT"
        | "BUYER_MARKETING"
        | "BUYER_FOUND"
        | "ASSIGNMENT_DRAFTED"
        | "SENT_TO_TITLE"
        | "CLOSED"
        | "DEAD"
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
      buyer_status: ["ACTIVE", "INACTIVE"],
      contract_status: ["DRAFT", "SENT_FOR_SIGNATURE", "SIGNED", "VOID"],
      contract_type: ["PURCHASE", "ASSIGNMENT"],
      outreach_status: ["DRAFT", "SENT", "REJECTED"],
      property_status: [
        "NEW_LEAD",
        "ANALYZED",
        "SELLER_OUTREACH",
        "SELLER_NEGOTIATING",
        "UNDER_CONTRACT",
        "BUYER_MARKETING",
        "BUYER_FOUND",
        "ASSIGNMENT_DRAFTED",
        "SENT_TO_TITLE",
        "CLOSED",
        "DEAD",
      ],
    },
  },
} as const
