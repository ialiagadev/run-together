'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, MessageCircle, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/events', icon: Calendar, label: 'Eventos' },
  { href: '/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 px-4 py-2">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href ? 'text-purple-500' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

