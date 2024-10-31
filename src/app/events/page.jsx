'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import EventList from '../components/EvenList'
import EventSearch from '../components/EventSearch'

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => {
    if (user) {
      fetchEvents()
      fetchJoinedEvents()
    }
  }, [user])

  async function fetchEvents() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true, nullsLast: true })
      
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

  async function fetchJoinedEvents() {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id)
      
      if (error) throw error
      setJoinedEvents(data.map(item => item.event_id))
    } catch (error) {
      console.error('Error fetching joined events:', error)
    }
  }

  async function joinEvent(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .insert([
          { event_id: eventId, user_id: user.id }
        ])
      
      if (error) throw error

      setMessage("Te has unido al evento.")
      fetchJoinedEvents()
    } catch (error) {
      console.error('Error joining event:', error)
      setMessage("No se pudo unir al evento. Por favor, intenta de nuevo.")
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
          joinedEvents={joinedEvents}
          onJoinEvent={joinEvent}
          loading={loading}
        />
      </div>
    </div>
  )
}