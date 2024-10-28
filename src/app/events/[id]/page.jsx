"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'
import EventChat from '@/app/components/EvenChat'

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching event:', error)
      } else {
        setEvent(data)
      }
    }

    fetchEvent()
  }, [id])

  if (!event) {
    return <div className="p-4">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Detalles del evento</h2>
          <p><strong>Fecha:</strong> {new Date(event.date).toLocaleString()}</p>
          <p><strong>Ubicación:</strong> {event.location}</p>
          <p><strong>Distancia:</strong> {event.distance}</p>
          <p className="mt-4">{event.description}</p>
        </div>
        <div className="h-[600px]">
          <h2 className="text-xl font-semibold mb-2">Chat del evento</h2>
          <EventChat eventId={event.id} />
        </div>
      </div>
    </div>
  )
}