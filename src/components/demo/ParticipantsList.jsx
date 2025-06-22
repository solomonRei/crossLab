import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown,
  MoreVertical,
  UserPlus
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ScrollArea } from '../ui/ScrollArea';

const ParticipantItem = ({ participant, currentUserRole, isCurrentUser = false }) => {
  const displayName = `${participant.firstName || ''} ${participant.lastName || ''}`.trim() 
    || participant.userName 
    || participant.email;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'host':
        return <Badge variant="destructive" className="text-xs">Host</Badge>;
      case 'presenter':
        return <Badge variant="secondary" className="text-xs">Presenter</Badge>;
      case 'observer':
        return <Badge variant="outline" className="text-xs">Observer</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={participant.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {participant.firstName?.[0] || participant.userName?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm truncate">
            {displayName}
            {isCurrentUser && ' (You)'}
          </p>
          {participant.role === 'host' && (
            <Crown className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {getRoleBadge(participant.role)}
          
          <div className="flex items-center gap-1">
            {participant.isAudioEnabled ? (
              <Mic className="h-3 w-3 text-green-500" />
            ) : (
              <MicOff className="h-3 w-3 text-red-500" />
            )}
            
            {participant.isVideoEnabled ? (
              <Video className="h-3 w-3 text-green-500" />
            ) : (
              <VideoOff className="h-3 w-3 text-gray-500" />
            )}
          </div>
        </div>
      </div>
      
      {currentUserRole === 'host' && !isCurrentUser && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};

export const ParticipantsList = ({ 
  participants = [], 
  currentUserRole = 'participant',
  currentUserId = null 
}) => {
  const sortedParticipants = [...participants].sort((a, b) => {
    // Sort by role priority: host > presenter > participant > observer
    const rolePriority = { host: 4, presenter: 3, participant: 2, observer: 1 };
    return (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0);
  });

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h3 className="text-white font-semibold">
              Participants ({participants.length})
            </h3>
          </div>
          
          {currentUserRole === 'host' && (
            <Button
              variant="outline"
              size="sm"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          )}
        </div>
      </div>

      {/* Participants List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedParticipants.length > 0 ? (
            sortedParticipants.map((participant) => (
              <ParticipantItem
                key={participant.id}
                participant={participant}
                currentUserRole={currentUserRole}
                isCurrentUser={participant.id === currentUserId}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No participants yet</p>
              <p className="text-sm">Waiting for others to join...</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with session info */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>Session participants</span>
          <span>{participants.length} connected</span>
        </div>
      </div>
    </div>
  );
}; 