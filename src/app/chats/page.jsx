'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Calendar, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ChatsPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchChats() {
      try {
        setLoading(true)
        setError(null)

        const { data: participations, error: participationsError } = await supabase
          .from('event_participants')
          .select(`
            event_id,
            events (
              id,
              title,
              date,
              description,
              location
            )
          `)
          .eq('user_id', user.id)

        if (participationsError) {
          console.error('Error participations:', participationsError)
          throw participationsError
        }

        if (!participations) {
          setChats([])
          return
        }

        const chatsWithLastMessage = await Promise.all(
          participations.map(async (participation) => {
            if (!participation.events) return null

            const { data: messages, error: messagesError } = await supabase
              .from('event_chats')
              .select(`
                message,
                created_at,
                profiles (
                  username,
                  avatar_url
                )
              `)
              .eq('event_id', participation.event_id)
              .order('created_at', { ascending: false })
              .limit(1)

            if (messagesError) {
              console.error('Error messages:', messagesError)
              throw messagesError
            }

            return {
              ...participation.events,
              lastMessage: messages && messages[0] ? messages[0] : null
            }
          })
        )

        setChats(chatsWithLastMessage.filter(Boolean))
      } catch (error) {
        console.error('Error fetching chats:', error)
        setError('Error al cargar los chats. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchChats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-destructive">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No participas en ningún chat</CardTitle>
            <div className="text-sm text-muted-foreground">
              Únete a eventos para comenzar a chatear con otros participantes
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button>Explorar eventos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Chats</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/events/${chat.id}/chat`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{chat.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(chat.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {chat.lastMessage ? (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={chat.lastMessage.profiles?.avatar_url} 
                        alt={chat.lastMessage.profiles?.username} 
                      />
                      <AvatarFallback>
                        {chat.lastMessage.profiles?.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {chat.lastMessage.profiles?.username}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {chat.lastMessage.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(chat.lastMessage.created_at).toLocaleString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No hay mensajes aún
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}