import { useState, useCallback, useRef, useEffect } from 'react';
import Peer from 'simple-peer';
import { signalingService } from '../../services/signalingService';
import { useToast } from '../../components/ui/Toast';

export const useWebRTC = (sessionId = null) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState(new Map());
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const peersRef = useRef(new Map());
  const { toast } = useToast();

  // Initialize signaling service only if sessionId is valid
  useEffect(() => {
    if (sessionId && sessionId !== 'null' && sessionId !== null) {
      const handleUserJoined = ({ userId, signal }) => {
        console.log('User joined:', userId);
        createPeer(userId, false, signal);
      };

      const handleUserLeft = ({ userId }) => {
        console.log('User left:', userId);
        removePeer(userId);
      };

      const handleSignal = ({ from, signal }) => {
        const peer = peersRef.current.get(from);
        if (peer) {
          peer.signal(signal);
        }
      };

      // Set up event listeners
      signalingService.on('user-joined', handleUserJoined);
      signalingService.on('user-left', handleUserLeft);
      signalingService.on('signal', handleSignal);

      return () => {
        signalingService.off('user-joined', handleUserJoined);
        signalingService.off('user-left', handleUserLeft);
        signalingService.off('signal', handleSignal);
      };
    }
  }, [sessionId]);

  // Create peer connection
  const createPeer = useCallback((userId, initiator, signal = null) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', async (data) => {
      await signalingService.sendSignal(userId, data);
    });

    peer.on('stream', (stream) => {
      console.log('Received stream from:', userId);
      setRemoteStreams(prev => new Map(prev).set(userId, stream));
    });

    peer.on('connect', () => {
      console.log('Peer connected:', userId);
      setConnectedPeers(prev => new Map(prev).set(userId, true));
      setIsConnected(true);
    });

    peer.on('close', () => {
      console.log('Peer disconnected:', userId);
      removePeer(userId);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError(err.message);
      toast.error('Connection Error', `Failed to connect to peer: ${err.message}`);
      removePeer(userId);
    });

    if (signal) {
      peer.signal(signal);
    }

    peersRef.current.set(userId, peer);
    return peer;
  }, [localStream, toast]);

  // Remove peer
  const removePeer = useCallback((userId) => {
    const peer = peersRef.current.get(userId);
    if (peer) {
      peer.destroy();
      peersRef.current.delete(userId);
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
    
    setConnectedPeers(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });

    // Update connection status
    setIsConnected(connectedPeers.size > 0);
  }, [connectedPeers.size]);

  // Initialize media devices
  const initializeMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      setError(null);
      
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }

      console.log('Requesting media permissions:', constraints);
      
      // Check available devices first
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        console.log('Available devices:', {
          video: videoDevices.length,
          audio: audioDevices.length,
          devices: devices.map(d => ({ kind: d.kind, label: d.label }))
        });
        
        // Adjust constraints based on available devices
        if (constraints.video && videoDevices.length === 0) {
          console.warn('No video devices found, disabling video');
          constraints.video = false;
        }
        if (constraints.audio && audioDevices.length === 0) {
          console.warn('No audio devices found, disabling audio');
          constraints.audio = false;
        }
      } catch (deviceError) {
        console.warn('Could not enumerate devices:', deviceError);
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add track event listeners to detect disconnections
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.warn(`Track ended unexpectedly:`, track.kind);
          
          // Attempt to recover the entire stream instead of individual tracks
          setTimeout(async () => {
            try {
              console.log('Attempting to recover media stream...');
              const newConstraints = { 
                video: track.kind === 'video' || stream.getVideoTracks().length > 0,
                audio: track.kind === 'audio' || stream.getAudioTracks().length > 0
              };
              
              const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);
              
              // Replace the entire stream
              setLocalStream(newStream);
              
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream;
              }
              
              // Update states based on new stream
              const videoTracks = newStream.getVideoTracks();
              const audioTracks = newStream.getAudioTracks();
              
              setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0].enabled);
              setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0].enabled);
              
              // Add event listeners to new tracks
              newStream.getTracks().forEach(newTrack => {
                newTrack.addEventListener('ended', () => {
                  console.warn(`New track ended:`, newTrack.kind);
                  if (newTrack.kind === 'video') setIsVideoEnabled(false);
                  if (newTrack.kind === 'audio') setIsAudioEnabled(false);
                });
              });
              
              console.log('Media stream recovered successfully');
              
            } catch (error) {
              console.error('Failed to recover media stream:', error);
              setLocalStream(null);
              setIsVideoEnabled(false);
              setIsAudioEnabled(false);
            }
          }, 1000);
        });

        track.addEventListener('mute', () => {
          console.warn(`Track muted:`, track.kind);
          if (track.kind === 'video') setIsVideoEnabled(false);
          if (track.kind === 'audio') setIsAudioEnabled(false);
        });

        track.addEventListener('unmute', () => {
          console.log(`Track unmuted:`, track.kind);
          if (track.kind === 'video') setIsVideoEnabled(true);
          if (track.kind === 'audio') setIsAudioEnabled(true);
        });
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Video ref set with stream');
      } else {
        console.warn('localVideoRef.current is null');
      }

      // Set initial states based on actual tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      setIsVideoEnabled(videoTracks.length > 0 && videoTracks[0].enabled);
      setIsAudioEnabled(audioTracks.length > 0 && audioTracks[0].enabled);

      console.log('Media initialized successfully:', {
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        videoEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : false,
        audioEnabled: audioTracks.length > 0 ? audioTracks[0].enabled : false,
        streamId: stream.id
      });

      // Update existing peer connections with new stream
      peersRef.current.forEach((peer, userId) => {
        console.log('Updating peer connection for user:', userId);
        if (peer.streams && peer.streams[0]) {
          const oldVideoTrack = peer.streams[0].getVideoTracks()[0];
          const oldAudioTrack = peer.streams[0].getAudioTracks()[0];
          const newVideoTrack = stream.getVideoTracks()[0];
          const newAudioTrack = stream.getAudioTracks()[0];

          if (oldVideoTrack && newVideoTrack) {
            peer.replaceTrack(oldVideoTrack, newVideoTrack, peer.streams[0]);
          }
          if (oldAudioTrack && newAudioTrack) {
            peer.replaceTrack(oldAudioTrack, newAudioTrack, peer.streams[0]);
          }
        }
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      let userMessage = 'Failed to access camera/microphone';
      if (error.name === 'NotAllowedError') {
        userMessage = 'Camera/microphone access denied. Please allow permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        userMessage = 'No camera or microphone found. Please check your devices.';
      } else if (error.name === 'NotReadableError') {
        userMessage = 'Camera/microphone is being used by another application.';
      } else if (error.name === 'OverconstrainedError') {
        userMessage = 'Camera/microphone constraints cannot be satisfied.';
      }
      
      setError(userMessage);
      throw error;
    }
  }, [localVideoRef]);

  // Join session
  const joinSession = useCallback(async () => {
    if (!sessionId || sessionId === 'null' || sessionId === null) {
      console.warn('Cannot join session: invalid sessionId');
      return false;
    }

    try {
      setError(null);
      
      // Connect to signaling service
      const connected = await signalingService.connect(sessionId, 'current-user-id');
      if (!connected) {
        throw new Error('Failed to connect to signaling service');
      }

      // Initialize media first
      await initializeMedia();
      
      // Join the session
      const joined = await signalingService.joinSession();
      if (!joined) {
        throw new Error('Failed to join demo session');
      }

      toast.success('Joined Session', 'Successfully joined the demo session');
      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      setError(error.message);
      toast.error('Join Error', error.message);
      return false;
    }
  }, [sessionId, initializeMedia, toast]);

  // Leave session
  const leaveSession = useCallback(async () => {
    try {
      // Clean up all peer connections
      peersRef.current.forEach((peer) => {
        peer.destroy();
      });
      peersRef.current.clear();

      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Disconnect from signaling service
      await signalingService.leaveSession();

      setRemoteStreams(new Map());
      setConnectedPeers(new Map());
      setIsConnected(false);
      setError(null);

      toast.success('Left Session', 'Successfully left the demo session');
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Leave Error', 'Failed to leave session properly');
    }
  }, [localStream, toast]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    console.log('Toggle video called:', { localStream, isVideoEnabled });
    
    if (!localStream) {
      console.log('No local stream available, attempting to initialize media...');
      try {
        await initializeMedia({ video: true, audio: true });
        return;
      } catch (error) {
        console.error('Failed to initialize media for video toggle:', error);
        return;
      }
    }
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const newState = !videoTrack.enabled;
      videoTrack.enabled = newState;
      setIsVideoEnabled(newState);
      
      console.log('Video toggled:', { newState, trackEnabled: videoTrack.enabled });
    } else {
      console.warn('No video track found, attempting to add video...');
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = videoStream.getVideoTracks()[0];
        if (newVideoTrack) {
          localStream.addTrack(newVideoTrack);
          setIsVideoEnabled(true);
          console.log('Video track added successfully');
        }
      } catch (error) {
        console.error('Failed to add video track:', error);
      }
    }
  }, [localStream, initializeMedia]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    console.log('Toggle audio called:', { localStream, isAudioEnabled });
    
    if (!localStream) {
      console.log('No local stream available, attempting to initialize media...');
      try {
        await initializeMedia({ video: true, audio: true });
        return;
      } catch (error) {
        console.error('Failed to initialize media for audio toggle:', error);
        return;
      }
    }
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      setIsAudioEnabled(newState);
      
      console.log('Audio toggled:', { newState, trackEnabled: audioTrack.enabled });
    } else {
      console.warn('No audio track found, attempting to add audio...');
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newAudioTrack = audioStream.getAudioTracks()[0];
        if (newAudioTrack) {
          localStream.addTrack(newAudioTrack);
          setIsAudioEnabled(true);
          console.log('Audio track added successfully');
        }
      } catch (error) {
        console.error('Failed to add audio track:', error);
      }
    }
  }, [localStream, initializeMedia]);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
    }
  }, [localStream]);

  // Get remote streams as array for easier rendering
  const remoteStreamsArray = Array.from(remoteStreams.entries()).map(([userId, stream]) => [userId, stream]);

  // Check media device status periodically
  const checkMediaDevices = useCallback(async () => {
    if (!localStream) return;

    try {
      const videoTracks = localStream.getVideoTracks();
      const audioTracks = localStream.getAudioTracks();

      let needsRecovery = false;

      // Check if any tracks have ended
      const hasActiveVideo = videoTracks.length > 0 && videoTracks.some(track => track.readyState === 'live');
      const hasActiveAudio = audioTracks.length > 0 && audioTracks.some(track => track.readyState === 'live');

      if (videoTracks.length > 0 && !hasActiveVideo) {
        console.warn('Video tracks are not active, marking for recovery');
        needsRecovery = true;
      }

      if (audioTracks.length > 0 && !hasActiveAudio) {
        console.warn('Audio tracks are not active, marking for recovery');
        needsRecovery = true;
      }

      // If we need recovery, reinitialize the entire media stream
      if (needsRecovery) {
        console.log('Performing full media recovery...');
        try {
          // Stop old stream
          localStream.getTracks().forEach(track => track.stop());
          
          // Get new stream
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: videoTracks.length > 0,
            audio: audioTracks.length > 0
          });
          
          setLocalStream(newStream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
          }
          
          // Update states
          const newVideoTracks = newStream.getVideoTracks();
          const newAudioTracks = newStream.getAudioTracks();
          
          setIsVideoEnabled(newVideoTracks.length > 0 && newVideoTracks[0].enabled);
          setIsAudioEnabled(newAudioTracks.length > 0 && newAudioTracks[0].enabled);
          
          console.log('Full media recovery completed successfully');
          
        } catch (error) {
          console.error('Failed to recover media stream:', error);
          setLocalStream(null);
          setIsVideoEnabled(false);
          setIsAudioEnabled(false);
        }
      } else {
        // Just update states based on current tracks
        if (videoTracks.length > 0) {
          setIsVideoEnabled(videoTracks[0].enabled);
        }
        if (audioTracks.length > 0) {
          setIsAudioEnabled(audioTracks[0].enabled);
        }
      }
    } catch (error) {
      console.error('Error checking media devices:', error);
    }
  }, [localStream, localVideoRef]);

  // Periodic check for media device status
  useEffect(() => {
    if (!localStream) return;

    const interval = setInterval(checkMediaDevices, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [localStream, checkMediaDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Cleanup peer connections
      peersRef.current.forEach((peer) => {
        peer.destroy();
      });
      peersRef.current.clear();
      
      // Disconnect signaling service
      signalingService.disconnect();
      
      console.log('WebRTC cleanup completed');
    };
  }, []); // No dependencies to prevent infinite loops

  return {
    // State
    localStream,
    remoteStreams,
    remoteStreamsArray,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    connectedPeersCount: connectedPeers.size,
    hasLocalStream: !!localStream,
    error,
    
    // Refs
    localVideoRef,
    
    // Actions
    initializeMedia,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    stopLocalStream,
    createPeer,
    removePeer
  };
}; 