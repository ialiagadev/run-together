'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { Bell, Search, User, MessageCircle, Moon, Sun, Menu, Calendar, MapPin, Route } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchEvents()
      fetchJoinedEvents()
    }
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
  }, [user])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      
      if (error) throw error
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
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
            date
          )
        `)
        .eq('user_id', user.id)
      
      if (error) throw error
      setJoinedEvents(data.map(item => item.events))
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

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-black">
      {/* Gradiente base */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-900/50" />

      {/* Efecto de ruido */}
      <div className="fixed inset-0 opacity-50" style={{ 
        backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E')",
        mixBlendMode: 'overlay'
      }} />

      {/* Círculos estáticos */}
      <div className="fixed inset-0">
        <div className="absolute rounded-full bg-purple-500/20 w-[400px] h-[400px] left-[10%] top-[20%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(80px)' }} />
        <div className="absolute rounded-full bg-purple-500/10 w-[600px] h-[600px] left-[80%] top-[50%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(100px)' }} />
        <div className="absolute rounded-full bg-purple-500/15 w-[500px] h-[500px] left-[50%] top-[80%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(90px)' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-display">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
           
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10 pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-black/60 border-r border-white/10 backdrop-blur-xl
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}>
          <Sidebar darkMode={darkMode} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 transition-all duration-300 ease-in-out md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search Events */}
            <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
              <h2 className="text-xl font-display mb-4">Búsqueda de Eventos</h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar eventos por ciudad..."
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button className="bg-purple-500 hover:bg-purple-600">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Events */}
              <div className="lg:col-span-2">
                <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
                  <h2 className="text-xl font-display mb-4">Próximos Eventos</h2>
                  <div className="space-y-4">
                    {events.map((event) => {
                      const isParticipant = joinedEvents.some(je => je.id === event.id);
                      return (
                        <div 
                          key={event.id}
                          className="group p-4 rounded-lg bg-black/40 border border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-white/20 flex items-center justify-center shadow-inner">
                                <Route className="h-6 w-6 text-purple-100" />
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
                            <Button
                              onClick={() => joinEvent(event.id)}
                              disabled={isParticipant}
                              variant={isParticipant ? "secondary" : "default"}
                              className={`
                                transition-all
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
                <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
                  <h2 className="text-xl font-display mb-4">Acceso Rápido</h2>
                  <div className="space-y-3">
                    <Link href="/create-event" className="block w-full">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Crear Evento
                      </Button>
                    </Link>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Mis Eventos
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Explorar Eventos
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Chats */}
            <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
              <h2 className="text-xl font-display mb-4">Chats de Eventos</h2>
              <div className="space-y-4">
                {joinedEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="group p-4 rounded-lg bg-black/40 border border-white/20 backdrop-blur-lg hover:bg-black/50 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-white/20 flex items-center justify-center shadow-inner">
                          <MessageCircle className="h-6 w-6 text-purple-100" />
                        </div>
                        <div>
                          <h3 className="font-display group-hover:text-purple-300 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}/chat`}>
                        <Button className="bg-purple-700/40 hover:bg-purple-600/50 text-white transition-all">
                          Abrir Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}