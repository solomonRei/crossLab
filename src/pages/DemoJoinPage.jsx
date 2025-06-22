import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, 
  Users, 
  Calendar, 
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  LogIn
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { authApiService } from '../services/authApi';

export const DemoJoinPage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Load session data by invite code
  const loadSessionData = async () => {
    if (!inviteCode) {
      setError('Invalid invite link');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading session data for invite code:', inviteCode);
      
      const response = await authApiService.getDemoSessionByInvite(inviteCode);
      console.log('Session data response:', response);
      
      if (response.success) {
        setSessionData(response.data);
        setError(null);
        console.log('Session data loaded successfully:', response.data);
      } else {
        console.error('Failed to load session data:', response.message);
        setError(response.message || 'Failed to load session data');
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  // Join the session
  const joinSession = async () => {
    if (!sessionData) {
      console.error('No session data available for joining');
      return;
    }
    
    console.log('Attempting to join session:', sessionData.session.id);
    console.log('Session data:', sessionData);
    console.log('Is authenticated:', isAuthenticated);
    
    try {
      setIsJoining(true);
      
      // If user is authenticated, join via API
      if (isAuthenticated) {
        const response = await authApiService.joinDemoSession(sessionData.session.id);
        console.log('Join session response:', response);
        
        if (!response.success) {
          console.error('Join session failed:', response.message);
          toast.error('Join Error', response.message || 'Failed to join session');
          return;
        }
      }
      
      // Navigate to demo room (works for both authenticated and unauthenticated users)
      toast.success('Joined Session', 'Successfully joined the demo session');
      
      console.log('Navigating to demo room with sessionId:', sessionData.session.id);
      
      // Navigate to the demo room with the session ID in the URL
      navigate(`/demo/room/${sessionData.session.id}`, {
        state: { 
          fromInvite: true,
          inviteCode,
          role: sessionData.invite.role,
          isAuthenticated
        }
      });
      
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Join Error', 'Failed to join session');
    } finally {
      setIsJoining(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadSessionData();
  }, [inviteCode]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'host': return 'bg-red-500';
      case 'presenter': return 'bg-blue-500';
      case 'participant': return 'bg-green-500';
      case 'observer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Video className="h-16 w-16 animate-pulse mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Session...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying invite and loading session details
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          <Card>
            <CardContent className="p-8">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Invalid Invite
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <Button onClick={() => navigate('/demo')} className="w-full">
                Go to Demo Page
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const { session, invite } = sessionData;
  const isExpired = new Date(invite.expiresAt) < new Date();
  const canJoin = session.status === 'active' || session.status === 'scheduled';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Video className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              You're Invited!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join this demo session and collaborate with the team
            </p>
          </div>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {session.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Role */}
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(session.status)} text-white`}>
                  {session.status}
                </Badge>
                <Badge className={`${getRoleColor(invite.role)} text-white`}>
                  {invite.role}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive">Invite Expired</Badge>
                )}
              </div>

              {/* Description */}
              {session.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {session.description}
                </p>
              )}

              {/* Session Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(session.startTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.duration} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Host</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.hostName || session.createdBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.participantCount || 0} joined
                    </p>
                  </div>
                </div>
              </div>

              {/* Invite Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Invite Details
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Role: <span className="font-medium">{invite.role}</span></p>
                  <p>Expires: <span className="font-medium">
                    {new Date(invite.expiresAt).toLocaleString()}
                  </span></p>
                  <p>Uses: <span className="font-medium">
                    {invite.usedCount || 0}/{invite.maxUses}
                  </span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join Actions */}
          <Card>
            <CardContent className="p-6">
              {isExpired ? (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Invite Expired
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This invite link has expired. Please request a new invite from the host.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/demo')}>
                    Go to Demo Page
                  </Button>
                </div>
              ) : !canJoin ? (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Session Not Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This session is not currently active or has ended.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/demo')}>
                    Go to Demo Page
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ready to Join
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Click the button below to join the demo session as a {invite.role}.
                  </p>
                  
                  {/* Authentication Status */}
                  {!isAuthenticated && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          You're joining as a guest. For full features, consider signing in.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/demo')}
                    >
                      Cancel
                    </Button>
                    
                    {!isAuthenticated && (
                      <Button
                        variant="outline"
                        onClick={() => navigate('/auth', { 
                          state: { 
                            returnTo: `/demo/join/${inviteCode}` 
                          } 
                        })}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    )}
                    
                    <Button
                      onClick={joinSession}
                      disabled={isJoining}
                      className="px-8"
                    >
                      {isJoining ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          {isAuthenticated ? 'Join Session' : 'Join as Guest'}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  💡 Before Joining
                </h4>
                <ul className="space-y-1">
                  <li>• Make sure your camera and microphone are working</li>
                  <li>• Use a stable internet connection for best experience</li>
                  <li>• Join from a quiet environment if possible</li>
                  <li>• Check your browser permissions for camera/microphone access</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}; 