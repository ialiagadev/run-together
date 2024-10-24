'use client'

import { useState, useCallback } from 'react'
import PostList from '../components/PostList'
import CreatePost from '../components/CreatePost'

export default function ForumPage() {
  const [key, setKey] = useState(0)

  const handlePostCreated = useCallback((newPost) => {
    console.log('Nuevo post creado:', newPost)
    setKey(prevKey => prevKey + 1)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Foro de Corredores</h1>
      <div className="mb-8">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>
      <div>
        <PostList key={key} />
      </div>
    </div>
  )
}