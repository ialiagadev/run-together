'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (data) => {
    const { error } = await supabase.auth.signUp(data)
    if (error) throw error
  }

  const signIn = async (data) => {
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    signUp,
    signIn,
    signOut,
    user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

