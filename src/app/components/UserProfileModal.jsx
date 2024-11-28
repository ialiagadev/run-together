import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Trophy } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user }) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-900/50 to-black text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-purple-300">Perfil de Usuario</DialogTitle>
        </DialogHeader>
        <div className="mt-6 flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback className="bg-purple-600 text-white text-2xl">
              {user.username ? user.username[0].toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
          {user.name && <p className="text-gray-300 mb-4">{user.name}</p>}
          {user.bio && <p className="text-center text-gray-400 mb-4">{user.bio}</p>}
          <div className="w-full space-y-2">
            {user.age && (
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                <span>{user.age} años</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                <span>{user.location}</span>
              </div>
            )}
            {user.running_frequency && (
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-400" />
                <span>Corre {user.running_frequency}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

