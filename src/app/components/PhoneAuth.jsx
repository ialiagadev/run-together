import { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'verify'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signInWithPhone, verifyOtp } = useAuth()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Intentando enviar código a:', phoneNumber)
      const { success, data, error } = await signInWithPhone(phoneNumber)
      if (error) throw error
      if (success) {
        console.log('Código enviado con éxito')
        setStep('verify')
      } else {
        throw new Error('No se pudo enviar el código')
      }
    } catch (error) {
      console.error('Error al enviar el código:', error)
      setError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { success, data } = await verifyOtp(phoneNumber, verificationCode)
      if (success) {
        // Autenticación exitosa, redirigir al usuario
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <Label htmlFor="phone">Número de teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+34600000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enviar código
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verificar
          </Button>
        </form>
      )}
    </div>
  )
}

