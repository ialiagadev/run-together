'use client'

import { useState } from 'react'
import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat</h1>
      <div className="flex space-x-4">
        <div className="w-1/3">
          <ConversationList onSelectConversation={setSelectedConversation} />
        </div>
        <div className="w-2/3">
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} />
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">Selecciona una conversación para comenzar a chatear</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}