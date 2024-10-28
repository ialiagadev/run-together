// app/events/[id]/chat/page.jsx
'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import EventChat from '@/app/components/EvenChat'

export default function EventChatPage() {
  const { id: eventId } = useParams()
  const { user } = useAuth()
  const [eventTitle, setEventTitle] = useState('')

  useEffect(() => {
    fetchEventDetails()
  }, [eventId])

  const fetchEventDetails = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event details:', error)
    } else {
      setEventTitle(data.title)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm z-10 p-4">
        <h1 className="text-2xl font-semibold text-gray-900">Chat del evento: {eventTitle}</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <EventChat eventId={eventId} currentUser={user} />
      </main>
    </div>
  )
}