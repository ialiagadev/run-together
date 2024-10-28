import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EventChat({ eventId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_chats')
        .select(`
          id,
          user_id,
          message,
          created_at,
          profiles (username, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        ...msg,
        username: msg.profiles?.username || 'Usuario anónimo',
        avatar_url: msg.profiles?.avatar_url || '/default-avatar.png'
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
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
          console.log('New message received:', payload.new);
          
          const { data, error } = await supabase
            .from('event_chats')
            .select(`
              id,
              user_id,
              message,
              created_at,
              profiles (username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message details:', error);
            return;
          }

          const newMessage = {
            ...data,
            username: data.profiles?.username || 'Usuario anónimo',
            avatar_url: data.profiles?.avatar_url || '/default-avatar.png'
          };

          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time changes.');
        }
      });

    return () => {
      console.log('Unsubscribing from channel');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

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

      console.log('Message sent:', data);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
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
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Cargando mensajes...</div>
        ) : (
          messages.map((message) => (
            <div
              key={`${message.id}-${message.created_at}`}
              className={`flex ${message.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[70%] ${message.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="w-10 h-10 mr-2">
                  <AvatarImage src={message.avatar_url} alt={message.username} />
                  <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${message.user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{message.username}</span>
                  <div className={`p-3 rounded-lg ${
                    message.user_id === currentUser?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p>{message.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.username} />
            <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}