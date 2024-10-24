'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ConversationList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [newConversationUserId, setNewConversationUserId] = useState('')

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchConversations()
    }
  }, [currentUser])

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error fetching current user:', error)
      return
    }
    setCurrentUser(user)
  }

  const fetchConversations = async () => {
    const { data: participations, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversations(id, name, is_group, updated_at),
        user:users!conversation_participants_user_id_fkey(id, name)
      `)
      .eq('user_id', currentUser.id)
      .order('conversation.updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return
    }

    const formattedConversations = participations.map(({ conversation, user }) => ({
      ...conversation,
      otherUser: user.id !== currentUser.id ? user : null
    }))

    setConversations(formattedConversations)
  }

  const startNewConversation = async () => {
    if (!newConversationUserId) {
      alert('Por favor, introduce el ID del usuario con el que quieres chatear.')
      return
    }

    const { data, error } = await supabase.rpc('start_conversation', {
      other_user_id: newConversationUserId,
      is_group: false
    })

    if (error) {
      console.error('Error starting new conversation:', error)
      alert('Error al iniciar la conversación. Por favor, inténtalo de nuevo.')
      return
    }

    // Actualizar la lista de conversaciones
    fetchConversations()
    setNewConversationUserId('')
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <h2 className="text-lg font-semibold p-4 border-b">Conversaciones</h2>
      <div className="p-4 border-b">
        <input
          type="text"
          value={newConversationUserId}
          onChange={(e) => setNewConversationUserId(e.target.value)}
          placeholder="ID del usuario"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={startNewConversation}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Nueva conversación
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="font-medium">
              {conversation.is_group ? conversation.name : conversation.otherUser?.name}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(conversation.updated_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}