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
                <Globe className="text-green-400 h-5 w-5" />
              ) : (
                <Lock className="text-yellow-400 h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Users className="w-4 h-4 mr-2" />
                <span>{event.is_public ? 'Público' : 'Privado'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href={`/events/${event.id}`} className="w-full">
              <Button variant="ghost" className="w-full text-white border border-white/20 rounded-full transition-transform duration-200 ease-in-out hover:scale-105">
                Ver detalles
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
  const baseButtonClasses = "w-full border border-white/20 rounded-full transition-transform duration-200 ease-in-out"

  if (!currentUser) {
    return (
      <Button variant="ghost" className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-gray-400 cursor-not-allowed opacity-50`} disabled>
        Inicia sesión para unirte
      </Button>
    )
  }

  if (event.created_by === currentUser.id) {
    return (
      <Button variant="ghost" className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-blue-400 cursor-not-allowed`} disabled>
        Eres el creador
      </Button>
    )
  }

  const status = userEventStatus[event.id]

  if (event.is_public) {
    if (status === 'participant') {
      return (
        <Button variant="ghost" className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-green-400 cursor-not-allowed`} disabled>
          Ya eres participante
        </Button>
      )
    }
    return (
      <Button 
        variant="ghost"
        className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-purple-400 hover:scale-105`}
        onClick={() => onJoinOrRequest(event.id, true)}
      >
        Unirse al evento
      </Button>
    )
  } else {
    switch (status) {
      case 'pending':
        return (
          <Button variant="ghost" className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-yellow-400 cursor-not-allowed`} disabled>
            Solicitud Pendiente
          </Button>
        )
      case 'accepted':
        return (
          <Button variant="ghost" className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-green-400 cursor-not-allowed`} disabled>
            Solicitud Aceptada
          </Button>
        )
      case 'rejected':
        return (
          <Button variant="ghost" className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-red-400 cursor-not-allowed`} disabled>
            Solicitud Rechazada
          </Button>
        )
      default:
        return (
          <Button 
            variant="ghost"
            className={`${baseButtonClasses.replace('rounded-full', 'rounded-full')} text-purple-400 hover:scale-105`}
            onClick={() => onJoinOrRequest(event.id, false)}
          >
            Solicitar Unirse
          </Button>
        )
    }
  }
}

