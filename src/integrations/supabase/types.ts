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
      blog_categories: {
        Row: {
          category_name: string
          created_at: string | null
          description: string | null
          id: string
          slug: string
        }
        Insert: {
          category_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          slug: string
        }
        Update: {
          category_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          slug?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          blog_id: string
          comment: string
          created_at: string | null
          id: string
          parent_id: string | null
          user_id: string
        }
        Insert: {
          blog_id: string
          comment: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          user_id: string
        }
        Update: {
          blog_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          meta_description: string | null
          published_at: string | null
          reading_time: number | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          views?: number | null
        }
        Relationships: []
      }
      channel_admins: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_admins_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          cohort_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_admin_only: boolean
          name: string
          type: string
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_admin_only?: boolean
          name: string
          type?: string
        }
        Update: {
          cohort_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_admin_only?: boolean
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          year: number
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          year: number
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          year?: number
        }
        Relationships: []
      }
      community_members: {
        Row: {
          approved: boolean
          avatar_url: string | null
          cohort_id: string | null
          created_at: string | null
          district: string
          email: string
          full_name: string
          id: string
          skill: string | null
          updated_at: string | null
        }
        Insert: {
          approved?: boolean
          avatar_url?: string | null
          cohort_id?: string | null
          created_at?: string | null
          district: string
          email: string
          full_name: string
          id?: string
          skill?: string | null
          updated_at?: string | null
        }
        Update: {
          approved?: boolean
          avatar_url?: string | null
          cohort_id?: string | null
          created_at?: string | null
          district?: string
          email?: string
          full_name?: string
          id?: string
          skill?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          }
        ]
      }
      community_projects: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          skills_needed: string[] | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          skills_needed?: string[] | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          skills_needed?: string[] | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          file_url: string | null
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      dss_applications: {
        Row: {
          age: number
          city: string
          created_at: string | null
          education: string
          email: string
          id: string
          motivation: string
          name: string
          phone: string
          skill_interest: string
          status: string
        }
        Insert: {
          age: number
          city: string
          created_at?: string | null
          education: string
          email: string
          id?: string
          motivation: string
          name: string
          phone: string
          skill_interest: string
          status?: string
        }
        Update: {
          age?: number
          city?: string
          created_at?: string | null
          education?: string
          email?: string
          id?: string
          motivation?: string
          name?: string
          phone?: string
          skill_interest?: string
          status?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string
          date: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          recording_url: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          date: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          recording_url?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          recording_url?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string | null
          file_url: string | null
          id: string
          reply_to: string | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          reply_to?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          reply_to?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          subscribed: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          subscribed?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          subscribed?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          link: string | null
          posted_by: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          posted_by: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          posted_by?: string
          title?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          contact_person: string
          country: string
          created_at: string | null
          email: string
          id: string
          interest: string | null
          message: string | null
          organization_name: string
        }
        Insert: {
          contact_person: string
          country: string
          created_at?: string | null
          email: string
          id?: string
          interest?: string | null
          message?: string | null
          organization_name: string
        }
        Update: {
          contact_person?: string
          country?: string
          created_at?: string | null
          email?: string
          id?: string
          interest?: string | null
          message?: string | null
          organization_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean | null
          avatar_url: string | null
          bio: string | null
          career_interest: string | null
          cohort_id: string | null
          created_at: string | null
          display_name: string | null
          id: string
          institution: string | null
          location: string | null
          skills: string[] | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          career_interest?: string | null
          cohort_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          institution?: string | null
          location?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          career_interest?: string | null
          cohort_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          institution?: string | null
          location?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          project_link: string | null
          tag: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          project_link?: string | null
          tag?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          project_link?: string | null
          tag?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "community_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          link: string | null
          posted_by: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          link?: string | null
          posted_by: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          link?: string | null
          posted_by?: string
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      startups: {
        Row: {
          created_at: string | null
          founder_name: string
          id: string
          problem: string
          solution: string
          stage: string | null
          startup_name: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          founder_name: string
          id?: string
          problem: string
          solution: string
          stage?: string | null
          startup_name: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          founder_name?: string
          id?: string
          problem?: string
          solution?: string
          stage?: string | null
          startup_name?: string
          website?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          bio: string | null
          city: string | null
          cohort_id: string | null
          id: string
          name: string
          photo_url: string | null
          skill: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          cohort_id?: string | null
          id?: string
          name: string
          photo_url?: string | null
          skill?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          cohort_id?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          skill?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_categories: {
        Row: {
          category_name: string
          created_at: string | null
          description: string | null
          id: string
        }
        Insert: {
          category_name: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          category_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          id: string
          is_featured: boolean
          name: string
          organization: string | null
          photo_url: string | null
          role: string
          status: string
          testimonial_text: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_featured?: boolean
          name: string
          organization?: string | null
          photo_url?: string | null
          role: string
          status?: string
          testimonial_text: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          organization?: string | null
          photo_url?: string | null
          role?: string
          status?: string
          testimonial_text?: string
          video_url?: string | null
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          approved: boolean
          cohort: string | null
          contact: string | null
          created_at: string | null
          email: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          organization: string | null
          role: string | null
          status: string | null
          testimony: string
          video_url: string | null
        }
        Insert: {
          approved?: boolean
          cohort?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          organization?: string | null
          role?: string | null
          status?: string | null
          testimony: string
          video_url?: string | null
        }
        Update: {
          approved?: boolean
          cohort?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          organization?: string | null
          role?: string | null
          status?: string | null
          testimony?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      calculate_reading_time: {
        Args: { content_text: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
