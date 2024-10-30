'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import Link from 'next/link'
import EventChat from '@/app/components/EvenChat'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Info, Users } from 'lucide-react'

export default function EventChatPage() {
  const { id: eventId } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEventAndParticipants() {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()

        if (eventError) throw eventError
        setEvent(eventData)

        // Fetch participants - modificado para usar dos consultas separadas
        const { data: participantIds, error: participantsError } = await supabase
          .from('event_participants')
          .select('user_id')
          .eq('event_id', eventId)

        if (participantsError) throw participantsError

        if (participantIds?.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', participantIds.map(p => p.user_id))

          if (profilesError) throw profilesError
          setParticipants(profilesData || [])
        } else {
          setParticipants([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventAndParticipants()
  }, [eventId])

  if (!user || !event) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Sheet>
        <header className="bg-white shadow-sm p-4 sticky top-0 z-50">
          <SheetTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.image_url} alt={event.title} />
                  <AvatarFallback>{event.title[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h1 className="text-lg font-semibold text-gray-900">{event.title}</h1>
                  <p className="text-sm text-gray-500">{participants.length} participantes</p>
                </div>
              </div>
              <Info className="h-5 w-5 text-gray-500" />
            </Button>
          </SheetTrigger>
        </header>
        <SheetContent side="right" className="w-full sm:w-[400px] bg-gray-50">
          <SheetHeader className="text-center pb-6">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={event.image_url} alt={event.title} />
              <AvatarFallback>{event.title[0]}</AvatarFallback>
            </Avatar>
            <SheetTitle className="text-xl font-bold">{event.title}</SheetTitle>
            <p className="text-sm text-gray-500">
              Creado el {new Date(event.created_at).toLocaleDateString('es-ES')}
            </p>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {event.description && (
                <div className="px-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                  <p className="text-sm text-gray-700">{event.description}</p>
                </div>
              )}
              <div className="px-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-500">
                    Participantes ({participants.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/profile/${participant.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback>
                          {participant.username ? participant.username[0].toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.username || 'Usuario anónimo'}
                        </p>
                        {participant.id === user.id && (
                          <span className="text-xs text-gray-500">(Tú)</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <main className="flex-1 overflow-hidden">
        <EventChat eventId={eventId} currentUser={user} />
      </main>
    </div>
  )
}