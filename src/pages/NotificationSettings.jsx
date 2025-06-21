import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Bell,
  Mail,
  Smartphone,
  Settings,
  Check,
  X,
  Users,
  FolderOpen,
  Star,
  MessageCircle,
  Award,
  AlertCircle,
  Calendar,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

const notificationCategories = [
  {
    id: 'team_invite',
    name: 'Team Invitations',
    description: 'Get notified when you\'re invited to join a project team',
    icon: Users,
    color: 'text-blue-500',
    defaultEnabled: true
  },
  {
    id: 'project_update',
    name: 'Project Updates',
    description: 'Notifications about project milestones and progress',
    icon: FolderOpen,
    color: 'text-green-500',
    defaultEnabled: true
  },
  {
    id: 'review_request',
    name: 'Peer Reviews',
    description: 'Requests to review team members\' contributions',
    icon: Star,
    color: 'text-yellow-500',
    defaultEnabled: true
  },
  {
    id: 'message',
    name: 'Messages',
    description: 'Direct messages and team chat notifications',
    icon: MessageCircle,
    color: 'text-purple-500',
    defaultEnabled: true
  },
  {
    id: 'achievement',
    name: 'Achievements',
    description: 'Badge unlocks and XP milestones',
    icon: Award,
    color: 'text-orange-500',
    defaultEnabled: true
  },
  {
    id: 'deadline',
    name: 'Deadlines',
    description: 'Important deadline reminders and alerts',
    icon: AlertCircle,
    color: 'text-red-500',
    defaultEnabled: true
  },
  {
    id: 'milestone',
    name: 'Milestones',
    description: 'Sprint completions and project milestones',
    icon: TrendingUp,
    color: 'text-indigo-500',
    defaultEnabled: false
  },
  {
    id: 'meeting',
    name: 'Meetings',
    description: 'Team meetings and demo session reminders',
    icon: Calendar,
    color: 'text-teal-500',
    defaultEnabled: true
  }
]

export function NotificationSettings() {
  const { 
    preferences, 
    updatePreferences, 
    pushPermission, 
    requestPushPermission,
    addNotification 
  } = useNotifications()

  const [localPreferences, setLocalPreferences] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize local preferences when loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
    }
  }, [preferences])

  // Check for changes
  useEffect(() => {
    if (preferences && localPreferences) {
      const hasChanged = JSON.stringify(preferences) !== JSON.stringify(localPreferences)
      setHasChanges(hasChanged)
    }
  }, [preferences, localPreferences])

  if (!localPreferences) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading notification settings...</p>
        </div>
      </div>
    )
  }

  const handleToggleCategory = (categoryId) => {
    setLocalPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: !prev.categories[categoryId]
      }
    }))
  }

  const handleTogglePush = async () => {
    if (!localPreferences.pushEnabled && pushPermission !== 'granted') {
      const granted = await requestPushPermission()
      if (!granted) return
    }

    setLocalPreferences(prev => ({
      ...prev,
      pushEnabled: !prev.pushEnabled
    }))
  }

  const handleToggleEmail = () => {
    setLocalPreferences(prev => ({
      ...prev,
      emailEnabled: !prev.emailEnabled
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePreferences(localPreferences)
      setHasChanges(false)
      
      // Show success notification
      addNotification({
        type: 'achievement',
        title: 'Settings Saved',
        message: 'Your notification preferences have been updated successfully',
        priority: 'low'
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLocalPreferences(preferences)
    setHasChanges(false)
  }

  const handleTestNotification = () => {
    addNotification({
      type: 'message',
      title: 'Test Notification',
      message: 'This is a test notification to check your settings',
      priority: 'medium'
    })
  }

  const enabledCategoriesCount = Object.values(localPreferences.categories).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage how you receive notifications from CrossLab
          </p>
        </div>
        <Button onClick={handleTestNotification} variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Test Notification
        </Button>
      </div>

      {/* Push Permission Status */}
      {pushPermission !== 'granted' && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  Browser Notifications Disabled
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200">
                  Enable browser notifications to receive real-time alerts
                </p>
              </div>
              <Button 
                onClick={requestPushPermission}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Delivery Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time browser notifications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={localPreferences.pushEnabled ? "default" : "secondary"}>
                {localPreferences.pushEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePush}
                disabled={pushPermission === 'denied'}
              >
                {localPreferences.pushEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Daily digest and important updates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={localPreferences.emailEnabled ? "default" : "secondary"}>
                {localPreferences.emailEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleEmail}
              >
                {localPreferences.emailEnabled ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Categories
            </CardTitle>
            <Badge variant="outline">
              {enabledCategoriesCount} of {notificationCategories.length} enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationCategories.map((category, index) => {
              const isEnabled = localPreferences.categories[category.id]
              const CategoryIcon = category.icon

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isEnabled 
                      ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isEnabled ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <CategoryIcon className={`h-4 w-4 ${
                          isEnabled ? category.color : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isEnabled 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-muted-foreground'
                    }`}>
                      {isEnabled && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-6 bg-card border rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              You have unsaved changes to your notification preferences
            </p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 