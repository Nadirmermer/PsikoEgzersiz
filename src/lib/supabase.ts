
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length 
})

// Create a conditional client or null if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Anonim kullanıcılar için session persistence'ı kapat
      }
    })
  : null

// Database types
export interface Professional {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface ClientStatistic {
  id: string
  professional_id: string
  client_identifier: string
  exercise_data: Record<string, unknown>
  session_date: string
  is_client_mode_session: boolean
  created_at: string
}
