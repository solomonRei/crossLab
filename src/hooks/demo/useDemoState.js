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
  const [participants, setParticipants] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load demo session data
  const loadSession = useCallback(async (id) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApiService.getDemoSession(id);
      if (response.success) {
        setSession(response.data);
      } else {
        setError(response.message || 'Failed to load demo session');
        toast.error('Load Error', 'Failed to load demo session');
      }
    } catch (err) {
      console.error('Error loading demo session:', err);
      setError(err.message);
      toast.error('Load Error', 'Failed to load demo session');
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

  // Invite participants
  const inviteParticipants = useCallback(async (emails, message = '', id = sessionId) => {
    if (!id) return false;

    try {
      const response = await authApiService.inviteDemoParticipants(id, {
        emails,
        message
      });
      
      if (response.success) {
        toast.success('Invitations Sent', `Invitations sent to ${emails.length} participants`);
        return true;
      } else {
        toast.error('Invitation Error', response.message || 'Failed to send invitations');
        return false;
      }
    } catch (err) {
      console.error('Error inviting participants:', err);
      toast.error('Invitation Error', 'Failed to send invitations');
      return false;
    }
  }, [sessionId, toast]);

  // Start recording
  const startRecording = useCallback(async (quality = RECORDING_QUALITY.HD, id = sessionId) => {
    if (!id) return false;

    try {
      const response = await authApiService.startDemoRecording(id, { quality });
      
      if (response.success) {
        setIsRecording(true);
        toast.success('Recording Started', 'Demo recording has started');
        return true;
      } else {
        toast.error('Recording Error', response.message || 'Failed to start recording');
        return false;
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error('Recording Error', 'Failed to start recording');
      return false;
    }
  }, [sessionId, toast]);

  // Stop recording
  const stopRecording = useCallback(async (id = sessionId) => {
    if (!id) return false;

    try {
      const response = await authApiService.stopDemoRecording(id);
      
      if (response.success) {
        setIsRecording(false);
        toast.success('Recording Stopped', 'Demo recording has stopped');
        // Reload recordings list
        loadRecordings(id);
        return true;
      } else {
        toast.error('Recording Error', response.message || 'Failed to stop recording');
        return false;
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      toast.error('Recording Error', 'Failed to stop recording');
      return false;
    }
  }, [sessionId, toast]);

  // Load recordings
  const loadRecordings = useCallback(async (id = sessionId) => {
    if (!id) return;

    try {
      const response = await authApiService.getDemoRecordings(id);
      if (response.success) {
        setRecordings(response.data || []);
      } else {
        console.warn('Failed to load recordings:', response.message);
      }
    } catch (err) {
      console.error('Error loading recordings:', err);
    }
  }, [sessionId]);

  // Update session status (for real-time updates)
  const updateSessionStatus = useCallback((status) => {
    setSession(prev => prev ? { ...prev, status } : null);
  }, []);

  // Add participant (for real-time updates)
  const addParticipant = useCallback((participant) => {
    setParticipants(prev => {
      const exists = prev.find(p => p.id === participant.id);
      if (exists) return prev;
      return [...prev, participant];
    });
  }, []);

  // Remove participant (for real-time updates)
  const removeParticipant = useCallback((participantId) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  }, []);

  // Load initial data when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
      loadRecordings(sessionId);
    }
  }, [sessionId, loadSession, loadRecordings]);

  return {
    // State
    session,
    participants,
    recordings,
    isLoading,
    isRecording,
    error,
    
    // Actions
    createSession,
    loadSession,
    startSession,
    endSession,
    inviteParticipants,
    startRecording,
    stopRecording,
    loadRecordings,
    
    // Real-time updates
    updateSessionStatus,
    addParticipant,
    removeParticipant,
    
    // Computed values
    isLive: session?.status === DEMO_SESSION_STATUS.LIVE,
    isScheduled: session?.status === DEMO_SESSION_STATUS.SCHEDULED,
    isEnded: session?.status === DEMO_SESSION_STATUS.ENDED,
    canStart: session?.status === DEMO_SESSION_STATUS.SCHEDULED,
    canEnd: session?.status === DEMO_SESSION_STATUS.LIVE || session?.status === DEMO_SESSION_STATUS.PAUSED,
  };
}; 