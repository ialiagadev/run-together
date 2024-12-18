'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Loader2 } from 'lucide-react'

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB para coincidir con la configuración de Supabase

export default function ProfilePage() {
 const { user } = useAuth()
 const router = useRouter()
 const [profile, setProfile] = useState({
   username: '',
   name: '',
   age: '',
   bio: '',
   running_frequency: '',
   avatar_url: '',
 })
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')
 const [avatarFile, setAvatarFile] = useState(null)
 const [avatarPreview, setAvatarPreview] = useState(null)

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
       if (error.code === 'PGRST116') {
         // El perfil no existe, creamos uno vacío
         const { data: newProfile, error: insertError } = await supabase
           .from('profiles')
           .insert([{
             id: user.id,
             username: user.email?.split('@')[0] || '',
             name: '',
             age: '',
             running_frequency: '',
             bio: '',
             avatar_url: null
           }])
           .select()
           .single()
         
         if (insertError) throw insertError
         setProfile(newProfile)
       } else {
         throw error
       }
     } else if (data) {
       setProfile({
         ...data,
         age: data.age?.toString() || ''
       })
     }
   } catch (error) {
     console.error('Error al cargar el perfil:', error)
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
   const file = e.target.files?.[0]
   if (file) {
     if (file.size > MAX_FILE_SIZE) {
       setError(`El archivo es demasiado grande. El tamaño máximo permitido es ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`)
       return
     }
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
   
   try {
     const fileExt = avatarFile.name.split('.').pop()
     const fileName = `${user.id}/${Math.random()}.${fileExt}`
     
     const { error: uploadError } = await supabase.storage
       .from('avatars')
       .upload(fileName, avatarFile, {
         cacheControl: '3600',
         upsert: true
       })

     if (uploadError) {
       if (uploadError.message?.includes('Payload too large')) {
         throw new Error('El archivo es demasiado grande para ser procesado. Por favor, intenta con una imagen más pequeña.')
       }
       throw uploadError
     }

     const { data: { publicUrl }, error: urlError } = supabase.storage
       .from('avatars')
       .getPublicUrl(fileName)

     if (urlError) throw urlError

     return publicUrl
   } catch (error) {
     console.error('Error al subir el avatar:', error)
     throw new Error(`Error al subir la imagen: ${error.message}`)
   }
 }

 const handleSubmit = async (e) => {
   e.preventDefault()
   try {
     setLoading(true)
     setError('')
     setSuccess('')

     if (!profile.username || !profile.name || !profile.age || !profile.running_frequency) {
       setError('Por favor, completa todos los campos requeridos.')
       return
     }

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
         age: parseInt(profile.age),
         bio: profile.bio || null,
         running_frequency: profile.running_frequency,
         avatar_url: avatarUrl,
       })

     if (error) throw error
     setSuccess("Perfil actualizado correctamente")
     setTimeout(() => {
       router.push('/dashboard')
     }, 2000)
   } catch (error) {
     console.error('Error al actualizar el perfil:', error)
     setError('Error al actualizar el perfil: ' + error.message)
   } finally {
     setLoading(false)
   }
 }

 const getInitials = (name) => {
   if (!name) return '?'
   return name.split(' ').map(word => word[0]).join('').toUpperCase()
 }

 if (loading) return (
   <div className="flex items-center justify-center min-h-screen bg-black">
     <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
   </div>
 )

 return (
   <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
     <div className="max-w-md w-full space-y-8 p-8 bg-black/60 rounded-xl shadow-lg backdrop-blur-sm border border-white/10">
       <h1 className="text-3xl font-bold text-center text-purple-400 mb-6">
         Perfil de Usuario
       </h1>
       <form onSubmit={handleSubmit} className="space-y-6">
         <div className="flex flex-col items-center">
           <div className="relative">
             <Avatar className="w-24 h-24 mb-4 border-2 border-purple-400">
               <AvatarImage src={avatarPreview || profile.avatar_url} alt="Avatar" />
               <AvatarFallback className="bg-purple-600 text-white text-xl font-bold">
                 {getInitials(profile.name || '')}
               </AvatarFallback>
             </Avatar>
             <Button
               type="button"
               variant="outline"
               size="icon"
               className="absolute bottom-0 right-0 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
               onClick={() => document.getElementById('avatar-upload').click()}
             >
               <Camera className="h-4 w-4" />
             </Button>
           </div>
           <Input
             id="avatar-upload"
             type="file"
             accept="image/*"
             onChange={handleAvatarChange}
             className="hidden"
           />
         </div>
         <div className="space-y-4">
           <div>
             <Label htmlFor="username" className="text-white">Nombre de usuario *</Label>
             <Input
               type="text"
               id="username"
               name="username"
               value={profile.username}
               onChange={handleChange}
               required
               placeholder="@usuario"
               className="bg-white/5 border-white/10 text-white placeholder-gray-400"
             />
           </div>
           <div>
             <Label htmlFor="name" className="text-white">Nombre completo *</Label>
             <Input
               type="text"
               id="name"
               name="name"
               value={profile.name}
               onChange={handleChange}
               required
               placeholder="Tu nombre completo"
               className="bg-white/5 border-white/10 text-white placeholder-gray-400"
             />
           </div>
           <div>
             <Label htmlFor="age" className="text-white">Edad *</Label>
             <Input
               type="number"
               id="age"
               name="age"
               value={profile.age}
               onChange={handleChange}
               required
               min="1"
               max="120"
               placeholder="Tu edad"
               className="bg-white/5 border-white/10 text-white placeholder-gray-400"
             />
           </div>
           <div>
             <Label htmlFor="running_frequency" className="text-white">Frecuencia de carrera *</Label>
             <Select
               value={profile.running_frequency}
               onValueChange={(value) => setProfile(prev => ({ ...prev, running_frequency: value }))}
               required
             >
               <SelectTrigger className="bg-white/5 border-white/10 text-white">
                 <SelectValue placeholder="¿Cada cuánto sales a correr?" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="daily">Diariamente</SelectItem>
                 <SelectItem value="several_times_week">Varias veces por semana</SelectItem>
                 <SelectItem value="once_week">Una vez por semana</SelectItem>
                 <SelectItem value="few_times_month">Algunas veces al mes</SelectItem>
                 <SelectItem value="occasionally">Ocasionalmente</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div>
             <Label htmlFor="bio" className="text-white">Biografía (opcional)</Label>
             <Textarea
               id="bio"
               name="bio"
               value={profile.bio}
               onChange={handleChange}
               rows={3}
               placeholder="Cuéntanos sobre ti (opcional)"
               className="bg-white/5 border-white/10 text-white placeholder-gray-400"
             />
           </div>
         </div>
         {error && (
           <Alert variant="destructive">
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}
         {success && (
           <Alert variant="default" className="bg-green-500/20 text-green-300 border-green-500/50">
             <AlertTitle>Éxito</AlertTitle>
             <AlertDescription>{success}</AlertDescription>
           </Alert>
         )}
         <Button type="submit" disabled={loading} className="w-full bg-purple-500 hover:bg-purple-700 text-white">
           {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
           {loading ? 'Procesando...' : 'Actualizar Perfil'}
         </Button>
       </form>
     </div>
   </div>
 )
}

