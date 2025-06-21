import { logApiRequest, logError, devLog } from '../config/devTools'

// API Configuration
const API_CONFIG = {
  https: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://192.168.0.56:7001',
    mode: 'https',
    port: 7001
  },
  http: {
    baseUrl: process.env.REACT_APP_API_URL_HTTP || 'http://192.168.0.56:5059',
    mode: 'http',
    port: 5059
  }
}

// Get current API mode from localStorage or environment
const getCurrentApiMode = () => {
  return localStorage.getItem('api_mode') || process.env.REACT_APP_API_MODE || 'http'
}

// Custom error class for API errors
export class AuthApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.errors = errors
  }
}

class AuthApiService {
  constructor() {
    this.currentMode = getCurrentApiMode()
    this.baseUrl = API_CONFIG[this.currentMode].baseUrl
    this.token = localStorage.getItem('token')
    this.refreshToken = localStorage.getItem('refreshToken')
    this.refreshPromise = null // Track ongoing refresh requests
    
    // Log initial configuration
    devLog('AuthApiService initialized:', {
      mode: this.currentMode,
      baseUrl: this.baseUrl,
      hasToken: !!this.token,
      hasRefreshToken: !!this.refreshToken
    })
    
    // Make service globally available for debugging
    if (process.env.NODE_ENV === 'development') {
      window.__CROSSLAB_AUTH_SERVICE__ = this
    }
  }

  // Get current API configuration
  getApiInfo() {
    return {
      mode: this.currentMode,
      baseUrl: this.baseUrl,
      available: API_CONFIG,
      hasToken: !!this.token,
      hasRefreshToken: !!this.refreshToken
    }
  }

  // Switch API mode
  switchApiMode(mode) {
    if (!API_CONFIG[mode]) {
      throw new Error(`Invalid API mode: ${mode}`)
    }

    const oldMode = this.currentMode
    this.currentMode = mode
    this.baseUrl = API_CONFIG[mode].baseUrl
    
    localStorage.setItem('api_mode', mode)
    
    devLog(`API mode switched from ${oldMode} to ${mode}`, {
      oldUrl: API_CONFIG[oldMode].baseUrl,
      newUrl: this.baseUrl
    })
    
    return this.baseUrl
  }

  // Set tokens
  setTokens(accessToken, refreshToken = null) {
    this.token = accessToken
    if (accessToken) {
      localStorage.setItem('token', accessToken)
      devLog('Access token set in localStorage')
    } else {
      localStorage.removeItem('token')
      devLog('Access token removed from localStorage')
    }

    if (refreshToken !== null) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
        devLog('Refresh token set in localStorage')
      } else {
        localStorage.removeItem('refreshToken')
        devLog('Refresh token removed from localStorage')
      }
    }
  }

  // Set token (legacy method, kept for compatibility)
  setToken(token) {
    this.setTokens(token, null)
  }

  // Get token
  getToken() {
    return this.token
  }

  // Get refresh token
  getRefreshToken() {
    return this.refreshToken
  }

  // Refresh access token using refresh token
  async refreshAccessToken() {
    // Prevent multiple concurrent refresh requests
    if (this.refreshPromise) {
      devLog('Refresh already in progress, waiting for existing request')
      return this.refreshPromise
    }

    if (!this.refreshToken) {
      throw new AuthApiError('No refresh token available', 401)
    }

    devLog('Attempting to refresh access token')

    this.refreshPromise = this.request('/Auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
      skipTokenRefresh: true // Prevent infinite loop
    }).then(response => {
      if (response.success && response.data?.token) {
        const newRefreshToken = response.data.refreshToken || this.refreshToken
        this.setTokens(response.data.token, newRefreshToken)
        devLog('Access token refreshed successfully')
        return response.data.token
      } else {
        throw new AuthApiError('Failed to refresh token', 401)
      }
    }).catch(error => {
      devLog('Token refresh failed:', error.message)
      // Clear tokens on refresh failure
      this.setTokens(null, null)
      throw error
    }).finally(() => {
      this.refreshPromise = null
    })

    return this.refreshPromise
  }

  // HTTP client with automatic token handling and refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`
    }

    // Log API request
    logApiRequest(config.method || 'GET', url, options.body ? JSON.parse(options.body) : null)

    try {
      devLog(`Making ${config.method || 'GET'} request to:`, url)
      
      const response = await fetch(url, config)
      const data = await response.json()

      // Log response
      devLog(`API Response (${response.status}):`, data)

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.refreshToken && !options.skipTokenRefresh) {
        devLog('Received 401, attempting token refresh')
        
        try {
          await this.refreshAccessToken()
          
          // Retry original request with new token
          devLog('Retrying original request with new token')
          config.headers.Authorization = `Bearer ${this.token}`
          
          const retryResponse = await fetch(url, config)
          const retryData = await retryResponse.json()
          
          devLog(`Retry Response (${retryResponse.status}):`, retryData)
          
          if (!retryResponse.ok) {
            const errorMessage = retryData.message || retryData.error || `HTTP ${retryResponse.status}`
            const errors = retryData.errors || retryData.validationErrors || []
            
            logError(new Error(errorMessage), `API ${config.method || 'GET'} ${endpoint} (retry)`)
            throw new AuthApiError(errorMessage, retryResponse.status, errors)
          }
          
          return {
            success: true,
            data: retryData,
            status: retryResponse.status
          }
        } catch (refreshError) {
          devLog('Token refresh failed, throwing original 401 error')
          const errorMessage = data.message || data.error || `HTTP ${response.status}`
          const errors = data.errors || data.validationErrors || []
          
          logError(new Error(errorMessage), `API ${config.method || 'GET'} ${endpoint}`)
          throw new AuthApiError(errorMessage, response.status, errors)
        }
      }

      if (!response.ok) {
        // Handle different error formats
        const errorMessage = data.message || data.error || `HTTP ${response.status}`
        const errors = data.errors || data.validationErrors || []
        
        logError(new Error(errorMessage), `API ${config.method || 'GET'} ${endpoint}`)
        throw new AuthApiError(errorMessage, response.status, errors)
      }

      return {
        success: true,
        data: data,
        status: response.status
      }
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error
      }

      // Network or other errors
      const message = error.message || 'Network error'
      logError(error, `Network error for ${config.method || 'GET'} ${endpoint}`)
      
      throw new AuthApiError(message, 0, [])
    }
  }

  // Authentication endpoints
  async login(credentials) {
    devLog('Attempting login for:', credentials.email)
    
    const response = await this.request('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Store tokens if login successful
    if (response.success && response.data?.token) {
      const refreshToken = response.data.refreshToken
      this.setTokens(response.data.token, refreshToken)
    }

    return response
  }

  async register(userData) {
    devLog('Attempting registration for:', userData.email)
    
    return await this.request('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    devLog('Fetching current user data')
    
    return await this.request('/Auth/me')
  }

  async getAllUsers() {
    devLog('Fetching all users')
    
    return await this.request('/Auth/users')
  }

  async getUserById(id) {
    devLog('Fetching user by ID:', id)
    
    return await this.request(`/Auth/users/${id}`)
  }

  // Logout - clear tokens
  logout() {
    devLog('User logging out')
    this.setTokens(null, null)
  }

  // Manual token refresh (for external use)
  async refreshToken() {
    return await this.refreshAccessToken()
  }
}

// Export singleton instance
export const authApiService = new AuthApiService()
export default authApiService 