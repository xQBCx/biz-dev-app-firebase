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
      device_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          photo_url: string | null
          sender_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          photo_url?: string | null
          sender_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          photo_url?: string | null
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_photos: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          photo_url: string
          photographer_id: string
          session_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          photo_url: string
          photographer_id: string
          session_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          photo_url?: string
          photographer_id?: string
          session_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_photos_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_photos_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          experience_level: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          is_photographer: boolean | null
          location_lat: number | null
          location_lng: number | null
          rating: number | null
          referred_by_code: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          total_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_available?: boolean | null
          is_photographer?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          rating?: number | null
          referred_by_code?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          is_photographer?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          rating?: number | null
          referred_by_code?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          photographer_id: string
          rating: number
          review: string | null
          session_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          photographer_id: string
          rating: number
          review?: string | null
          session_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          photographer_id?: string
          rating?: number
          review?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          total_lifetime_earnings: number | null
          total_referrals: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          total_lifetime_earnings?: number | null
          total_referrals?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          total_lifetime_earnings?: number | null
          total_referrals?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          last_calculated_at: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          total_earnings: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          total_earnings?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          total_earnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_photos: {
        Row: {
          approved_at: string | null
          client_approved: boolean | null
          created_at: string
          edited_at: string | null
          edited_url: string | null
          editing_status: string
          id: string
          original_url: string
          session_id: string
          uploaded_at: string
          uploader_id: string
        }
        Insert: {
          approved_at?: string | null
          client_approved?: boolean | null
          created_at?: string
          edited_at?: string | null
          edited_url?: string | null
          editing_status?: string
          id?: string
          original_url: string
          session_id: string
          uploaded_at?: string
          uploader_id: string
        }
        Update: {
          approved_at?: string | null
          client_approved?: boolean | null
          created_at?: string
          edited_at?: string | null
          edited_url?: string | null
          editing_status?: string
          id?: string
          original_url?: string
          session_id?: string
          uploaded_at?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_photos_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          allow_photographer_portfolio: boolean | null
          client_id: string
          created_at: string | null
          device_used: string | null
          duration_minutes: number | null
          editing_fee: number | null
          editing_requested: boolean | null
          ended_at: string | null
          hourly_rate: number
          id: string
          location_lat: number
          location_lng: number
          location_name: string | null
          photographer_id: string
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          allow_photographer_portfolio?: boolean | null
          client_id: string
          created_at?: string | null
          device_used?: string | null
          duration_minutes?: number | null
          editing_fee?: number | null
          editing_requested?: boolean | null
          ended_at?: string | null
          hourly_rate: number
          id?: string
          location_lat: number
          location_lng: number
          location_name?: string | null
          photographer_id: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_photographer_portfolio?: boolean | null
          client_id?: string
          created_at?: string | null
          device_used?: string | null
          duration_minutes?: number | null
          editing_fee?: number | null
          editing_requested?: boolean | null
          ended_at?: string | null
          hourly_rate?: number
          id?: string
          location_lat?: number
          location_lng?: number
          location_name?: string | null
          photographer_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_versions: {
        Row: {
          content: string
          created_at: string | null
          effective_date: string
          id: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          effective_date?: string
          id?: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          effective_date?: string
          id?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
