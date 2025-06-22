import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Link, 
  Copy, 
  Mail, 
  Calendar,
  Trash2,
  Plus,
  Check,
  ExternalLink,
  Clock,
  UserPlus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { authApiService } from '../../services/authApi';

export const InviteParticipants = ({ sessionId, isOpen, onClose }) => {
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(null);
  const { toast } = useToast();

  // Load existing invites
  const loadInvites = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await authApiService.getDemoInvites(sessionId);
      if (response.success) {
        setInvites(response.data || []);
      } else {
        console.error('Failed to load invites:', response.message);
      }
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new invite
  const generateInvite = async (role = 'participant') => {
    try {
      setIsGenerating(true);
      
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const response = await authApiService.generateDemoInvite(sessionId, {
        role,
        expiresAt: expiresAt.toISOString(),
        maxUses: 50
      });
      
      if (response.success) {
        setInvites(prev => [...prev, response.data]);
        toast.success('Invite Generated', 'New invite link created successfully');
        
        // Auto-copy to clipboard
        const inviteUrl = `${window.location.origin}/demo/join/${response.data.inviteCode}`;
        await copyToClipboard(inviteUrl, response.data.id);
      } else {
        toast.error('Generate Error', response.message || 'Failed to generate invite');
      }
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Generate Error', 'Failed to generate invite');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy invite link to clipboard
  const copyToClipboard = async (inviteUrl, inviteId) => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(inviteId);
      toast.success('Copied!', 'Invite link copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedInvite(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Copy Error', 'Failed to copy invite link');
    }
  };

  // Revoke invite
  const revokeInvite = async (inviteId) => {
    try {
      const response = await authApiService.revokeDemoInvite(sessionId, inviteId);
      if (response.success) {
        setInvites(prev => prev.filter(invite => invite.id !== inviteId));
        toast.success('Invite Revoked', 'Invite link has been revoked');
      } else {
        toast.error('Revoke Error', response.message || 'Failed to revoke invite');
      }
    } catch (error) {
      console.error('Error revoking invite:', error);
      toast.error('Revoke Error', 'Failed to revoke invite');
    }
  };

  // Load invites when component opens
  useEffect(() => {
    if (isOpen && sessionId) {
      loadInvites();
    }
  }, [isOpen, sessionId]);

  // Format expiration date
  const formatExpiration = (expiresAt) => {
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMs < 0) return 'Expired';
    if (diffHours < 1) return 'Expires soon';
    if (diffHours < 24) return `${diffHours}h left`;
    return date.toLocaleDateString();
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
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
                  Invite Participants
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate and manage invite links for your demo session
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Generate New Invite */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Generate New Invite
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => generateInvite('participant')}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Participant Invite
                </Button>
                <Button
                  onClick={() => generateInvite('observer')}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Observer Invite
                </Button>
              </div>
            </div>

            {/* Existing Invites */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Active Invites ({invites.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadInvites}
                  disabled={isLoading}
                >
                  <Clock className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">Loading invites...</p>
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Invites Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate your first invite link to start inviting participants
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invites.map((invite) => {
                    const inviteUrl = `${window.location.origin}/demo/join/${invite.inviteCode}`;
                    const isExpired = new Date(invite.expiresAt) < new Date();
                    
                    return (
                      <Card key={invite.id} className={`${isExpired ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${getRoleColor(invite.role)} text-white`}>
                                  {invite.role}
                                </Badge>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatExpiration(invite.expiresAt)}
                                </span>
                                {isExpired && (
                                  <Badge variant="destructive">Expired</Badge>
                                )}
                              </div>
                              
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 font-mono text-sm break-all">
                                {inviteUrl}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>Uses: {invite.usedCount || 0}/{invite.maxUses}</span>
                                <span>•</span>
                                <span>Created: {new Date(invite.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(inviteUrl, invite.id)}
                                disabled={isExpired}
                              >
                                {copiedInvite === invite.id ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(inviteUrl, '_blank')}
                                disabled={isExpired}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeInvite(invite.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Invite links expire in 24 hours by default
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