import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ParticipantsList({ eventId }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchParticipants() {
      setLoading(true)
      try {
        // Paso 1: Obtener los user_ids de los participantes
        const { data: participantIds, error: participantsError } = await supabase
          .from('event_participants')
          .select('user_id')
          .eq('event_id', eventId)

        if (participantsError) throw participantsError

        // Paso 2: Obtener los perfiles de esos usuarios
        const userIds = participantIds.map(p => p.user_id)
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)

        if (profilesError) throw profilesError

        setParticipants(profilesData)
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [eventId])

  if (loading) {
    return <div className="text-center p-4">Cargando participantes...</div>
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-4">Participantes ({participants.length})</h2>
      <div className="space-y-4">
        {participants.map((participant) => (
          <Link key={participant.id} href={`/profile/${participant.id}`}>
            <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
              <Avatar>
                <AvatarImage 
                  src={participant.avatar_url || '/images/default-avatar.png'} 
                  alt={participant.username} 
                />
                <AvatarFallback>
                  {participant.username ? participant.username[0].toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {participant.username || 'Usuario anónimo'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}

