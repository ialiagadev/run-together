'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send, ArrowLeft } from 'lucide-react'

export default function ConversationPage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user && userId) {
      fetchMessages()
      fetchOtherUser()
      subscribeToMessages()
    }
  }, [user, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
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
        .or(`and(id_remitente.eq.${user.id},id_destinatario.eq.${userId}),and(id_remitente.eq.${userId},id_destinatario.eq.${user.id})`)
        .order('fecha_creacion', { ascending: true })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOtherUser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .single()

      if (error) throw error
      setOtherUser(data)
    } catch (error) {
      console.error('Error fetching other user:', error)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('private-messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensajes_privados',
          filter: `or(id_remitente=eq.${user.id},id_destinatario=eq.${user.id})`
        }, 
        (payload) => {
          if (payload.new.id_remitente === userId || payload.new.id_destinatario === userId) {
            setMessages(prevMessages => [...prevMessages, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const { data, error } = await supabase
        .from('mensajes_privados')
        .insert({
          id_remitente: user.id,
          id_destinatario: userId,
          contenido: newMessage.trim()
        })
        .select(`
          id,
          id_remitente,
          id_destinatario,
          contenido,
          fecha_creacion,
          remitente:profiles!id_remitente(id, username, avatar_url),
          destinatario:profiles!id_destinatario(id, username, avatar_url)
        `)
        .single()

      if (error) throw error
      setMessages(prevMessages => [...prevMessages, data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900/50 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col bg-gradient-to-br from-purple-900/50 to-black">
      <Card className="flex-1 overflow-hidden flex flex-col bg-black/60 border-purple-500/20 backdrop-blur-md">
        <CardHeader className="bg-purple-900/30 border-b border-purple-500/20">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 text-white"
              onClick={() => router.push('/messages')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Link href={`/profile/${otherUser?.id}`}>
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {otherUser?.username?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <CardTitle className="text-xl text-white">{otherUser?.username}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.id_remitente === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[70%] ${message.id_remitente === user.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Link href={`/profile/${message.id_remitente}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.id_remitente === user.id ? user.user_metadata.avatar_url : otherUser?.avatar_url} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {message.id_remitente === user.id ? user.email[0].toUpperCase() : otherUser?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className={`rounded-lg p-3 ${message.id_remitente === user.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                  <p>{message.contenido}</p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {new Date(message.fecha_creacion).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardContent className="p-4 bg-purple-900/20 border-t border-purple-500/20">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-black/40 border-purple-500/30 text-white placeholder-gray-400"
            />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

