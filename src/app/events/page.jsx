'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabaseClient'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center mt-8 text-purple-600">Cargando eventos...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Eventos de Running</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4">{new Date(event.date_time).toLocaleString()}</p>
                <p className="text-gray-600 mb-4">{event.location}</p>
                <p className="text-gray-600 mb-4">Distancia: {event.distance} km</p>
                <p className="text-gray-600 mb-4">Dificultad: {event.difficulty}</p>
                <Link 
                  href={`/events/${event.id}`}
                  className="inline-block bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-300"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
        {events.length === 0 && (
          <p className="text-center mt-4 text-gray-600">No hay eventos programados. ¡Crea uno nuevo!</p>
        )}
      </div>
    </div>
  )
}