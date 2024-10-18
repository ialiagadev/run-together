'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'

export default function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSignUp = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const { data, error } = await signUp({ 
        email, 
        password,
        options: {
          data: {
            email_confirmed: true
          }
        }
      })
      
      if (error) throw error

      if (data.user) {
        // Llamar a la función handle_new_user
        const { error: profileError } = await supabase.rpc('handle_new_user', {
          email: data.user.email,
          user_id: data.user.id
        })
        if (profileError) throw profileError

        router.push('/signin') // Redirige al usuario a la página de inicio de sesión
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }

}
  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  )
}