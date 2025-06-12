
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

  useEffect(() => {
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
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching professional:', error)
    } else {
      setProfessional(data)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      toast.error(`Kayıt hatası: ${error.message}`)
      throw error
    }

    if (data.user) {
      // Create professional profile
      const { error: profileError } = await supabase
        .from('professionals')
        .insert([
          {
            id: data.user.id,
            email: email,
            display_name: displayName,
          }
        ])

      if (profileError) {
        toast.error(`Profil oluşturma hatası: ${profileError.message}`)
        throw profileError
      }

      toast.success('Hesap başarıyla oluşturuldu!')
    }
  }

  const signIn = async (email: string, password: string) => {
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
    }}>
      {children}
    </AuthContext.Provider>
  )
}
