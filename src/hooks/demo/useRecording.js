import { useState, useCallback, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';
import { authApiService } from '../../services/authApi';

export const useRecording = (sessionId = null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const { toast } = useToast();

  // Start recording with MediaRecorder API
  const startRecording = useCallback(async (stream, options = {}) => {
    try {
      if (!stream) {
        throw new Error('No stream provided for recording');
      }

      console.log('🎬 Starting recording with MediaRecorder API...');
      console.log('Stream tracks:', stream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      })));

      // Store stream reference
      streamRef.current = stream;
      recordedChunksRef.current = [];

      // Configure MediaRecorder options
      const mimeType = 'video/webm;codecs=vp9,opus';
      const recordOptions = {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
        videoBitsPerSecond: options.quality === 'HD' ? 2000000 : 1000000,
        audioBitsPerSecond: 128000
      };

      console.log('MediaRecorder options:', recordOptions);

      // Create MediaRecorder instance
      mediaRecorderRef.current = new MediaRecorder(stream, recordOptions);

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('📦 Data chunk available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorderRef.current.onstop = async () => {
        console.log('🛑 MediaRecorder stopped, processing recording...');
        await processRecording();
      };

      // Handle errors
      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event.error);
        setError(event.error.message);
        setIsRecording(false);
      };

      // Start recording with chunks every 1 second
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setError(null);
      setRecordingDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Notify backend that recording started
      if (sessionId) {
        console.log('📡 Notifying backend that recording started...');
        try {
          const response = await authApiService.startDemoRecording(sessionId, {
            quality: options.quality || 'HD',
            format: 'webm'
          });
          console.log('✅ Backend response for start recording:', response);
        } catch (err) {
          console.warn('⚠️ Backend notification failed, but continuing recording:', err);
        }
      }

      console.log('✅ Recording started successfully');
      return true;
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setError(error.message);
      setIsRecording(false);
      return false;
    }
  }, [sessionId]);

  // Process recording after stop
  const processRecording = async () => {
    try {
      if (recordedChunksRef.current.length === 0) {
        console.warn('⚠️ No recorded chunks available');
        return null;
      }

      console.log('🔄 Processing', recordedChunksRef.current.length, 'chunks...');

      // Create blob from recorded chunks
      const blob = new Blob(recordedChunksRef.current, { 
        type: 'video/webm' 
      });

      console.log('📁 Created blob:', {
        size: blob.size,
        type: blob.type,
        sizeMB: (blob.size / 1024 / 1024).toFixed(2)
      });

      const url = URL.createObjectURL(blob);
      
      const recordingData = {
        id: Date.now().toString(),
        blob,
        url,
        duration: recordingDuration,
        timestamp: new Date().toISOString(),
        size: blob.size,
        type: blob.type
      };

      setRecordings(prev => [...prev, recordingData]);
      setIsRecording(false);
      
      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      console.log('✅ Recording processed successfully');

      // Auto-upload to server
      if (sessionId) {
        console.log('📤 Auto-uploading recording to server...');
        try {
          // Notify backend that recording stopped
          await authApiService.stopDemoRecording(sessionId);
          
          // Upload the recording
          const uploadResult = await uploadRecordingToServer(recordingData, sessionId);
          console.log('✅ Recording uploaded successfully:', uploadResult);
        } catch (uploadErr) {
          console.error('❌ Failed to upload recording:', uploadErr);
          // Don't fail the whole process if upload fails
        }
      }

      return recordingData;
    } catch (error) {
      console.error('❌ Error processing recording:', error);
      setError(error.message);
      return null;
    }
  };

  // Stop recording
  const stopRecording = useCallback(async () => {
    console.log('=== STOP RECORDING CALLED ===');
    console.log('Stop recording state check:', {
      mediaRecorderExists: !!mediaRecorderRef.current,
      isRecording: isRecording,
      mediaRecorderState: mediaRecorderRef.current?.state,
      sessionId: sessionId
    });
    
    try {
      if (!mediaRecorderRef.current) {
        console.warn('⚠️ No MediaRecorder instance available');
        return null;
      }
      
      if (!isRecording) {
        console.warn('⚠️ Recording is not active, cannot stop');
        return null;
      }

      if (mediaRecorderRef.current.state === 'recording') {
        console.log('🛑 Stopping MediaRecorder...');
        mediaRecorderRef.current.stop();
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('🔇 Stopped track:', track.kind);
          });
        }
        
        console.log('✅ MediaRecorder stop initiated');
        // The actual processing will happen in the onstop event
        return true;
      } else {
        console.warn('⚠️ MediaRecorder is not in recording state:', mediaRecorderRef.current.state);
        setIsRecording(false);
        return null;
      }
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      setError(error.message);
      setIsRecording(false);
      
      // Clear duration timer even on error
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      return null;
    }
  }, [isRecording, sessionId]);

  // Helper function for uploading recordings
  const uploadRecordingToServer = async (recording, sessionId) => {
    try {
      if (!sessionId) {
        console.error('❌ No session ID provided for upload - sessionId:', sessionId);
        throw new Error('No session ID provided for upload');
      }

      if (!recording || !recording.blob) {
        console.error('❌ Invalid recording data:', recording);
        throw new Error('Invalid recording data provided');
      }

      console.log('📤 Preparing recording upload...', {
        sessionId,
        recordingSize: recording.blob.size,
        recordingSizeMB: (recording.blob.size / 1024 / 1024).toFixed(2),
        recordingDuration: recording.duration,
        recordingType: recording.blob.type,
        recordingId: recording.id
      });

      // Create FormData according to API specification
      const formData = new FormData();
      const fileName = `recording-${recording.id}-${Date.now()}.webm`;
      
      // Append file with proper name (API expects 'file' field)
      formData.append('file', recording.blob, fileName);
      
      // Add metadata
      formData.append('duration', recording.duration.toString());
      formData.append('timestamp', recording.timestamp);
      formData.append('quality', 'HD');
      formData.append('format', 'webm');

      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(`${key}: File blob (${value.size} bytes, ${value.type}, ${value.name})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('🚀 Uploading recording to server...');
      
      // Get auth token
      const token = localStorage.getItem('token');
      
      // Upload using fetch with proper headers
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://192.168.0.47:5059'}/api/v1/Demo/sessions/${sessionId}/recordings/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type - let browser set it for FormData
          }
        }
      );

      console.log('📡 Upload response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed with status:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📨 Upload response:', result);
      
      if (result.success) {
        console.log('✅ Recording uploaded successfully to server:', result.data);
        return result.data;
      } else {
        console.error('❌ Upload failed with response:', result);
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading recording:', error);
      console.error('Upload error details:', {
        message: error.message,
        stack: error.stack,
        sessionId,
        recordingExists: !!recording,
        recordingSize: recording?.blob?.size
      });
      throw error;
    }
  };

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
        console.log('⏸️ Recording paused');
        
        // Pause duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      }
    }
  }, [isRecording]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
        console.log('▶️ Recording resumed');
        
        // Resume duration timer
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      }
    }
  }, [isRecording]);

  // Download recording
  const downloadRecording = useCallback((recording) => {
    try {
      const link = document.createElement('a');
      link.href = recording.url;
      link.download = `demo-recording-${recording.timestamp}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Recording download started');
    } catch (error) {
      console.error('Error downloading recording:', error);
    }
  }, []);

  // Upload recording (wrapper function)
  const uploadRecording = useCallback(async (recording) => {
    return await uploadRecordingToServer(recording, sessionId);
  }, [sessionId]);

  // Delete recording
  const deleteRecording = useCallback((recordingId) => {
    setRecordings(prev => {
      const recording = prev.find(r => r.id === recordingId);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return prev.filter(r => r.id !== recordingId);
    });
    
    console.log('Recording deleted');
  }, []);

  // Get recording quality options
  const getQualityOptions = useCallback((quality) => {
    const qualitySettings = {
      'SD': {
        videoBitsPerSecond: 1000000, // 1 Mbps
        width: 640,
        height: 480
      },
      'HD': {
        videoBitsPerSecond: 2000000, // 2 Mbps
        width: 1280,
        height: 720
      },
      'FullHD': {
        videoBitsPerSecond: 4000000, // 4 Mbps
        width: 1920,
        height: 1080
      },
      'UHD': {
        videoBitsPerSecond: 8000000, // 8 Mbps
        width: 3840,
        height: 2160
      }
    };

    return qualitySettings[quality] || qualitySettings['HD'];
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up recording resources...');
    
    // Stop MediaRecorder if recording
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        console.log('🛑 Stopped MediaRecorder during cleanup');
      }
      mediaRecorderRef.current = null;
    }
    
    // Stop stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped track during cleanup:', track.kind);
      });
      streamRef.current = null;
    }
    
    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
      console.log('⏱️ Cleared duration timer');
    }

    // Cleanup blob URLs
    recordings.forEach(recording => {
      if (recording.url) {
        URL.revokeObjectURL(recording.url);
        console.log('🗑️ Revoked blob URL for recording:', recording.id);
      }
    });
    
    console.log('✅ Cleanup completed');
  }, [isRecording, recordings]);

  return {
    // State
    isRecording,
    recordings,
    recordingDuration,
    error,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    uploadRecording,
    deleteRecording,
    
    // Utilities
    getQualityOptions,
    formatDuration,
    cleanup
  };
}; 