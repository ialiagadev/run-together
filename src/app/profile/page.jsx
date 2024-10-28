'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    bio: '',
    experience_level: '',
    preferred_distance: '',
    avatar_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) fetchProfile()
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
        if (error.code === 'PGRST116') setIsNewUser(true)
        else throw error
      }
      if (data) setProfile(data)
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile)
    if (uploadError) throw uploadError

    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    if (urlError) throw urlError

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')
      let avatarUrl = profile.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          name: profile.name,
          bio: profile.bio,
          experience_level: profile.experience_level,
          preferred_distance: profile.preferred_distance,
          avatar_url: avatarUrl
        })

      if (error) throw error
      setMessage(isNewUser ? 'Perfil creado con éxito' : 'Perfil actualizado con éxito')
      if (isNewUser) router.push('/dashboard')
      else {
        // Refresh the profile data
        await fetchProfile()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Error al actualizar el perfil: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => name.split(' ').map(word => word[0]).join('').toUpperCase()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-purple-400 mb-6">
          {isNewUser ? 'Crea tu Perfil' : 'Perfil de Usuario'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-32 h-32 mb-4 border-4 border-purple-400">
                <AvatarImage src={avatarPreview || profile.avatar_url} alt="Avatar" />
                <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                  {getInitials(profile.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => fileInputRef.current.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              ref={fileInputRef}
              capture="user"
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Nombre de usuario</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={profile.username}
                onChange={handleChange}
                required
                placeholder="@usuario"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-white">Nombre completo</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-white">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Cuéntanos sobre ti"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="experience_level" className="text-white">Nivel de Experiencia</Label>
              <Select
                value={profile.experience_level}
                onValueChange={(value) => handleChange({ target: { name: 'experience_level', value } })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principiante">Principiante</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferred_distance" className="text-white">Distancia Preferida (km)</Label>
              <Input
                type="number"
                id="preferred_distance"
                name="preferred_distance"
                value={profile.preferred_distance}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                placeholder="Distancia en km"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {message && <div className="text-green-500 text-sm text-center">{message}</div>}
          <Button type="submit" disabled={loading} className="w-full bg-purple-500 hover:bg-purple-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Procesando...' : isNewUser ? 'Crear Perfil' : 'Actualizar Perfil'}
          </Button>
        </form>
      </div>
    </div>
  )
}