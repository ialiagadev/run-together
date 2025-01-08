import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

export default function EventList({ events, userEventStatus, onJoinOrRequest, currentUser }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map(event => (
        <Card key={event.id} className="bg-black/60 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex justify-between items-center">
              {event.title}
              {event.is_public ? (
                <Globe className="text-green-500 h-5 w-5" />
              ) : (
                <Lock className="text-gray-400 h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-purple-200">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-purple-200">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-purple-200">
                <Users className="w-4 h-4 mr-2" />
                <span>{event.is_public ? 'Público' : 'Privado'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href={`/events/${event.id}`} className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Ver Detalles
              </Button>
            </Link>
            {renderActionButton(event, userEventStatus, onJoinOrRequest, currentUser)}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function renderActionButton(event, userEventStatus, onJoinOrRequest, currentUser) {
  if (!currentUser) {
    return (
      <Button className="w-full bg-gray-600" disabled>
        Inicia sesión para unirte
      </Button>
    )
  }

  if (event.created_by === currentUser.id) {
    return (
      <Button className="w-full bg-gray-600" disabled>
        Eres el creador
      </Button>
    )
  }

  const status = userEventStatus[event.id]

  if (event.is_public) {
    if (status === 'participant') {
      return (
        <Button className="w-full bg-green-600" disabled>
          Ya eres participante
        </Button>
      )
    }
    return (
      <Button 
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={() => onJoinOrRequest(event.id, true)}
      >
        Unirse al evento
      </Button>
    )
  } else {
    switch (status) {
      case 'pending':
        return (
          <Button className="w-full bg-yellow-600" disabled>
            Solicitud Pendiente
          </Button>
        )
      case 'accepted':
        return (
          <Button className="w-full bg-green-600" disabled>
            Solicitud Aceptada
          </Button>
        )
      case 'rejected':
        return (
          <Button className="w-full bg-red-600" disabled>
            Solicitud Rechazada
          </Button>
        )
      default:
        return (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => onJoinOrRequest(event.id, false)}
          >
            Solicitar Unirse
          </Button>
        )
    }
  }
}

