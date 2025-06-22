import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Pin,
  Maximize2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';

// Local Video Tile Component
const LocalVideoTile = ({ localStream, localVideoRef, isVideoEnabled, userRole }) => {
  const internalVideoRef = useRef(null);
  const videoRef = localVideoRef || internalVideoRef;

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
      console.log('Local video stream set:', { 
        streamId: localStream.id, 
        videoTracks: localStream.getVideoTracks().length,
        audioTracks: localStream.getAudioTracks().length,
        isVideoEnabled 
      });
    }
  }, [localStream, videoRef, isVideoEnabled]);

  // Check if we have video tracks and they are enabled
  const hasVideoTrack = localStream && localStream.getVideoTracks().length > 0;
  const videoTrackEnabled = hasVideoTrack && localStream.getVideoTracks()[0].enabled;
  const shouldShowVideo = hasVideoTrack && isVideoEnabled && videoTrackEnabled;

  console.log('LocalVideoTile render:', { 
    hasVideoTrack, 
    videoTrackEnabled, 
    isVideoEnabled, 
    shouldShowVideo 
  });

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg h-full">
      {shouldShowVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <User className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-gray-300 text-lg font-medium">You</p>
            <p className="text-gray-500 text-sm">
              {!hasVideoTrack ? 'No camera detected' : 
               !isVideoEnabled ? 'Camera off' : 
               'Camera starting...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Local video overlay */}
      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">You</span>
      </div>
      
      {/* Video status indicator */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        {!shouldShowVideo && (
          <div className="bg-red-600 rounded-full p-2">
            <VideoOff className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

// Remote Video Tile Component  
const RemoteVideoTile = ({ userId, stream, isPinned, onPin, onMaximize }) => {
  const videoRef = useRef(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Monitor track status
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        videoTrack.addEventListener('ended', () => setIsVideoEnabled(false));
      }
      
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        audioTrack.addEventListener('ended', () => setIsAudioEnabled(false));
      }
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg group">
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-3 mx-auto">
              <User className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-300 text-sm font-medium">Participant</p>
            <p className="text-gray-500 text-xs">Camera off</p>
          </div>
        </div>
      )}
      
      {/* Participant name overlay */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
        <span className="text-white text-xs font-medium">
          Participant {userId.slice(-4)}
        </span>
      </div>
      
      {/* Status indicators */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {!isVideoEnabled && (
          <div className="bg-red-600 rounded-full p-1">
            <VideoOff className="h-3 w-3 text-white" />
          </div>
        )}
        {!isAudioEnabled && (
          <div className="bg-red-600 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Hover controls */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <Button
          size="sm"
          onClick={() => onPin?.(userId)}
          className="bg-black/60 hover:bg-black/80 text-white border-none"
        >
          <Pin className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={() => onMaximize?.(userId)}
          className="bg-black/60 hover:bg-black/80 text-white border-none"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export const VideoStream = ({ 
  localStream, 
  remoteStreams = [], 
  localVideoRef,
  isVideoEnabled = true,
  userRole = 'participant'
}) => {
  const [pinnedParticipant, setPinnedParticipant] = useState(null);
  const [layout, setLayout] = useState('grid'); // 'grid' | 'speaker'

  // Calculate grid layout based on number of participants
  const totalParticipants = 1 + remoteStreams.length;
  
  const getGridLayout = () => {
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  const getGridRows = () => {
    if (totalParticipants <= 2) return 'grid-rows-1';
    if (totalParticipants <= 4) return 'grid-rows-2';
    if (totalParticipants <= 6) return 'grid-rows-2 lg:grid-rows-2';
    return 'grid-rows-3';
  };

  // Handle pin participant
  const handlePinParticipant = (userId) => {
    setPinnedParticipant(pinnedParticipant === userId ? null : userId);
    setLayout(pinnedParticipant === userId ? 'grid' : 'speaker');
  };

  // Handle maximize participant
  const handleMaximizeParticipant = (userId) => {
    // Could implement full-screen participant view
    console.log('Maximize participant:', userId);
  };

  // If no participants and no local stream, show waiting state
  if (!localStream && remoteStreams.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg border border-gray-700">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Starting camera...</h3>
          <p className="text-gray-400 text-sm">
            Please allow camera and microphone access
          </p>
        </motion.div>
      </div>
    );
  }

  // If only local stream, show just local video with waiting message
  if (localStream && remoteStreams.length === 0) {
    return (
      <div className="w-full h-full p-8 bg-black flex items-center justify-center">
        <div className="w-full h-full max-w-4xl max-h-3xl flex flex-col">
          <div className="flex-1 mb-4">
            <LocalVideoTile
              localStream={localStream}
              localVideoRef={localVideoRef}
              isVideoEnabled={isVideoEnabled}
              userRole={userRole}
            />
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-lg">Waiting for other participants to join...</p>
            <p className="text-gray-500 text-sm mt-2">Share the session link to invite others</p>
          </div>
        </div>
      </div>
    );
  }

  // Speaker view with pinned participant
  if (layout === 'speaker' && pinnedParticipant) {
    const pinnedStream = remoteStreams.find(([userId]) => userId === pinnedParticipant);
    const otherStreams = remoteStreams.filter(([userId]) => userId !== pinnedParticipant);

    return (
      <div className="w-full h-full flex flex-col bg-black">
        {/* Main speaker view */}
        <div className="flex-1 p-4">
          {pinnedStream ? (
            <RemoteVideoTile
              userId={pinnedStream[0]}
              stream={pinnedStream[1]}
              isPinned={true}
              onPin={handlePinParticipant}
              onMaximize={handleMaximizeParticipant}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg"></div>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="h-32 p-2 flex gap-2 overflow-x-auto">
          {/* Local video thumbnail */}
          <div className="w-24 h-24 flex-shrink-0">
            <LocalVideoTile
              localStream={localStream}
              localVideoRef={localVideoRef}
              isVideoEnabled={isVideoEnabled}
              userRole={userRole}
            />
          </div>

          {/* Other participants thumbnails */}
          {otherStreams.map(([userId, stream]) => (
            <div key={userId} className="w-24 h-24 flex-shrink-0">
              <RemoteVideoTile
                userId={userId}
                stream={stream}
                isPinned={false}
                onPin={handlePinParticipant}
                onMaximize={handleMaximizeParticipant}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="w-full h-full p-4 bg-black">
      <div className={`
        grid gap-4 h-full
        ${getGridLayout()} ${getGridRows()}
      `}>
        {/* Local video */}
        <LocalVideoTile
          localStream={localStream}
          localVideoRef={localVideoRef}
          isVideoEnabled={isVideoEnabled}
          userRole={userRole}
        />

        {/* Remote videos */}
        {remoteStreams.map(([userId, stream]) => (
          <RemoteVideoTile
            key={userId}
            userId={userId}
            stream={stream}
            isPinned={pinnedParticipant === userId}
            onPin={handlePinParticipant}
            onMaximize={handleMaximizeParticipant}
          />
        ))}
      </div>
    </div>
  );
}; 