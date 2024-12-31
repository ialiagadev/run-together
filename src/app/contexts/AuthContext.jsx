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
     try {
       const { data: { session }, error } = await supabase.auth.getSession()
       if (error) throw error
       
       if (session?.user && !user) {
         setUser(session.user)
         router.push('/dashboard')
       } else if (!session?.user) {
         setUser(null)
       }
     } catch (error) {
       console.error('Error fetching session:', error)
     } finally {
       setLoading(false)
     }
   }

   const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
     try {
       if (session?.user && !user) {
         setUser(session.user)
         router.push('/dashboard')
       } else if (!session?.user) {
         setUser(null)
         router.push('/signin')
       }
     } catch (error) {
       console.error('Error in auth state change:', error)
     } finally {
       setLoading(false)
     }
   })

   setData()

   return () => {
     listener?.subscription.unsubscribe()
   }
 }, [user, router])

 const signUp = async (data) => {
   try {
     const { error: signUpError } = await supabase.auth.signUp(data)
     if (signUpError) throw signUpError

     const { data: { user }, error: userError } = await supabase.auth.getUser()
     if (userError) throw userError

     if (user) {
       const { error: profileError } = await supabase
         .from('profiles')
         .insert([{ 
           id: user.id,
           username: '',
           name: '',
           age: null,
           running_frequency: '',
           bio: null,
           avatar_url: null
         }])
       if (profileError) throw profileError
     }
   } catch (error) {
     console.error('Error in signUp:', error)
     throw error
   }
 }

 const signIn = async (data) => {
   try {
     const { error: signInError } = await supabase.auth.signInWithPassword(data)
     if (signInError) throw signInError

     const { data: { user }, error: userError } = await supabase.auth.getUser()
     if (userError) throw userError

     if (user) {
       setUser(user)
       router.push('/dashboard')
     }
   } catch (error) {
     console.error('Error in signIn:', error)
     throw error
   }
 }

 const signOut = async () => {
   try {
     const { error } = await supabase.auth.signOut()
     if (error) throw error
     router.push('/signin')
   } catch (error) {
     console.error('Error in signOut:', error)
     throw error
   }
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

