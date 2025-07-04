import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseClient
})()

// Server-side client for admin operations
export function createServerClient() {
  // For API routes and server-side operations
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  // Fallback to anon key if service key not available
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client-side client for component operations
export function createClientComponentClient() {
  // For client-side operations
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          password: string | null
          role: "client" | "fundi" | "admin"
          categories: string[] | null
          location: string | null
          availability: AvailabilitySlot[] | null
          rating: number | null
          is_verified: boolean
          subscription_status: "free" | "active" | "expired" | "cancelled"
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          password?: string | null
          role: "client" | "fundi" | "admin"
          categories?: string[] | null
          location?: string | null
          availability?: AvailabilitySlot[] | null
          rating?: number | null
          is_verified?: boolean
          subscription_status?: "free" | "active" | "expired" | "cancelled"
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          password?: string | null
          role?: "client" | "fundi" | "admin"
          categories?: string[] | null
          location?: string | null
          availability?: AvailabilitySlot[] | null
          rating?: number | null
          is_verified?: boolean
          subscription_status?: "free" | "active" | "expired" | "cancelled"
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          fundi_id: string
          client_name: string
          fundi_name: string
          service_category: string
          location: string
          date: string
          time: string
          status: "pending" | "confirmed" | "completed" | "cancelled"
          description: string | null
          price: number | null
          quoted_price: number | null
          final_price: number | null
          payment_status: "pending" | "paid" | "failed" | "refunded"
          payment_transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          fundi_id: string
          client_name: string
          fundi_name: string
          service_category: string
          location: string
          date: string
          time: string
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          description?: string | null
          price?: number | null
          quoted_price?: number | null
          final_price?: number | null
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          payment_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          fundi_id?: string
          client_name?: string
          fundi_name?: string
          service_category?: string
          location?: string
          date?: string
          time?: string
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          description?: string | null
          price?: number | null
          quoted_price?: number | null
          final_price?: number | null
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          payment_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface AvailabilitySlot {
  date: string
  time: string
  available: boolean
}
