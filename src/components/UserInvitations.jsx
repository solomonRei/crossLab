import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Check, 
  X,
  Calendar,
  Users,
  Briefcase,
  Mail,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';
import { useToast } from './ui/Toast';
import { authApiService } from '../services/authApi';

const InvitationCard = ({ invitation, onAccept, onDecline, isProcessing }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntityIcon = (type) => {
    return type === 'Project' ? Briefcase : Users;
  };

  const getEntityColor = (type) => {
    return type === 'Project' ? 'text-blue-600' : 'text-green-600';
  };

  const EntityIcon = getEntityIcon(invitation.relatedEntityType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 bg-gray-100 dark:bg-gray-800 rounded-lg ${getEntityColor(invitation.relatedEntityType)}`}>
            <EntityIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {invitation.relatedEntityName}
              </h4>
              <Badge variant="outline" className="text-xs">
                {invitation.relatedEntityType}
              </Badge>
            </div>
            
            {invitation.relatedEntityDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {invitation.relatedEntityDescription}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Invited {formatDate(invitation.invitedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>By {invitation.invitedByName}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                <span>As {invitation.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            onClick={() => onAccept(invitation)}
            disabled={isProcessing}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => onDecline(invitation)}
            disabled={isProcessing}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const UserInvitations = ({ isOpen, onClose }) => {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingInvitations, setProcessingInvitations] = useState(new Set());
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApiService.getUserInvitations();
      
      if (response.success) {
        setInvitations(response.data || []);
        console.log('Loaded invitations:', response.data?.length || 0);
      } else {
        setError(response.message || 'Failed to load invitations');
        console.error('Failed to load invitations:', response.message);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitation) => {
    setProcessingInvitations(prev => new Set([...prev, invitation.id]));
    
    try {
      let response;
      
      if (invitation.relatedEntityType === 'Project') {
        response = await authApiService.acceptProjectInvitation(invitation.id);
      } else if (invitation.relatedEntityType === 'Team') {
        response = await authApiService.acceptTeamInvitation(invitation.id);
      }
      
      if (response.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        toast.success('Invitation Accepted', 
          `You have joined ${invitation.relatedEntityName} as ${invitation.role}`
        );
      } else {
        toast.error('Accept Failed', response.message || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Accept Error', 'Failed to accept invitation');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (invitation) => {
    setProcessingInvitations(prev => new Set([...prev, invitation.id]));
    
    try {
      let response;
      
      if (invitation.relatedEntityType === 'Project') {
        response = await authApiService.declineProjectInvitation(invitation.id);
      } else if (invitation.relatedEntityType === 'Team') {
        response = await authApiService.declineTeamInvitation(invitation.id);
      }
      
      if (response.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        toast.success('Invitation Declined', 
          `You have declined the invitation to ${invitation.relatedEntityName}`
        );
      } else {
        toast.error('Decline Failed', response.message || 'Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Decline Error', 'Failed to decline invitation');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Invitations ({invitations.length})
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your pending project and team invitations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadInvitations}
                disabled={isLoading}
                title="Refresh Invitations"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" onClick={onClose} title="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">Loading invitations...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Failed to Load Invitations
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={loadInvitations}>
                  Try Again
                </Button>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Pending Invitations
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any pending invitations at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={handleAcceptInvitation}
                    onDecline={handleDeclineInvitation}
                    isProcessing={processingInvitations.has(invitation.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Accepting an invitation will add you to the project or team immediately
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 