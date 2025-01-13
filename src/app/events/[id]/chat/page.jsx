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
import { Info, Users, ArrowLeft, Phone, Video } from 'lucide-react'

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
      <div className="flex items-center justify-center h-screen bg-[#1a1c2b]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4957e6]"></div>
      </div>
    )
  }

  const handleBackClick = (e) => {
    e.stopPropagation()
    router.push(`/events/${eventId}`)
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1c2b]">
      <Sheet>
        <SheetTrigger asChild>
          <header className="bg-[#2d2f3e] shadow-md sticky top-0 z-30">
            <div className="h-16 px-4 flex items-center justify-between">
              <button 
                onClick={handleBackClick}
                className="text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.image_url} alt={event.title} />
                  <AvatarFallback className="bg-[#4957e6] text-white">
                    {event.title[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <h1 className="text-lg font-medium text-white truncate max-w-[180px] sm:max-w-[240px]">
                    {event.title}
                  </h1>
                  <p className="text-xs text-white/60">
                    {participants.length} participantes
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="text-white/80 hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>
        </SheetTrigger>

        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] bg-[#2d2f3e] text-white border-l border-white/10"
        >
          <SheetHeader className="text-left space-y-4 pb-6">
            <SheetTitle className="text-2xl font-bold text-white">
              Información del evento
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-100px)] pr-4">
            <div className="space-y-6">
              {event.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white/70">
                    Descripción
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-white/70" />
                  <h3 className="text-sm font-medium text-white/70">
                    Participantes ({participants.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {participants.map((participant) => (
                    <Link
                      key={participant.id}
                      href={`/profile/${participant.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback className="bg-[#4957e6] text-white">
                          {participant.username?.[0].toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {participant.username || 'Usuario anónimo'}
                        </p>
                        {participant.id === user.id && (
                          <span className="text-xs text-white/60">Tú</span>
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

