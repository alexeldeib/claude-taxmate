export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          amount: number
          merchant: string
          category: string | null
          notes: string | null
          categorization_source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          amount: number
          merchant: string
          category?: string | null
          notes?: string | null
          categorization_source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount?: number
          merchant?: string
          category?: string | null
          notes?: string | null
          categorization_source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      form_jobs: {
        Row: {
          id: string
          user_id: string
          type: 'schedule_c' | '1099'
          status: 'queued' | 'processing' | 'done' | 'error'
          result_url: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'schedule_c' | '1099'
          status?: 'queued' | 'processing' | 'done' | 'error'
          result_url?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'schedule_c' | '1099'
          status?: 'queued' | 'processing' | 'done' | 'error'
          result_url?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free_trial' | 'solo' | 'seasonal'
          status: 'active' | 'cancelled' | 'past_due'
          started_at: string
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: 'free_trial' | 'solo' | 'seasonal'
          status: 'active' | 'cancelled' | 'past_due'
          started_at: string
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free_trial' | 'solo' | 'seasonal'
          status?: 'active' | 'cancelled' | 'past_due'
          started_at?: string
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      errors: {
        Row: {
          id: string
          user_id: string | null
          error_type: string
          error_message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          error_type: string
          error_message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          error_type?: string
          error_message?: string
          metadata?: Json | null
          created_at?: string
        }
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
  }
}