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
      audio_notes: {
        Row: {
          audio_url: string
          created_at: string
          duration_seconds: number | null
          id: string
          inspection_id: string
          transcription: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          inspection_id: string
          transcription?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          inspection_id?: string
          transcription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_notes_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      defects: {
        Row: {
          bounding_box: Json | null
          created_at: string
          description: string | null
          id: string
          inspection_id: string
          location: string
          photo_url: string | null
          repair_cost: number | null
          repair_required: boolean
          repair_status: Database["public"]["Enums"]["repair_status"] | null
          severity: Database["public"]["Enums"]["defect_severity"]
          type: Database["public"]["Enums"]["defect_type"]
        }
        Insert: {
          bounding_box?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          inspection_id: string
          location: string
          photo_url?: string | null
          repair_cost?: number | null
          repair_required?: boolean
          repair_status?: Database["public"]["Enums"]["repair_status"] | null
          severity: Database["public"]["Enums"]["defect_severity"]
          type: Database["public"]["Enums"]["defect_type"]
        }
        Update: {
          bounding_box?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          inspection_id?: string
          location?: string
          photo_url?: string | null
          repair_cost?: number | null
          repair_required?: boolean
          repair_status?: Database["public"]["Enums"]["repair_status"] | null
          severity?: Database["public"]["Enums"]["defect_severity"]
          type?: Database["public"]["Enums"]["defect_type"]
        }
        Relationships: [
          {
            foreignKeyName: "defects_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          inspection_id: string
          photo_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          inspection_id: string
          photo_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          inspection_id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          additional_inspectors: string[] | null
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          duration_seconds: number | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          inspection_type: string | null
          inspector_id: string
          item: string | null
          job: string | null
          labor_hours: number | null
          labor_rate: number | null
          location: string
          notes: string | null
          part: string | null
          parts_accepted: number | null
          parts_rejected: number | null
          pass_count: number | null
          pipe_support_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["inspection_status"]
          total_cost: number | null
          updated_at: string
          weld_stamp: string | null
          weld_stamp_none: boolean | null
          weld_stamp_not_required: boolean | null
          welder_id: string
          welder_name: string
          wps_ref: string | null
        }
        Insert: {
          additional_inspectors?: string[] | null
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          duration_seconds?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          inspection_type?: string | null
          inspector_id: string
          item?: string | null
          job?: string | null
          labor_hours?: number | null
          labor_rate?: number | null
          location: string
          notes?: string | null
          part?: string | null
          parts_accepted?: number | null
          parts_rejected?: number | null
          pass_count?: number | null
          pipe_support_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["inspection_status"]
          total_cost?: number | null
          updated_at?: string
          weld_stamp?: string | null
          weld_stamp_none?: boolean | null
          weld_stamp_not_required?: boolean | null
          welder_id: string
          welder_name: string
          wps_ref?: string | null
        }
        Update: {
          additional_inspectors?: string[] | null
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          duration_seconds?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          inspection_type?: string | null
          inspector_id?: string
          item?: string | null
          job?: string | null
          labor_hours?: number | null
          labor_rate?: number | null
          location?: string
          notes?: string | null
          part?: string | null
          parts_accepted?: number | null
          parts_rejected?: number | null
          pass_count?: number | null
          pipe_support_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["inspection_status"]
          total_cost?: number | null
          updated_at?: string
          weld_stamp?: string | null
          weld_stamp_none?: boolean | null
          weld_stamp_not_required?: boolean | null
          welder_id?: string
          welder_name?: string
          wps_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_pipe_support_id_fkey"
            columns: ["pipe_support_id"]
            isOneToOne: false
            referencedRelation: "pipe_supports"
            referencedColumns: ["id"]
          },
        ]
      }
      material_costs: {
        Row: {
          created_at: string
          id: string
          inspection_id: string
          name: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_id: string
          name: string
          quantity?: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          inspection_id?: string
          name?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_costs_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      pipe_supports: {
        Row: {
          blueprint_ref: string | null
          created_at: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          location: string
          name: string
          status: Database["public"]["Enums"]["pipe_support_status"]
          type: Database["public"]["Enums"]["pipe_support_type"]
          updated_at: string
        }
        Insert: {
          blueprint_ref?: string | null
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          location: string
          name: string
          status?: Database["public"]["Enums"]["pipe_support_status"]
          type: Database["public"]["Enums"]["pipe_support_type"]
          updated_at?: string
        }
        Update: {
          blueprint_ref?: string | null
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          location?: string
          name?: string
          status?: Database["public"]["Enums"]["pipe_support_status"]
          type?: Database["public"]["Enums"]["pipe_support_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          certifications: string[] | null
          created_at: string
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          certifications?: string[] | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          certifications?: string[] | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_usage_log: {
        Row: {
          action: string
          created_at: string
          file_path: string
          file_size_bytes: number
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          file_path: string
          file_size_bytes: number
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          file_path?: string
          file_size_bytes?: number
          id?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          storage_limit_mb: number
          storage_used_mb: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          storage_limit_mb?: number
          storage_used_mb?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          storage_limit_mb?: number
          storage_used_mb?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
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
      app_role: "inspector" | "executive" | "admin"
      defect_severity: "critical" | "major" | "minor"
      defect_type:
        | "undercut"
        | "porosity"
        | "lack_of_fusion"
        | "sloppy_weld"
        | "cold_lap"
        | "crack"
        | "incomplete_penetration"
        | "spatter"
        | "distortion"
      department_type:
        | "a_cut_shop"
        | "b_bechtel"
        | "f_fab"
        | "n_galvanizing"
        | "o_foam_fab"
        | "p_constants_variable_spring_line"
      inspection_status: "in_progress" | "completed" | "requires_review"
      pipe_support_status: "good" | "needs_repair" | "critical"
      pipe_support_type: "spring_can" | "hanger" | "guide" | "anchor" | "saddle"
      repair_status: "pending" | "in_progress" | "completed"
      subscription_tier: "free" | "pro" | "enterprise"
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
      app_role: ["inspector", "executive", "admin"],
      defect_severity: ["critical", "major", "minor"],
      defect_type: [
        "undercut",
        "porosity",
        "lack_of_fusion",
        "sloppy_weld",
        "cold_lap",
        "crack",
        "incomplete_penetration",
        "spatter",
        "distortion",
      ],
      department_type: [
        "a_cut_shop",
        "b_bechtel",
        "f_fab",
        "n_galvanizing",
        "o_foam_fab",
        "p_constants_variable_spring_line",
      ],
      inspection_status: ["in_progress", "completed", "requires_review"],
      pipe_support_status: ["good", "needs_repair", "critical"],
      pipe_support_type: ["spring_can", "hanger", "guide", "anchor", "saddle"],
      repair_status: ["pending", "in_progress", "completed"],
      subscription_tier: ["free", "pro", "enterprise"],
    },
  },
} as const
