"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { supabase } from "../lib/supabaseClient"

export default function CreateEventForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    distance: "",
    description: "",
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const validateForm = () => {
    let formErrors = {}
    if (formData.title.length < 2) {
      formErrors.title = "El título debe tener al menos 2 caracteres."
    }
    if (!formData.date) {
      formErrors.date = "Se requiere una fecha para el evento."
    }
    if (formData.location.length < 2) {
      formErrors.location = "La ubicación debe tener al menos 2 caracteres."
    }
    if (!formData.distance) {
      formErrors.distance = "Por favor, especifica la distancia del evento."
    }
    if (formData.description.length < 10) {
      formErrors.description = "La descripción debe tener al menos 10 caracteres."
    }
    return formErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formErrors = validateForm()
    if (Object.keys(formErrors).length === 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user logged in")

        const { data, error } = await supabase
          .from('events')
          .insert([
            { 
              title: formData.title,
              date: formData.date,
              location: formData.location,
              distance: formData.distance,
              description: formData.description,
              created_by: user.id
            }
          ])

        if (error) throw error

        alert("Evento creado exitosamente")
        router.push("/dashboard")
      } catch (error) {
        alert("Hubo un problema al crear el evento. Por favor, intenta de nuevo.")
        console.error('Error:', error)
      }
    } else {
      setErrors(formErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Evento</h2>
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título del evento
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="Maratón de la Ciudad"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Fecha del evento
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-purple-500"
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        {errors.date && (
          <p className="mt-2 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="Parque Central, Ciudad"
        />
        {errors.location && (
          <p className="mt-2 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
          Distancia
        </label>
        <input
          type="text"
          id="distance"
          name="distance"
          value={formData.distance}
          onChange={handleChange}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="5K, 10K, 42K"
        />
        {errors.distance && (
          <p className="mt-2 text-sm text-red-600">{errors.distance}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-purple-500"
          placeholder="Describe los detalles del evento, como el recorrido, premios, etc."
        ></textarea>
        {errors.description && (
          <p className="mt-2 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:shadow-outline transition duration-300"
        >
          Crear Evento
        </button>
      </div>
    </form>
  )
}