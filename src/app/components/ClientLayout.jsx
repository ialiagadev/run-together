'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-black">
      {/* Gradiente base */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-900/50" />

      {/* Efecto de ruido */}
      <div className="fixed inset-0 opacity-50" style={{ 
        backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E')",
        mixBlendMode: 'overlay'
      }} />

      {/* Círculos estáticos */}
      <div className="fixed inset-0">
        <div className="absolute rounded-full bg-purple-500/20 w-[400px] h-[400px] left-[10%] top-[20%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(80px)' }} />
        <div className="absolute rounded-full bg-purple-500/10 w-[600px] h-[600px] left-[80%] top-[50%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(100px)' }} />
        <div className="absolute rounded-full bg-purple-500/15 w-[500px] h-[500px] left-[50%] top-[80%] transform -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(90px)' }} />
      </div>

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-black/60 border-r border-white/10 backdrop-blur-xl
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}>
          <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-black/60 border-b border-white/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={toggleSidebar}
                    className="mr-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
                    aria-label="Toggle sidebar"
                  >
                    {sidebarOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                  <h1 className="text-2xl font-display">RunTogether</h1>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>

          {/* Footer */}
          <footer className="py-4 text-center text-sm text-gray-500 bg-black/60 backdrop-blur-xl">
            © {new Date().getFullYear()} RunTogether. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </div>
  )
}