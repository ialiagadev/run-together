import React, { useState } from 'react'
import { Plus, X, Calendar, Search, MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const QuickActionFAB = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const actions = [
    { icon: Calendar, label: 'Crear Evento', href: '/create-event' },
    { icon: Search, label: 'Explorar Eventos', href: '/events' },
    { icon: MessageCircle, label: 'Mis Chats', href: '/chats' },
  ]

  return (
    <div className="fixed right-4 bottom-20 z-50">
      <div className={`flex flex-col-reverse items-end space-y-2 space-y-reverse transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <Link key={action.href} href={action.href}>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-purple-600 shadow-lg hover:bg-purple-100 transition-all duration-300"
              style={{
                transform: isOpen ? 'scale(1)' : 'scale(0)',
                transition: `transform 300ms ${index * 50}ms`
              }}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
      <Button
        size="icon"
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'
        }`}
        onClick={toggleMenu}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}

export default QuickActionFAB

