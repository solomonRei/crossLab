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
    
    // Log initial configuration
    devLog('AuthApiService initialized:', {
      mode: this.currentMode,
      baseUrl: this.baseUrl,
      hasToken: !!this.token
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
      hasToken: !!this.token
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

  // Set token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
      devLog('Token set in localStorage')
    } else {
      localStorage.removeItem('token')
      devLog('Token removed from localStorage')
    }
  }

  // Get token
  getToken() {
    return this.token
  }

  // HTTP client with automatic token handling
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
      
      // Check if response has content
      const contentType = response.headers.get('content-type')
      const hasJsonContent = contentType && contentType.includes('application/json')
      
      let data = null
      
      // Only try to parse JSON if response has content and is JSON
      if (hasJsonContent && response.headers.get('content-length') !== '0') {
        try {
          const text = await response.text()
          if (text.trim()) {
            data = JSON.parse(text)
          } else {
            data = { success: false, message: 'Empty response from server' }
          }
        } catch (parseError) {
          devLog('Failed to parse JSON response:', parseError)
          data = { 
            success: false, 
            message: `Invalid JSON response: ${parseError.message}`,
            status: response.status 
          }
        }
      } else {
        // No JSON content or empty response
        data = { 
          success: false, 
          message: `HTTP ${response.status}${response.statusText ? ': ' + response.statusText : ''}`,
          status: response.status 
        }
      }

      // Log response
      devLog(`API Response (${response.status}):`, data)

      if (!response.ok) {
        // Handle different error formats
        const errorMessage = data.message || data.error || `HTTP ${response.status}`
        const errors = data.errors || data.validationErrors || []
        
        logError(new Error(errorMessage), `API ${config.method || 'GET'} ${endpoint}`)
        throw new AuthApiError(errorMessage, response.status, errors)
      }

      // Return the API response directly since it already has the proper structure
      return data
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
    
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Store token if login successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async register(userData) {
    devLog('Attempting registration for:', userData.email)
    
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    devLog('Fetching current user data')
    
    return await this.request('/auth/me')
  }

  async getAllUsers() {
    devLog('Fetching all users')
    
    return await this.request('/auth/users')
  }

  async getUserById(id) {
    devLog('Fetching user by ID:', id)
    
    return await this.request(`/auth/users/${id}`)
  }

  // Logout - clear token
  logout() {
    devLog('User logging out')
    this.setToken(null)
  }
}

// Export singleton instance
export const authApiService = new AuthApiService()
export default authApiService 