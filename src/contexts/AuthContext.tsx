
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
  verifyPassword: (password: string) => Promise<boolean>
  isSupabaseConfigured: boolean
  refreshProfessional: () => Promise<void>
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

  const fetchProfessional = async (userId: string) => {
    if (!supabase) {
      console.log('AuthContext - fetchProfessional: Supabase not configured')
      return
    }

    console.log('AuthContext - fetchProfessional: Fetching professional data for user:', userId)

    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id,email,display_name,created_at')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('AuthContext - fetchProfessional: Error fetching professional:', error)
        toast.error(`Profesyonel bilgileri alınamadı: ${error.message}`)
        setProfessional(null)
      } else {
        console.log('AuthContext - fetchProfessional: Professional data fetched successfully:', {
          id: data.id,
          email: data.email,
          display_name: data.display_name
        })
        setProfessional(data)
      }
    } catch (error) {
      console.error('AuthContext - fetchProfessional: Unexpected error:', error)
      setProfessional(null)
    }
  }

  const refreshProfessional = async () => {
    if (!supabase) {
      console.log('AuthContext - refreshProfessional: Supabase not configured')
      return
    }

    console.log('AuthContext - refreshProfessional: Refreshing professional data')
    setLoading(true)

    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('AuthContext - refreshProfessional: Error getting current user:', error)
        setUser(null)
        setProfessional(null)
      } else if (currentUser) {
        setUser(currentUser)
        await fetchProfessional(currentUser.id)
      } else {
        console.log('AuthContext - refreshProfessional: No current user found')
        setUser(null)
        setProfessional(null)
      }
    } catch (error) {
      console.error('AuthContext - refreshProfessional: Unexpected error:', error)
      setUser(null)
      setProfessional(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!supabase) {
      console.log('AuthContext - useEffect: Supabase not configured')
      setLoading(false)
      return
    }

    console.log('AuthContext - useEffect: Initializing auth state')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthContext - useEffect: Error getting session:', error)
        setUser(null)
        setProfessional(null)
      } else if (session?.user) {
        console.log('AuthContext - useEffect: Initial session found for user:', session.user.id)
        setUser(session.user)
        fetchProfessional(session.user.id)
      } else {
        console.log('AuthContext - useEffect: No initial session found')
        setUser(null)
        setProfessional(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext - onAuthStateChange:', { event, userId: session?.user?.id })
      
      if (session?.user) {
        setUser(session.user)
        await fetchProfessional(session.user.id)
      } else {
        setUser(null)
        setProfessional(null)
      }
      setLoading(false)
    })

    return () => {
      console.log('AuthContext - useEffect: Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış. Lütfen önce Supabase bağlantısını kurun.')
      throw new Error('Supabase not configured')
    }

    console.log('AuthContext - signUp: Attempting to sign up user:', email)

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
      console.error('AuthContext - signUp: Sign up error:', error)
      toast.error(`Kayıt hatası: ${error.message}`)
      throw error
    }

    if (data.user) {
      console.log('AuthContext - signUp: User signed up successfully:', data.user.id)
      toast.success('Hesap başarıyla oluşturuldu!')
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış. Lütfen önce Supabase bağlantısını kurun.')
      throw new Error('Supabase not configured')
    }

    console.log('AuthContext - signIn: Attempting to sign in user:', email)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('AuthContext - signIn: Sign in error:', error)
      toast.error(`Giriş hatası: ${error.message}`)
      throw error
    }

    console.log('AuthContext - signIn: User signed in successfully')
    toast.success('Başarıyla giriş yapıldı!')
  }

  const signOut = async () => {
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış.')
      throw new Error('Supabase not configured')
    }

    console.log('AuthContext - signOut: Signing out user')

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('AuthContext - signOut: Sign out error:', error)
      toast.error(`Çıkış hatası: ${error.message}`)
      throw error
    }
    
    console.log('AuthContext - signOut: User signed out successfully')
    toast.success('Başarıyla çıkış yapıldı!')
  }

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!supabase || !user?.email) {
      console.error('AuthContext - verifyPassword: Supabase not configured or user email not available')
      return false
    }

    console.log('AuthContext - verifyPassword: Verifying password for user:', user.email)

    try {
      // Create a temporary session to verify password
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      })

      if (error) {
        console.log('AuthContext - verifyPassword: Password verification failed:', error.message)
        return false
      }

      console.log('AuthContext - verifyPassword: Password verified successfully')
      return true
    } catch (error) {
      console.error('AuthContext - verifyPassword: Unexpected error:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      professional,
      loading,
      signUp,
      signIn,
      signOut,
      verifyPassword,
      isSupabaseConfigured,
      refreshProfessional,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
