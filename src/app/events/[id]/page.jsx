"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, MessageCircle } from 'lucide-react'

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setEvent(data)
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  if (loading) {
    return <div className="container mx-auto p-4">Cargando...</div>
  }

  if (!event) {
    return <div className="container mx-auto p-4">Evento no encontrado</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>
                {new Date(event.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground">
              {event.description}
            </p>
          </div>

          <Link href={`/events/${id}/chat`}>
            <Button className="w-full" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Ir al Chat
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}