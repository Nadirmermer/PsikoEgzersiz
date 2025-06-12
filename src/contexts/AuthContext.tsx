
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Professional } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  professional: Professional | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isSupabaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const isSupabaseConfigured = supabase !== null

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfessional(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfessional(session.user.id)
      } else {
        setProfessional(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfessional = async (userId: string) => {
    if (!supabase) return

    const { data, error } = await supabase
      .from('professionals')
      .select('id,email,display_name,created_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching professional:', error)
    } else {
      setProfessional(data)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış. Lütfen önce Supabase bağlantısını kurun.')
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (error) {
      toast.error(`Kayıt hatası: ${error.message}`)
      throw error
    }

    if (data.user) {
      toast.success('Hesap başarıyla oluşturuldu!')
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış. Lütfen önce Supabase bağlantısını kurun.')
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(`Giriş hatası: ${error.message}`)
      throw error
    }

    toast.success('Başarıyla giriş yapıldı!')
  }

  const signOut = async () => {
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış.')
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(`Çıkış hatası: ${error.message}`)
      throw error
    }
    toast.success('Başarıyla çıkış yapıldı!')
  }

  return (
    <AuthContext.Provider value={{
      user,
      professional,
      loading,
      signUp,
      signIn,
      signOut,
      isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
