'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Calendar, Trophy } from 'lucide-react'

export default function ProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          throw profileError
        }
        
        setProfile(profileData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando perfil...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Perfil no encontrado</div>
      </div>
    )
  }

  const getRunningFrequencyText = (frequency) => {
    const frequencyMap = {
      'daily': 'Diariamente',
      'several_times_week': 'Varias veces por semana',
      'once_week': 'Una vez por semana',
      'few_times_month': 'Algunas veces al mes',
      'occasionally': 'Ocasionalmente'
    }
    return frequencyMap[frequency] || frequency
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).join('').toUpperCase()
  }

  const initials = getInitials(profile.username || profile.name)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="container max-w-4xl mx-auto space-y-6">
      <Card className="bg-black/60 border-purple-500/20 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
            <div>
              <Avatar 
                className="w-32 h-32 cursor-pointer transition-transform hover:scale-105 border-4 border-purple-500/50"
                onClick={() => setIsAvatarOpen(true)}
              >
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback className="bg-purple-600 text-white text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <Dialog open={isAvatarOpen} onOpenChange={setIsAvatarOpen}>
                <DialogContent className="max-w-md sm:max-w-lg p-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`Foto de perfil de ${profile.username}`}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-purple-600 text-white text-8xl rounded-lg">
                      {initials}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
              {profile.name && (
                <div className="text-purple-300 mb-2">{profile.name}</div>
              )}
              <div className="space-y-2 mt-4">
                {profile.age && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">{profile.age} años</span>
                  </div>
                )}
                {profile.running_frequency && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Corre {getRunningFrequencyText(profile.running_frequency)}</span>
                  </div>
                )}
              </div>
              {profile.bio && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2 text-white">Biografía</h2>
                  <p className="text-purple-100">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="bg-purple-600/20 border-purple-400 text-purple-200 hover:bg-purple-500/30 hover:text-white"
        >
          Volver al chat
        </Button>
        {user?.id === id && (
          <Button 
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/profile/edit">Editar Perfil</Link>
          </Button>
        )}
      </div>
      </div>
    </div>
  )
}

