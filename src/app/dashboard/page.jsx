'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { MessageCircle, Calendar, MapPin, Route, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { Button } from "@/components/ui/button"
import EventSearch from '../components/EventSearch'

const MAX_DISPLAY_EVENTS = 3
const MAX_DISPLAY_CHATS = 3

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [totalEventCount, setTotalEventCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchEvents()
      fetchAllEvents()
      fetchJoinedEvents()
    }
  }, [user])

  async function fetchEvents() {
    try {
      const [{ count }, { data }] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase
          .from('events')
          .select('*')
          .limit(MAX_DISPLAY_EVENTS)
      ])
      
      if (data) setEvents(data)
      setTotalEventCount(count)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  async function fetchAllEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAllEvents(data)
    } catch (error) {
      console.error('Error fetching all events:', error)
    }
  }

  async function fetchJoinedEvents() {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events (
            id,
            title,
            date,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('events.created_at', { ascending: false })
        .limit(MAX_DISPLAY_CHATS)
      
      if (error) throw error
      setJoinedEvents(data.map(item => item.events).filter(Boolean))
    } catch (error) {
      console.error('Error fetching joined events:', error)
    }
  }

  async function joinEvent(eventId) {
    if (joinedEvents.some(event => event.id === eventId)) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .insert([
          { event_id: eventId, user_id: user.id }
        ])
      
      if (error) throw error

      const { error: chatError } = await supabase
        .from('event_chats')
        .insert([
          { 
            event_id: eventId, 
            user_id: user.id, 
            message: `${user.email} se ha unido al evento.` 
          }
        ])

      if (chatError) throw chatError

      fetchEvents()
      fetchJoinedEvents()
    } catch (error) {
      console.error('Error joining event:', error)
    }
  }

  const handleSearchResults = (results) => {
    setSearchResults(results)
  }

  const displayEvents = searchResults || events

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <EventSearch 
        onSearchResults={handleSearchResults} 
        onReset={() => setSearchResults(null)} 
        allEvents={allEvents}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <div className="p-4 sm:p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="text-xl font-display mb-2 sm:mb-0">
                {searchResults ? 'Resultados de búsqueda' : 'Eventos Recientes'}
              </h2>
              {!searchResults && totalEventCount > MAX_DISPLAY_EVENTS && (
                <Link href="/events">
                  <Button variant="link" className="text-purple-400 hover:text-purple-300 px-0 sm:px-2">
                    Ver todos <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {displayEvents.slice(0, searchResults ? displayEvents.length : MAX_DISPLAY_EVENTS).map((event) => {
                const isParticipant = joinedEvents.some(je => je.id === event.id);
                return (
                  <div 
                    key={event.id}
                    className="group p-4 rounded-lg bg-black/40 border border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-white/20 flex items-center justify-center shadow-inner">
                          <Route className="h-6 w-6 text-purple-100" />
                        </div>
                        <div>
                          <h3 className="font-display group-hover:text-purple-300 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-4 w-4" />
                            {event.date 
                              ? new Date(event.date).toLocaleString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : "Por definir"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPin className="h-4 w-4" />
                            {event.location || "Por definir"}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => joinEvent(event.id)}
                        disabled={isParticipant}
                        variant={isParticipant ? "secondary" : "default"}
                        className={`
                          transition-all w-full sm:w-auto
                          ${isParticipant 
                            ? 'bg-purple-700/40 text-white hover:bg-purple-600/50' 
                            : 'bg-purple-600/80 hover:bg-purple-700/90 text-white'
                          }
                        `}
                      >
                        {isParticipant ? 'Ya participas' : 'Unirse'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <div className="p-4 sm:p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-display mb-4">Acceso Rápido</h2>
            <div className="space-y-3">
              <Link href="/create-event" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Crear Evento
                </Button>
              </Link>
              <Link href="/userevents" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Mis Eventos
                </Button>
              </Link>
              <Link href="/events" className="block w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Explorar Eventos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Event Chats */}
      <div className="p-4 sm:p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-display mb-2 sm:mb-0">Chats de Eventos</h2>
          {joinedEvents.length > MAX_DISPLAY_CHATS && (
            <Link href="/chats">
              <Button variant="link" className="text-purple-400 hover:text-purple-300 px-0 sm:px-2">
                Ver todos <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="space-y-4">
          {joinedEvents.slice(0, MAX_DISPLAY_CHATS).map((event) => (
            <div 
              key={event.id}
              className="group p-4 rounded-lg bg-black/40 border border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-white/20 flex items-center justify-center shadow-inner">
                    <MessageCircle className="h-6 w-6 text-purple-100" />
                  </div>
                  <div>
                    <h3 className="font-display group-hover:text-purple-300 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "Fecha por definir"}
                    </p>
                  </div>
                </div>
                <Link href={`/events/${event.id}/chat`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-purple-700/40 hover:bg-purple-600/50 text-white transition-all">
                    Abrir Chat
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}