'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { Send, Loader2, ChevronDown } from 'lucide-react';
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
    return date.toLocaleString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
      <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {hasMoreMessages && (
              <div className="flex justify-center mb-4">
                <Button onClick={loadMoreMessages} variant="outline" size="sm" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Cargar más mensajes
                </Button>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${message.created_at}`}
                id={`message-${message.id}`}
                className={`flex mb-4 ${message.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className={`flex max-w-[70%] ${message.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Link href={`/profile/${message.user_id}`}>
                    <Avatar className="w-10 h-10 mr-2 cursor-pointer">
                      {message.avatar_url ? (
                        <AvatarImage 
                          src={message.avatar_url} 
                          alt={message.username}
                        />
                      ) : (
                        <AvatarFallback className="bg-purple-500 text-white">
                          {getInitials(message.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <div className={`flex flex-col ${message.user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                    <Link href={`/profile/${message.user_id}`}>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 cursor-pointer hover:underline">
                        {message.username}
                      </span>
                    </Link>
                    <div className={`p-3 rounded-lg ${
                      message.user_id === currentUser?.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      <p>{message.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </ScrollArea>
      <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="w-10 h-10">
            {currentUser?.user_metadata?.avatar_url ? (
              <AvatarImage 
                src={currentUser.user_metadata.avatar_url} 
                alt={currentUser.email}
              />
            ) : (
              <AvatarFallback className="bg-purple-500 text-white">
                {getInitials(currentUser?.user_metadata?.username || currentUser?.email || 'U')}
              </AvatarFallback>
            )}
          </Avatar>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} className="bg-purple-500 hover:bg-purple-600 text-white">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

