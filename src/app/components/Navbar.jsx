'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [message, setMessage] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black bg-opacity-80' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
       
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="text-white hover:text-purple-300 transition duration-300 text-sm">
                Perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-purple-300 transition duration-300 text-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-white hover:text-purple-300 transition duration-300 text-sm">
                Iniciar sesión
              </Link>
              <Link href="/signup" className="text-white hover:text-purple-300 transition duration-300 text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-full">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
      {message && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300">
          {message}
        </div>
      )}
    </nav>
  )
}