import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Mail,
  Calendar,
  X,
  Check,
  Loader2,
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { useToast } from '../ui/Toast';
import { authApiService } from '../../services/authApi';

const ProjectRoles = {
  MEMBER: 'Member',
  DEVELOPER: 'Developer',
  DESIGNER: 'Designer',
  ANALYST: 'Analyst',
  TESTER: 'Tester',
  PROJECT_MANAGER: 'ProjectManager'
};

const JoinRequestCard = ({ request, onApprove, onReject, isProcessing }) => {
  const [selectedRole, setSelectedRole] = useState(request.requestedRole || ProjectRoles.MEMBER);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={request.user?.avatarUrl} />
            <AvatarFallback className="bg-blue-500 text-white">
              {getInitials(request.user?.firstName, request.user?.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {request.user?.firstName} {request.user?.lastName}
              </h4>
              <Badge variant="outline" className="text-xs">
                {request.user?.preferredRole || 'User'}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {request.user?.email}
            </p>
            
            {request.message && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 italic">
                "{request.message}"
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Requested {formatDate(request.requestedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Wants to join as {request.requestedRole}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isProcessing}
          >
            {Object.entries(ProjectRoles).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onApprove(request, selectedRole)}
              disabled={isProcessing}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={() => onReject(request)}
              disabled={isProcessing}
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const JoinRequestsManager = ({ projectId, isOpen, onClose, onRequestProcessed }) => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && projectId) {
      loadJoinRequests();
    }
  }, [isOpen, projectId]);

  const loadJoinRequests = async () => {
    setIsLoading(true);
    try {
      const response = await authApiService.getProjectJoinRequests(projectId);
      
      if (response.success) {
        setJoinRequests(response.data || []);
      } else {
        toast.error('Load Error', response.message || 'Failed to load join requests');
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
      toast.error('Load Error', 'Failed to load join requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (request, approvedRole) => {
    setProcessingRequests(prev => new Set([...prev, request.id]));
    
    try {
      const approvalData = {
        role: approvedRole,
        message: `Welcome to the project! You have been approved as a ${approvedRole}.`
      };

      const response = await authApiService.approveJoinRequest(projectId, request.id, approvalData);
      
      if (response.success) {
        setJoinRequests(prev => prev.filter(req => req.id !== request.id));
        toast.success('Request Approved', `${request.user?.firstName} ${request.user?.lastName} has been added to the project`);
        
        if (onRequestProcessed) {
          onRequestProcessed(response.data, 'approved');
        }
      } else {
        toast.error('Approval Failed', response.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Approval Error', 'Failed to approve request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (request) => {
    setProcessingRequests(prev => new Set([...prev, request.id]));
    
    try {
      const rejectionData = {
        message: 'Thank you for your interest. Unfortunately, we cannot accept your request to join this project at this time.'
      };

      const response = await authApiService.rejectJoinRequest(projectId, request.id, rejectionData);
      
      if (response.success) {
        setJoinRequests(prev => prev.filter(req => req.id !== request.id));
        toast.success('Request Rejected', `Request from ${request.user?.firstName} ${request.user?.lastName} has been rejected`);
        
        if (onRequestProcessed) {
          onRequestProcessed(request, 'rejected');
        }
      } else {
        toast.error('Rejection Failed', response.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Rejection Error', 'Failed to reject request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setJoinRequests([]);
    setProcessingRequests(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
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
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Join Requests ({joinRequests.length})
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review and manage requests to join your project
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadJoinRequests}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">Loading join requests...</p>
                </div>
              </div>
            ) : joinRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Pending Requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are no pending requests to join this project
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <JoinRequestCard
                    key={request.id}
                    request={request}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                    isProcessing={processingRequests.has(request.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: You can change the role before approving a request
            </div>
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 