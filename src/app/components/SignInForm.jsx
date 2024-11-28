'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn({ email, password })
      // Si llegamos aquí, el inicio de sesión fue exitoso
      // El AuthContext debería manejar la redirección, así que no necesitamos hacer nada más aquí
    } catch (error) {
      console.error('Error de inicio de sesión:', error)
      setError('Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black/60 p-8 rounded-xl backdrop-blur-sm border border-purple-500/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-400">
            Inicia sesión en tu cuenta
          </h2>
        </div>
        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="bg-white/5 border-white/10 text-white"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="bg-white/5 border-white/10 text-white"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link href="/signup" className="font-medium text-purple-400 hover:text-purple-300">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}

