'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from 'lucide-react'

export default function EventSearch({ onSearchResults, onReset, allEvents, placeholder = "Buscar eventos por ciudad o nombre...", buttonText = "Buscar" }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = allEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="p-6 rounded-xl bg-black/30 border border-white/20 backdrop-blur-md shadow-lg">
      <h2 className="text-xl font-display mb-4">Búsqueda de Eventos</h2>
      <div className="flex gap-4">
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/5 border-white/10 text-white flex-grow"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch}
          className="bg-purple-500 hover:bg-purple-600 text-white"
          disabled={isSearching}
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? 'Buscando...' : buttonText}
        </Button>
        <Button 
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        >
          Ver todos
        </Button>
      </div>
    </div>
  )
}