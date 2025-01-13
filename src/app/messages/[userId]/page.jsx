'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Paperclip, Smile } from 'lucide-react'

export default function ConversationPage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const scrollAreaRef = useRef(null)
  const lastMessageRef = useRef(null)

  useEffect(() => {
    if (user && userId) {
      fetchMessages()
      fetchOtherUser()
      const unsubscribe = subscribeToMessages()
      return () => {
        unsubscribe()
      }
    }
  }, [user, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!user) return
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
    if (!userId) return
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
    if (!user) return () => {}
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
    if (!newMessage.trim() || !user) return

    setSending(true)
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
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current && lastMessageRef.current) {
      const scrollArea = scrollAreaRef.current;
      const isScrolledToBottom = scrollArea.scrollHeight - scrollArea.scrollTop === scrollArea.clientHeight;
      
      if (isScrolledToBottom || messages[messages.length - 1]?.id_remitente === user?.id) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const shouldShowDate = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.fecha_creacion).toDateString();
    const prevDate = new Date(prevMsg.fecha_creacion).toDateString();
    return currentDate !== prevDate;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  if (!user || !userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-[#0a0a1f]">
      {/* Fondo de cielo estrellado */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogIDxkZWZzPgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJzdGFyIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiIGZ4PSI1MCUiIGZ5PSI1MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwYTBhMWYiLz4KICA8ZyBmaWxsPSJ1cmwoI3N0YXIpIj4KICAgIDxjaXJjbGUgY3g9IjUwJSIgY3k9IjUwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjIwJSIgY3k9IjMwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjgwJSIgY3k9IjcwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjEwJSIgY3k9IjEwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjkwJSIgY3k9IjkwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjMwJSIgY3k9IjcwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjcwJSIgY3k9IjMwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjQwJSIgY3k9IjIwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjYwJSIgY3k9IjgwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICA8L2c+Cjwvc3ZnPg==')] opacity-50"></div>
      
      {/* Aurora boreal */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a4a5e] to-transparent opacity-20 animate-pulse"></div>

      {/* Header */}
      <div className="relative z-10 px-4 py-3 bg-cyan-950/50 backdrop-blur-sm border-b border-cyan-800/50 flex justify-center items-center">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-cyan-500/30">
            {otherUser?.avatar_url ? (
              <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
            ) : (
              <AvatarFallback className="bg-cyan-800 text-cyan-200">
                {otherUser?.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-cyan-100 font-medium">{otherUser?.username}</h2>
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-grow px-4 py-6 bg-transparent relative z-10">
        {messages.map((message, index) => {
          const isCurrentUser = message.id_remitente === user.id;
          const showAvatar = index === 0 || messages[index - 1].id_remitente !== message.id_remitente;
          const showDate = shouldShowDate(message, messages[index - 1]);
          
          return (
            <React.Fragment key={`${message.id}-${message.fecha_creacion}`}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-cyan-900/50 text-cyan-200 text-xs px-2 py-1 rounded-full">
                    {formatDate(message.fecha_creacion)}
                  </span>
                </div>
              )}
              <div
                className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                  <div className="w-8 flex-shrink-0 mr-2">
                    {!isCurrentUser && showAvatar ? (
                      <Avatar className="w-8 h-8 border-2 border-cyan-500/30">
                        {otherUser?.avatar_url ? (
                          <AvatarImage src={otherUser.avatar_url} alt={otherUser.username} />
                        ) : (
                          <AvatarFallback className="bg-cyan-800 text-cyan-200">
                            {getInitials(otherUser?.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    ) : null}
                  </div>
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} flex-grow`}>
                    {showAvatar && (
                      <span className={`text-xs font-medium mb-1 ${
                        isCurrentUser ? 'text-purple-300' : 'text-cyan-600'
                      }`}>
                        {isCurrentUser ? 'Tú' : otherUser?.username}
                      </span>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-800'
                    } shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm`}>
                      <p className="text-sm leading-relaxed">{message.contenido}</p>
                    </div>
                    <span className="text-[10px] text-cyan-400 mt-1">
                      {formatTime(message.fecha_creacion)}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </ScrollArea>
      <form onSubmit={sendMessage} className="p-4 bg-[#0a0a1f]/80 backdrop-blur-sm border-t border-cyan-900/50">
        <div className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-cyan-950/30 border-cyan-800/50 text-cyan-100 placeholder-cyan-400 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <Button type="button" variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30">
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="submit" disabled={sending || !newMessage.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

