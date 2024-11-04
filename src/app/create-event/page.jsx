'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, MapPin } from "lucide-react"
import { supabase } from "../lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateEventForm() {
  const router = useRouter()
  const [date, setDate] = useState(null)
  const [time, setTime] = useState("undefined")
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    let formErrors = {}
    
    if (!formData.title.trim()) {
      formErrors.title = "El título es obligatorio"
    }
    
    if (!formData.location.trim()) {
      formErrors.location = "La ubicación es obligatoria"
    }
    
    return formErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formErrors = validateForm()
    
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw new Error("No user logged in")

        let eventDateTime = null
        if (date && time !== "undefined") {
          eventDateTime = new Date(date)
          const [hours, minutes] = time.split(':')
          eventDateTime.setHours(parseInt(hours), parseInt(minutes))
        }

        const { data, error } = await supabase
          .from('events')
          .insert([
            { 
              title: formData.title,
              date: eventDateTime ? eventDateTime.toISOString() : null,
              location: formData.location,
              description: formData.description || null,
              created_by: user.id
            }
          ])
          .select()

        if (error) throw error

        console.log('Event created successfully:', data)
        router.push("/dashboard")
      } catch (error) {
        console.error('Error creating event:', error)
        setErrors({ submit: `Error al crear el evento: ${error.message}` })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setErrors(formErrors)
    }
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeString)
      }
    }
    return options
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="bg-black/30 border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Crear Nuevo Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Título del evento</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Ej: Maratón de la Ciudad"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Por definir"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Hora</Label>
                <Select onValueChange={setTime} value={time}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Por definir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">Por definir</SelectItem>
                    {generateTimeOptions().map((timeOption) => (
                      <SelectItem key={timeOption} value={timeOption}>
                        {timeOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                  placeholder="Ej: Parque Central, Ciudad"
                />
              </div>
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Descripción <span className="text-sm text-gray-400">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Puedes añadir algo a la descripción (opcional)"
              />
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Evento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}