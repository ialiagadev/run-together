import Link from 'next/link'
import { Home, Calendar, User, MessageCircle, Settings, LogOut, PlusCircle } from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="bg-purple-600 text-white h-screen w-64 fixed left-0 top-0 p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">RunTogether</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard" className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-lg transition duration-200">
              <Home size={24} />
              <span>Inicio</span>
            </Link>
          </li>
          <li>
            <Link href="/events" className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-lg transition duration-200">
              <Calendar size={24} />
              <span>Eventos</span>
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-lg transition duration-200">
              <User size={24} />
              <span>Perfil</span>
            </Link>
          </li>
          <li>
            <Link href="/chats" className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-lg transition duration-200">
              <MessageCircle size={24} />
              <span>Chats</span>
            </Link>
          </li>
          <li>
            <Link href="/settings" className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-lg transition duration-200">
              <Settings size={24} />
              <span>Configuración</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <Link href="/events/create" className="flex items-center justify-center space-x-2 bg-white text-purple-600 p-2 rounded-lg hover:bg-gray-200 transition duration-200">
          <PlusCircle size={24} />
          <span>Crear Evento</span>
        </Link>
        <button className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-lg transition duration-200 mt-4 w-full">
          <LogOut size={24} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}