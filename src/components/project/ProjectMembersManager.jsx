import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  Crown,
  Settings,
  MoreVertical,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Edit3,
  RefreshCw,
  Bell
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { useToast } from '../ui/Toast';
import { authApiService } from '../../services/authApi';
import { InviteProjectMember } from './InviteProjectMember';
import { JoinRequestsManager } from './JoinRequestsManager';

const MemberCard = ({ member, currentUserId, isCreator, onRoleUpdate, onRemoveMember }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'projectmanager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'developer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'designer':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'analyst':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'tester':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleRoleChange = async (newRole) => {
    setIsUpdating(true);
    try {
      await onRoleUpdate(member.id, newRole);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsUpdating(false);
      setShowActions(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName} from the project?`)) {
      setIsUpdating(true);
      try {
        await onRemoveMember(member.id);
      } catch (error) {
        console.error('Error removing member:', error);
      } finally {
        setIsUpdating(false);
        setShowActions(false);
      }
    }
  };

  const canManageMember = isCreator && member.id !== currentUserId && !member.isProjectLead;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} />
              <AvatarFallback className="bg-blue-500 text-white">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            {member.isProjectLead && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {member.firstName} {member.lastName}
              </h4>
              {member.isProjectLead && (
                <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Creator
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {member.email}
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${getRoleBadgeColor(member.projectRole)}`}>
                {member.projectRole}
              </Badge>
              {member.preferredRole && member.preferredRole !== member.projectRole && (
                <Badge variant="outline" className="text-xs">
                  Prefers {member.preferredRole}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDate(member.joinedAt)}</span>
              </div>
              {member.invitedBy && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>Invited by {member.invitedByName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {canManageMember && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              disabled={isUpdating}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                    Change Role
                  </div>
                  {['Member', 'Developer', 'Designer', 'Analyst', 'Tester', 'ProjectManager'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      disabled={isUpdating}
                    >
                      {role}
                    </button>
                  ))}
                  
                  <hr className="my-2" />
                  
                  <button
                    onClick={handleRemove}
                    className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-2"
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove from Project
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ProjectMembersManager = ({ project, currentUser }) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [joinRequestsCount, setJoinRequestsCount] = useState(0);
  const { toast } = useToast();

  const isCreator = project?.createdBy === currentUser?.id;

  // Отладочная информация
  console.log('ProjectMembersManager Debug:', {
    projectCreatedBy: project?.createdBy,
    currentUserId: currentUser?.id,
    isCreator: isCreator,
    project: project,
    currentUser: currentUser
  });

  useEffect(() => {
    if (project?.id) {
      loadMembers();
      if (isCreator) {
        loadJoinRequestsCount();
      }
    }
  }, [project?.id, isCreator]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const response = await authApiService.getProjectMembers(project.id, { isActive: true });
      
      if (response.success) {
        setMembers(response.data || []);
      } else {
        toast.error('Load Error', response.message || 'Failed to load project members');
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Load Error', 'Failed to load project members');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJoinRequestsCount = async () => {
    try {
      const response = await authApiService.getProjectJoinRequests(project.id);
      if (response.success) {
        setJoinRequestsCount(response.data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading join requests count:', error);
    }
  };

  const handleMemberInvited = (newMember) => {
    // Refresh members list
    loadMembers();
    toast.success('Member Invited', 'Invitation sent successfully');
  };

  const handleRequestProcessed = (processedRequest, action) => {
    if (action === 'approved') {
      // Refresh members list to show new member
      loadMembers();
    }
    // Refresh join requests count
    loadJoinRequestsCount();
  };

  const handleRoleUpdate = async (memberId, newRole) => {
    try {
      const response = await authApiService.updateProjectMemberRole(project.id, memberId, { role: newRole });
      
      if (response.success) {
        // Update local state
        setMembers(prev => prev.map(member => 
          member.id === memberId 
            ? { ...member, projectRole: newRole }
            : member
        ));
        toast.success('Role Updated', 'Member role updated successfully');
      } else {
        toast.error('Update Failed', response.message || 'Failed to update member role');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Update Error', 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await authApiService.removeProjectMember(project.id, memberId);
      
      if (response.success) {
        // Remove from local state
        setMembers(prev => prev.filter(member => member.id !== memberId));
        toast.success('Member Removed', 'Member removed from project successfully');
      } else {
        toast.error('Remove Failed', response.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Remove Error', 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members ({members.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your project team and collaboration
            </p>
          </div>
        </div>

        {/* Временно убираем проверку isCreator для тестирования */}
        {true && (
          <div className="flex items-center gap-2">
            {joinRequestsCount > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowJoinRequests(true)}
                className="relative"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Join Requests
                <Badge className="ml-2 bg-orange-500 text-white text-xs">
                  {joinRequestsCount}
                </Badge>
              </Button>
            )}
            
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMembers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading team members...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              currentUserId={currentUser?.id}
              isCreator={isCreator}
              onRoleUpdate={handleRoleUpdate}
              onRemoveMember={handleRemoveMember}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && members.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Team Members Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start building your team by inviting members to collaborate on this project
          </p>
          {/* Временно убираем проверку isCreator для тестирования */}
          {true && (
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Your First Member
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <InviteProjectMember
        projectId={project?.id}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onMemberInvited={handleMemberInvited}
      />

      <JoinRequestsManager
        projectId={project?.id}
        isOpen={showJoinRequests}
        onClose={() => setShowJoinRequests(false)}
        onRequestProcessed={handleRequestProcessed}
      />
    </div>
  );
}; 