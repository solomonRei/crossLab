import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Mail, 
  X, 
  Check,
  Loader2,
  Users,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
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

const UserSearchResult = ({ user, onInvite, isInviting, selectedRole, onRoleChange }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-blue-500 text-white">
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
          {user.preferredRole && (
            <Badge variant="outline" className="text-xs mt-1">
              {user.preferredRole}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {Object.entries(ProjectRoles).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
        
        <Button
          onClick={() => onInvite(user)}
          disabled={isInviting}
          size="sm"
          className="flex items-center gap-1"
        >
          {isInviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Invite
        </Button>
      </div>
    </motion.div>
  );
};

export const InviteProjectMember = ({ projectId, isOpen, onClose, onMemberInvited }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [invitingUsers, setInvitingUsers] = useState(new Set());
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const { toast } = useToast();

  // Search users with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, projectId]);

  const searchUsers = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await authApiService.searchUsers(query, {
        excludeProjectId: projectId
      });
      
      if (response.success) {
        setSearchResults(response.data || []);
        
        // Initialize default roles for new users
        const newRoles = {};
        response.data.forEach(user => {
          if (!selectedRoles[user.id]) {
            newRoles[user.id] = user.preferredRole || ProjectRoles.MEMBER;
          }
        });
        setSelectedRoles(prev => ({ ...prev, ...newRoles }));
      } else {
        toast.error('Search Error', response.message || 'Failed to search users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search Error', 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  const handleInviteUser = async (user) => {
    setInvitingUsers(prev => new Set([...prev, user.id]));
    
    try {
      const inviteData = {
        userId: user.id,
        email: user.email,
        role: selectedRoles[user.id] || ProjectRoles.MEMBER,
        message: `You have been invited to join this project as a ${selectedRoles[user.id] || ProjectRoles.MEMBER}`
      };

      const response = await authApiService.inviteToProject(projectId, inviteData);
      
      if (response.success) {
        setInvitedUsers(prev => new Set([...prev, user.id]));
        toast.success('Invitation Sent', `Invitation sent to ${user.firstName} ${user.lastName}`);
        
        if (onMemberInvited) {
          onMemberInvited(response.data);
        }
      } else {
        toast.error('Invitation Failed', response.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Invitation Error', 'Failed to send invitation');
    } finally {
      setInvitingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedRoles({});
    setInvitedUsers(new Set());
    setInvitingUsers(new Set());
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
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
                  Invite Team Members
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Search and invite users to join your project
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1 overflow-y-auto p-6">
            {!searchQuery.trim() ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Search for Users
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start typing to search for users to invite to your project
                </p>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No users found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <UserSearchResult
                    key={user.id}
                    user={user}
                    onInvite={handleInviteUser}
                    isInviting={invitingUsers.has(user.id)}
                    selectedRole={selectedRoles[user.id] || ProjectRoles.MEMBER}
                    onRoleChange={(role) => handleRoleChange(user.id, role)}
                  />
                ))}
              </div>
            )}

            {/* Invited Users Summary */}
            {invitedUsers.size > 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Invitations Sent ({invitedUsers.size})
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Invited users will receive email notifications and can accept the invitation from their dashboard.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Users will receive email invitations and can accept them from their dashboard
            </div>
            <Button onClick={handleClose}>
              Done
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 