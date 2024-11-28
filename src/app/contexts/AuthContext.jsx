'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
      } else {
        setUser(session?.user ?? null)
        if (session?.user) {
          await checkAndRedirect(session.user)
        }
      }
      setLoading(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await checkAndRedirect(session.user)
      }
      setLoading(false)
    })

    setData()

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const checkAndRedirect = async (user) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
      return
    }

    if (!profile || !isProfileComplete(profile)) {
      router.push('/profile')
    } else {
      router.push('/dashboard')
    }
  }

  const isProfileComplete = (profile) => {
    const requiredFields = ['username', 'name', 'age', 'running_frequency']
    return requiredFields.every(field => profile[field] && profile[field] !== '')
  }

  const signUp = async (data) => {
    const { error } = await supabase.auth.signUp(data)
    if (error) throw error
    // After successful sign up, create an empty profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id }])
      if (profileError) throw profileError
    }
  }

  const signIn = async (data) => {
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) throw error
    // After successful sign in, check and redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await checkAndRedirect(user)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/signin')
  }

  const value = {
    signUp,
    signIn,
    signOut,
    user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

