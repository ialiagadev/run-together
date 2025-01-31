'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Calendar, MapPin, Check, X } from 'lucide-react'

export default function SolicitudesPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  async function fetchRequests() {
    try {
      setLoading(true)
      // Primero, obtenemos los eventos creados por el usuario actual
      const { data: userEvents, error: userEventsError } = await supabase
        .from('events')
        .select('id')
        .eq('created_by', user.id)

      if (userEventsError) throw userEventsError

      const userEventIds = userEvents.map(event => event.id)

      // Luego, obtenemos las solicitudes para esos eventos
      const { data, error } = await supabase
        .from('event_requests')
        .select(`
          id,
          event_id,
          user_id,
          status,
          created_at,
          events (
            id,
            title,
            date,
            location
          )
        `)
        .in('event_id', userEventIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch user profiles separately
      const userIds = [...new Set(data.map(request => request.user_id))]
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Combine the data
      const requestsWithProfiles = data.map(request => ({
        ...request,
        profile: profiles.find(profile => profile.id === request.user_id)
      }))

      console.log('Fetched requests:', requestsWithProfiles)
      setRequests(requestsWithProfiles)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setMessage('No se pudieron cargar las solicitudes. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRequest(requestId, status) {
    try {
      const { error: updateError } = await supabase
        .from('event_requests')
        .update({ status })
        .eq('id', requestId)

      if (updateError) throw updateError
      
      if (status === 'accepted') {
        const request = requests.find(r => r.id === requestId)
        if (request) {
          const { error: participantError } = await supabase
            .from('event_participants')
            .insert({ 
              event_id: request.event_id, 
              user_id: request.user_id 
            })
        
          if (participantError) {
            console.error('Error adding participant:', participantError)
            setMessage('La solicitud fue aceptada, pero hubo un problema al añadir al participante.')
            return
          }
        }
      }

      setMessage(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada')
      // Eliminar la solicitud del estado local
      setRequests(prevRequests => prevRequests.filter(r => r.id !== requestId))
    } catch (error) {
      console.error('Error updating request:', error)
      setMessage('No se pudo procesar la solicitud. Por favor, intenta de nuevo.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Solicitudes de Eventos</h1>
      {message && (
        <div className="mb-4 p-4 bg-purple-600/50 text-white rounded-md">
          {message}
        </div>
      )}
      {requests.length === 0 ? (
        <Card className="bg-black/60 border-white/20 backdrop-blur-md">
          <CardContent className="p-6">
            <p className="text-white text-lg">No hay solicitudes pendientes para tus eventos.</p>
          </CardContent>
        </Card>
      ) : (
        requests.map(request => (
          <Card key={request.id} className="bg-black/60 border-white/20 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                {request.events.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={request.profile?.avatar_url} alt={request.profile?.username} />
                    <AvatarFallback>{request.profile?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-white block">{request.profile?.username}</span>
                    <div className="flex items-center text-purple-200 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(request.events.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-purple-200 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{request.events.location}</span>
                    </div>
                  </div>
                </div>
                {request.status === 'pending' && (
                  <div className="flex items-center space-x-12">
                    <Button 
                      onClick={() => handleRequest(request.id, 'accepted')}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-indigo-100/50 border-2 border-indigo-200/50 hover:border-indigo-300"
                      aria-label="Aceptar solicitud"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={() => handleRequest(request.id, 'rejected')}
                      className="bg-violet-50 hover:bg-violet-100 text-violet-600 p-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-violet-100/50 border-2 border-violet-200/50 hover:border-violet-300"
                      aria-label="Rechazar solicitud"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

