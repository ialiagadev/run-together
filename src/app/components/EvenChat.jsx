'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { Send, Loader2, ChevronDown, Paperclip, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const MESSAGES_PER_PAGE = 20;

const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

export default function EventChat({ eventId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const scrollAreaRef = useRef(null);
  const channelRef = useRef(null);
  const lastMessageRef = useRef(null);
  const router = useRouter();

  const fetchMessages = async (lastId = null) => {
    setLoading(true);
    try {
      let query = supabase
        .from('event_chats')
        .select(`
          id,
          user_id,
          message,
          created_at,
          profiles!user_id (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (lastId) {
        query = query.lt('id', lastId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        ...msg,
        username: msg.profiles?.username || msg.profiles?.name || 'Usuario anónimo',
        avatar_url: msg.profiles?.avatar_url || null
      })).reverse();

      setMessages(prevMessages => {
        const newMessages = formattedMessages.filter(
          newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
        );
        return [...newMessages, ...prevMessages];
      });
      setHasMoreMessages(data.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error('Error al obtener mensajes:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    channelRef.current = supabase.channel(`event_chat:${eventId}`);
    
    channelRef.current
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'event_chats',
          filter: `event_id=eq.${eventId}`
        }, 
        async (payload) => {
          console.log('Nuevo mensaje recibido:', payload.new);
          
          const { data, error } = await supabase
            .from('event_chats')
            .select(`
              id,
              user_id,
              message,
              created_at,
              profiles!user_id (
                id,
                username,
                name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error al obtener detalles del nuevo mensaje:', error);
            return;
          }

          const newMessage = {
            ...data,
            username: data.profiles?.username || data.profiles?.name || 'Usuario anónimo',
            avatar_url: data.profiles?.avatar_url || null
          };

          setMessages(prevMessages => {
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Suscrito exitosamente a cambios en tiempo real.');
        }
      });

    return () => {
      console.log('Cancelando suscripción del canal');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [eventId]);

  useEffect(() => {
    if (scrollAreaRef.current && lastMessageRef.current) {
      const scrollArea = scrollAreaRef.current;
      const isScrolledToBottom = scrollArea.scrollHeight - scrollArea.scrollTop === scrollArea.clientHeight;
      
      if (isScrolledToBottom || messages[messages.length - 1]?.user_id === currentUser.id) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('event_chats')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          message: newMessage.trim()
        })
        .select();

      if (error) throw error;

      console.log('Mensaje enviado:', data);
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error.message);
    } finally {
      setSending(false);
    }
  };

  const loadMoreMessages = async () => {
    if (messages.length > 0) {
      setLoading(true);
      await fetchMessages(messages[0].id);
      setLoading(false);
    }
  };

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
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden bg-[#0a0a1f]">
      {/* Fondo de cielo estrellado */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogIDxkZWZzPgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJzdGFyIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiIGZ4PSI1MCUiIGZ5PSI1MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwYTBhMWYiLz4KICA8ZyBmaWxsPSJ1cmwoI3N0YXIpIj4KICAgIDxjaXJjbGUgY3g9IjUwJSIgY3k9IjUwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjIwJSIgY3k9IjMwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjgwJSIgY3k9IjcwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjEwJSIgY3k9IjEwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjkwJSIgY3k9IjkwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjMwJSIgY3k9IjcwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjcwJSIgY3k9IjMwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjQwJSIgY3k9IjIwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICAgIDxjaXJjbGUgY3g9IjYwJSIgY3k9IjgwJSIgcj0iMXB4IiBvcGFjaXR5PSIwLjMiLz4KICA8L2c+Cjwvc3ZnPg==')] opacity-50"></div>
      
      {/* Aurora boreal */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a4a5e] to-transparent opacity-20 animate-pulse"></div>

      <ScrollArea ref={scrollAreaRef} className="flex-grow px-4 py-6 bg-transparent relative z-10">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
          </div>
        ) : (
          <>
            {hasMoreMessages && (
              <div className="flex justify-center mb-6">
                <Button onClick={loadMoreMessages} variant="outline" size="sm" disabled={loading} className="bg-cyan-900/30 border-cyan-500/30 text-cyan-300 hover:bg-cyan-800/40 hover:text-cyan-200 transition-all duration-200">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Cargar más mensajes
                </Button>
              </div>
            )}
            {messages.map((message, index) => {
              const isCurrentUser = message.user_id === currentUser?.id;
              const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
              const showDate = shouldShowDate(message, messages[index - 1]);
              
              return (
                <React.Fragment key={`${message.id}-${message.created_at}`}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-cyan-900/50 text-cyan-200 text-xs px-2 py-1 rounded-full">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    id={`message-${message.id}`}
                    className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    ref={index === messages.length - 1 ? lastMessageRef : null}
                  >
                    <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isCurrentUser && showAvatar && (
                        <Link href={`/profile/${message.user_id}`}>
                          <Avatar className="w-8 h-8 mr-2 border-2 border-cyan-500/30">
                            {message.avatar_url ? (
                              <AvatarImage 
                                src={message.avatar_url} 
                                alt={message.username}
                              />
                            ) : (
                              <AvatarFallback className="bg-cyan-800 text-cyan-200">
                                {getInitials(message.username)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </Link>
                      )}
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {showAvatar && (
                          <Link href={`/profile/${message.user_id}`}>
                            <span className={`text-xs font-medium mb-1 cursor-pointer hover:underline ${
                              isCurrentUser ? 'text-purple-300' : 'text-cyan-600'
                            }`}>
                              {isCurrentUser ? 'Tú' : message.username}
                            </span>
                          </Link>
                        )}
                        <div className={`px-4 py-2 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-800'
                        } shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm`}>
                          <p className="text-sm leading-relaxed">{message.message}</p>
                        </div>
                        <span className="text-[10px] text-cyan-400 mt-1">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </>
        )}
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
  );
}

