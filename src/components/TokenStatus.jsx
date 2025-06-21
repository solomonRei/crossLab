import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { Clock, User, Key, AlertTriangle, CheckCircle } from 'lucide-react'

export function TokenStatus() {
  const { isAuthenticated, user, token, checkTokenHealth } = useAuth()
  const [tokenInfo, setTokenInfo] = useState({ isValid: false, timeLeft: null })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Skip effect in production
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const updateTokenInfo = () => {
      const info = checkTokenHealth()
      setTokenInfo(info)
    }

    updateTokenInfo()
    const interval = setInterval(updateTokenInfo, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [checkTokenHealth])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-black/80 text-white border-gray-600 hover:bg-black/90"
        >
          <Key className="h-4 w-4 mr-2" />
          Token Status
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="w-80 bg-black/90 text-white border-gray-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center">
              <Key className="h-4 w-4 mr-2" />
              Token Status (DEV)
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          <div className="space-y-3">
            {/* Authentication Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Authentication:</span>
              <Badge 
                variant={isAuthenticated ? "default" : "destructive"} 
                className="text-xs"
              >
                {isAuthenticated ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
              </Badge>
            </div>

            {/* Token Validity */}
            {token && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Token:</span>
                <Badge 
                  variant={tokenInfo.isValid ? "default" : "destructive"} 
                  className="text-xs"
                >
                  {tokenInfo.isValid ? 'Valid' : 'Expired'}
                </Badge>
              </div>
            )}

            {/* Time Left */}
            {tokenInfo.timeLeft && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Expires in:</span>
                <span className="text-xs text-gray-100 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {tokenInfo.timeLeft}
                </span>
              </div>
            )}

            {/* User Info */}
            {user && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">User:</span>
                <span className="text-xs text-gray-100 flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {user.firstName || user.email || 'Unknown'}
                </span>
              </div>
            )}

            {/* Token Preview */}
            {token && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-xs text-gray-400 mb-1">Token (first 20 chars):</div>
                <div className="text-xs text-gray-200 font-mono bg-gray-800 p-2 rounded break-all">
                  {token.substring(0, 20)}...
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 