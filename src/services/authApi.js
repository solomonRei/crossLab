import { logApiRequest } from '../config/devTools'

// API Configuration with multiple endpoints
const API_CONFIG = {
  https: process.env.REACT_APP_API_URL || 'https://192.168.0.56:7001',
  http: process.env.REACT_APP_API_URL_HTTP || 'http://192.168.0.56:5059'
}

// Get current API mode from localStorage or environment
const getCurrentApiMode = () => {
  return localStorage.getItem('api_mode') || process.env.REACT_APP_API_MODE || 'http'
}

// Get current API base URL
const getApiBaseUrl = () => {
  const mode = getCurrentApiMode()
  return API_CONFIG[mode] || API_CONFIG.http
}

class AuthApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.errors = errors
  }
}

class AuthApiService {
  constructor() {
    this.baseUrl = getApiBaseUrl()
    this.token = localStorage.getItem('auth_token')
  }

  // Switch API endpoint method
  switchApiMode(mode) {
    if (!API_CONFIG[mode]) {
      throw new Error(`Invalid API mode: ${mode}. Available modes: ${Object.keys(API_CONFIG).join(', ')}`)
    }
    
    localStorage.setItem('api_mode', mode)
    this.baseUrl = API_CONFIG[mode]
    console.log(`API switched to ${mode.toUpperCase()} mode: ${this.baseUrl}`)
    return this.baseUrl
  }

  // Get current API info
  getApiInfo() {
    const mode = getCurrentApiMode()
    return {
      mode,
      baseUrl: this.baseUrl,
      available: API_CONFIG
    }
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token')
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    // Log API request in development
    logApiRequest(options.method || 'GET', url, options.body ? JSON.parse(options.body) : null)

    try {
      console.log(`Making ${options.method || 'GET'} request to: ${url}`)
      const response = await fetch(url, config)
      
      // Handle non-JSON responses
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        // If JSON parsing fails, use response text
        const text = await response.text()
        data = { message: text || `HTTP ${response.status}`, raw: text }
      }

      if (!response.ok) {
        throw new AuthApiError(
          data.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data.errors || []
        )
      }

      return data
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error
      }
      
      // Network or other errors
      console.error('API Request Error:', error)
      throw new AuthApiError(
        `Network error or server unavailable: ${error.message}`,
        0,
        [error.message]
      )
    }
  }

  // Authentication endpoints
  async login(loginRequest) {
    const response = await this.makeRequest('/api/v1/Auth/login', {
      method: 'POST',
      body: JSON.stringify(loginRequest)
    })

    // Set token if login successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async register(registerRequest) {
    const response = await this.makeRequest('/api/v1/Auth/register', {
      method: 'POST',
      body: JSON.stringify(registerRequest)
    })

    return response
  }

  async getCurrentUser() {
    return await this.makeRequest('/api/v1/Auth/me', {
      method: 'GET'
    })
  }

  async getAllUsers() {
    return await this.makeRequest('/api/v1/Auth/users', {
      method: 'GET'
    })
  }

  async getUserById(id) {
    return await this.makeRequest(`/api/v1/Auth/users/${id}`, {
      method: 'GET'
    })
  }

  logout() {
    this.setToken(null)
    // Don't clear API mode on logout
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

// Export singleton instance
const authApiService = new AuthApiService()
export { authApiService, AuthApiError } 