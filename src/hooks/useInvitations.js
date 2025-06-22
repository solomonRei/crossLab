import { useState, useEffect } from 'react';
import { authApiService } from '../services/authApi';

export const useInvitations = (userId) => {
  const [invitations, setInvitations] = useState([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvitations = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApiService.getUserInvitations();
      
      if (response.success) {
        const pendingInvitations = response.data?.filter(
          inv => inv.isActive === false
        ) || [];
        
        setInvitations(pendingInvitations);
        setInvitationsCount(pendingInvitations.length);
        
        console.log('🎯 Invitations loaded:', {
          total: response.data?.length || 0,
          pending: pendingInvitations.length,
          invitations: pendingInvitations
        });
      } else {
        console.error('Failed to load invitations:', response.message);
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInvitations = () => {
    fetchInvitations();
  };

  useEffect(() => {
    fetchInvitations();
    
    // Poll for new invitations every 30 seconds
    const interval = setInterval(fetchInvitations, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  return {
    invitations,
    invitationsCount,
    isLoading,
    error,
    refreshInvitations
  };
}; 