import { useState, useCallback } from 'react'
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
  Settings,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { formatDate } from '../lib/utils'
import { useNotifications } from '../hooks/useNotifications'

// Notification types with icons and colors
const notificationTypes = {
  task_assigned: { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  task_status_changed: { icon: FolderOpen, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950' },
  task_review: { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
  task_completed: { icon: Award, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950' },
  team_invite: { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  project_update: { icon: FolderOpen, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950' },
  review_request: { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
  mention: { icon: MessageCircle, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  general: { icon: Bell, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-950' },
  // Legacy support
  message: { icon: MessageCircle, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  achievement: { icon: Award, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  deadline: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950' },
  milestone: { icon: TrendingUp, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950' },
  meeting: { icon: Calendar, color: 'text-teal-500', bgColor: 'bg-teal-50 dark:bg-teal-950' }
}

export function NotificationCenter({ isOpen, onClose }) {
  const [filter, setFilter] = useState('all')
  
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPushPermission,
    refreshNotifications,
    getFilteredNotifications,
    getCounts,
    pushPermission,
    preferences
  } = useNotifications()

  // Filter notifications
  const filteredNotifications = getFilteredNotifications(filter)
  const counts = getCounts()

  // Handle notification action
  const handleNotificationAction = useCallback((notification, action) => {
    switch (action) {
      case 'accept_invite':
        markAsRead(notification.id)
        // TODO: Navigate to project or handle invitation acceptance
        break
      case 'view_project':
        markAsRead(notification.id)
        // TODO: Navigate to project
        break
      case 'start_review':
        markAsRead(notification.id)
        // TODO: Navigate to review page
        break
      case 'view_task':
        markAsRead(notification.id)
        // TODO: Navigate to task
        break
      default:
        markAsRead(notification.id)
    }
  }, [markAsRead])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshNotifications()
  }, [refreshNotifications])

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
            {counts.unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {counts.unread}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={requestPushPermission}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex space-x-1">
          {[
            { id: 'all', label: 'All', count: counts.total },
            { id: 'unread', label: 'Unread', count: counts.unread },
            { id: 'high', label: 'Priority', count: counts.high }
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
        {counts.unread > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="w-full mt-2 text-xs"
            disabled={isLoading}
          >
            <CheckCheck className="h-3 w-3 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto max-h-96">
        {isLoading && notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Loading notifications...</p>
          </div>
        ) : (
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
                      !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-950/30' : ''
                    }`}
                    onClick={() => handleNotificationAction(notification, 'view')}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${bgColor}`}>
                        <NotificationIcon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {(notification.priority === 'high' || notification.priority === 'urgent') && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                !
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            {/* Action buttons based on notification type */}
                            {notification.type === 'team_invite' && !notification.isRead && (
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
                            
                            {notification.type === 'review_request' && !notification.isRead && (
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

                            {(notification.type === 'task_assigned' || notification.type === 'task_status_changed') && !notification.isRead && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs px-2 py-1 h-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationAction(notification, 'view_task')
                                }}
                              >
                                View
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
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Push notifications: {preferences.pushEnabled ? 'Enabled' : 'Disabled'}</span>
          <span>{counts.total} total</span>
        </div>
        
        {/* Test notification button for development */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              // Create a test notification
              const testNotification = {
                id: Date.now().toString(),
                type: 'task_assigned',
                title: 'Test Notification',
                message: 'This is a test notification to verify the system is working',
                createdAt: new Date().toISOString(),
                isRead: false,
                priority: 'normal'
              };
              
              // Add to local state for immediate feedback
              // In real app, this would come from the API
              console.log('Test notification created:', testNotification);
            }}
            className="text-xs h-6 opacity-70 hover:opacity-100"
          >
            Test Notification
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 