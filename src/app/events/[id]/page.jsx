"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, MessageCircle, Users, Clock, Loader2 } from 'lucide-react'
import { motion } from "framer-motion"

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/50 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/50 to-black p-4">
        <Card className="w-full max-w-md bg-black/60 border-purple-500/20 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CardTitle className="text-2xl font-bold text-white mb-4">Evento no encontrado</CardTitle>
            <Link href="/events">
              <Button variant="outline" className="mt-4 bg-purple-600/20 border-purple-400 text-purple-200 hover:bg-purple-500/30 hover:text-white transition-colors">
                Volver a eventos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-black/60 border-purple-500/20 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-purple-900/30 border-b border-purple-500/20 pb-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 text-purple-200">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-purple-400" />
                  <span className="text-sm sm:text-base">
                    {event.date
                      ? new Date(event.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : "Fecha por definir"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-purple-200">
                  <Clock className="h-5 w-5 flex-shrink-0 text-purple-400" />
                  <span className="text-sm sm:text-base">
                    {event.date
                      ? new Date(event.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "Hora por definir"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-purple-200">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-purple-400" />
                  <span className="text-sm sm:text-base">{event.location || "Ubicación por definir"}</span>
                </div>
              </div>

              <div className="bg-purple-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Descripción</h3>
                <p className="text-purple-100 text-sm sm:text-base">
                  {event.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/events/${id}/chat`} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 ease-in-out transform hover:scale-105" size="lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ir al Chat
                  </Button>
                </Link>
                <Link href="/events" className="flex-1">
                  <Button variant="outline" className="w-full bg-purple-600/20 border-purple-400 text-purple-200 hover:bg-purple-500/30 hover:text-white shadow-lg shadow-purple-500/20 transition-all duration-300 ease-in-out transform hover:scale-105" size="lg">
                    Volver a eventos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}