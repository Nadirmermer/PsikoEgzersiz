
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  exercise_data: any
  session_date: string
  is_client_mode_session: boolean
  created_at: string
}
