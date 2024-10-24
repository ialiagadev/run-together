'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { MessageCircle, Heart, Share2 } from 'lucide-react'

export default function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    setError(null)
    try {
      console.log('Iniciando fetchPosts')
      
      // Primero, obtengamos los posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Luego, obtengamos los perfiles correspondientes
      const userIds = postsData.map(post => post.user_id)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Combinar los datos de posts y perfiles
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profile: profilesData.find(profile => profile.id === post.user_id)
      }))

      console.log('Posts obtenidos:', postsWithProfiles)
      setPosts(postsWithProfiles)
    } catch (error) {
      console.error('Error detallado al cargar los posts:', error)
      setError(`Error al cargar los posts: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center p-4">Cargando posts...</div>
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchPosts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return <div className="text-center p-4">No hay posts disponibles. ¡Sé el primero en crear uno!</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0">
              {post.profile?.avatar_url && (
                <img 
                  src={post.profile.avatar_url} 
                  alt={post.profile.name || 'Avatar del usuario'} 
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-semibold">{post.profile?.name || 'Usuario desconocido'}</p>
              <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              <p className="mt-2">{post.content}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button className="flex items-center text-gray-500 hover:text-blue-500">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comentar
            </button>
            <button className="flex items-center text-gray-500 hover:text-red-500">
              <Heart className="w-5 h-5 mr-2" />
              Me gusta
            </button>
            <button className="flex items-center text-gray-500 hover:text-green-500">
              <Share2 className="w-5 h-5 mr-2" />
              Compartir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}