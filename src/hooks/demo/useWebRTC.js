import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());
  const { toast } = useToast();

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize local media stream
  const initializeMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsVideoEnabled(constraints.video);
      setIsAudioEnabled(constraints.audio);
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Camera/microphone access denied. Please allow permissions and try again.'
        : 'Failed to access camera/microphone. Please check your devices.';
      
      setError(errorMessage);
      toast.error('Media Access Error', errorMessage);
      return null;
    }
  }, [toast]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Create peer connection
  const createPeerConnection = useCallback((peerId, isInitiator = false) => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      
      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams(prev => new Map(prev.set(peerId, remoteStream)));
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to remote peer via signaling server
          // This would typically be handled by SignalR
          console.log('ICE candidate for peer', peerId, event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state changed:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
        }
      };

      peerConnections.current.set(peerId, pc);
      return pc;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      toast.error('Connection Error', 'Failed to create peer connection');
      return null;
    }
  }, [localStream, toast]);

  // Create offer
  const createOffer = useCallback(async (peerId) => {
    const pc = peerConnections.current.get(peerId) || createPeerConnection(peerId, true);
    if (!pc) return null;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      return offer;
    } catch (err) {
      console.error('Error creating offer:', err);
      toast.error('Connection Error', 'Failed to create offer');
      return null;
    }
  }, [createPeerConnection, toast]);

  // Create answer
  const createAnswer = useCallback(async (peerId, offer) => {
    const pc = peerConnections.current.get(peerId) || createPeerConnection(peerId, false);
    if (!pc) return null;

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    } catch (err) {
      console.error('Error creating answer:', err);
      toast.error('Connection Error', 'Failed to create answer');
      return null;
    }
  }, [createPeerConnection, toast]);

  // Handle answer
  const handleAnswer = useCallback(async (peerId, answer) => {
    const pc = peerConnections.current.get(peerId);
    if (!pc) return;

    try {
      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error handling answer:', err);
      toast.error('Connection Error', 'Failed to handle answer');
    }
  }, [toast]);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (peerId, candidate) => {
    const pc = peerConnections.current.get(peerId);
    if (!pc) return;

    try {
      await pc.addIceCandidate(candidate);
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }, []);

  // Remove peer connection
  const removePeerConnection = useCallback((peerId) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  }, [localStream]);

  // Disconnect all peers
  const disconnectAll = useCallback(() => {
    peerConnections.current.forEach((pc, peerId) => {
      pc.close();
    });
    peerConnections.current.clear();
    setRemoteStreams(new Map());
    setIsConnected(false);
  }, []);

  // Get media constraints based on quality
  const getMediaConstraints = useCallback((quality = 'HD') => {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        facingMode: 'user',
      }
    };

    switch (quality) {
      case 'SD':
        constraints.video = { ...constraints.video, width: 640, height: 480 };
        break;
      case 'HD':
        constraints.video = { ...constraints.video, width: 1280, height: 720 };
        break;
      case 'FullHD':
        constraints.video = { ...constraints.video, width: 1920, height: 1080 };
        break;
      case 'UHD':
        constraints.video = { ...constraints.video, width: 3840, height: 2160 };
        break;
      default:
        constraints.video = { ...constraints.video, width: 1280, height: 720 };
    }

    return constraints;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalStream();
      disconnectAll();
    };
  }, [stopLocalStream, disconnectAll]);

  return {
    // State
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    error,
    localVideoRef,
    
    // Actions
    initializeMedia,
    toggleVideo,
    toggleAudio,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    removePeerConnection,
    stopLocalStream,
    disconnectAll,
    getMediaConstraints,
    
    // Computed values
    hasLocalStream: !!localStream,
    remoteStreamsArray: Array.from(remoteStreams.entries()),
    connectedPeersCount: remoteStreams.size,
  };
}; 