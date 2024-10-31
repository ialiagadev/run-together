'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { MessageCircle, Calendar, MapPin, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { Button } from "@/components/ui/button"
import EventSearch from '../components/EventSearch'

export default function UserEventsPage() {
  const { user } = useAuth()
  const [joinedEvents, setJoinedEvents] = useState([])
  const [allJoinedEvents, setAllJoinedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => {
    if (user) {
      fetchJoinedEvents()
    }
  }, [user])

  async function fetchJoinedEvents() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events (
            id,
            title,
            date,
            location,
            description
          )
        `)
        .eq('user_id', user.id)
      
      if (error) throw error
      const events = data.map(item => item.events).filter(Boolean)
      setJoinedEvents(events)
      setAllJoinedEvents(events) // Guardamos una copia de todos los eventos para la búsqueda
    } catch (error) {
      console.error('Error fetching joined events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchResults = (results) => {
    setSearchResults(results)
  }

  const displayEvents = searchResults || joinedEvents

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Search Events and Ver más eventos button */}
      <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-display">
            {searchResults ? 'Resultados de búsqueda' : 'Mis Eventos'}
          </h2>
          <Link href="/events">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ver más eventos
            </Button>
          </Link>
        </div>
        <EventSearch 
          onSearchResults={handleSearchResults}
          onReset={() => setSearchResults(null)}
          allEvents={allJoinedEvents}
          placeholder="Buscar en mis eventos..."
          buttonText="Buscar en mis eventos"
        />
      </div>

      {/* User's Events */}
      <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-300">Cargando eventos...</p>
          ) : displayEvents.length === 0 ? (
            <div className="text-center text-gray-300">
              {searchResults ? 
                'No se encontraron eventos que coincidan con tu búsqueda.' : 
                'No estás unido a ningún evento en este momento.'}
            </div>
          ) : (
            displayEvents.map((event) => (
              <div 
                key={event.id}
                className="group p-4 rounded-lg bg-black/40 border border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-white/20 flex items-center justify-center shadow-inner">
                      <Calendar className="h-6 w-6 text-purple-100" />
                    </div>
                    <div>
                      <h3 className="font-display group-hover:text-purple-300 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`}>
                      <Button className="bg-purple-700/40 hover:bg-purple-600/50 text-white transition-all">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Link href={`/events/${event.id}/chat`}>
                      <Button className="bg-purple-700/40 hover:bg-purple-600/50 text-white transition-all">
                        Chat
                        <MessageCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}