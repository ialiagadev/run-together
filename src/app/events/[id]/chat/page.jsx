'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import EventChat from '@/app/components/EvenChat'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Info, Users, ArrowLeft } from 'lucide-react'

export default function EventChatPage() {
  const { id: eventId } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEventAndParticipants() {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()

        if (eventError) throw eventError
        setEvent(eventData)

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
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900/50 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  const handleBackClick = (e) => {
    e.stopPropagation()
    router.push(`/events/${eventId}`)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900/50 to-black">
      <Sheet>
        <SheetTrigger asChild>
          <header className="bg-purple-600 shadow-lg sticky top-0 z-30 cursor-pointer">
            <div className="h-16 px-4 flex items-center justify-between relative">
              <button 
                onClick={handleBackClick}
                className="absolute left-4 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <div className="flex items-center justify-center w-full gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  <AvatarImage src={event.image_url} alt={event.title} />
                  <AvatarFallback className="bg-purple-700 text-white">
                    {event.title[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-center min-w-0">
                  <h1 className="text-lg font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">
                    {event.title}
                  </h1>
                  <p className="text-sm text-white/80">
                    {participants.length} participantes
                  </p>
                </div>

                <Info className="h-5 w-5 text-white/80" />
              </div>
            </div>
          </header>
        </SheetTrigger>

        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] bg-purple-900/90 backdrop-blur-md text-white border-l border-purple-500/30"
        >
          <SheetHeader className="text-center pb-6">
            <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-purple-400">
              <AvatarImage src={event.image_url} alt={event.title} />
              <AvatarFallback className="bg-purple-700 text-white text-2xl">
                {event.title[0]}
              </AvatarFallback>
            </Avatar>
            <SheetTitle className="text-2xl font-bold text-white">
              {event.title}
            </SheetTitle>
            <p className="text-sm text-white/80">
              Creado el {new Date(event.created_at).toLocaleDateString('es-ES')}
            </p>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <div className="space-y-6">
              {event.description && (
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-2">
                    Descripción
                  </h3>
                  <p className="text-sm text-white">
                    {event.description}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-white/80" />
                  <h3 className="text-sm font-medium text-white/80">
                    Participantes ({participants.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {participants.map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/profile/${participant.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors block"
                    >
                      <Avatar>
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback className="bg-purple-700 text-white">
                          {participant.username?.[0].toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {participant.username || 'Usuario anónimo'}
                        </p>
                        {participant.id === user.id && (
                          <span className="text-xs text-white/60">(Tú)</span>
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

