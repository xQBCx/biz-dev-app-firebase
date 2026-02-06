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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academy_badges: {
        Row: {
          active: boolean
          category: string
          conditions: Json | null
          created_at: string
          description: string
          icon_name: string
          id: string
          name: string
          xp_requirement: number | null
        }
        Insert: {
          active?: boolean
          category: string
          conditions?: Json | null
          created_at?: string
          description: string
          icon_name: string
          id?: string
          name: string
          xp_requirement?: number | null
        }
        Update: {
          active?: boolean
          category?: string
          conditions?: Json | null
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          xp_requirement?: number | null
        }
        Relationships: []
      }
      academy_challenges: {
        Row: {
          active: boolean
          created_at: string
          current_value: number
          description: string
          end_date: string
          id: string
          reward_description: string | null
          reward_xp: number
          start_date: string
          target_value: number
          title: string
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_value?: number
          description: string
          end_date: string
          id?: string
          reward_description?: string | null
          reward_xp?: number
          start_date?: string
          target_value: number
          title: string
          type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_value?: number
          description?: string
          end_date?: string
          id?: string
          reward_description?: string | null
          reward_xp?: number
          start_date?: string
          target_value?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      academy_course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          progress_percentage: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academy_course_modules: {
        Row: {
          active: boolean
          content_type: string
          content_url: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          order_index: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          content_type?: string
          content_url?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          order_index: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          content_type?: string
          content_url?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      academy_courses: {
        Row: {
          active: boolean
          created_at: string
          department: string
          description: string
          difficulty: string
          duration_minutes: number
          featured: boolean
          id: string
          instructor_name: string | null
          learning_objectives: string[] | null
          prerequisites: string[] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          department: string
          description: string
          difficulty?: string
          duration_minutes?: number
          featured?: boolean
          id?: string
          instructor_name?: string | null
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          featured?: boolean
          id?: string
          instructor_name?: string | null
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      academy_module_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          module_id: string
          progress_percentage: number
          started_at: string
          status: string
          time_spent_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          module_id: string
          progress_percentage?: number
          started_at?: string
          status?: string
          time_spent_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          module_id?: string
          progress_percentage?: number
          started_at?: string
          status?: string
          time_spent_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academy_progress: {
        Row: {
          certifications_earned: number
          created_at: string
          culture_points: number
          current_level: number
          hours_logged: number
          id: string
          last_activity: string | null
          modules_completed: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications_earned?: number
          created_at?: string
          culture_points?: number
          current_level?: number
          hours_logged?: number
          id?: string
          last_activity?: string | null
          modules_completed?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications_earned?: number
          created_at?: string
          culture_points?: number
          current_level?: number
          hours_logged?: number
          id?: string
          last_activity?: string | null
          modules_completed?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academy_redemptions: {
        Row: {
          created_at: string
          employee_id: string
          fulfilled_at: string | null
          id: string
          notes: string | null
          requested_at: string
          reward_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          reward_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          reward_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "academy_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_rewards: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          stock: number | null
          title: string
          updated_at: string
          xp_cost: number
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          stock?: number | null
          title: string
          updated_at?: string
          xp_cost: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          stock?: number | null
          title?: string
          updated_at?: string
          xp_cost?: number
        }
        Relationships: []
      }
      coms_channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          notifications_enabled: boolean
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          notifications_enabled?: boolean
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          notifications_enabled?: boolean
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coms_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "coms_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      coms_channels: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          property_id: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          property_id: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          property_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      coms_meetings: {
        Row: {
          channel_id: string
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          meeting_url: string | null
          starts_at: string
          status: string
          title: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          meeting_url?: string | null
          starts_at?: string
          status?: string
          title: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          meeting_url?: string | null
          starts_at?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "coms_meetings_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "coms_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      coms_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coms_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "coms_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      coms_messages: {
        Row: {
          channel_id: string
          content: string | null
          created_at: string
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message_type: string
          sender_id: string
          thread_id: string | null
          updated_at: string
          voice_duration: number | null
        }
        Insert: {
          channel_id: string
          content?: string | null
          created_at?: string
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id: string
          thread_id?: string | null
          updated_at?: string
          voice_duration?: number | null
        }
        Update: {
          channel_id?: string
          content?: string | null
          created_at?: string
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id?: string
          thread_id?: string | null
          updated_at?: string
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coms_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "coms_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coms_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "coms_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_shifts: {
        Row: {
          created_at: string
          department: string
          employee_id: string
          id: string
          notes: string | null
          property_id: string
          shift_date: string
          shift_end: string
          shift_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          employee_id: string
          id?: string
          notes?: string | null
          property_id: string
          shift_date: string
          shift_end: string
          shift_start: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          employee_id?: string
          id?: string
          notes?: string | null
          property_id?: string
          shift_date?: string
          shift_end?: string
          shift_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_shifts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          email: string
          id: string
          job_id: string
          name: string
          phone: string | null
          resume_url: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          email: string
          id?: string
          job_id: string
          name: string
          phone?: string | null
          resume_url?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          email?: string
          id?: string
          job_id?: string
          name?: string
          phone?: string | null
          resume_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          active: boolean
          created_at: string
          department: string
          description: string
          id: string
          location: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          department: string
          description: string
          id?: string
          location: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          department?: string
          description?: string
          id?: string
          location?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          contact_name: string
          created_at: string
          email: string
          id: string
          notes: string | null
          org_name: string
          phone: string | null
          property_count: number | null
        }
        Insert: {
          contact_name: string
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          org_name: string
          phone?: string | null
          property_count?: number | null
        }
        Update: {
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          org_name?: string
          phone?: string | null
          property_count?: number | null
        }
        Relationships: []
      }
      maintenance_request_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_internal: boolean
          request_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_internal?: boolean
          request_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          description: string | null
          estimated_completion: string | null
          id: string
          location_type: string | null
          media_attachments: Json | null
          property_id: string | null
          remarks: string | null
          request_number: string
          room_id: string | null
          selected_items: Json
          specific_location: string | null
          status: string
          suite_number: string
          time_spent: number | null
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          estimated_completion?: string | null
          id?: string
          location_type?: string | null
          media_attachments?: Json | null
          property_id?: string | null
          remarks?: string | null
          request_number?: string
          room_id?: string | null
          selected_items?: Json
          specific_location?: string | null
          status?: string
          suite_number: string
          time_spent?: number | null
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          estimated_completion?: string | null
          id?: string
          location_type?: string | null
          media_attachments?: Json | null
          property_id?: string | null
          remarks?: string | null
          request_number?: string
          room_id?: string | null
          selected_items?: Json
          specific_location?: string | null
          status?: string
          suite_number?: string
          time_spent?: number | null
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          initials: string | null
          org_id: string | null
          property_id: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          initials?: string | null
          org_id?: string | null
          property_id?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          initials?: string | null
          org_id?: string | null
          property_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          org_id: string
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          org_id: string
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          bed_config: string
          created_at: string
          id: string
          notes: string | null
          property_id: string | null
          room_number: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          bed_config: string
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          room_number: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          bed_config?: string
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          room_number?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          created_at: string
          department: string
          id: string
          sop_url: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          sop_url: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          sop_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          full_name: string
          id: string
          initials: string
          property_id: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          initials: string
          property_id?: string | null
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          initials?: string
          property_id?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_status: {
        Row: {
          created_at: string
          current_shift_id: string | null
          employee_id: string
          id: string
          last_seen: string
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_shift_id?: string | null
          employee_id: string
          id?: string
          last_seen?: string
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_shift_id?: string | null
          employee_id?: string
          id?: string
          last_seen?: string
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_status_current_shift"
            columns: ["current_shift_id"]
            isOneToOne: false
            referencedRelation: "daily_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_status_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_status_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "academy_badges"
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
