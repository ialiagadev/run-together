import Link from 'next/link'
import Image from 'next/image'
import { Home, Calendar, User, MessageCircle, CalendarDays, LogOut, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import useLogout from './logout'

export default function Sidebar() {
  const handleLogout = useLogout()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Inicio' },
    { href: '/profile', icon: User, label: 'Perfil' },
    { href: '/chats', icon: MessageCircle, label: 'Chats' },
    { href: '/userevents', icon: Calendar, label: 'Mis Eventos' },
    { href: '/events', icon: CalendarDays, label: 'Todos los Eventos' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex justify-center items-center">
        <Image
          src="/images/logo.png"
          alt="SocialKM Logo"
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
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-gray-300 
                       hover:text-white hover:bg-purple-500/20 transition-colors group"
            >
              <div className="p-1 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/30 transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
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

