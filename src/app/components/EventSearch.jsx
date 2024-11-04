'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from 'lucide-react'

export default function EventSearch({ 
  onSearchResults, 
  onReset, 
  allEvents, 
  placeholder = "Buscar eventos por ciudad o nombre...", 
  buttonText = "Buscar" 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = allEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      onSearchResults(results);
    } catch (error) {
      console.error('Error searching events:', error)
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  const handleReset = () => {
    setSearchTerm('');
    onReset();
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
      <h2 className="text-xl font-display mb-4">Búsqueda de Eventos</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white pl-10 w-full"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isSearching ? 'Buscando...' : buttonText}
          </Button>
          <Button 
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white flex-1 sm:flex-none"
          >
            Ver todos
          </Button>
        </div>
      </div>
    </div>
  )
}