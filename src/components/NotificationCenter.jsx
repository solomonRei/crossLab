import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { 
  Bell,
  X,
  CheckCheck,
  Users,
  FolderOpen,
  Star,
  MessageCircle,
  Award,
  AlertCircle,
  Calendar,
  TrendingUp,
  Settings
} from 'lucide-react'
import { formatDate } from '../lib/utils'

// Notification types with icons and colors
const notificationTypes = {
  team_invite: { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  project_update: { icon: FolderOpen, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950' },
  review_request: { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
  message: { icon: MessageCircle, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  achievement: { icon: Award, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  deadline: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950' },
  milestone: { icon: TrendingUp, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950' },
  meeting: { icon: Calendar, color: 'text-teal-500', bgColor: 'bg-teal-50 dark:bg-teal-950' }
}

// Mock notifications with enhanced data
const mockNotifications = [
  {
    id: 1,
    type: "team_invite",
    title: "Team Invitation",
    message: "You've been invited to join the AI Coffee Assistant project",
    timestamp: "2024-01-22T14:30:00Z",
    read: false,
    priority: "high",
    actionData: {
      projectId: 1,
      invitedBy: "Maya Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya"
    }
  },
  {
    id: 2,
    type: "project_update",
    title: "Project Milestone",
    message: "Greenhouse Dashboard reached 60% completion",
    timestamp: "2024-01-22T11:00:00Z",
    read: false,
    priority: "medium",
    actionData: {
      projectId: 2,
      progress: 60
    }
  },
  {
    id: 3,
    type: "review_request",
    title: "Peer Review Required",
    message: "Please review David Kim's contribution to the AI Coffee Assistant",
    timestamp: "2024-01-22T09:15:00Z",
    read: false,
    priority: "high",
    actionData: {
      revieweeId: 3,
      projectId: 1,
      deadline: "2024-01-25"
    }
  }
]

export function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState('all')
  const [pushEnabled, setPushEnabled] = useState(false)

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'high') return notification.priority === 'high'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
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

  // Handle notification action
  const handleNotificationAction = useCallback((notification, action) => {
    switch (action) {
      case 'accept_invite':
        markAsRead(notification.id)
        break
      case 'view_project':
        markAsRead(notification.id)
        break
      case 'start_review':
        markAsRead(notification.id)
        break
      default:
        markAsRead(notification.id)
    }
  }, [markAsRead])

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPushEnabled(permission === 'granted')
    }
  }, [])

  // Simulate new notification
  const simulateNotification = useCallback(() => {
    const newNotification = {
      id: Date.now(),
      type: "message",
      title: "New Message",
      message: "Sophie Laurent: 'Can we schedule a team meeting?'",
      timestamp: new Date().toISOString(),
      read: false,
      priority: "medium",
      actionData: {
        senderId: 4,
        chatId: "team-2"
      }
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show browser notification if enabled
    if (pushEnabled && 'Notification' in window) {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/logo192.png',
        tag: `notification-${newNotification.id}`
      })
    }
  }, [pushEnabled])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed right-4 top-20 w-96 max-h-[80vh] bg-card border rounded-lg shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={requestPushPermission}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-1">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'high', label: 'Priority', count: notifications.filter(n => n.priority === 'high').length }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filter === filterOption.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className="ml-1">({filterOption.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="w-full mt-2 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto max-h-96">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const NotificationIcon = notificationTypes[notification.type]?.icon || Bell
              const iconColor = notificationTypes[notification.type]?.color || 'text-gray-500'
              const bgColor = notificationTypes[notification.type]?.bgColor || 'bg-gray-50'

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50/30 dark:bg-blue-950/30' : ''
                  }`}
                  onClick={() => handleNotificationAction(notification, 'view')}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${bgColor}`}>
                      <NotificationIcon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                              !
                            </Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {/* Action buttons based on notification type */}
                          {notification.type === 'team_invite' && !notification.read && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs px-2 py-1 h-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationAction(notification, 'accept_invite')
                              }}
                            >
                              Accept
                            </Button>
                          )}
                          
                          {notification.type === 'review_request' && !notification.read && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs px-2 py-1 h-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationAction(notification, 'start_review')
                              }}
                            >
                              Review
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Push notifications: {pushEnabled ? 'Enabled' : 'Disabled'}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={simulateNotification}
            className="text-xs h-6"
          >
            Test notification
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 