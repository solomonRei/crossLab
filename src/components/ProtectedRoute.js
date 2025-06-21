import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isTokenExpired } from '../lib/tokenUtils'
import { authApiService } from '../services/authApi'
import { devLog } from '../config/devTools'
import { useEffect, useState } from 'react'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, isLoading, token, loadUser } = useAuth()
  const location = useLocation()
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasVerified, setHasVerified] = useState(false)

  devLog('ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    hasToken: !!token,
    currentPath: location.pathname,
    requiredRole,
    isVerifying,
    hasVerified
  })

  // Verify token when accessing protected route
  useEffect(() => {
    const storedToken = authApiService.getToken()
    
    // Verify if we have a token, are authenticated, but haven't verified with server yet
    if (storedToken && !isTokenExpired(storedToken) && isAuthenticated && !hasVerified && !isVerifying) {
      devLog('ProtectedRoute: Verifying token with server for protected route')
      setIsVerifying(true)
      loadUser().finally(() => {
        setIsVerifying(false)
        setHasVerified(true)
      })
    }
  }, [isAuthenticated, loadUser, isVerifying, hasVerified])

  // Show loading while checking auth status or verifying
  if (isLoading || isVerifying) {
    devLog('ProtectedRoute: Still loading auth or verifying')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  const storedToken = authApiService.getToken()
  const hasValidToken = token && !isTokenExpired(token)

  // If we have a stored token but it's expired, clear it and redirect
  if (storedToken && isTokenExpired(storedToken)) {
    devLog('ProtectedRoute: Token expired, clearing and redirecting')
    authApiService.setToken(null)
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Check authentication status
  if (!isAuthenticated || !hasValidToken) {
    devLog('ProtectedRoute: Not authenticated, redirecting to auth', {
      isAuthenticated,
      hasValidToken,
      hasStoredToken: !!storedToken
    })
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // If authenticated but no user data yet, keep loading
  if (isAuthenticated && !user) {
    devLog('ProtectedRoute: Authenticated but no user data, showing loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (requiredRole && user) {
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role]
    const hasRequiredRole = userRoles && userRoles.includes(requiredRole)
    
    devLog('ProtectedRoute: Role check:', {
      requiredRole,
      userRoles,
      hasRequiredRole
    })
    
    if (!hasRequiredRole) {
      devLog('ProtectedRoute: Insufficient role, redirecting to unauthorized')
      return <Navigate to="/unauthorized" replace />
    }
  }

  devLog('ProtectedRoute: Access granted')
  return children
} 