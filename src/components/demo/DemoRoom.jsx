import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
  VolumeX,
  MoreVertical,
  Clock,
  UserPlus,
  FileVideo
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { useToast } from '../ui/Toast';

import { useDemoState, DEMO_SESSION_STATUS } from '../../hooks/demo/useDemoState';
import { useWebRTC } from '../../hooks/demo/useWebRTC';
import { useScreenShare } from '../../hooks/demo/useScreenShare';
import { useRecording } from '../../hooks/demo/useRecording';

import { VideoStream } from './VideoStream';
import { ScreenShare } from './ScreenShare';
import { ParticipantsList } from './ParticipantsList';
import { ChatPanel } from './ChatPanel';
import { RecordingControls } from './RecordingControls';
import { InviteParticipants } from './InviteParticipants';
import { DemoRecordings } from './DemoRecordings';
import { authApiService } from '../../services/authApi';

export const DemoRoom = ({ userRole = 'participant', onLeave }) => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('DemoRoom - URL params sessionId:', sessionId);
  console.log('DemoRoom - location state:', location.state);
  
  // Get role from location state if coming from invite or demo page
  const roleFromState = location.state?.role;
  const actualUserRole = roleFromState || userRole;
  const isAuthenticatedUser = location.state?.isAuthenticated ?? true; // Default to true for backward compatibility
  const fromDemoPage = location.state?.fromDemoPage;
  
  console.log('DemoRoom - actualUserRole:', actualUserRole);
  console.log('DemoRoom - roleFromState:', roleFromState);
  console.log('DemoRoom - userRole prop:', userRole);
  console.log('DemoRoom - isAuthenticatedUser:', isAuthenticatedUser);
  console.log('DemoRoom - fromDemoPage:', fromDemoPage);
  
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainView, setMainView] = useState('video'); // 'video' | 'screen'
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  const containerRef = useRef(null);
  const { toast } = useToast();

  // Demo state management - only if sessionId is valid
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
    joinSession,
    leaveSession,
    createRoom,
    checkRoomStatus,
    isLive,
    isScheduled,
    canStart,
    canEnd
  } = useDemoState(sessionId && sessionId !== 'null' ? sessionId : null);

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
  } = useWebRTC(sessionId && sessionId !== 'null' ? sessionId : null);

  // Screen sharing
  const {
    screenStream,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    screenVideoRef,
    isScreenShareSupported
  } = useScreenShare();

  // Recording
  const {
    startRecording: recordingStart,
    stopRecording: recordingStop,
    isRecording: recordingIsActive,
    recordingDuration
  } = useRecording(sessionId);

  // Initialize media when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (sessionId && sessionId !== 'null' && isMounted) {
        try {
          console.log('Initializing demo session for role:', actualUserRole);
          
          // First, check if room exists and create if needed
          const roomStatus = await checkRoomStatus();
          if (!roomStatus || !roomStatus.exists) {
            console.log('Room does not exist, creating room...');
            const roomCreated = await createRoom();
            if (roomCreated) {
              console.log('Room created successfully');
            } else {
              console.warn('Failed to create room, continuing anyway...');
            }
          } else {
            console.log('Room already exists:', roomStatus);
          }
          
          // Initialize media for all roles except observer
          if (actualUserRole !== 'observer') {
            await initializeMedia();
            console.log('Media initialized successfully');
          }
          
          // Auto-join session for participants (not hosts)
          if (actualUserRole === 'participant') {
            console.log('Auto-joining session as participant');
            // Only call API join if user is authenticated
            if (isAuthenticatedUser) {
              await joinSession();
            } else {
              console.log('Guest user - skipping API join call');
            }
          }
        } catch (error) {
          console.error('Failed to initialize demo session:', error);
          if (isMounted) {
            toast.error('Initialization Error', 'Failed to initialize demo session');
          }
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, [actualUserRole, sessionId, checkRoomStatus, createRoom]); // Added room functions to dependencies

  // Handle session status changes
  useEffect(() => {
    if (session?.status === DEMO_SESSION_STATUS.LIVE && !hasLocalStream && actualUserRole !== 'observer') {
      initializeMedia();
    }
  }, [session?.status, hasLocalStream, actualUserRole, initializeMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalStream();
      if (isScreenSharing) {
        stopScreenShare();
      }
    };
  }, [stopLocalStream, isScreenSharing, stopScreenShare]);

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
    try {
      // First ensure room exists
      const roomStatus = await checkRoomStatus();
      if (!roomStatus || !roomStatus.exists) {
        console.log('Creating room before starting session...');
        const roomCreated = await createRoom();
        if (!roomCreated) {
          toast.error('Session Error', 'Failed to create room for session');
          return;
        }
        console.log('Room created successfully for session');
      }
      
      const success = await startSession();
      if (success) {
        await initializeMedia();
        toast.success('Session Started', 'Demo session is now live');
      } else {
        toast.error('Session Error', 'Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error('Session Error', 'Failed to start session');
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

  // Handle leaving session
  const handleLeaveSession = async () => {
    try {
      console.log('Leaving demo session...');
      
      // Stop local media
      stopLocalStream();
      
      // Stop screen sharing if active
      if (isScreenSharing) {
        stopScreenShare();
      }
      
      // Leave session via API only if user is authenticated
      if (isAuthenticatedUser) {
        await leaveSession();
      } else {
        console.log('Guest user - skipping API leave call');
      }
      
      // Navigate back to demo page or call onLeave callback
      if (onLeave) {
        onLeave();
      } else {
        navigate('/demo');
      }
      
      console.log('Successfully left demo session');
    } catch (error) {
      console.error('Error leaving session:', error);
      // Still navigate away even if API call fails
      if (onLeave) {
        onLeave();
      } else {
        navigate('/demo');
      }
    }
  };

  // Handle audio toggle with debugging
  const handleToggleAudio = async () => {
    console.log('Audio toggle clicked:', { isAudioEnabled, hasLocalStream, localStream });
    await toggleAudio();
  };

  // Handle video toggle with debugging
  const handleToggleVideo = async () => {
    console.log('Video toggle clicked:', { isVideoEnabled, hasLocalStream, localStream });
    await toggleVideo();
  };

  // Handle screen share toggle with debugging
  const handleScreenShareToggle = async () => {
    console.log('Screen share toggle clicked:', { isScreenSharing, isScreenShareSupported });
    
    if (isScreenSharing) {
      stopScreenShare();
      setMainView('video');
    } else {
      try {
        await startScreenShare();
        setMainView('screen');
      } catch (error) {
        console.error('Failed to start screen share:', error);
        toast.error('Screen Share Error', 'Failed to start screen sharing');
      }
    }
  };

  // Handle recording toggle
  const handleToggleRecording = async () => {
    console.log('=== RECORDING TOGGLE DEBUG ===');
    console.log('Recording states:', { 
      isRecording: isRecording,
      recordingIsActive: recordingIsActive,
      localStream: !!localStream,
      userRole: actualUserRole,
      sessionId: sessionId,
      hasLocalStream: hasLocalStream
    });
    
    if (actualUserRole !== 'host' && actualUserRole !== 'presenter') {
      console.warn('Only hosts and presenters can record. Current role:', actualUserRole);
      toast.error('Permission Error', 'Only hosts and presenters can record');
      return;
    }
    
    // Check if recording is active (either state)
    const isCurrentlyRecording = recordingIsActive || isRecording;
    console.log('Is currently recording:', isCurrentlyRecording);
    
    if (isCurrentlyRecording) {
      console.log('Attempting to stop recording...');
      try {
        await recordingStop();
        console.log('Recording stop function called');
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast.error('Recording Error', 'Failed to stop recording');
      }
    } else {
      // Check and initialize media if needed
      if (!localStream || !hasLocalStream) {
        console.log('No local stream available, attempting to initialize media...');
        try {
          await initializeMedia();
          console.log('Media initialized for recording');
          
          // Wait a moment for stream to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!localStream) {
            toast.error('Media Error', 'Failed to initialize camera/microphone for recording');
            return;
          }
        } catch (error) {
          console.error('Failed to initialize media for recording:', error);
          toast.error('Media Error', 'Failed to access camera/microphone for recording');
          return;
        }
      }
      
      console.log('Attempting to start recording...');
      // Before starting recording, ensure room exists
      try {
        const roomStatus = await checkRoomStatus();
        if (!roomStatus || !roomStatus.exists) {
          console.log('Room does not exist, creating room before recording...');
          const roomCreated = await createRoom();
          if (!roomCreated) {
            toast.error('Recording Error', 'Failed to create room for recording');
            return;
          }
          console.log('Room created successfully for recording');
        }
        
        console.log('Starting recording with stream...');
        await recordingStart(localStream, { quality: 'HD' });
        console.log('Recording start function called');
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Recording Error', 'Failed to start recording: ' + error.message);
      }
    }
  };

  // Handle main view toggle
  const handleViewToggle = () => {
    setMainView(prev => prev === 'video' ? 'screen' : 'video');
  };

  // Handle settings toggle
  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Handle media initialization
  const handleInitializeMedia = async () => {
    console.log('Initialize media clicked');
    try {
      await initializeMedia();
      toast.success('Media Ready', 'Camera and microphone initialized');
    } catch (error) {
      console.error('Failed to initialize media:', error);
      toast.error('Media Error', 'Failed to access camera/microphone');
    }
  };

  // Handle media recovery
  const handleMediaRecovery = async () => {
    console.log('Attempting media recovery...');
    try {
      await initializeMedia();
      toast.success('Media Recovered', 'Camera and microphone have been restored');
    } catch (error) {
      console.error('Failed to recover media:', error);
      toast.error('Recovery Failed', 'Could not restore camera/microphone');
    }
  };

  // Handle room creation
  const handleCreateRoom = async () => {
    console.log('Creating room manually...');
    try {
      const roomCreated = await createRoom();
      if (roomCreated) {
        toast.success('Room Created', 'Demo room has been created successfully');
      } else {
        toast.error('Room Creation Failed', 'Could not create demo room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Room Creation Failed', 'Could not create demo room');
    }
  };

  // Handle room status check
  const handleCheckRoomStatus = async () => {
    console.log('Checking room status...');
    try {
      const status = await checkRoomStatus();
      if (status) {
        toast.success('Room Status', `Room exists: ${status.exists ? 'Yes' : 'No'}`);
      } else {
        toast.error('Room Status', 'Could not check room status');
      }
    } catch (error) {
      console.error('Failed to check room status:', error);
      toast.error('Room Status', 'Could not check room status');
    }
  };

  // Debug function to test all room operations
  const handleDebugRoomOperations = async () => {
    console.log('=== DEBUG: Testing Room Operations ===');
    console.log('Session ID:', sessionId);
    
    try {
      // 1. Check current room status
      console.log('1. Checking room status...');
      const status1 = await checkRoomStatus();
      console.log('Room status result:', status1);
      
      // 2. Create room
      console.log('2. Creating room...');
      const createResult = await createRoom({ recordingQuality: 'HD' });
      console.log('Create room result:', createResult);
      
      // 3. Check room status again
      console.log('3. Checking room status after creation...');
      const status2 = await checkRoomStatus();
      console.log('Room status after creation:', status2);
      
      toast.success('Debug Complete', 'Check console for detailed logs');
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Debug Error', error.message);
    }
  };

  // Check for media device changes
  useEffect(() => {
    if (!navigator.mediaDevices) return;

    const handleDeviceChange = async () => {
      console.log('Media devices changed');
      
      // If we had a stream but lost it, try to recover
      if (hasLocalStream && localStream) {
        const videoTracks = localStream.getVideoTracks();
        const audioTracks = localStream.getAudioTracks();
        
        const hasActiveVideo = videoTracks.some(track => track.readyState === 'live');
        const hasActiveAudio = audioTracks.some(track => track.readyState === 'live');
        
        if (!hasActiveVideo || !hasActiveAudio) {
          console.log('Detected inactive tracks, attempting recovery...');
          setTimeout(handleMediaRecovery, 1000);
        }
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [hasLocalStream, localStream, initializeMedia]);

  // Handle view recordings
  const handleViewRecordings = () => {
    setShowRecordingsModal(true);
  };

  // Validate sessionId
  if (!sessionId || sessionId === 'null') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">No valid session ID provided.</p>
            <Button onClick={onLeave}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      className="h-screen bg-black text-white flex flex-col overflow-hidden relative"
    >
      {/* Header with session info */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">{session.title}</h1>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isLive ? 'destructive' : isScheduled ? 'secondary' : 'outline'}
              className="text-xs bg-red-600 text-white border-none"
            >
              {isLive ? 'LIVE' : session.status}
            </Badge>
            {!isAuthenticatedUser && (
              <Badge className="bg-yellow-600 text-white border-none text-xs">
                GUEST
              </Badge>
            )}
            {isRecording && (
              <Badge className="animate-pulse bg-red-600 text-white border-none text-xs">
                <Circle className="h-2 w-2 mr-1 fill-current" />
                REC
              </Badge>
            )}
            <span className="text-sm text-gray-300">{participants.length} participants</span>
            {/* Small Recording Indicator */}
            {recordingIsActive && (
              <div className="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-2 bg-yellow-300 rounded-full"
                />
                <span className="font-medium">REC</span>
                <span className="font-mono">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Host controls in top right */}
      {actualUserRole === 'host' && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {canStart && (
            <Button 
              onClick={handleStartSession} 
              className="bg-green-600 hover:bg-green-700 text-white border-none"
            >
              Start Session
            </Button>
          )}
          {canEnd && (
            <Button 
              onClick={handleEndSession} 
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              End Session
            </Button>
          )}
        </div>
      )}

      {/* Main Video Area */}
      <div className="flex-1 relative">
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
                isPresenter={actualUserRole === 'host' || actualUserRole === 'presenter'}
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
                userRole={actualUserRole}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panels */}
      <AnimatePresence>
        {(isParticipantsOpen || isChatOpen) && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="absolute right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 flex flex-col z-20"
          >
            {/* Panel Header */}
            <div className="flex border-b border-gray-700 bg-gray-800">
              <Button
                variant={isParticipantsOpen ? 'secondary' : 'ghost'}
                onClick={() => {
                  setIsParticipantsOpen(true);
                  setIsChatOpen(false);
                }}
                className="flex-1 rounded-none text-white border-none"
              >
                <Users className="h-4 w-4 mr-2" />
                Participants ({participants.length})
              </Button>
              <Button
                variant={isChatOpen ? 'secondary' : 'ghost'}
                onClick={() => {
                  setIsChatOpen(true);
                  setIsParticipantsOpen(false);
                }}
                className="flex-1 rounded-none text-white border-none"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsParticipantsOpen(false);
                  setIsChatOpen(false);
                }}
                className="px-2 text-white border-none"
              >
                ×
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {isParticipantsOpen && (
                <ParticipantsList 
                  participants={participants}
                  currentUserRole={actualUserRole}
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

      {/* Google Meet Style Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3 shadow-lg border border-gray-600">
          {/* Audio Control */}
          <Button
            onClick={handleToggleAudio}
            className={`h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 border-none ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          {/* Video Control */}
          <Button
            onClick={handleToggleVideo}
            className={`h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 border-none ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          {/* Screen Share */}
          {isScreenShareSupported && (actualUserRole === 'host' || actualUserRole === 'presenter') && (
            <Button
              onClick={handleScreenShareToggle}
              className={`h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 border-none ${
                isScreenSharing 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Recording (Host & Presenter) */}
          {(actualUserRole === 'host' || actualUserRole === 'presenter') && (
            <Button
              onClick={handleToggleRecording}
              className={`h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 border-none ${
                (recordingIsActive || isRecording)
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {(recordingIsActive || isRecording) ? (
                <Square className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Participants */}
          <Button
            onClick={() => {
              setIsParticipantsOpen(!isParticipantsOpen);
              setIsChatOpen(false);
            }}
            className={`h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 border-none ${
              isParticipantsOpen 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <Users className="h-5 w-5" />
          </Button>

          {/* Chat */}
          <Button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              setIsParticipantsOpen(false);
            }}
            className={`h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 border-none ${
              isChatOpen 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* View Recordings */}
          <Button
            onClick={handleViewRecordings}
            className="h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 bg-gray-700 hover:bg-gray-600 text-white border-none"
            title="View Recordings"
          >
            <FileVideo className="h-5 w-5" />
          </Button>

          {/* Invite Participants (Host & Presenter) */}
          {(actualUserRole === 'host' || actualUserRole === 'presenter') && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 bg-gray-700 hover:bg-gray-600 text-white border-none"
              title="Invite Participants"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
          )}

          {/* More Options */}
          <Button
            onClick={handleSettingsToggle}
            className="h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 bg-gray-700 hover:bg-gray-600 text-white border-none"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>

          {/* Leave Call */}
          <Button
            onClick={handleLeaveSession}
            className="h-12 w-12 rounded-full p-0 transition-all duration-200 hover:scale-105 bg-red-600 hover:bg-red-700 text-white border-none ml-2"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Fullscreen toggle - moved left to avoid overlap */}
      <Button
        onClick={toggleFullscreen}
        className="absolute top-4 right-48 z-10 h-10 w-10 rounded-full p-0 bg-black/50 hover:bg-black/70 text-white border-none"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-600 min-w-64">
              <h3 className="text-white font-medium mb-3">Settings</h3>
              
              <div className="space-y-3">
                {/* Media Status */}
                <div className="text-sm">
                  <p className="text-gray-300 mb-1">Media Status:</p>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${hasLocalStream ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {hasLocalStream ? 'Connected' : 'Not Connected'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${isVideoEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                      Video: {isVideoEnabled ? 'On' : 'Off'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${isAudioEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                      Audio: {isAudioEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>

                {/* Initialize Media Button */}
                {!hasLocalStream && (
                  <Button
                    onClick={handleInitializeMedia}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none"
                  >
                    Initialize Camera & Microphone
                  </Button>
                )}

                {/* Media Recovery Button */}
                {hasLocalStream && (
                  <Button
                    onClick={handleMediaRecovery}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white border-none"
                  >
                    Recover Media Devices
                  </Button>
                )}

                {/* Connection Info */}
                <div className="text-sm">
                  <p className="text-gray-300 mb-1">Connection:</p>
                  <p className="text-gray-400 text-xs">
                    Participants: {participants.length} | 
                    Connected Peers: {connectedPeersCount}
                  </p>
                </div>

                {/* Session Info */}
                <div className="text-sm">
                  <p className="text-gray-300 mb-1">Session:</p>
                  <p className="text-gray-400 text-xs">
                    Role: {actualUserRole} | Status: {session?.status}
                  </p>
                </div>

                {/* Debug Panel for Room Management */}
                <div className="border-t border-gray-600 pt-3">
                  <p className="text-gray-300 mb-2 text-sm font-medium">Room Management:</p>
                  
                  <div className="space-y-2">
                    {/* Room Creation Button */}
                    <Button
                      onClick={handleCreateRoom}
                      className="w-full bg-green-600 hover:bg-green-700 text-white border-none text-sm"
                    >
                      Create Room
                    </Button>

                    {/* Room Status Check Button */}
                    <Button
                      onClick={handleCheckRoomStatus}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none text-sm"
                    >
                      Check Room Status
                    </Button>

                    {/* Debug Room Operations Button */}
                    <Button
                      onClick={handleDebugRoomOperations}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none text-sm"
                    >
                      Debug Room Operations
                    </Button>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setIsSettingsOpen(false)}
                  variant="outline"
                  className="w-full text-white border-gray-600"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Participants Modal */}
      <InviteParticipants
        sessionId={sessionId}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Demo Recordings Modal */}
      <DemoRecordings
        sessionId={sessionId}
        isOpen={showRecordingsModal}
        onClose={() => setShowRecordingsModal(false)}
      />
    </div>
  );
}; 