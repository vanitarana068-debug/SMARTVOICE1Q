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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          billing_address: string | null
          company: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          billing_address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          line_total: number
          position: number
          quantity: number
          tax_rate: number
          unit_price: number
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          line_total?: number
          position?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          position?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          currency: string
          customer_id: string
          discount_total: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id: string
          discount_total?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string
          discount_total?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          notes: string | null
          payment_date: string
          reference: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          business_name: string
          created_at: string
          currency: string
          default_notes: string
          default_tax_rate: number
          email: string | null
          gstin: string | null
          id: string
          invoice_next_number: number
          invoice_prefix: string
          logo_url: string | null
          onboarding_done: boolean
          owner_name: string | null
          payment_terms_days: number
          phone: string | null
          plan: string
        }
        Insert: {
          address?: string | null
          business_name?: string
          created_at?: string
          currency?: string
          default_notes?: string
          default_tax_rate?: number
          email?: string | null
          gstin?: string | null
          id: string
          invoice_next_number?: number
          invoice_prefix?: string
          logo_url?: string | null
          onboarding_done?: boolean
          owner_name?: string | null
          payment_terms_days?: number
          phone?: string | null
          plan?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          created_at?: string
          currency?: string
          default_notes?: string
          default_tax_rate?: number
          email?: string | null
          gstin?: string | null
          id?: string
          invoice_next_number?: number
          invoice_prefix?: string
          logo_url?: string | null
          onboarding_done?: boolean
          owner_name?: string | null
          payment_terms_days?: number
          phone?: string | null
          plan?: string
        }
        Relationships: []
      }
      recurring_schedules: {
        Row: {
          created_at: string
          customer_id: string
          end_date: string | null
          frequency: string
          id: string
          items: Json
          last_generated_at: string | null
          next_invoice_date: string
          notes: string | null
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          end_date?: string | null
          frequency: string
          id?: string
          items?: Json
          last_generated_at?: string | null
          next_invoice_date: string
          notes?: string | null
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          end_date?: string | null
          frequency?: string
          id?: string
          items?: Json
          last_generated_at?: string | null
          next_invoice_date?: string
          notes?: string | null
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          invoice_id: string
          scheduled_for: string
          sent_at: string | null
          stage_key: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          invoice_id: string
          scheduled_for: string
          sent_at?: string | null
          stage_key: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          invoice_id?: string
          scheduled_for?: string
          sent_at?: string | null
          stage_key?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_settings: {
        Row: {
          enabled: boolean
          id: string
          stages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          stages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          enabled?: boolean
          id?: string
          stages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
