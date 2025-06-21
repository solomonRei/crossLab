import { useState, useCallback } from 'react'

// Simplified notification service without WebSocket
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

  // Get user preferences (mock)
  async getPreferences(userId) {
    return {
      pushEnabled: false,
      emailEnabled: true,
      categories: {
        team_invite: true,
        project_update: true,
        review_request: true,
        message: true,
        achievement: true,
        deadline: true
      }
    }
  }

  // Update user preferences (mock)
  async updatePreferences(userId, preferences) {
    return { success: true }
  }
}

// Global notification service instance
const notificationService = new NotificationService()

export function useNotifications(userId = 1) {
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState({
    pushEnabled: false,
    emailEnabled: true,
    categories: {
      team_invite: true,
      project_update: true,
      review_request: true,
      message: true,
      achievement: true,
      deadline: true
    }
  })
  const [pushPermission, setPushPermission] = useState('default')

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)
      return permission === 'granted'
    }
    return false
  }, [])

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now(),
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])
    return newNotification
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    setPreferences(newPreferences)
    await notificationService.updatePreferences(userId, newPreferences)
  }, [userId])

  // Get filtered notifications
  const getFilteredNotifications = useCallback((filter = 'all') => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'high':
        return notifications.filter(n => n.priority === 'high')
      case 'today':
        const today = new Date().toDateString()
        return notifications.filter(n => 
          new Date(n.timestamp).toDateString() === today
        )
      default:
        return notifications
    }
  }, [notifications])

  // Get notification counts
  const getCounts = useCallback(() => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      high: notifications.filter(n => n.priority === 'high').length,
      today: notifications.filter(n => 
        new Date(n.timestamp).toDateString() === new Date().toDateString()
      ).length
    }
  }, [notifications])

  return {
    // State
    notifications,
    isLoading: false,
    error: null,
    preferences,
    pushPermission,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    requestPushPermission,

    // Getters
    getFilteredNotifications,
    getCounts,

    // Service
    service: notificationService
  }
} 