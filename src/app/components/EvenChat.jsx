import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send } from 'lucide-react';

export default function EventChat({ eventId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('event_chats')
        .select(`
          id,
          user_id,
          message,
          created_at,
          profiles (username)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('Fetched messages:', data);

      setMessages(data.map(msg => ({
        ...msg,
        username: msg.profiles?.username || 'Usuario anónimo'
      })));
    } catch (error) {
      console.error('Error fetching messages:', error.message, error.details);
    }
  }, [eventId]);

  useEffect(() => {
    fetchMessages();
    
    channelRef.current = supabase.channel(`public:event_chats:event_id=eq.${eventId}`);
    
    channelRef.current
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'event_chats',
          filter: `event_id=eq.${eventId}`
        }, 
        payload => {
          console.log('New message received:', payload.new);
          setMessages(prevMessages => [...prevMessages, {
            ...payload.new,
            username: 'Usuario' // Temporary username, you might want to fetch the actual username
          }]);
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
  }, [eventId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
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
      console.error('Error sending message:', error.message, error.details);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.user_id === currentUser?.id ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                message.user_id === currentUser?.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm font-medium">{message.username}</p>
              <p className="break-words">{message.message}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex items-center bg-white border-t p-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white p-2 rounded-r-lg hover:bg-purple-700 transition duration-300"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}