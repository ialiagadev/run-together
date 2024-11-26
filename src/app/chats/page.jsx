'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Calendar, Loader2, MapPin, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

export default function ChatsPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchChats() {
      if (!user) return

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

        if (participationsError) throw participationsError

        const chatsWithLastMessage = await Promise.all(
          participations
            .filter(p => p.events) // Filter out null events
            .map(async (participation) => {
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

              if (messagesError) throw messagesError

              return {
                ...participation.events,
                lastMessage: messages && messages[0] ? messages[0] : null
              }
            })
        )

        setChats(chatsWithLastMessage)
      } catch (error) {
        console.error('Error fetching chats:', error)
        setError('Error al cargar los chats. Por favor, intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/50 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/50 to-black gap-4">
        <Card className="p-6 text-center bg-black/60 border-white/20 backdrop-blur-md">
          <CardContent>
            <div className="text-destructive mb-4">{error}</div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-black">
        <Card className="text-center p-8 bg-black/60 border-white/20 backdrop-blur-md w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl mb-2 text-white">No participas en ningún chat</CardTitle>
            <div className="text-sm text-white text-muted-foreground">
              Únete a eventos para comenzar a chatear con otros participantes
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">Explorar eventos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white text-center">Mis Chats</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/events/${chat.id}/chat`}>
                <Card className="hover:shadow-lg transition-all duration-300 bg-black/60 border-white/20 backdrop-blur-md overflow-hidden group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1 text-lg font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">
                          {chat.title}
                        </CardTitle>
                        <div className="text-sm text-gray-400">
                          {chat.date && (
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
                          )}
                          {chat.location && (
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-4 w-4" />
                              <span className="line-clamp-1">{chat.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <MessageCircle className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {chat.lastMessage ? (
                      <div className="flex items-start gap-3 bg-purple-900/20 p-3 rounded-md">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={chat.lastMessage.profiles?.avatar_url} 
                            alt={chat.lastMessage.profiles?.username} 
                          />
                          <AvatarFallback className="bg-purple-700 text-white">
                            {chat.lastMessage.profiles?.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-purple-200">
                            {chat.lastMessage.profiles?.username}
                          </div>
                          <div className="text-sm text-gray-400 line-clamp-2">
                            {chat.lastMessage.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
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
                      <div className="text-sm text-gray-400 bg-purple-900/20 p-3 rounded-md">
                        No hay mensajes aún
                      </div>
                    )}
                  </CardContent>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-5 w-5 text-purple-400" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}