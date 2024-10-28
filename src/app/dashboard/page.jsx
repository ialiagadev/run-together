'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { Bell, Search, User, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import EventChat from '../components/EvenChat'


export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)

  useEffect(() => {
    if (user) {
      fetchEvents()
      fetchJoinedEvents()
    }
  }, [user])

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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <div className="flex items-center">
                <div className="relative mr-4">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  aria-label="Notificaciones"
                >
                  <Bell size={20} />
                </button>
                <button
                  className="ml-4 p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  aria-label="Perfil de usuario"
                >
                  <User size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Componente de búsqueda por ciudad */}
              <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Búsqueda de Eventos</h2>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Buscar eventos por ciudad..."
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition duration-300">
                    Buscar
                  </button>
                </div>
              </div>

              {/* Componente de próximos eventos */}
              <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
                <ul className="space-y-4">
                  {events.map((event) => (
                    <li key={event.id} className="border-b pb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {event.location}
                      </p>
                      <p className="text-sm text-gray-600">Distancia: {event.distance}</p>
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
              <div className="bg-white rounded-lg shadow p-6">
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
              // En app/dashboard/page.jsx, modifica la sección de chats así:

{/* Componente de chats */}
<div className="md:col-span-3 bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4">Chats de Eventos</h2>
  <ul className="space-y-2">
    {joinedEvents.map((event) => (
      <li key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
            <MessageCircle className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-gray-600">
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