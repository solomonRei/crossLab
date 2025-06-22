import { authApiService } from './authApi';

class SignalingService {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.userId = null;
    this.eventHandlers = new Map();
  }

  // Connect to session
  async connect(sessionId, userId) {
    this.sessionId = sessionId;
    this.userId = userId;

    // For now, we'll simulate WebRTC signaling through polling
    // In a real implementation, you'd use WebSockets or SignalR
    this.startPolling();
    
    return true;
  }

  // Disconnect from session
  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.sessionId = null;
    this.userId = null;
    this.eventHandlers.clear();
  }

  // Send signaling data
  async sendSignal(targetUserId, signalData) {
    try {
      const response = await authApiService.sendDemoSignal(this.sessionId, {
        targetUserId,
        signalData,
        type: 'webrtc-signal'
      });
      
      return response.success;
    } catch (error) {
      console.error('Error sending signal:', error);
      return false;
    }
  }

  // Join session
  async joinSession() {
    try {
      const response = await authApiService.joinDemoSession(this.sessionId);
      return response.success;
    } catch (error) {
      console.error('Error joining session:', error);
      return false;
    }
  }

  // Leave session
  async leaveSession() {
    try {
      // Only make API call if we have a valid sessionId
      if (this.sessionId && this.sessionId !== 'null' && this.sessionId !== null) {
        const response = await authApiService.leaveDemoSession(this.sessionId);
        this.disconnect();
        return response.success;
      } else {
        // Just disconnect without API call if no valid sessionId
        this.disconnect();
        return true;
      }
    } catch (error) {
      console.error('Error leaving session:', error);
      this.disconnect(); // Still disconnect even if API call fails
      return false;
    }
  }

  // Add event handler
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // Remove event handler
  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit event
  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Start polling for signaling messages (temporary solution)
  startPolling() {
    // Clear any existing polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Only start polling if we have a valid sessionId
    if (!this.sessionId || this.sessionId === 'null' || this.sessionId === null) {
      console.warn('Cannot start polling: invalid sessionId');
      return;
    }
    
    console.log('Starting signaling polling for session:', this.sessionId);
    
    this.pollingInterval = setInterval(async () => {
      try {
        // Double-check sessionId is still valid
        if (!this.sessionId || this.sessionId === 'null' || this.sessionId === null) {
          this.disconnect();
          return;
        }
        
        const response = await authApiService.getDemoSignals(this.sessionId);
        if (response.success && response.data && Array.isArray(response.data)) {
          response.data.forEach(signal => {
            this.handleIncomingSignal(signal);
          });
        }
      } catch (error) {
        console.error('Error polling signals:', error);
        // Don't stop polling on individual errors, but limit retries
      }
    }, 2000); // Poll every 2 seconds instead of 1 second to reduce load
  }

  // Handle incoming signal
  handleIncomingSignal(signal) {
    switch (signal.type) {
      case 'user-joined':
        this.emit('user-joined', {
          userId: signal.fromUserId,
          signal: signal.signalData
        });
        break;
      
      case 'user-left':
        this.emit('user-left', {
          userId: signal.fromUserId
        });
        break;
      
      case 'webrtc-signal':
        this.emit('signal', {
          from: signal.fromUserId,
          signal: signal.signalData
        });
        break;
      
      default:
        console.log('Unknown signal type:', signal.type);
    }
  }

  // Get session participants
  async getParticipants() {
    try {
      const response = await authApiService.getDemoParticipants(this.sessionId);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error getting participants:', error);
      return [];
    }
  }
}

export const signalingService = new SignalingService(); 