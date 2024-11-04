'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

export default function useLogout() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/') // Redirige a la página principal
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message)
    }
  }

  return handleLogout
}