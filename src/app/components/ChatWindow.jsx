'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (conversation && currentUser) {
      fetchMessages()
      subscribeToMessages()
    }
    return () => {
      supabase.removeAllSubscriptions()
    }
  }, [conversation, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error fetching current user:', error)
      return
    }
    setCurrentUser(user)
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user:users(id, name)
      `)
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data)
  }

  const subscribeToMessages = () => {
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` }, (payload) => {
        setMessages(prevMessages => [...prevMessages, payload.new])
      })
      .subscribe()
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        user_id: currentUser.id,
        content: newMessage
      })

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    setNewMessage('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-full bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {conversation.is_group ? conversation.name : conversation.otherUser?.name}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.user.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs mx-2 p-3 rounded-lg ${
              message.user.id === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}