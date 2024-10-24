'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentProfile, setCurrentProfile] = useState(null)

  useEffect(() => {
    fetchCurrentProfile()
  }, [])

  async function fetchCurrentProfile() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error al obtener el usuario actual:', error)
      return
    }
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error al obtener el perfil:', error)
        return
      }
      
      setCurrentProfile(data)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      if (!currentProfile) {
        throw new Error('No se ha encontrado un perfil de usuario')
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{ content, user_id: currentProfile.id }])
        .select()

      if (error) throw error

      console.log('Post creado:', data[0])
      setContent('')
      if (onPostCreated) onPostCreated(data[0])
    } catch (error) {
      console.error('Error creating post:', error)
      setError(`Error al crear el post: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-200">
          {currentProfile?.avatar_url && (
            <img 
              src={currentProfile.avatar_url} 
              alt={currentProfile.name} 
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué está pasando?"
          required
          className="flex-grow resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || content.trim().length === 0}
          className={`px-4 py-2 rounded-full font-semibold text-white ${
            isLoading || content.trim().length === 0
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}