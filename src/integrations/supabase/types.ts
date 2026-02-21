export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_activity: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: number | null
          id: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: number | null
          id?: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: number | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: number
          likes: number | null
          published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: number
          likes?: number | null
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: number
          likes?: number | null
          published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          participants: number
          payment_status: string | null
          special_requests: string | null
          start_date: string
          status: string | null
          stripe_session_id: string | null
          total_amount: number
          tour_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          participants: number
          payment_status?: string | null
          special_requests?: string | null
          start_date: string
          status?: string | null
          stripe_session_id?: string | null
          total_amount: number
          tour_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          participants?: number
          payment_status?: string | null
          special_requests?: string | null
          start_date?: string
          status?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          tour_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          id: string
          location: string
          name: string
          rating: number | null
          updated_at: string
          visible: boolean | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          location: string
          name: string
          rating?: number | null
          updated_at?: string
          visible?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          rating?: number | null
          updated_at?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      tours: {
        Row: {
          created_at: string
          description: string
          difficulty_level: string | null
          duration_days: number
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          itinerary: Json | null
          location: string
          max_participants: number
          price: number
          short_description: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_level?: string | null
          duration_days: number
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          itinerary?: Json | null
          location: string
          max_participants: number
          price: number
          short_description?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_level?: string | null
          duration_days?: number
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          itinerary?: Json | null
          location?: string
          max_participants?: number
          price?: number
          short_description?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          anon_id: string | null
          created_at: string
          id: string
          language: string | null
          page_path: string
          referrer: string | null
          screen_resolution: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string
          id?: string
          language?: string | null
          page_path: string
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string
          id?: string
          language?: string | null
          page_path?: string
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pesapal_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string | null
          id: string
          merchant_reference: string
          payment_method: string | null
          status: string | null
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          merchant_reference: string
          payment_method?: string | null
          status?: string | null
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          merchant_reference?: string
          payment_method?: string | null
          status?: string | null
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesapal_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          id: string
          anon_id: string | null
          user_id: string | null
          status: "active" | "resolved" | "archived"
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          anon_id?: string | null
          user_id?: string | null
          status?: "active" | "resolved" | "archived"
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          anon_id?: string | null
          user_id?: string | null
          status?: "active" | "resolved" | "archived"
          last_message_at?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          sender_role: "user" | "assistant" | "admin"
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_role: "user" | "assistant" | "admin"
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id: string
          sender_role?: "user" | "assistant" | "admin"
          content?: string
          created_at?: string
        }
      }
      destinations: {
        Row: {
          activities: Json | null
          best_time_to_visit: Json | null
          category: string
          citizen_price: number
          created_at: string
          description: string
          difficulty: string | null
          duration: number | null
          featured_order: number | null
          highlights: string[] | null
          id: number
          image: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          max_participants: number | null
          name: string
          non_resident_price: number
          rating: number | null
          resident_price: number
          updated_at: string
        }
        Insert: {
          activities?: Json | null
          best_time_to_visit?: Json | null
          category: string
          citizen_price: number
          created_at?: string
          description: string
          difficulty?: string | null
          duration?: number | null
          featured_order?: number | null
          highlights?: string[] | null
          id?: number
          image: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          max_participants?: number | null
          name: string
          non_resident_price: number
          rating?: number | null
          resident_price: number
          updated_at?: string
        }
        Update: {
          activities?: Json | null
          best_time_to_visit?: Json | null
          category?: string
          citizen_price?: number
          created_at?: string
          description?: string
          difficulty?: string | null
          duration?: number | null
          featured_order?: number | null
          highlights?: string[] | null
          id?: number
          image?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          max_participants?: number | null
          name?: string
          non_resident_price?: number
          rating?: number | null
          resident_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      destination_media: {
        Row: {
          caption: string | null
          created_at: string
          destination_id: number
          id: number
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          destination_id: number
          id?: number
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          destination_id?: number
          id?: number
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_media_destination_fk"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      swap_destination_media_order: {
        Args: { a_id: number; b_id: number }
        Returns: void
      }
      get_managed_users: {
        Args: Record<string, never>;
        Returns: Array<{
          id: string;
          email: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          last_sign_in_at: string | null;
        }>;
      }
      set_user_admin_status: {
        Args: { target_user_id: string; is_admin_requested: boolean };
        Returns: null;
      }
      daily_page_views: {
        Args: Record<string, never>;
        Returns: Array<{
          date: string;
          count: number;
        }>;
      }
    }
    Enums: {
      user_role: "user" | "admin"
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
      user_role: ["user", "admin"],
    },
  },
} as const
