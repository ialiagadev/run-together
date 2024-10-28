'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { Bell, Search, User, MessageCircle, Moon, Sun, Menu } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

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

      alert('Te has unido al evento exitosamente')
      fetchEvents()
      fetchJoinedEvents()
    } catch (error) {
      console.error('Error joining event:', error)
      alert('Hubo un problema al unirte al evento. Por favor, intenta de nuevo.')
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 md:hidden"
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <div className="relative mr-4 hidden sm:block">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className={`rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-label="Notificaciones"
              >
                <Bell size={20} />
              </button>
              <button
                className={`ml-4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-label="Perfil de usuario"
              >
                <User size={20} />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`ml-4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-label="Cambiar modo"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r`}>
          <Sidebar darkMode={darkMode} />
        </aside>
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Componente de búsqueda por ciudad */}
              <div className={`md:col-span-3 rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-semibold mb-4">Búsqueda de Eventos</h2>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Buscar eventos por ciudad..."
                    className={`flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition duration-300">
                    Buscar
                  </button>
                </div>
              </div>

              {/* Componente de próximos eventos */}
              <div className={`md:col-span-2 rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
                <ul className="space-y-4">
                  {events.map((event) => (
                    <li key={event.id} className={`border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(event.date).toLocaleString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {event.location}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distancia: {event.distance}</p>
                      <button 
                        onClick={() => joinEvent(event.id)}
                        className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition duration-300"
                      >
                        Unirse al evento
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Componente de acceso rápido */}
              <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-semibold mb-4">Acceso Rápido</h2>
                <div className="space-y-2">
                  <Link href="/create-event" className="block w-full">
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-300">
                      Crear Evento
                    </button>
                  </Link>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-300">
                    Mis Eventos
                  </button>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-300">
                    Explorar Eventos
                  </button>
                </div>
              </div>

              {/* Componente de chats */}
              <div className={`md:col-span-3 rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-xl font-semibold mb-4">Chats de Eventos</h2>
                <ul className="space-y-2">
                  {joinedEvents.map((event) => (
                    <li key={event.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-purple-900' : 'bg-purple-200'
                        }`}>
                          <MessageCircle className={`${darkMode ? 'text-purple-300' : 'text-purple-600'}`} size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}/chat`}>
                        <button 
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition duration-300"
                        >
                          Abrir Chat
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}