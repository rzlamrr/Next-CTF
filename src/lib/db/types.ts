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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          provider_account_id: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          team_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          team_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          team_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "awards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brackets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          bracket_id: string | null
          category: string
          connection_info: string | null
          created_at: string
          decay: number | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          flag: string
          function: Database["public"]["Enums"]["scoring_function"]
          id: string
          max_attempts: number | null
          minimum: number | null
          name: string
          points: number
          requirements: string | null
          type: Database["public"]["Enums"]["challenge_type"]
          updated_at: string
          value: number | null
        }
        Insert: {
          bracket_id?: string | null
          category: string
          connection_info?: string | null
          created_at?: string
          decay?: number | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          flag: string
          function?: Database["public"]["Enums"]["scoring_function"]
          id?: string
          max_attempts?: number | null
          minimum?: number | null
          name: string
          points: number
          requirements?: string | null
          type?: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string
          value?: number | null
        }
        Update: {
          bracket_id?: string | null
          category?: string
          connection_info?: string | null
          created_at?: string
          decay?: number | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          flag?: string
          function?: Database["public"]["Enums"]["scoring_function"]
          id?: string
          max_attempts?: number | null
          minimum?: number | null
          name?: string
          points?: number
          requirements?: string | null
          type?: Database["public"]["Enums"]["challenge_type"]
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_bracket_id_fkey"
            columns: ["bracket_id"]
            isOneToOne: false
            referencedRelation: "brackets"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      configs: {
        Row: {
          created_at: string
          description: string | null
          editable: boolean
          id: string
          key: string
          type: Database["public"]["Enums"]["config_type"]
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          editable?: boolean
          id?: string
          key: string
          type?: Database["public"]["Enums"]["config_type"]
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          editable?: boolean
          id?: string
          key?: string
          type?: Database["public"]["Enums"]["config_type"]
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      field_entries: {
        Row: {
          created_at: string
          field_id: string
          id: string
          team_id: string | null
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          field_id: string
          id?: string
          team_id?: string | null
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          field_id?: string
          id?: string
          team_id?: string | null
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_entries_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_entries_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          required: boolean
          type: Database["public"]["Enums"]["field_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          required?: boolean
          type?: Database["public"]["Enums"]["field_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          required?: boolean
          type?: Database["public"]["Enums"]["field_type"]
          updated_at?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          location: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          location: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          location?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      hints: {
        Row: {
          challenge_id: string
          content: string
          cost: number
          created_at: string
          id: string
          requirements: string | null
          title: string
          type: string | null
        }
        Insert: {
          challenge_id: string
          content: string
          cost: number
          created_at?: string
          id?: string
          requirements?: string | null
          title: string
          type?: string | null
        }
        Update: {
          challenge_id?: string
          content?: string
          cost?: number
          created_at?: string
          id?: string
          requirements?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hints_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          auth_required: boolean
          content: string
          created_at: string
          draft: boolean
          hidden: boolean
          id: string
          route: string
          title: string
          updated_at: string
        }
        Insert: {
          auth_required?: boolean
          content: string
          created_at?: string
          draft?: boolean
          hidden?: boolean
          id?: string
          route: string
          title: string
          updated_at?: string
        }
        Update: {
          auth_required?: boolean
          content?: string
          created_at?: string
          draft?: boolean
          hidden?: boolean
          id?: string
          route?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          review: string | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          review?: string | null
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          review?: string | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          expires: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          expires: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          expires?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          id: string
          state: string | null
          updated_at: string
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string
          id?: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          id?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: true
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      solves: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solves_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solves_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          challenge_id: string
          created_at: string
          flag: string
          id: string
          status: Database["public"]["Enums"]["submission_status"]
          team_id: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          flag: string
          id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          team_id?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          flag?: string
          id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          password: string | null
          updated_at: string
        }
        Insert: {
          captain_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          password?: string | null
          updated_at?: string
        }
        Update: {
          captain_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          password?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unlocks: {
        Row: {
          created_at: string
          id: string
          target_id: string
          team_id: string | null
          type: Database["public"]["Enums"]["unlock_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          team_id?: string | null
          type: Database["public"]["Enums"]["unlock_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          team_id?: string | null
          type?: Database["public"]["Enums"]["unlock_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unlocks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          affiliation: string | null
          country: string | null
          created_at: string
          email: string
          email_verified: string | null
          id: string
          image: string | null
          name: string
          password: string
          role: Database["public"]["Enums"]["user_role"]
          team_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          affiliation?: string | null
          country?: string | null
          created_at?: string
          email: string
          email_verified?: string | null
          id?: string
          image?: string | null
          name: string
          password: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          affiliation?: string | null
          country?: string | null
          created_at?: string
          email?: string
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string
          password?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_tokens: {
        Row: {
          expires: string
          id: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          id?: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          id?: string
          identifier?: string
          token?: string
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
      challenge_type: "STANDARD" | "DYNAMIC"
      config_type: "STRING" | "NUMBER" | "BOOLEAN"
      difficulty: "EASY" | "MEDIUM" | "HARD" | "INSANE"
      field_type:
        | "TEXT"
        | "BOOLEAN"
        | "NUMBER"
        | "SELECT"
        | "CHECKBOX"
        | "TEXTAREA"
      scoring_function: "static" | "log" | "exp" | "linear"
      submission_status: "CORRECT" | "INCORRECT" | "PENDING"
      unlock_type: "HINTS" | "CHALLENGES" | "AWARDS"
      user_role: "USER" | "ADMIN"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      challenge_type: ["STANDARD", "DYNAMIC"],
      config_type: ["STRING", "NUMBER", "BOOLEAN"],
      difficulty: ["EASY", "MEDIUM", "HARD", "INSANE"],
      field_type: [
        "TEXT",
        "BOOLEAN",
        "NUMBER",
        "SELECT",
        "CHECKBOX",
        "TEXTAREA",
      ],
      scoring_function: ["static", "log", "exp", "linear"],
      submission_status: ["CORRECT", "INCORRECT", "PENDING"],
      unlock_type: ["HINTS", "CHALLENGES", "AWARDS"],
      user_role: ["USER", "ADMIN"],
    },
  },
} as const
