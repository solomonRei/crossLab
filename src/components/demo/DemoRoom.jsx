import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Circle,
  Square,
  Users,
  MessageSquare,
  Settings,
  Phone,
  PhoneOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { useToast } from '../ui/Toast';

import { useDemoState, DEMO_SESSION_STATUS } from '../../hooks/demo/useDemoState';
import { useWebRTC } from '../../hooks/demo/useWebRTC';
import { useScreenShare } from '../../hooks/demo/useScreenShare';

import { VideoStream } from './VideoStream';
import { ScreenShare } from './ScreenShare';
import { ParticipantsList } from './ParticipantsList';
import { ChatPanel } from './ChatPanel';
import { RecordingControls } from './RecordingControls';
import { DemoControls } from './DemoControls';

export const DemoRoom = ({ sessionId, userRole = 'participant' }) => {
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainView, setMainView] = useState('video'); // 'video' | 'screen'

  const containerRef = useRef(null);
  const { toast } = useToast();

  // Demo state management
  const {
    session,
    participants,
    recordings,
    isLoading,
    isRecording,
    error,
    startSession,
    endSession,
    startRecording,
    stopRecording,
    isLive,
    isScheduled,
    canStart,
    canEnd
  } = useDemoState(sessionId);

  // WebRTC for video/audio
  const {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    initializeMedia,
    toggleVideo,
    toggleAudio,
    stopLocalStream,
    localVideoRef,
    hasLocalStream,
    remoteStreamsArray,
    connectedPeersCount
  } = useWebRTC();

  // Screen sharing
  const {
    screenStream,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    screenVideoRef,
    isScreenShareSupported
  } = useScreenShare();

  // Initialize media when component mounts
  useEffect(() => {
    const init = async () => {
      if (userRole === 'host' || userRole === 'presenter') {
        await initializeMedia();
      }
    };
    init();
  }, [userRole, initializeMedia]);

  // Handle session status changes
  useEffect(() => {
    if (session?.status === DEMO_SESSION_STATUS.LIVE && !hasLocalStream && userRole !== 'observer') {
      initializeMedia();
    }
  }, [session?.status, hasLocalStream, userRole, initializeMedia]);

  // Fullscreen handling
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle session start
  const handleStartSession = async () => {
    const success = await startSession();
    if (success) {
      await initializeMedia();
    }
  };

  // Handle session end
  const handleEndSession = async () => {
    await endSession();
    stopLocalStream();
    if (isScreenSharing) {
      stopScreenShare();
    }
  };

  // Handle recording toggle
  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // Handle screen share toggle
  const handleScreenShareToggle = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      setMainView('video');
    } else {
      await startScreenShare();
      setMainView('screen');
    }
  };

  // Handle main view toggle
  const handleViewToggle = () => {
    setMainView(prev => prev === 'video' ? 'screen' : 'video');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading demo session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Demo Session Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Demo Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">The requested demo session could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{session.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Badge 
                variant={isLive ? 'destructive' : isScheduled ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {session.status}
              </Badge>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <Circle className="h-3 w-3 mr-1" />
                  REC
                </Badge>
              )}
              <span>{participants.length} participants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Session Controls */}
          {userRole === 'host' && (
            <>
              {canStart && (
                <Button onClick={handleStartSession} className="bg-green-600 hover:bg-green-700">
                  Start Session
                </Button>
              )}
              {canEnd && (
                <Button onClick={handleEndSession} variant="destructive">
                  End Session
                </Button>
              )}
            </>
          )}

          {/* View Toggle */}
          {isScreenSharing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewToggle}
              className="text-white border-gray-600"
            >
              {mainView === 'video' ? <Monitor className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            </Button>
          )}

          {/* Fullscreen */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white border-gray-600"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Leave Session */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.close()}
            className="text-white border-gray-600"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-black">
            <AnimatePresence mode="wait">
              {mainView === 'screen' && isScreenSharing ? (
                <motion.div
                  key="screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <ScreenShare
                    screenStream={screenStream}
                    screenVideoRef={screenVideoRef}
                    isPresenter={userRole === 'host' || userRole === 'presenter'}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <VideoStream
                    localStream={localStream}
                    remoteStreams={remoteStreamsArray}
                    localVideoRef={localVideoRef}
                    isVideoEnabled={isVideoEnabled}
                    userRole={userRole}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <DemoControls
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenSharing={isScreenSharing}
                isRecording={isRecording}
                onToggleVideo={toggleVideo}
                onToggleAudio={toggleAudio}
                onToggleScreenShare={handleScreenShareToggle}
                onToggleRecording={handleRecordingToggle}
                userRole={userRole}
                canRecord={userRole === 'host'}
                isScreenShareSupported={isScreenShareSupported}
              />
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {(isParticipantsOpen || isChatOpen) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800 border-l border-gray-700 flex flex-col"
            >
              {/* Panel Tabs */}
              <div className="flex border-b border-gray-700">
                <Button
                  variant={isParticipantsOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setIsParticipantsOpen(true);
                    setIsChatOpen(false);
                  }}
                  className="flex-1 rounded-none text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Participants ({participants.length})
                </Button>
                <Button
                  variant={isChatOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setIsChatOpen(true);
                    setIsParticipantsOpen(false);
                  }}
                  className="flex-1 rounded-none text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {isParticipantsOpen && (
                  <ParticipantsList 
                    participants={participants}
                    currentUserRole={userRole}
                  />
                )}
                {isChatOpen && (
                  <ChatPanel 
                    sessionId={sessionId}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel Toggle */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex justify-center gap-2">
        <Button
          variant={isParticipantsOpen ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => {
            setIsParticipantsOpen(!isParticipantsOpen);
            setIsChatOpen(false);
          }}
          className="text-white border-gray-600"
        >
          <Users className="h-4 w-4 mr-2" />
          Participants ({participants.length})
        </Button>
        
        <Button
          variant={isChatOpen ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            setIsParticipantsOpen(false);
          }}
          className="text-white border-gray-600"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>

        {userRole === 'host' && (
          <RecordingControls
            isRecording={isRecording}
            recordings={recordings}
            onStartRecording={() => startRecording()}
            onStopRecording={() => stopRecording()}
          />
        )}
      </div>
    </div>
  );
}; 