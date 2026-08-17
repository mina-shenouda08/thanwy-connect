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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          checked_in_at: string
          event_id: string
          id: string
          present: boolean
          recorded_by: string | null
          student_id: string
        }
        Insert: {
          checked_in_at?: string
          event_id: string
          id?: string
          present?: boolean
          recorded_by?: string | null
          student_id: string
        }
        Update: {
          checked_in_at?: string
          event_id?: string
          id?: string
          present?: boolean
          recorded_by?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      book_study_assignments: {
        Row: {
          book: string
          chapter: number
          class_id: string | null
          created_at: string
          created_by: string | null
          due_date: string
          grade_level: string | null
          id: string
          testament: string
          title: string
        }
        Insert: {
          book: string
          chapter: number
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          grade_level?: string | null
          id?: string
          testament: string
          title: string
        }
        Update: {
          book?: string
          chapter?: number
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          grade_level?: string | null
          id?: string
          testament?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_study_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_study_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      book_study_submissions: {
        Row: {
          answer_text: string | null
          assignment_id: string
          id: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          answer_text?: string | null
          assignment_id: string
          id?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          answer_text?: string | null
          assignment_id?: string
          id?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_study_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "book_study_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_study_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          created_by: string | null
          grade_level: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          grade_level: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          grade_level?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          end_time: string | null
          event_date: string
          grade_level: string | null
          id: string
          location: string | null
          recurrence: string
          start_time: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          event_date: string
          grade_level?: string | null
          id?: string
          location?: string | null
          recurrence?: string
          start_time?: string | null
          status?: string
          title: string
          type?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          event_date?: string
          grade_level?: string | null
          id?: string
          location?: string | null
          recurrence?: string
          start_time?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          servant_id: string
          student_id: string
          tags: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          servant_id: string
          student_id: string
          tags?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          servant_id?: string
          student_id?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "followup_notes_servant_id_fkey"
            columns: ["servant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_journal: {
        Row: {
          book: string | null
          chapter: number | null
          created_at: string
          entry_date: string
          id: string
          kind: string
          prayers: Json
          reflection: string | null
          student_id: string
          testament: string | null
        }
        Insert: {
          book?: string | null
          chapter?: number | null
          created_at?: string
          entry_date?: string
          id?: string
          kind?: string
          prayers?: Json
          reflection?: string | null
          student_id: string
          testament?: string | null
        }
        Update: {
          book?: string | null
          chapter?: number | null
          created_at?: string
          entry_date?: string
          id?: string
          kind?: string
          prayers?: Json
          reflection?: string | null
          student_id?: string
          testament?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_journal_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      users: {
        Row: {
          class_id: string | null
          created_at: string
          email: string | null
          full_name: string
          grade_level: string | null
          id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          grade_level?: string | null
          id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          grade_level?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grade_of: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_grade: { Args: never; Returns: string }
      supervises: { Args: { _student: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "servant"
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
      app_role: ["student", "servant"],
    },
  },
} as const
