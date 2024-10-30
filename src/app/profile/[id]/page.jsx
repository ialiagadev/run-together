'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Trophy, Users } from 'lucide-react'

export default function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)

  useEffect(() => {
    async function fetchProfileAndEvents() {
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

        const { data: participations, error: participationsError } = await supabase
          .from('event_participants')
          .select(`
            event_id,
            events (
              id,
              title,
              description,
              date,
              location
            )
          `)
          .eq('user_id', id)

        if (participationsError) {
          console.error('Error fetching participations:', participationsError)
          throw participationsError
        }

        const formattedEvents = participations
          .map(p => p.events)
          .filter(Boolean)
          .sort((a, b) => new Date(a.date) - new Date(b.date))

        setEvents(formattedEvents)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfileAndEvents()
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

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
            <div>
              <Avatar 
                className="w-32 h-32 cursor-pointer transition-transform hover:scale-105"
                onClick={() => setIsAvatarOpen(true)}
              >
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>

              <Dialog open={isAvatarOpen} onOpenChange={setIsAvatarOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background">
                  <DialogTitle className="sr-only">
                    Foto de perfil de {profile.username}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Imagen ampliada del avatar del usuario
                  </DialogDescription>
                  <div className="relative aspect-square">
                    <img
                      src={profile.avatar_url}
                      alt={`Foto de perfil de ${profile.username}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://avatar.vercel.sh/${profile.username}`
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.name && (
                <div className="text-gray-500 mb-2">{profile.name}</div>
              )}
              {profile.bio && (
                <div className="text-gray-700 mb-4">{profile.bio}</div>
              )}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {profile.experience_level && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.experience_level}</span>
                  </div>
                )}
                {profile.preferred_distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.preferred_distance}km</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <div className="grid gap-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    No participa en ningún evento todavía
                  </div>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <Card className="hover:bg-gray-50 transition-colors">
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <div className="text-sm text-muted-foreground">
                Resumen de actividad
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-8 h-8 text-gray-500 mb-2" />
                  <div className="text-2xl font-bold">{events.length}</div>
                  <div className="text-sm text-gray-500">Eventos</div>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-gray-500 mb-2" />
                  <div className="text-2xl font-bold">{profile.experience_level ? '1' : '0'}</div>
                  <div className="text-sm text-gray-500">Nivel</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {user?.id === id && (
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/profile/edit">Editar Perfil</Link>
          </Button>
        </div>
      )}
    </div>
  )
}