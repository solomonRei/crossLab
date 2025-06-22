import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, 
  Calendar, 
  Users, 
  Clock,
  Play,
  Plus,
  Settings,
  RefreshCw,
  FileVideo
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CreateDemoModal } from '../components/demo/CreateDemoModal';
import { DemoRecordings } from '../components/demo/DemoRecordings';
import { useToast } from '../components/ui/Toast';
import { authApiService } from '../services/authApi';
import { 
  DEMO_SESSION_TYPE, 
  DEMO_SESSION_STATUS, 
  RECORDING_QUALITY 
} from '../hooks/demo/useDemoState';

const DemoSessionCard = ({ session, onJoin, onEdit, onViewRecordings }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case DEMO_SESSION_STATUS.LIVE:
        return 'bg-red-500';
      case DEMO_SESSION_STATUS.SCHEDULED:
        return 'bg-blue-500';
      case DEMO_SESSION_STATUS.ENDED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case DEMO_SESSION_TYPE.PRODUCT_DEMO:
        return <Video className="h-4 w-4" />;
      case DEMO_SESSION_TYPE.TRAINING:
        return <Users className="h-4 w-4" />;
      case DEMO_SESSION_TYPE.WEBINAR:
        return <Calendar className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                {getTypeIcon(session.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {session.description}
                </p>
              </div>
            </div>
            
            <Badge 
              className={`${getStatusColor(session.status)} text-white`}
            >
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(session.scheduledAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{session.participantCount || 0}/{session.maxParticipants}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{session.type}</Badge>
              {session.autoRecord && (
                <Badge variant="secondary">Auto Record</Badge>
              )}
              {session.recordingQuality && (
                <Badge variant="outline">{session.recordingQuality}</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={() => onJoin(session)}
                className="flex-1"
                disabled={session.status === DEMO_SESSION_STATUS.ENDED}
              >
                <Play className="h-4 w-4 mr-2" />
                {session.status === DEMO_SESSION_STATUS.LIVE ? 'Join Live' : 'Join Session'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewRecordings(session)}
                title="View Recordings"
              >
                <FileVideo className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(session)}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const DemoPage = () => {
  const [userRole, setUserRole] = useState('host'); // host, presenter, participant, observer
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [demoSessions, setDemoSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSessionForRecordings, setSelectedSessionForRecordings] = useState(null);
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load demo sessions from API
  const loadDemoSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApiService.getDemoSessions();
      
      if (response.success) {
        setDemoSessions(response.data || []);
        console.log('Demo sessions loaded:', response.data?.length || 0);
      } else {
        setError(response.message || 'Failed to load demo sessions');
        toast.error('Load Error', response.message || 'Failed to load demo sessions');
      }
    } catch (err) {
      console.error('Error loading demo sessions:', err);
      setError(err.message);
      toast.error('Load Error', 'Failed to load demo sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    loadDemoSessions();
  }, []);

  const handleJoinSession = (session) => {
    console.log('Joining session:', session.id);
    // Navigate to the demo room with the session ID in the URL
    navigate(`/demo/room/${session.id}`, {
      state: {
        fromDemoPage: true,
        role: userRole // Pass the selected role
      }
    });
  };

  const handleEditSession = (session) => {
    console.log('Edit session:', session);
    // TODO: Open edit modal
  };

  const handleViewRecordings = (session) => {
    console.log('View recordings for session:', session.id);
    setSelectedSessionForRecordings(session);
    setIsRecordingsModalOpen(true);
  };

  const handleCreateSession = () => {
    setIsCreateModalOpen(true);
  };

  const handleSessionCreated = (newSession) => {
    setDemoSessions(prev => [newSession, ...prev]);
    toast.success('Session Created', 'Demo session created successfully');
  };

  const handleLeaveSession = () => {
    // Implement leave session logic
  };

  const handleRefresh = () => {
    loadDemoSessions();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Demo Sessions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and join interactive demo sessions
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Role Selector for Testing */}
            <select 
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="host">Host</option>
              <option value="presenter">Presenter</option>
              <option value="participant">Participant</option>
              <option value="observer">Observer</option>
            </select>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={handleCreateSession}>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">Loading demo sessions...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
                  Failed to Load Demo Sessions
                </h3>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Demo Sessions Grid */}
        {!isLoading && !error && (
          <>
            {demoSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoSessions.map((session) => (
                  <DemoSessionCard
                    key={session.id}
                    session={session}
                    onJoin={handleJoinSession}
                    onEdit={handleEditSession}
                    onViewRecordings={handleViewRecordings}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No Demo Sessions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first demo session
                </p>
                <Button onClick={handleCreateSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Demo Session
                </Button>
              </div>
            )}
          </>
        )}

        {/* Quick Start Info */}
        {!isLoading && demoSessions.length > 0 && (
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Quick Start Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Create Session
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Set up a new demo session with custom settings and participant limits
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Invite Participants
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Send invitation links to participants via email or direct sharing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Start Demo
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Begin your interactive demo with video, screen sharing, and recording
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Demo Modal */}
      <CreateDemoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />

      {/* Demo Recordings Modal */}
      <DemoRecordings
        sessionId={selectedSessionForRecordings?.id}
        isOpen={isRecordingsModalOpen}
        onClose={() => {
          setIsRecordingsModalOpen(false);
          setSelectedSessionForRecordings(null);
        }}
      />
    </div>
  );
}; 