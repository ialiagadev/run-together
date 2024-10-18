'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      setMessage('Gracias por usar RunTogether. ¡Hasta pronto!')
      setTimeout(() => {
        setMessage('')
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setMessage('Error al cerrar sesión')
    }
  }

  return (
    <nav className="bg-indigo-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          RunTogether
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="text-white hover:text-indigo-200">
                Perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-indigo-200"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-white hover:text-indigo-200">
                Iniciar sesión
              </Link>
              <Link href="/signup" className="text-white hover:text-indigo-200">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
      {message && (
        <div className="absolute top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {message}
        </div>
      )}
    </nav>
  )
}