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
      activity_logs: {
        Row: {
          created_at: string
          detected_issues: string[] | null
          energy_level: number | null
          exercise_name: string | null
          form_quality: number | null
          id: string
          joint_angles: Json | null
          pain_locations: string[] | null
          rep_count: number | null
          rpe: number | null
          sleep_hours: number | null
          soreness_scale: number | null
          timestamp: string
          user_id: string
          user_mood: number | null
        }
        Insert: {
          created_at?: string
          detected_issues?: string[] | null
          energy_level?: number | null
          exercise_name?: string | null
          form_quality?: number | null
          id?: string
          joint_angles?: Json | null
          pain_locations?: string[] | null
          rep_count?: number | null
          rpe?: number | null
          sleep_hours?: number | null
          soreness_scale?: number | null
          timestamp?: string
          user_id: string
          user_mood?: number | null
        }
        Update: {
          created_at?: string
          detected_issues?: string[] | null
          energy_level?: number | null
          exercise_name?: string | null
          form_quality?: number | null
          id?: string
          joint_angles?: Json | null
          pain_locations?: string[] | null
          rep_count?: number | null
          rpe?: number | null
          sleep_hours?: number | null
          soreness_scale?: number | null
          timestamp?: string
          user_id?: string
          user_mood?: number | null
        }
        Relationships: []
      }
      affirmations: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          user_id?: string
        }
        Relationships: []
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
      blog_posts: {
        Row: {
          ai_prompt: string | null
          content: string | null
          content_type: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          external_link: string | null
          id: string
          is_ai_generated: boolean
          is_published: boolean
          media_url: string | null
          published_at: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_prompt?: string | null
          content?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          external_link?: string | null
          id?: string
          is_ai_generated?: boolean
          is_published?: boolean
          media_url?: string | null
          published_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_prompt?: string | null
          content?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          external_link?: string | null
          id?: string
          is_ai_generated?: boolean
          is_published?: boolean
          media_url?: string | null
          published_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_purchases: {
        Row: {
          book_id: string
          id: string
          payment_amount: number
          payment_status: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          id?: string
          payment_amount: number
          payment_status?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          id?: string
          payment_amount?: number
          payment_status?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_purchases_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "digital_books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_reading_progress: {
        Row: {
          book_id: string
          completed: boolean | null
          current_page: number
          id: string
          last_read_at: string
          total_pages: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          completed?: boolean | null
          current_page?: number
          id?: string
          last_read_at?: string
          total_pages?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          completed?: boolean | null
          current_page?: number
          id?: string
          last_read_at?: string
          total_pages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "digital_books"
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
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
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
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_content: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          duration_seconds: number | null
          id: string
          like_count: number | null
          media_url: string
          platforms_published: Json | null
          published_at: string | null
          scheduled_for: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          like_count?: number | null
          media_url: string
          platforms_published?: Json | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          like_count?: number | null
          media_url?: string
          platforms_published?: Json | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      coach_embeddings: {
        Row: {
          coach_id: string
          embedding_vector: Json | null
          generated_at: string
          id: string
          match_signals: Json | null
          profile_snapshot: Json | null
          version: number | null
        }
        Insert: {
          coach_id: string
          embedding_vector?: Json | null
          generated_at?: string
          id?: string
          match_signals?: Json | null
          profile_snapshot?: Json | null
          version?: number | null
        }
        Update: {
          coach_id?: string
          embedding_vector?: Json | null
          generated_at?: string
          id?: string
          match_signals?: Json | null
          profile_snapshot?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_embeddings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_gym_locations: {
        Row: {
          availability_notes: string | null
          coach_id: string
          created_at: string
          gym_location_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          availability_notes?: string | null
          coach_id: string
          created_at?: string
          gym_location_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          availability_notes?: string | null
          coach_id?: string
          created_at?: string
          gym_location_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_gym_locations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_gym_locations_gym_location_id_fkey"
            columns: ["gym_location_id"]
            isOneToOne: false
            referencedRelation: "gym_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string | null
          created_at: string
          email: string
          experience: string | null
          featured: boolean | null
          full_name: string
          id: string
          location: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          session_price: number
          specialties: string[] | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string | null
          created_at?: string
          email: string
          experience?: string | null
          featured?: boolean | null
          full_name: string
          id?: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          session_price?: number
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          featured?: boolean | null
          full_name?: string
          id?: string
          location?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          session_price?: number
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_sessions: {
        Row: {
          client_email: string
          client_id: string | null
          client_name: string
          client_phone: string | null
          coach_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_status: string | null
          price: number
          session_date: string
          session_time: string
          session_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_email: string
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          coach_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          price: number
          session_date: string
          session_time: string
          session_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          coach_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          price?: number
          session_date?: string
          session_time?: string
          session_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_books: {
        Row: {
          author: string
          category: string | null
          compare_at_price: number | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          epub_url: string | null
          id: string
          is_active: boolean
          pages: number | null
          pdf_url: string | null
          preview_url: string | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string | null
          compare_at_price?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          epub_url?: string | null
          id?: string
          is_active?: boolean
          pages?: number | null
          pdf_url?: string | null
          preview_url?: string | null
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string | null
          compare_at_price?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          epub_url?: string | null
          id?: string
          is_active?: boolean
          pages?: number | null
          pdf_url?: string | null
          preview_url?: string | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      embedding_similarity_cache: {
        Row: {
          computed_at: string
          entity_id_a: string
          entity_id_b: string
          entity_type_a: string
          entity_type_b: string
          id: string
          similarity_score: number
        }
        Insert: {
          computed_at?: string
          entity_id_a: string
          entity_id_b: string
          entity_type_a: string
          entity_type_b: string
          id?: string
          similarity_score: number
        }
        Update: {
          computed_at?: string
          entity_id_a?: string
          entity_id_b?: string
          entity_type_a?: string
          entity_type_b?: string
          id?: string
          similarity_score?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          form_cues: string[] | null
          id: string
          name: string
          order_index: number
          reps: string
          rest_seconds: number | null
          sets: number
          weight_type: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          form_cues?: string[] | null
          id?: string
          name: string
          order_index?: number
          reps?: string
          rest_seconds?: number | null
          sets?: number
          weight_type?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string
          form_cues?: string[] | null
          id?: string
          name?: string
          order_index?: number
          reps?: string
          rest_seconds?: number | null
          sets?: number
          weight_type?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      form_analysis: {
        Row: {
          analysis_result: Json | null
          created_at: string
          cues_given: string[] | null
          exercise_name: string
          form_score: number | null
          id: string
          issues_detected: string[] | null
          user_id: string
          video_clip_url: string | null
          workout_log_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          cues_given?: string[] | null
          exercise_name: string
          form_score?: number | null
          id?: string
          issues_detected?: string[] | null
          user_id: string
          video_clip_url?: string | null
          workout_log_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          cues_given?: string[] | null
          exercise_name?: string
          form_score?: number | null
          id?: string
          issues_detected?: string[] | null
          user_id?: string
          video_clip_url?: string | null
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_analysis_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_conversations: {
        Row: {
          content: string
          created_at: string
          generated_images: Json | null
          goal_id: string
          id: string
          image_url: string | null
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          generated_images?: Json | null
          goal_id: string
          id?: string
          image_url?: string | null
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          generated_images?: Json | null
          goal_id?: string
          id?: string
          image_url?: string | null
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_conversations_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "health_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_brands: {
        Row: {
          affiliate_network: string | null
          affiliate_program_type: string | null
          commission_structure: Json | null
          contact_info: Json | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          partnership_status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          affiliate_network?: string | null
          affiliate_program_type?: string | null
          commission_structure?: Json | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          partnership_status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          affiliate_network?: string | null
          affiliate_program_type?: string | null
          commission_structure?: Json | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          partnership_status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      gym_embeddings: {
        Row: {
          embedding_vector: Json | null
          feature_snapshot: Json | null
          generated_at: string
          gym_location_id: string
          id: string
          version: number | null
        }
        Insert: {
          embedding_vector?: Json | null
          feature_snapshot?: Json | null
          generated_at?: string
          gym_location_id: string
          id?: string
          version?: number | null
        }
        Update: {
          embedding_vector?: Json | null
          feature_snapshot?: Json | null
          generated_at?: string
          gym_location_id?: string
          id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_embeddings_gym_location_id_fkey"
            columns: ["gym_location_id"]
            isOneToOne: true
            referencedRelation: "gym_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_locations: {
        Row: {
          address: string | null
          amenities: Json | null
          city: string
          created_at: string
          featured: boolean | null
          google_maps_url: string | null
          gym_brand_id: string | null
          has_personal_training: boolean | null
          hours: Json | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          monthly_price_estimate: number | null
          name: string
          phone: string | null
          promo_code: string | null
          referral_link: string | null
          state: string
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          city: string
          created_at?: string
          featured?: boolean | null
          google_maps_url?: string | null
          gym_brand_id?: string | null
          has_personal_training?: boolean | null
          hours?: Json | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          monthly_price_estimate?: number | null
          name: string
          phone?: string | null
          promo_code?: string | null
          referral_link?: string | null
          state: string
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          city?: string
          created_at?: string
          featured?: boolean | null
          google_maps_url?: string | null
          gym_brand_id?: string | null
          has_personal_training?: boolean | null
          hours?: Json | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          monthly_price_estimate?: number | null
          name?: string
          phone?: string | null
          promo_code?: string | null
          referral_link?: string | null
          state?: string
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_locations_gym_brand_id_fkey"
            columns: ["gym_brand_id"]
            isOneToOne: false
            referencedRelation: "gym_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_referrals: {
        Row: {
          clicked_at: string
          commission_amount: number | null
          commission_status: string | null
          conversion_date: string | null
          converted: boolean | null
          gym_location_id: string
          id: string
          referral_code: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          commission_amount?: number | null
          commission_status?: string | null
          conversion_date?: string | null
          converted?: boolean | null
          gym_location_id: string
          id?: string
          referral_code?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          commission_amount?: number | null
          commission_status?: string | null
          conversion_date?: string | null
          converted?: boolean | null
          gym_location_id?: string
          id?: string
          referral_code?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_referrals_gym_location_id_fkey"
            columns: ["gym_location_id"]
            isOneToOne: false
            referencedRelation: "gym_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          body_area: string | null
          created_at: string
          description: string | null
          goal_type: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_area?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_area?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_partners: {
        Row: {
          created_at: string
          description: string | null
          disclaimer: string | null
          id: string
          is_active: boolean | null
          link: string | null
          logo_url: string | null
          name: string
          recommended_for: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          disclaimer?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          logo_url?: string | null
          name: string
          recommended_for?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          disclaimer?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          logo_url?: string | null
          name?: string
          recommended_for?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      health_recommendations: {
        Row: {
          created_at: string
          description: string
          diagram_url: string | null
          frequency: string | null
          goal_id: string
          id: string
          instructions: Json | null
          notes: string | null
          priority: string | null
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          diagram_url?: string | null
          frequency?: string | null
          goal_id: string
          id?: string
          instructions?: Json | null
          notes?: string | null
          priority?: string | null
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          diagram_url?: string | null
          frequency?: string | null
          goal_id?: string
          id?: string
          instructions?: Json | null
          notes?: string | null
          priority?: string | null
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_recommendations_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "health_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_waivers: {
        Row: {
          accepted_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          waiver_version: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          waiver_version?: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          waiver_version?: string
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
      leads: {
        Row: {
          converted_at: string | null
          created_at: string
          email: string
          id: string
          lead_magnet: string | null
          name: string | null
          quiz_results: Json | null
          source: string
          subscribed_newsletter: boolean | null
          user_id: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          email: string
          id?: string
          lead_magnet?: string | null
          name?: string | null
          quiz_results?: Json | null
          source: string
          subscribed_newsletter?: boolean | null
          user_id?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_magnet?: string | null
          name?: string | null
          quiz_results?: Json | null
          source?: string
          subscribed_newsletter?: boolean | null
          user_id?: string | null
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
          email: string | null
          estimated_income: number | null
          fleet_size: number | null
          id: string
          last_contacted_at: string | null
          lead_type: Database["public"]["Enums"]["lead_type"]
          notes: string | null
          phone: string | null
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
          email?: string | null
          estimated_income?: number | null
          fleet_size?: number | null
          id?: string
          last_contacted_at?: string | null
          lead_type: Database["public"]["Enums"]["lead_type"]
          notes?: string | null
          phone?: string | null
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
          email?: string | null
          estimated_income?: number | null
          fleet_size?: number | null
          id?: string
          last_contacted_at?: string | null
          lead_type?: Database["public"]["Enums"]["lead_type"]
          notes?: string | null
          phone?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      nutrition_targets: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          fats_g: number | null
          id: string
          plate_template: string | null
          protein_g: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fats_g?: number | null
          id?: string
          plate_template?: string | null
          protein_g?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fats_g?: number | null
          id?: string
          plate_template?: string | null
          protein_g?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_title: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_title: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_title?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          customer_email: string
          customer_name: string | null
          id: string
          notes: string | null
          shipping: number | null
          shipping_address: Json | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
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
      partner_embeddings: {
        Row: {
          business_id: string
          embedding_vector: Json | null
          generated_at: string
          id: string
          profile_snapshot: Json | null
          version: number | null
        }
        Insert: {
          business_id: string
          embedding_vector?: Json | null
          generated_at?: string
          id?: string
          profile_snapshot?: Json | null
          version?: number | null
        }
        Update: {
          business_id?: string
          embedding_vector?: Json | null
          generated_at?: string
          id?: string
          profile_snapshot?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_embeddings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          feedback_type: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          feedback_type?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          feedback_type?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          created_at: string
          id: string
          inventory_quantity: number
          is_available: boolean
          option1: string | null
          option2: string | null
          option3: string | null
          price: number
          product_id: string
          sku: string | null
          title: string
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number
          is_available?: boolean
          option1?: string | null
          option2?: string | null
          option3?: string | null
          price: number
          product_id: string
          sku?: string | null
          title?: string
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number
          is_available?: boolean
          option1?: string | null
          option2?: string | null
          option3?: string | null
          price?: number
          product_id?: string
          sku?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          compare_at_price: number | null
          created_at: string
          currency_code: string
          description: string | null
          handle: string
          id: string
          inventory_quantity: number
          is_active: boolean
          price: number
          product_type: string | null
          tags: string[] | null
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          currency_code?: string
          description?: string | null
          handle: string
          id?: string
          inventory_quantity?: number
          is_active?: boolean
          price?: number
          product_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          currency_code?: string
          description?: string | null
          handle?: string
          id?: string
          inventory_quantity?: number
          is_active?: boolean
          price?: number
          product_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          available_days: string[] | null
          avatar_url: string | null
          created_at: string
          customer_rating: number | null
          email: string | null
          equipment_access: string[] | null
          experience_level: string | null
          fitness_goals: string[] | null
          full_name: string | null
          id: string
          injuries: string[] | null
          nano_stack: Json | null
          onboarding_completed: boolean | null
          payment_methods: Json | null
          phone: string | null
          phone_number: string | null
          preferences: Json | null
          total_bookings: number | null
          updated_at: string
          viome_results: Json | null
          workout_duration_minutes: number | null
        }
        Insert: {
          available_days?: string[] | null
          avatar_url?: string | null
          created_at?: string
          customer_rating?: number | null
          email?: string | null
          equipment_access?: string[] | null
          experience_level?: string | null
          fitness_goals?: string[] | null
          full_name?: string | null
          id: string
          injuries?: string[] | null
          nano_stack?: Json | null
          onboarding_completed?: boolean | null
          payment_methods?: Json | null
          phone?: string | null
          phone_number?: string | null
          preferences?: Json | null
          total_bookings?: number | null
          updated_at?: string
          viome_results?: Json | null
          workout_duration_minutes?: number | null
        }
        Update: {
          available_days?: string[] | null
          avatar_url?: string | null
          created_at?: string
          customer_rating?: number | null
          email?: string | null
          equipment_access?: string[] | null
          experience_level?: string | null
          fitness_goals?: string[] | null
          full_name?: string | null
          id?: string
          injuries?: string[] | null
          nano_stack?: Json | null
          onboarding_completed?: boolean | null
          payment_methods?: Json | null
          phone?: string | null
          phone_number?: string | null
          preferences?: Json | null
          total_bookings?: number | null
          updated_at?: string
          viome_results?: Json | null
          workout_duration_minutes?: number | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          creator_coach_id: string | null
          description: string | null
          difficulty_level: string
          equipment_required: string[] | null
          frequency_per_week: number
          id: string
          is_public: boolean | null
          is_template: boolean | null
          name: string
          target_audience: string[] | null
          updated_at: string
          weeks: number
        }
        Insert: {
          created_at?: string
          creator_coach_id?: string | null
          description?: string | null
          difficulty_level?: string
          equipment_required?: string[] | null
          frequency_per_week?: number
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          target_audience?: string[] | null
          updated_at?: string
          weeks?: number
        }
        Update: {
          created_at?: string
          creator_coach_id?: string | null
          description?: string | null
          difficulty_level?: string
          equipment_required?: string[] | null
          frequency_per_week?: number
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          target_audience?: string[] | null
          updated_at?: string
          weeks?: number
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
      reflections: {
        Row: {
          created_at: string
          feelings_check: string | null
          gratitude_items: string[] | null
          growth_areas: string[] | null
          id: string
          intentions: string[] | null
          notes: string | null
          reflection_date: string
          reflection_type: string
          user_id: string
          wins: string[] | null
        }
        Insert: {
          created_at?: string
          feelings_check?: string | null
          gratitude_items?: string[] | null
          growth_areas?: string[] | null
          id?: string
          intentions?: string[] | null
          notes?: string | null
          reflection_date?: string
          reflection_type: string
          user_id: string
          wins?: string[] | null
        }
        Update: {
          created_at?: string
          feelings_check?: string | null
          gratitude_items?: string[] | null
          growth_areas?: string[] | null
          id?: string
          intentions?: string[] | null
          notes?: string | null
          reflection_date?: string
          reflection_type?: string
          user_id?: string
          wins?: string[] | null
        }
        Relationships: []
      }
      relationship_reflections: {
        Row: {
          action_to_take: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          my_part: string | null
          person_name: string | null
          situation: string | null
          user_id: string
        }
        Insert: {
          action_to_take?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          my_part?: string | null
          person_name?: string | null
          situation?: string | null
          user_id: string
        }
        Update: {
          action_to_take?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          my_part?: string | null
          person_name?: string | null
          situation?: string | null
          user_id?: string
        }
        Relationships: []
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
      social_platform_connections: {
        Row: {
          access_token_encrypted: string | null
          account_name: string | null
          created_at: string
          id: string
          is_connected: boolean
          platform: string
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_name?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          platform: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_name?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          platform?: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      supplement_stacks: {
        Row: {
          created_at: string
          disclaimer: string | null
          dosage: string | null
          id: string
          ingredients: Json | null
          is_active: boolean | null
          name: string
          purpose: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          disclaimer?: string | null
          dosage?: string | null
          id?: string
          ingredients?: Json | null
          is_active?: boolean | null
          name: string
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          disclaimer?: string | null
          dosage?: string | null
          id?: string
          ingredients?: Json | null
          is_active?: boolean | null
          name?: string
          purpose?: string | null
          updated_at?: string
        }
        Relationships: []
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
      user_embeddings: {
        Row: {
          behavioral_signals: Json | null
          embedding_source: string | null
          embedding_vector: Json | null
          generated_at: string
          id: string
          profile_snapshot: Json | null
          user_id: string
          version: number | null
        }
        Insert: {
          behavioral_signals?: Json | null
          embedding_source?: string | null
          embedding_vector?: Json | null
          generated_at?: string
          id?: string
          profile_snapshot?: Json | null
          user_id: string
          version?: number | null
        }
        Update: {
          behavioral_signals?: Json | null
          embedding_source?: string | null
          embedding_vector?: Json | null
          generated_at?: string
          id?: string
          profile_snapshot?: Json | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      user_programs: {
        Row: {
          completed_at: string | null
          created_at: string
          current_day: number | null
          current_week: number | null
          id: string
          program_id: string
          started_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          program_id: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          program_id?: string
          started_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
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
      workout_logs: {
        Row: {
          created_at: string
          exercise_id: string | null
          exercise_name: string
          form_score: number | null
          id: string
          logged_at: string
          notes: string | null
          reps_completed: number | null
          rpe: number | null
          set_number: number
          user_id: string
          weight_used: number | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          exercise_name: string
          form_score?: number | null
          id?: string
          logged_at?: string
          notes?: string | null
          reps_completed?: number | null
          rpe?: number | null
          set_number: number
          user_id: string
          weight_used?: number | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          exercise_name?: string
          form_score?: number | null
          id?: string
          logged_at?: string
          notes?: string | null
          reps_completed?: number | null
          rpe?: number | null
          set_number?: number
          user_id?: string
          weight_used?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          day_number: number
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          program_id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          day_number: number
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          program_id: string
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          program_id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
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
