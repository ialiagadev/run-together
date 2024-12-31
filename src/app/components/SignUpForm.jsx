'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setLoading(true)
      const { data, error } = await signUp({ email, password })
      if (error) throw error
      console.log('Sign up data:', data)
      setRegistrationComplete(true)
    } catch (error) {
      console.error('SignUp error:', error)
      setError('Error durante el registro: ' + (error.message || 'Intente nuevamente más tarde'))
    } finally {
      setLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <Card className="w-full max-w-md bg-black/60 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-400">
            Registro Completado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>Verifica tu correo electrónico</AlertTitle>
            <AlertDescription>
              Se ha enviado un correo de confirmación a {email} desde supabase. 
              Por favor, verifica tu bandeja de entrada y inicia sesión para activar tu cuenta.
            </AlertDescription>
          </Alert>
          <p className="text-center text-white mb-4">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo correo de confirmación.
          </p>
          <Button
            onClick={() => router.push('/signin')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Ir a Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/50 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-black/60 border-white/20 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-purple-400">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Ingresa tus datos para registrarte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">
                Confirmar contraseña
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/signin"
                className="text-purple-400 hover:text-purple-300 hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
