'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MessageCircle } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('mensajes_privados')
        .select(`
          id,
          id_remitente,
          id_destinatario,
          contenido,
          fecha_creacion,
          remitente:profiles!id_remitente(id, username, avatar_url),
          destinatario:profiles!id_destinatario(id, username, avatar_url)
        `)
        .or(`id_remitente.eq.${user.id},id_destinatario.eq.${user.id}`)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      const conversationsMap = data.reduce((acc, message) => {
        const otherUser = message.id_remitente === user.id ? message.destinatario : message.remitente
        if (!acc[otherUser.id]) {
          acc[otherUser.id] = {
            user: otherUser,
            lastMessage: message
          }
        } else if (new Date(message.fecha_creacion) > new Date(acc[otherUser.id].lastMessage.fecha_creacion)) {
          acc[otherUser.id].lastMessage = message
        }
        return acc
      }, {})

      setConversations(Object.values(conversationsMap))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900/50 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-purple-900/50 to-black">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Mensajes Privados</h1>
      <div className="grid gap-4 max-w-2xl mx-auto">
        {conversations.map((conversation) => (
          <Card key={conversation.user.id} className="bg-black/60 border-purple-500/20 backdrop-blur-md overflow-hidden hover:bg-purple-900/20 transition-all duration-300">
            <CardContent className="p-4">
              <Link href={`/messages/${conversation.user.id}`} className="flex items-center space-x-4">
                <Link href={`/profile/${conversation.user.id}`}>
                  <Avatar className="h-12 w-12 ring-2 ring-purple-500 transition-all duration-300 hover:ring-4">
                    <AvatarImage src={conversation.user.avatar_url} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {conversation.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white truncate">
                    {conversation.user.username}
                  </p>
                  <p className="text-sm text-gray-400 truncate flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1 inline" />
                    {conversation.lastMessage.contenido}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(conversation.lastMessage.fecha_creacion).toLocaleString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short'
                  })}
                </span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

