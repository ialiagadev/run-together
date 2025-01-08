'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, MapPin, Globe, Lock } from 'lucide-react'
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
import { Switch } from "@/components/ui/switch"
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
    isPublic: true,
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

  const handleSwitchChange = (checked) => {
    setFormData(prevData => ({
      ...prevData,
      isPublic: checked
    }))
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
              created_by: user.id,
              is_public: formData.isPublic
            }
          ])
          .select()

        if (error) throw error

        console.log('Event created successfully:', data)

        // The creator is now automatically added as a participant due to the Supabase trigger
        // We don't need to manually insert into event_participants

        // Add a chat message to indicate the event creation
        const { error: chatError } = await supabase
          .from('event_chats')
          .insert([
            { 
              event_id: data[0].id, 
              user_id: user.id, 
              message: `${user.email} ha creado el evento.` 
            }
          ])

        if (chatError) throw chatError

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
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-white">Crear Nuevo Evento</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="isPublic" className="text-white font-semibold">
              {formData.isPublic ? (
                <>
                  <Globe className="inline-block w-4 h-4 mr-2" />
                  Público
                </>
              ) : (
                <>
                  <Lock className="inline-block w-4 h-4 mr-2" />
                  Privado
                </>
              )}
            </Label>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={handleSwitchChange}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
            />
          </div>
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

