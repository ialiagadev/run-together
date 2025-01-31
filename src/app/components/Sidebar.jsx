import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Calendar, User, MessageCircle, Settings, LogOut, PlusCircle, CalendarDays, MessageSquare, UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import useLogout from './logout'
import { supabase } from '@/app/lib/supabaseClient'
import { useAuth } from '@/app/contexts/AuthContext'

export default function Sidebar() {
  const handleLogout = useLogout()
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    if (user) {
      fetchPendingRequests()
    }
  }, [user])

  const fetchPendingRequests = async () => {
    try {
      // Primero, obtenemos los eventos creados por el usuario actual
      const { data: userEvents, error: userEventsError } = await supabase
        .from('events')
        .select('id')
        .eq('created_by', user.id)

      if (userEventsError) throw userEventsError

      const userEventIds = userEvents.map(event => event.id)

      // Luego, contamos las solicitudes pendientes para esos eventos
      const { count, error } = await supabase
        .from('event_requests')
        .select('id', { count: 'exact' })
        .in('event_id', userEventIds)
        .eq('status', 'pending')

      if (error) throw error
      setPendingRequests(count)
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Inicio' },
    { href: '/profile', icon: User, label: 'Perfil' },
    { href: '/chats', icon: MessageCircle, label: 'Chats' },
    { href: '/userevents', icon: Calendar, label: 'Mis Eventos' },
    { href: '/events', icon: CalendarDays, label: 'Todos los Eventos' },
    { href: '/messages', icon: MessageSquare, label: 'Mensajes' },
    { href: '/solicitudes', icon: UserPlus, label: 'Solicitudes', badge: pendingRequests },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex justify-center items-center">
        <Image
          src="/images/logo.png"
          alt="RunTogether Logo"
          width={150}
          height={50}
          className="object-contain"
        />
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-lg text-gray-300 
                       hover:text-white hover:bg-purple-500/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/30 transition-colors">
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <Badge variant="destructive" className="bg-red-500 text-white">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 mt-auto space-y-4 border-t border-white/10">
        <Link href="/create-event" className="block">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 
                     hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Crear Evento
          </Button>
        </Link>

        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-500/20"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

