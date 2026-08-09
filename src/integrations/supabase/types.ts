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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          payload: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      body_metrics: {
        Row: {
          bodyfat_pct: number | null
          created_at: string
          id: string
          measured_on: string
          note: string | null
          resting_hr: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          bodyfat_pct?: number | null
          created_at?: string
          id?: string
          measured_on?: string
          note?: string | null
          resting_hr?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          bodyfat_pct?: number | null
          created_at?: string
          id?: string
          measured_on?: string
          note?: string | null
          resting_hr?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          metadata: Json
          order_id: string | null
          product_id: string
          programme_version_id: string | null
          revoked_at: string | null
          source: Database["public"]["Enums"]["entitlement_source"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          metadata?: Json
          order_id?: string | null
          product_id: string
          programme_version_id?: string | null
          revoked_at?: string | null
          source?: Database["public"]["Enums"]["entitlement_source"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          metadata?: Json
          order_id?: string | null
          product_id?: string
          programme_version_id?: string | null
          revoked_at?: string | null
          source?: Database["public"]["Enums"]["entitlement_source"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_programme_version_id_fkey"
            columns: ["programme_version_id"]
            isOneToOne: false
            referencedRelation: "programme_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      food_entries: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          grams: number | null
          id: string
          logged_on: string
          meal: string
          name: string
          protein_g: number
          saved: boolean
          serving_label: string | null
          source: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          grams?: number | null
          id?: string
          logged_on?: string
          meal?: string
          name: string
          protein_g?: number
          saved?: boolean
          serving_label?: string | null
          source?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          grams?: number | null
          id?: string
          logged_on?: string
          meal?: string
          name?: string
          protein_g?: number
          saved?: boolean
          serving_label?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          created_at: string
          id: string
          logged_on: string
          ml: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_on?: string
          ml: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_on?: string
          ml?: number
          user_id?: string
        }
        Relationships: []
      }
      nutrition_targets: {
        Row: {
          activity_level: string | null
          age: number | null
          basis_weight_kg: number | null
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          goal: string | null
          height_cm: number | null
          method: string
          protein_g: number
          protein_per_kg: number
          sex: string | null
          updated_at: string
          user_id: string
          water_ml: number
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          basis_weight_kg?: number | null
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          goal?: string | null
          height_cm?: number | null
          method?: string
          protein_g?: number
          protein_per_kg?: number
          sex?: string | null
          updated_at?: string
          user_id: string
          water_ml?: number
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          basis_weight_kg?: number | null
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          goal?: string | null
          height_cm?: number | null
          method?: string
          protein_g?: number
          protein_per_kg?: number
          sex?: string | null
          updated_at?: string
          user_id?: string
          water_ml?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount_pence: number
          final_price_pence: number
          id: string
          order_id: string
          product_id: string
          programme_version_id: string | null
          refunded_at: string | null
          stripe_price_id: string | null
          unit_price_pence: number
        }
        Insert: {
          created_at?: string
          discount_pence?: number
          final_price_pence?: number
          id?: string
          order_id: string
          product_id: string
          programme_version_id?: string | null
          refunded_at?: string | null
          stripe_price_id?: string | null
          unit_price_pence?: number
        }
        Update: {
          created_at?: string
          discount_pence?: number
          final_price_pence?: number
          id?: string
          order_id?: string
          product_id?: string
          programme_version_id?: string | null
          refunded_at?: string | null
          stripe_price_id?: string | null
          unit_price_pence?: number
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
            foreignKeyName: "order_items_programme_version_id_fkey"
            columns: ["programme_version_id"]
            isOneToOne: false
            referencedRelation: "programme_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          discount_pence: number
          environment: string
          id: string
          order_status: string
          payment_status: string
          promotion_code: string | null
          purchased_at: string | null
          refunded_at: string | null
          stripe_checkout_session_id: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_pence: number
          total_pence: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          discount_pence?: number
          environment?: string
          id?: string
          order_status?: string
          payment_status?: string
          promotion_code?: string | null
          purchased_at?: string | null
          refunded_at?: string | null
          stripe_checkout_session_id: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_pence?: number
          total_pence?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          discount_pence?: number
          environment?: string
          id?: string
          order_status?: string
          payment_status?: string
          promotion_code?: string | null
          purchased_at?: string | null
          refunded_at?: string | null
          stripe_checkout_session_id?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_pence?: number
          total_pence?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_on: string
          created_at: string
          id: string
          lift_key: string
          lift_label: string
          metric: string
          note: string | null
          reps: number | null
          source_session_id: string | null
          unit: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          achieved_on?: string
          created_at?: string
          id?: string
          lift_key: string
          lift_label: string
          metric?: string
          note?: string | null
          reps?: number | null
          source_session_id?: string | null
          unit?: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          achieved_on?: string
          created_at?: string
          id?: string
          lift_key?: string
          lift_label?: string
          metric?: string
          note?: string | null
          reps?: number | null
          source_session_id?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      processed_payment_events: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          processed_at: string
          processing_status: string
          stripe_event_id: string
          stripe_event_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_at?: string
          processing_status?: string
          stripe_event_id: string
          stripe_event_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_at?: string
          processing_status?: string
          stripe_event_id?: string
          stripe_event_type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_path: string | null
          collection: Database["public"]["Enums"]["product_collection"]
          cover_image_url: string | null
          created_at: string
          cta_label: string | null
          currency: string
          description: string | null
          difficulty: string | null
          duration_weeks: number | null
          founding_price_cents: number | null
          hero_image_url: string | null
          id: string
          meaning: string | null
          metadata: Json
          name: string
          price_cents: number | null
          sessions_per_week: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          subtitle: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          base_path?: string | null
          collection: Database["public"]["Enums"]["product_collection"]
          cover_image_url?: string | null
          created_at?: string
          cta_label?: string | null
          currency?: string
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          founding_price_cents?: number | null
          hero_image_url?: string | null
          id?: string
          meaning?: string | null
          metadata?: Json
          name: string
          price_cents?: number | null
          sessions_per_week?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          subtitle?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          base_path?: string | null
          collection?: Database["public"]["Enums"]["product_collection"]
          cover_image_url?: string | null
          created_at?: string
          cta_label?: string | null
          currency?: string
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          founding_price_cents?: number | null
          hero_image_url?: string | null
          id?: string
          meaning?: string | null
          metadata?: Json
          name?: string
          price_cents?: number | null
          sessions_per_week?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          subtitle?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          legacy_full_access: boolean
          unit_preference: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          legacy_full_access?: boolean
          unit_preference?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          legacy_full_access?: boolean
          unit_preference?: string
          updated_at?: string
        }
        Relationships: []
      }
      programme_enrolments: {
        Row: {
          completion_pct: number | null
          created_at: string
          current_week: number | null
          id: string
          product_id: string
          started_at: string
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_pct?: number | null
          created_at?: string
          current_week?: number | null
          id?: string
          product_id: string
          started_at?: string
          state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_pct?: number | null
          created_at?: string
          current_week?: number | null
          id?: string
          product_id?: string
          started_at?: string
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_enrolments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_versions: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          is_published: boolean
          manifest: Json
          notes: string | null
          pdf_path: string | null
          product_id: string
          published_at: string | null
          released_at: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          is_published?: boolean
          manifest?: Json
          notes?: string | null
          pdf_path?: string | null
          product_id: string
          published_at?: string | null
          released_at?: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          is_published?: boolean
          manifest?: Json
          notes?: string | null
          pdf_path?: string | null
          product_id?: string
          published_at?: string | null
          released_at?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness_logs: {
        Row: {
          created_at: string
          energy: number | null
          id: string
          log_date: string
          notes: string | null
          sleep_hours: number | null
          soreness: number | null
          stress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number | null
          soreness?: number | null
          stress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number | null
          soreness?: number | null
          stress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_completions: {
        Row: {
          completed_at: string
          created_at: string
          day: number | null
          duration_seconds: number | null
          id: string
          notes: string | null
          product_id: string
          session_id: string
          user_id: string
          week: number | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          day?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          product_id: string
          session_id: string
          user_id: string
          week?: number | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          day?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          product_id?: string
          session_id?: string
          user_id?: string
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_completions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      session_schedule_overrides: {
        Row: {
          action: string
          created_at: string
          day_of_week: string | null
          id: string
          product_id: string
          reason: string | null
          session_id: string
          swap_with_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          day_of_week?: string | null
          id?: string
          product_id: string
          reason?: string | null
          session_id: string
          swap_with_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          day_of_week?: string | null
          id?: string
          product_id?: string
          reason?: string | null
          session_id?: string
          swap_with_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_schedule_overrides_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          leaderboard_name: string | null
          leaderboard_opt_in: boolean
          onboarding_completed_at: string | null
          primary_product_id: string | null
          settings: Json
          training_days: string[]
          units: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          leaderboard_name?: string | null
          leaderboard_opt_in?: boolean
          onboarding_completed_at?: string | null
          primary_product_id?: string | null
          settings?: Json
          training_days?: string[]
          units?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          leaderboard_name?: string | null
          leaderboard_opt_in?: boolean
          onboarding_completed_at?: string | null
          primary_product_id?: string | null
          settings?: Json
          training_days?: string[]
          units?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_primary_product_id_fkey"
            columns: ["primary_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_results: {
        Row: {
          block_id: string | null
          created_at: string
          exercise_id: string | null
          id: string
          kind: string | null
          logged_at: string
          payload: Json
          product_id: string
          session_id: string
          user_id: string
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          exercise_id?: string | null
          id?: string
          kind?: string | null
          logged_at?: string
          payload?: Json
          product_id: string
          session_id: string
          user_id: string
        }
        Update: {
          block_id?: string | null
          created_at?: string
          exercise_id?: string | null
          id?: string
          kind?: string | null
          logged_at?: string
          payload?: Json
          product_id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_results_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_entitlement: {
        Args: {
          _product_id: string
          _programme_version_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      has_active_membership: {
        Args: { _environment: string; _user_id: string }
        Returns: boolean
      }
      has_active_product_entitlement: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
      has_club_access: {
        Args: { _environment?: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      monthly_leaderboard: {
        Args: { _month_start: string }
        Returns: {
          display_name: string
          is_me: boolean
          sessions_completed: number
          total_seconds: number
          user_id: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      user_has_entitlement: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "athlete"
      entitlement_source:
        | "development"
        | "purchase"
        | "gift"
        | "admin"
        | "owner"
      product_collection: "compete" | "build" | "blueprint"
      product_status: "draft" | "published" | "archived"
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
      app_role: ["owner", "admin", "athlete"],
      entitlement_source: ["development", "purchase", "gift", "admin", "owner"],
      product_collection: ["compete", "build", "blueprint"],
      product_status: ["draft", "published", "archived"],
    },
  },
} as const
