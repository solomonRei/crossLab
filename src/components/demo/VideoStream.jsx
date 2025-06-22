import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  VideoOff, 
  MicOff, 
  User,
  Pin,
  Maximize2
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const VideoTile = ({ 
  stream, 
  isLocal = false, 
  participant = null, 
  isVideoEnabled = true, 
  isAudioEnabled = true,
  isPinned = false,
  onPin,
  onMaximize,
  className = ""
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const displayName = participant 
    ? `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.userName || participant.email
    : isLocal ? 'You' : 'Unknown';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700
        group hover:border-blue-500 transition-all duration-200
        ${className}
      `}
    >
      {/* Video Element */}
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage src={participant?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                {participant?.firstName?.[0] || participant?.userName?.[0] || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-medium">{displayName}</p>
            {!isVideoEnabled && (
              <div className="flex items-center justify-center mt-2">
                <VideoOff className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Camera off</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-3 right-3 flex gap-2">
          {onPin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPin(!isPinned)}
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
            >
              <Pin className={`h-4 w-4 ${isPinned ? 'text-blue-400' : 'text-white'}`} />
            </Button>
          )}
          {onMaximize && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onMaximize}
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
            >
              <Maximize2 className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Name and Status Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm truncate">
              {displayName}
            </span>
            {isLocal && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
            {isPinned && (
              <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                Pinned
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isAudioEnabled && (
              <div className="bg-red-500 rounded-full p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const VideoStream = ({ 
  localStream, 
  remoteStreams = [], 
  localVideoRef,
  isVideoEnabled = true,
  userRole = 'participant'
}) => {
  const [pinnedParticipant, setPinnedParticipant] = React.useState(null);
  const [layout, setLayout] = React.useState('grid'); // 'grid' | 'speaker'

  // Calculate grid layout based on number of participants
  const totalParticipants = 1 + remoteStreams.length; // +1 for local stream
  
  const getGridCols = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const gridCols = getGridCols(totalParticipants);

  const handlePin = (participantId, isPinned) => {
    setPinnedParticipant(isPinned ? participantId : null);
    setLayout(isPinned ? 'speaker' : 'grid');
  };

  if (layout === 'speaker' && pinnedParticipant) {
    // Speaker view with pinned participant
    const pinnedStream = pinnedParticipant === 'local' 
      ? { stream: localStream, isLocal: true }
      : remoteStreams.find(([id]) => id === pinnedParticipant);

    return (
      <div className="w-full h-full flex flex-col">
        {/* Main speaker view */}
        <div className="flex-1 p-4">
          <VideoTile
            stream={pinnedStream?.stream || pinnedStream?.[1]}
            isLocal={pinnedStream?.isLocal || pinnedParticipant === 'local'}
            participant={pinnedStream?.participant}
            isVideoEnabled={pinnedParticipant === 'local' ? isVideoEnabled : true}
            isPinned={true}
            onPin={(pinned) => handlePin(pinnedParticipant, pinned)}
            className="w-full h-full"
          />
        </div>

        {/* Thumbnail strip */}
        <div className="h-32 border-t border-gray-700 bg-gray-800 p-2">
          <div className="flex gap-2 h-full overflow-x-auto">
            {/* Local video thumbnail */}
            {pinnedParticipant !== 'local' && (
              <VideoTile
                stream={localStream}
                isLocal={true}
                isVideoEnabled={isVideoEnabled}
                onPin={(pinned) => handlePin('local', pinned)}
                className="w-24 h-full flex-shrink-0"
              />
            )}
            
            {/* Remote video thumbnails */}
            {remoteStreams
              .filter(([id]) => id !== pinnedParticipant)
              .map(([id, stream, participant]) => (
                <VideoTile
                  key={id}
                  stream={stream}
                  participant={participant}
                  onPin={(pinned) => handlePin(id, pinned)}
                  className="w-24 h-full flex-shrink-0"
                />
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="w-full h-full p-4">
      <div className={`grid ${gridCols} gap-4 h-full`}>
        {/* Local video */}
        <VideoTile
          stream={localStream}
          isLocal={true}
          isVideoEnabled={isVideoEnabled}
          onPin={(pinned) => handlePin('local', pinned)}
          className="aspect-video"
        />
        
        {/* Remote videos */}
        {remoteStreams.map(([id, stream, participant]) => (
          <VideoTile
            key={id}
            stream={stream}
            participant={participant}
            onPin={(pinned) => handlePin(id, pinned)}
            className="aspect-video"
          />
        ))}
        
        {/* Empty slots for better layout */}
        {totalParticipants < 4 && Array.from({ length: 4 - totalParticipants }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-video" />
        ))}
      </div>
    </div>
  );
}; 