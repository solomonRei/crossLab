import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isTokenExpired } from '../lib/tokenUtils'
import { authApiService } from '../services/authApi'
import { devLog } from '../config/devTools'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, isLoading, token } = useAuth()
  const location = useLocation()

  devLog('ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    hasToken: !!token,
    currentPath: location.pathname,
    requiredRole
  })

  // Show loading while checking auth status
  if (isLoading) {
    devLog('ProtectedRoute: Still loading auth')
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

  // If authenticated but no user data yet, show loading
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
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required role: <span className="font-mono bg-muted px-2 py-1 rounded">{requiredRole}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your roles: <span className="font-mono bg-muted px-2 py-1 rounded">{userRoles?.join(', ') || 'None'}</span>
            </p>
          </div>
        </div>
      )
    }
  }

  devLog('ProtectedRoute: Access granted, rendering children')
  return children
} 