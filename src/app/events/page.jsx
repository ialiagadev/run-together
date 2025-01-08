'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import EventList from '../components/EvenList'
import EventSearch from '../components/EventSearch'
import { Loader2 } from 'lucide-react'

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [userEventStatus, setUserEventStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => {
    fetchEvents()
    if (user) {
      fetchUserEventStatus()
    }
  }, [user])

  async function fetchEvents() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      
      if (error) throw error
      setEvents(data)
      setAllEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
      setMessage("No se pudieron cargar los eventos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserEventStatus() {
    if (!user) return

    try {
      const { data: requests, error: requestsError } = await supabase
        .from('event_requests')
        .select('event_id, status')
        .eq('user_id', user.id)

      if (requestsError) throw requestsError

      const { data: participations, error: participationsError } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id)

      if (participationsError) throw participationsError

      const statusMap = {}
      requests.forEach(item => {
        statusMap[item.event_id] = item.status
      })
      participations.forEach(item => {
        statusMap[item.event_id] = 'participant'
      })
      setUserEventStatus(statusMap)
    } catch (error) {
      console.error('Error fetching user event status:', error)
    }
  }

  async function joinOrRequestEvent(eventId, isPublic) {
    if (!user) {
      setMessage("Por favor, inicia sesión para unirte o solicitar unirte a un evento.")
      return
    }

    try {
      if (isPublic) {
        const { data: existingParticipant, error: participantError } = await supabase
          .from('event_participants')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()

        if (participantError && participantError.code !== 'PGRST116') {
          throw participantError
        }

        if (existingParticipant) {
          setMessage("Ya eres participante de este evento.")
          return
        }

        const { error: insertError } = await supabase
          .from('event_participants')
          .insert([{ event_id: eventId, user_id: user.id }])
        
        if (insertError) throw insertError
        setMessage("Te has unido al evento público.")
      } else {
        const { data: existingRequest, error: requestError } = await supabase
          .from('event_requests')
          .select('status')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()

        if (requestError && requestError.code !== 'PGRST116') {
          throw requestError
        }

        if (existingRequest) {
          setMessage("Ya tienes una solicitud existente para este evento.")
          return
        }

        const { error: insertError } = await supabase
          .from('event_requests')
          .insert([
            { event_id: eventId, user_id: user.id, status: 'pending' }
          ])
        
        if (insertError) throw insertError
        setMessage("Solicitud enviada. Espera la aprobación del creador del evento.")
      }
      
      fetchUserEventStatus()
    } catch (error) {
      console.error('Error joining or requesting to join event:', error)
      setMessage("No se pudo procesar tu solicitud. Por favor, intenta de nuevo.")
    }
  }

  const handleSearchResults = (results) => {
    setSearchResults(results)
    if (results.length === 0) {
      setMessage("No se encontraron eventos que coincidan con tu búsqueda.")
    } else {
      setMessage("")
    }
  }

  const displayEvents = searchResults || events

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">
          {searchResults ? 'Resultados de búsqueda' : 'Eventos Disponibles'}
        </h1>
        
        <EventSearch 
          onSearchResults={handleSearchResults} 
          onReset={() => {
            setSearchResults(null)
            setMessage("")
          }}
          allEvents={allEvents}
        />

        {message && (
          <div className="mb-4 p-4 bg-purple-600/50 text-white rounded-md">
            {message}
          </div>
        )}

        <EventList 
          events={displayEvents}
          userEventStatus={userEventStatus}
          onJoinOrRequest={joinOrRequestEvent}
          currentUser={user}
        />
      </div>
    </div>
  )
}

