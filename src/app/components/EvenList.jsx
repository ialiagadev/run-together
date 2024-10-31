'use client'

import { motion } from "framer-motion"
import { Calendar, MapPin, Users, MessageCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EventList({ events, joinedEvents, onJoinEvent, loading }) {
  const formatEventDate = (date) => {
    if (!date) return 'Por definir'
    const eventDate = new Date(date)
    if (isNaN(eventDate.getTime())) return 'Por definir'
    return eventDate.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="bg-black/60 border-white/20 backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-white text-lg mb-4">
            No hay eventos disponibles en este momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-black/60 border-white/20 backdrop-blur-md overflow-hidden hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader className="bg-purple-900/30 border-b border-white/10">
              <CardTitle className="text-xl font-semibold text-white">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center text-purple-200 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatEventDate(event.date)}</span>
              </div>
              <div className="flex items-center text-purple-200 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-purple-200 mb-4">
                <Users className="w-4 h-4 mr-2" />
                <span>{event.max_participants ? `${event.max_participants} participantes máximo` : 'Sin límite de participantes'}</span>
              </div>
              <p className="text-gray-300">{event.description?.slice(0, 100)}...</p>
            </CardContent>
            <CardFooter className="bg-purple-900/20 border-t border-white/10 flex justify-between">
              <Link href={`/events/${event.id}`}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Ver detalles
                </Button>
              </Link>
              {joinedEvents.includes(event.id) ? (
                <Link href={`/events/${event.id}/chat`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Abrir chat
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={() => onJoinEvent(event.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Unirse al evento
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}