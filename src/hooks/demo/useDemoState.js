import { useState, useCallback, useEffect } from 'react';
import { authApiService } from '../../services/authApi';
import { useToast } from '../../components/ui/Toast';

// Demo session statuses from API
export const DEMO_SESSION_STATUS = {
  SCHEDULED: 'Scheduled',
  STARTING: 'Starting', 
  LIVE: 'Live',
  PAUSED: 'Paused',
  ENDED: 'Ended',
  CANCELLED: 'Cancelled'
};

// Demo session types from API
export const DEMO_SESSION_TYPE = {
  PRODUCT_DEMO: 'ProductDemo',
  TRAINING: 'Training',
  WEBINAR: 'Webinar',
  CLIENT_PRESENTATION: 'ClientPresentation',
  TEAM_MEETING: 'TeamMeeting',
  WORKSHOP: 'Workshop'
};

// Recording quality options from API
export const RECORDING_QUALITY = {
  SD: 'SD',
  HD: 'HD', 
  FULL_HD: 'FullHD',
  UHD: 'UHD'
};

export const useDemoState = (sessionId = null) => {
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load all demo sessions
  const loadSessions = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApiService.getDemoSessions(filters);
      if (response.success) {
        setSessions(response.data || []);
        return response.data;
      } else {
        setError(response.message || 'Failed to load demo sessions');
        toast.error('Load Error', 'Failed to load demo sessions');
        return [];
      }
    } catch (err) {
      console.error('Error loading demo sessions:', err);
      setError(err.message);
      toast.error('Load Error', 'Failed to load demo sessions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load demo session data
  const loadSession = useCallback(async (id) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApiService.getDemoSession(id);
      if (response.success) {
        setSession(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to load demo session');
        toast.error('Load Error', 'Failed to load demo session');
        return null;
      }
    } catch (err) {
      console.error('Error loading demo session:', err);
      setError(err.message);
      toast.error('Load Error', 'Failed to load demo session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create new demo session
  const createSession = useCallback(async (sessionData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApiService.createDemoSession(sessionData);
      if (response.success) {
        setSession(response.data);
        // Add to sessions list if it exists
        setSessions(prev => [response.data, ...prev]);
        toast.success('Session Created', 'Demo session created successfully');
        return response.data;
      } else {
        setError(response.message || 'Failed to create demo session');
        toast.error('Creation Error', response.message || 'Failed to create demo session');
        return null;
      }
    } catch (err) {
      console.error('Error creating demo session:', err);
      setError(err.message);
      toast.error('Creation Error', 'Failed to create demo session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Start demo session
  const startSession = useCallback(async (id = sessionId) => {
    if (!id) return false;

    try {
      setIsLoading(true);
      const response = await authApiService.startDemoSession(id);
      
      if (response.success) {
        setSession(prev => ({ ...prev, status: DEMO_SESSION_STATUS.STARTING }));
        // Update in sessions list
        setSessions(prev => prev.map(s => 
          s.id === id ? { ...s, status: DEMO_SESSION_STATUS.STARTING } : s
        ));
        toast.success('Session Started', 'Demo session is starting');
        return true;
      } else {
        toast.error('Start Error', response.message || 'Failed to start demo session');
        return false;
      }
    } catch (err) {
      console.error('Error starting demo session:', err);
      toast.error('Start Error', 'Failed to start demo session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast]);

  // End demo session
  const endSession = useCallback(async (id = sessionId) => {
    if (!id) return false;

    try {
      setIsLoading(true);
      const response = await authApiService.endDemoSession(id);
      
      if (response.success) {
        setSession(prev => ({ ...prev, status: DEMO_SESSION_STATUS.ENDED }));
        setSessions(prev => prev.map(s => 
          s.id === id ? { ...s, status: DEMO_SESSION_STATUS.ENDED } : s
        ));
        setIsRecording(false);
        toast.success('Session Ended', 'Demo session has ended');
        return true;
      } else {
        toast.error('End Error', response.message || 'Failed to end demo session');
        return false;
      }
    } catch (err) {
      console.error('Error ending demo session:', err);
      toast.error('End Error', 'Failed to end demo session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast]);

  // Join demo session
  const joinSession = useCallback(async (id = sessionId) => {
    if (!id) return false;

    try {
      setIsLoading(true);
      const response = await authApiService.joinDemoSession(id);
      
      if (response.success) {
        toast.success('Joined Session', 'Successfully joined the demo session');
        return true;
      } else {
        toast.error('Join Error', response.message || 'Failed to join demo session');
        return false;
      }
    } catch (err) {
      console.error('Error joining demo session:', err);
      toast.error('Join Error', 'Failed to join demo session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast]);

  // Leave demo session
  const leaveSession = useCallback(async (id = sessionId) => {
    if (!id) return false;

    try {
      setIsLoading(true);
      const response = await authApiService.leaveDemoSession(id);
      
      if (response.success) {
        toast.success('Left Session', 'Successfully left the demo session');
        return true;
      } else {
        toast.error('Leave Error', response.message || 'Failed to leave demo session');
        return false;
      }
    } catch (err) {
      console.error('Error leaving demo session:', err);
      toast.error('Leave Error', 'Failed to leave demo session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toast]);

  // Load participants
  const loadParticipants = useCallback(async (id = sessionId) => {
    if (!id) return [];

    try {
      const response = await authApiService.getDemoParticipants(id);
      if (response.success) {
        setParticipants(response.data || []);
        return response.data || [];
      } else {
        console.error('Failed to load participants:', response.message);
        return [];
      }
    } catch (err) {
      console.error('Error loading participants:', err);
      return [];
    }
  }, [sessionId]);

  // Load recordings
  const loadRecordings = useCallback(async (id = sessionId) => {
    if (!id) return [];

    try {
      const response = await authApiService.getDemoRecordings(id);
      if (response.success) {
        setRecordings(response.data || []);
        return response.data || [];
      } else {
        console.error('Failed to load recordings:', response.message);
        return [];
      }
    } catch (err) {
      console.error('Error loading recordings:', err);
      return [];
    }
  }, [sessionId]);

  // Start recording
  const startRecording = useCallback(async (id = sessionId, recordingData = {}) => {
    if (!id) return false;

    try {
      const response = await authApiService.startDemoRecording(id, recordingData);
      if (response.success) {
        setIsRecording(true);
        console.log('Demo recording started successfully');
        return true;
      } else {
        console.error('Failed to start recording:', response.message);
        return false;
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      return false;
    }
  }, [sessionId]);

  // Stop recording
  const stopRecording = useCallback(async (id = sessionId) => {
    if (!id) return false;

    try {
      const response = await authApiService.stopDemoRecording(id);
      if (response.success) {
        setIsRecording(false);
        console.log('Demo recording stopped successfully');
        // Reload recordings
        loadRecordings(id);
        return true;
      } else {
        console.error('Failed to stop recording:', response.message);
        return false;
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      return false;
    }
  }, [sessionId, loadRecordings]);

  // Create demo room
  const createRoom = useCallback(async (id = sessionId, roomData = {}) => {
    if (!id) return false;

    try {
      console.log('Creating demo room for session:', id);
      const response = await authApiService.createDemoRoom(id, {
        recordingQuality: 'HD',
        ...roomData
      });
      
      if (response.success) {
        console.log('Demo room created successfully:', response.data);
        return response.data;
      } else {
        console.error('Failed to create room:', response.message);
        return false;
      }
    } catch (err) {
      console.error('Error creating room:', err);
      return false;
    }
  }, [sessionId]);

  // Check room status
  const checkRoomStatus = useCallback(async (id = sessionId) => {
    if (!id) return null;

    try {
      console.log('Checking room status for session:', id);
      const response = await authApiService.getDemoRoomStatus(id);
      
      if (response.success) {
        console.log('Room status:', response.data);
        return response.data;
      } else {
        console.error('Failed to get room status:', response.message);
        return null;
      }
    } catch (err) {
      console.error('Error checking room status:', err);
      return null;
    }
  }, [sessionId]);

  // Auto-load session data when sessionId changes
  useEffect(() => {
    if (sessionId && sessionId !== 'null' && sessionId !== null) {
      console.log('Loading session data for sessionId:', sessionId);
      
      // Load session data directly without depending on callbacks
      const loadSessionData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Load session
          const sessionResponse = await authApiService.getDemoSession(sessionId);
          if (sessionResponse.success) {
            setSession(sessionResponse.data);
          } else {
            console.error('Failed to load session:', sessionResponse.message);
          }
          
          // Load participants
          const participantsResponse = await authApiService.getDemoParticipants(sessionId);
          if (participantsResponse.success) {
            setParticipants(participantsResponse.data || []);
          } else {
            console.error('Failed to load participants:', participantsResponse.message);
          }
          
          // Load recordings
          const recordingsResponse = await authApiService.getDemoRecordings(sessionId);
          if (recordingsResponse.success) {
            setRecordings(recordingsResponse.data || []);
          } else {
            console.error('Failed to load recordings:', recordingsResponse.message);
          }
          
        } catch (err) {
          console.error('Error loading session data:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSessionData();
    } else {
      // Clear data if no valid sessionId
      setSession(null);
      setParticipants([]);
      setRecordings([]);
      setError(null);
    }
  }, [sessionId]); // Only depend on sessionId

  return {
    // State
    session,
    sessions,
    participants,
    recordings,
    isLoading,
    isRecording,
    error,
    
    // Actions
    loadSessions,
    loadSession,
    createSession,
    startSession,
    endSession,
    joinSession,
    leaveSession,
    loadParticipants,
    loadRecordings,
    startRecording,
    stopRecording,
    createRoom,
    checkRoomStatus,
    
    // Computed values
    isLive: session?.status === DEMO_SESSION_STATUS.LIVE,
    isScheduled: session?.status === DEMO_SESSION_STATUS.SCHEDULED,
    isEnded: session?.status === DEMO_SESSION_STATUS.ENDED,
    canStart: session?.status === DEMO_SESSION_STATUS.SCHEDULED,
    canEnd: session?.status === DEMO_SESSION_STATUS.LIVE || session?.status === DEMO_SESSION_STATUS.PAUSED,
    
    // Utilities
    setError,
    setIsLoading
  };
}; 