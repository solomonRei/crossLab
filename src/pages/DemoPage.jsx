import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Calendar, 
  Users, 
  Clock,
  Play,
  Plus,
  Settings
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DemoRoom } from '../components/demo/DemoRoom';
import { 
  DEMO_SESSION_TYPE, 
  DEMO_SESSION_STATUS, 
  RECORDING_QUALITY 
} from '../hooks/demo/useDemoState';

const DemoSessionCard = ({ session, onJoin, onEdit }) => {
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
              <Badge variant="outline">{session.recordingQuality}</Badge>
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
                onClick={() => onEdit(session)}
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
  const [activeSession, setActiveSession] = useState(null);
  const [userRole, setUserRole] = useState('host'); // host, presenter, participant, observer

  // Mock demo sessions
  const mockSessions = [
    {
      id: 'demo-1',
      title: 'Product Demo - CrossLab Platform',
      description: 'Comprehensive overview of the CrossLab collaboration platform features',
      type: DEMO_SESSION_TYPE.PRODUCT_DEMO,
      status: DEMO_SESSION_STATUS.SCHEDULED,
      scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
      maxParticipants: 50,
      participantCount: 12,
      autoRecord: true,
      recordingQuality: RECORDING_QUALITY.HD
    },
    {
      id: 'demo-2',
      title: 'Team Training Session',
      description: 'Training session for new team members on project workflows',
      type: DEMO_SESSION_TYPE.TRAINING,
      status: DEMO_SESSION_STATUS.LIVE,
      scheduledAt: new Date(Date.now() - 1800000), // 30 minutes ago
      maxParticipants: 20,
      participantCount: 8,
      autoRecord: false,
      recordingQuality: RECORDING_QUALITY.FULL_HD
    },
    {
      id: 'demo-3',
      title: 'Client Presentation - Q4 Results',
      description: 'Quarterly results presentation for key stakeholders',
      type: DEMO_SESSION_TYPE.CLIENT_PRESENTATION,
      status: DEMO_SESSION_STATUS.ENDED,
      scheduledAt: new Date(Date.now() - 7200000), // 2 hours ago
      maxParticipants: 30,
      participantCount: 25,
      autoRecord: true,
      recordingQuality: RECORDING_QUALITY.UHD
    }
  ];

  const handleJoinSession = (session) => {
    setActiveSession(session);
  };

  const handleEditSession = (session) => {
    console.log('Edit session:', session);
    // TODO: Open edit modal
  };

  const handleCreateSession = () => {
    console.log('Create new session');
    // TODO: Open create modal
  };

  const handleLeaveSession = () => {
    setActiveSession(null);
  };

  if (activeSession) {
    return (
      <DemoRoom 
        sessionId={activeSession.id}
        userRole={userRole}
        onLeave={handleLeaveSession}
      />
    );
  }

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
            
            <Button onClick={handleCreateSession}>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Demo Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSessions.map((session) => (
            <DemoSessionCard
              key={session.id}
              session={session}
              onJoin={handleJoinSession}
              onEdit={handleEditSession}
            />
          ))}
        </div>

        {/* Quick Start Info */}
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
      </div>
    </div>
  );
}; 