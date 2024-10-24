'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    bio: '',
    experience_level: '',
    preferred_distance: '',
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setIsNewUser(true)
        } else {
          throw error
        }
      }

      if (data) {
        setProfile(data)
        setIsNewUser(false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...profile })

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este nombre de usuario ya está en uso. Por favor, elige otro.')
        }
        throw error
      }

      setMessage(isNewUser ? 'Perfil creado con éxito' : 'Perfil actualizado con éxito')
      if (isNewUser) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center mt-8 text-purple-400">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-purple-400 mb-6">
            {isNewUser ? 'Crea tu Perfil' : 'Perfil de Usuario'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profile.username}
                onChange={handleChange}
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-800"
                placeholder="@usuario"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                Biografía
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={3}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Cuéntanos sobre ti"
              ></textarea>
            </div>
            <div>
              <label htmlFor="experience_level" className="block text-sm font-medium text-gray-300 mb-1">
                Nivel de Experiencia
              </label>
              <select
                id="experience_level"
                name="experience_level"
                value={profile.experience_level}
                onChange={handleChange}
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-800"
              >
                <option value="">Selecciona un nivel</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label htmlFor="preferred_distance" className="block text-sm font-medium text-gray-300 mb-1">
                Distancia Preferida (km)
              </label>
              <input
                type="number"
                id="preferred_distance"
                name="preferred_distance"
                value={profile.preferred_distance}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Distancia en km"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {message && (
            <div className="text-green-500 text-sm text-center">{message}</div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {loading ? 'Procesando...' : (isNewUser ? 'Crear Perfil' : 'Actualizar Perfil')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}