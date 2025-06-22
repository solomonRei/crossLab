import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';

export const useScreenShare = () => {
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  
  const screenVideoRef = useRef(null);
  const { toast } = useToast();

  // Get screen sharing constraints based on quality
  const getScreenShareConstraints = useCallback((quality = 'HD', includeAudio = false) => {
    const constraints = {
      audio: includeAudio,
      video: {
        cursor: 'always',
        displaySurface: 'monitor',
      }
    };

    switch (quality) {
      case 'SD':
        constraints.video = { 
          ...constraints.video, 
          width: { ideal: 1280, max: 1280 }, 
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 15, max: 15 }
        };
        break;
      case 'HD':
        constraints.video = { 
          ...constraints.video, 
          width: { ideal: 1920, max: 1920 }, 
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        };
        break;
      case 'FullHD':
        constraints.video = { 
          ...constraints.video, 
          width: { ideal: 1920, max: 1920 }, 
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 60, max: 60 }
        };
        break;
      case 'UHD':
        constraints.video = { 
          ...constraints.video, 
          width: { ideal: 3840, max: 3840 }, 
          height: { ideal: 2160, max: 2160 },
          frameRate: { ideal: 30, max: 30 }
        };
        break;
      default:
        constraints.video = { 
          ...constraints.video, 
          width: { ideal: 1920, max: 1920 }, 
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        };
    }

    return constraints;
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async (options = {}) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing not supported in this browser');
      }

      const constraints = getScreenShareConstraints(options.quality, options.includeAudio);
      console.log('Starting screen share with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      // Add event listeners for screen share disconnection
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.warn('Screen share track ended unexpectedly');
          setScreenStream(null);
          setIsScreenSharing(false);
          
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
          
          console.log('Screen sharing stopped automatically');
        });

        track.addEventListener('mute', () => {
          console.warn('Screen share track muted');
        });

        track.addEventListener('unmute', () => {
          console.log('Screen share track unmuted');
        });
      });
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      
      console.log('Screen sharing started successfully');
      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      
      let userMessage = 'Failed to start screen sharing';
      if (error.name === 'NotAllowedError') {
        userMessage = 'Screen sharing permission denied';
      } else if (error.name === 'NotFoundError') {
        userMessage = 'No screen available for sharing';
      } else if (error.name === 'NotReadableError') {
        userMessage = 'Screen is being used by another application';
      } else if (error.name === 'AbortError') {
        userMessage = 'Screen sharing was cancelled';
      }
      
      setError(userMessage);
      throw error;
    }
  }, [getScreenShareConstraints, screenVideoRef]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    
    setIsScreenSharing(false);
    toast.info('Screen Sharing Stopped', 'Screen sharing has ended');
  }, [screenStream, toast]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async (options = {}) => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare(options);
    }
  }, [isScreenSharing, stopScreenShare, startScreenShare]);

  // Check if screen sharing is supported
  const isScreenShareSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }, []);

  // Get screen share track for peer connections
  const getScreenShareTrack = useCallback(() => {
    if (screenStream) {
      return screenStream.getVideoTracks()[0];
    }
    return null;
  }, [screenStream]);

  // Replace video track in peer connection
  const replaceVideoTrack = useCallback(async (peerConnection, useScreenShare = true) => {
    if (!peerConnection) return false;

    try {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender) {
        const newTrack = useScreenShare ? getScreenShareTrack() : null;
        await sender.replaceTrack(newTrack);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error replacing video track:', err);
      return false;
    }
  }, [getScreenShareTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);

  return {
    // State
    screenStream,
    isScreenSharing,
    error,
    screenVideoRef,
    
    // Actions
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
    getScreenShareConstraints,
    replaceVideoTrack,
    
    // Utilities
    isScreenShareSupported,
    getScreenShareTrack,
    
    // Computed values
    hasScreenStream: !!screenStream,
    screenShareTrack: getScreenShareTrack(),
  };
}; 