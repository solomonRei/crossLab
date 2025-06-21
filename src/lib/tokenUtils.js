// JWT utilities for token management

/**
 * Decode JWT token without verification (for client-side info only)
 */
export function decodeJWT(token) {
  try {
    if (!token) return null
    
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload))
    
    return decoded
  } catch (error) {
    console.warn('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token) {
  try {
    if (!token) return true
    
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true
    
    // Check if token expires in next 30 seconds (buffer for network delay)
    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const bufferTime = 30 * 1000 // 30 seconds buffer
    
    return currentTime >= (expirationTime - bufferTime)
  } catch (error) {
    console.warn('Error checking token expiration:', error)
    return true
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  } catch (error) {
    console.warn('Error getting token expiration:', error)
    return null
  }
}

/**
 * Get user info from token
 */
export function getUserFromToken(token) {
  try {
    const decoded = decodeJWT(token)
    if (!decoded) return null
    
    return {
      id: decoded.sub || decoded.userId || decoded.id,
      email: decoded.email,
      name: decoded.name,
      firstName: decoded.firstName || decoded.given_name,
      lastName: decoded.lastName || decoded.family_name,
      role: decoded.role || decoded.roles,
      exp: decoded.exp,
      iat: decoded.iat
    }
  } catch (error) {
    console.warn('Error extracting user from token:', error)
    return null
  }
}

/**
 * Format time until token expiration
 */
export function getTimeUntilExpiration(token) {
  try {
    const expiration = getTokenExpiration(token)
    if (!expiration) return null
    
    const now = new Date()
    const timeLeft = expiration.getTime() - now.getTime()
    
    if (timeLeft <= 0) return 'Expired'
    
    const minutes = Math.floor(timeLeft / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day(s)`
    if (hours > 0) return `${hours} hour(s)`
    return `${minutes} minute(s)`
  } catch (error) {
    console.warn('Error calculating time until expiration:', error)
    return null
  }
}

/**
 * Check if token needs refresh (expires in next 15 minutes)
 */
export function shouldRefreshToken(token) {
  try {
    if (!token) return false
    
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return false
    
    const expirationTime = decoded.exp * 1000
    const currentTime = Date.now()
    const refreshThreshold = 15 * 60 * 1000 // 15 minutes
    
    return currentTime >= (expirationTime - refreshThreshold)
  } catch (error) {
    console.warn('Error checking if token should refresh:', error)
    return false
  }
} 