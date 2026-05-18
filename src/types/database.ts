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
      departments: {
        Row: {
          id: number
          name: string
          province_id: number
        }
        Insert: {
          id?: number
          name: string
          province_id: number
        }
        Update: {
          id?: number
          name?: string
          province_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "departments_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      match_requests: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_requests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          creator_id: string | null
          football_type: Database["public"]["Enums"]["football_type"] | null
          id: string
          is_paid: boolean | null
          location_name: string
          max_age: number | null
          min_age: number | null
          price_per_person: number | null
          scheduled_at: string
          sport: Database["public"]["Enums"]["match_sport"]
          status: Database["public"]["Enums"]["match_status"] | null
          team_id: string | null
          type: Database["public"]["Enums"]["match_type"]
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          football_type?: Database["public"]["Enums"]["football_type"] | null
          id?: string
          is_paid?: boolean | null
          location_name: string
          max_age?: number | null
          min_age?: number | null
          price_per_person?: number | null
          scheduled_at: string
          sport: Database["public"]["Enums"]["match_sport"]
          status?: Database["public"]["Enums"]["match_status"] | null
          team_id?: string | null
          type: Database["public"]["Enums"]["match_type"]
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          football_type?: Database["public"]["Enums"]["football_type"] | null
          id?: string
          is_paid?: boolean | null
          location_name?: string
          max_age?: number | null
          min_age?: number | null
          price_per_person?: number | null
          scheduled_at?: string
          sport?: Database["public"]["Enums"]["match_sport"]
          status?: Database["public"]["Enums"]["match_status"] | null
          team_id?: string | null
          type?: Database["public"]["Enums"]["match_type"]
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_votes: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          voted_for_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          voted_for_id: string
          voter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          voted_for_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_voted_for_id_fkey"
            columns: ["voted_for_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          match_id: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_conflictive: boolean | null
          is_flake: boolean | null
          match_id: string | null
          reviewee_id: string | null
          reviewer_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_conflictive?: boolean | null
          is_flake?: boolean | null
          match_id?: string | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_conflictive?: boolean | null
          is_flake?: boolean | null
          match_id?: string | null
          reviewee_id?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["team_role"] | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role"] | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role"] | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          department_id: number | null
          founder_id: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          department_id?: number | null
          founder_id: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          department_id?: number | null
          founder_id?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          department_id: number | null
          first_name: string
          id: string
          is_free_agent: boolean | null
          last_name: string | null
          location: string | null
          matches_played: number | null
          phone_number: string | null
          preferred_football_position:
            | Database["public"]["Enums"]["football_position"]
            | null
          preferred_padel_position:
            | Database["public"]["Enums"]["padel_position"]
            | null
          preferred_sport: Database["public"]["Enums"]["match_sport"] | null
          province_id: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          department_id?: number | null
          first_name: string
          id: string
          is_free_agent?: boolean | null
          last_name?: string | null
          location?: string | null
          matches_played?: number | null
          phone_number?: string | null
          preferred_football_position?:
            | Database["public"]["Enums"]["football_position"]
            | null
          preferred_padel_position?:
            | Database["public"]["Enums"]["padel_position"]
            | null
          preferred_sport?: Database["public"]["Enums"]["match_sport"] | null
          province_id?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          department_id?: number | null
          first_name?: string
          id?: string
          is_free_agent?: boolean | null
          last_name?: string | null
          location?: string | null
          matches_played?: number | null
          phone_number?: string | null
          preferred_football_position?:
            | Database["public"]["Enums"]["football_position"]
            | null
          preferred_padel_position?:
            | Database["public"]["Enums"]["padel_position"]
            | null
          preferred_sport?: Database["public"]["Enums"]["match_sport"] | null
          province_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          created_at: string | null
          department_id: number
          id: string
          name: string
          sport: Database["public"]["Enums"]["match_sport"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          department_id: number
          id?: string
          name: string
          sport?: Database["public"]["Enums"]["match_sport"] | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          department_id?: number
          id?: string
          name?: string
          sport?: Database["public"]["Enums"]["match_sport"] | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      team_challenges: {
        Row: {
          created_at: string
          id: string
          challenger_id: string
          challenged_id: string
          message: string | null
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          challenger_id: string
          challenged_id: string
          message?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          created_at?: string
          id?: string
          challenger_id?: string
          challenged_id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "team_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenges_challenged_id_fkey"
            columns: ["challenged_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_expired_matches: { Args: never; Returns: undefined }
    }
    Enums: {
      football_position: "arquero" | "defensa" | "mediocampista" | "delantero"
      football_type: "5" | "7" | "8" | "9" | "11"
      match_sport: "padel" | "futbol"
      match_status: "abierto" | "confirmado" | "completado" | "cancelado"
      match_type: "busco_rival" | "busco_jugador"
      notification_type:
        | "postulacion_nueva"
        | "postulacion_aceptada"
        | "postulacion_rechazada"
        | "partido_cancelado"
        | "partido_confirmado"
        | "equipo_invitacion"
        | "mvp_elegido"
      padel_position: "drive" | "reves"
      request_status: "pendiente" | "aceptado" | "rechazado"
      team_role: "capitan" | "jugador"
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
      football_position: ["arquero", "defensa", "mediocampista", "delantero"],
      football_type: ["5", "7", "8", "9", "11"],
      match_sport: ["padel", "futbol"],
      match_status: ["abierto", "confirmado", "completado", "cancelado"],
      match_type: ["busco_rival", "busco_jugador"],
      notification_type: [
        "postulacion_nueva",
        "postulacion_aceptada",
        "postulacion_rechazada",
        "partido_cancelado",
        "partido_confirmado",
        "equipo_invitacion",
        "mvp_elegido",
      ],
      padel_position: ["drive", "reves"],
      request_status: ["pendiente", "aceptado", "rechazado"],
      team_role: ["capitan", "jugador"],
    },
  },
} as const
