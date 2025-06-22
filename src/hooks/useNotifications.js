import { useState, useCallback, useEffect } from 'react'
import { authApiService } from '../services/authApi'
import { useToast } from '../components/ui/Toast'

// Simplified notification service without WebSocket (can be enhanced later)
class NotificationService {
  constructor() {
    this.listeners = new Set()
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notify all listeners
  notifyListeners(notification) {
    this.listeners.forEach(callback => callback(notification))
  }

  // Get user preferences (mock for now - can be implemented when API is available)
  async getPreferences(userId) {
    return {
      pushEnabled: false,
      emailEnabled: true,
      categories: {
        task_assigned: true,
        task_status_changed: true,
        task_review: true,
        task_completed: true,
        team_invite: true,
        project_update: true,
        review_request: true,
        mention: true,
        general: true
      }
    }
  }

  // Update user preferences (mock for now)
  async updatePreferences(userId, preferences) {
    return { success: true }
  }
}

// Global notification service instance
const notificationService = new NotificationService()

export function useNotifications(userId = null) {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preferences, setPreferences] = useState({
    pushEnabled: false,
    emailEnabled: true,
    categories: {
      task_assigned: true,
      task_status_changed: true,
      task_review: true,
      task_completed: true,
      team_invite: true,
      project_update: true,
      review_request: true,
      mention: true,
      general: true
    }
  })
  const [pushPermission, setPushPermission] = useState('default')
  const { toast } = useToast()

  // Initialize push permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }, [])

  // Load notifications from API
  const loadNotifications = useCallback(async (filters = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authApiService.getNotifications({
        take: 50, // Limit to 50 notifications
        ...filters
      })
      
      if (response.success) {
        setNotifications(response.data || [])
      } else {
        setError(response.message || 'Failed to load notifications')
        toast.error('Notifications Error', 'Failed to load notifications')
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load notifications'
      setError(errorMessage)
      toast.error('Notifications Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      
      if (permission === 'granted') {
        toast.success('Notifications Enabled', 'You will now receive browser notifications')
      } else {
        toast.warning('Notifications Blocked', 'Browser notifications are disabled')
      }
      
      return permission === 'granted'
    }
    return false
  }, [toast])

  // Add new notification (for local state management)
  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      createdAt: notification.createdAt || new Date().toISOString(),
      isRead: false
    }

    setNotifications(prev => [newNotification, ...prev])
    
    // Show browser notification if enabled
    if (pushPermission === 'granted' && preferences.pushEnabled) {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/logo192.png',
        tag: `notification-${newNotification.id}`
      })
    }
    
    return newNotification
  }, [pushPermission, preferences.pushEnabled])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await authApiService.markNotificationAsRead(notificationId)
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        )
      } else {
        toast.error('Update Failed', 'Failed to mark notification as read')
      }
    } catch (err) {
      toast.error('Update Error', 'Failed to mark notification as read')
    }
  }, [toast])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Since API doesn't have bulk mark as read, we'll do it individually
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      const promises = unreadNotifications.map(notification => 
        authApiService.markNotificationAsRead(notification.id)
      )
      
      await Promise.all(promises)
      
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }))
      )
      
      toast.success('All Read', 'All notifications marked as read')
    } catch (err) {
      toast.error('Update Error', 'Failed to mark all notifications as read')
    }
  }, [notifications, toast])

  // Delete notification (local only since API doesn't have delete endpoint)
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  // Create mention notification
  const createMentionNotification = useCallback(async (mentionData) => {
    try {
      const response = await authApiService.createMentionNotification(mentionData)
      
      if (response.success && response.data) {
        // Add the new notifications to local state
        setNotifications(prev => [...response.data, ...prev])
        toast.success('Mention Sent', 'Mention notification sent successfully')
        return response.data
      } else {
        toast.error('Mention Failed', 'Failed to send mention notification')
        return null
      }
    } catch (err) {
      toast.error('Mention Error', 'Failed to send mention notification')
      return null
    }
  }, [toast])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      setPreferences(newPreferences)
      await notificationService.updatePreferences(userId, newPreferences)
      toast.success('Settings Saved', 'Notification preferences updated')
    } catch (err) {
      toast.error('Settings Error', 'Failed to update notification preferences')
    }
  }, [userId, toast])

  // Get filtered notifications
  const getFilteredNotifications = useCallback((filter = 'all') => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead)
      case 'high':
        return notifications.filter(n => n.priority === 'high' || n.priority === 'urgent')
      case 'today':
        const today = new Date().toDateString()
        return notifications.filter(n => 
          new Date(n.createdAt).toDateString() === today
        )
      case 'type':
        return (type) => notifications.filter(n => n.type === type)
      default:
        return notifications
    }
  }, [notifications])

  // Get notification counts
  const getCounts = useCallback(() => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      high: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
      today: notifications.filter(n => 
        new Date(n.createdAt).toDateString() === new Date().toDateString()
      ).length
    }
  }, [notifications])

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    // State
    notifications,
    isLoading,
    error,
    preferences,
    pushPermission,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createMentionNotification,
    updatePreferences,
    requestPushPermission,
    refreshNotifications,

    // Getters
    getFilteredNotifications,
    getCounts,

    // Service
    service: notificationService
  }
} 