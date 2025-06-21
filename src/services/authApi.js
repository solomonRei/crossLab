const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://192.168.0.56:7001'

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
    this.baseUrl = API_BASE_URL
    this.token = localStorage.getItem('auth_token')
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

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new AuthApiError(
          data.message || `HTTP ${response.status}`,
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
      throw new AuthApiError(
        'Network error or server unavailable',
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

  // Utility methods
  logout() {
    this.setToken(null)
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

// Export singleton instance
const authApiService = new AuthApiService()
export { authApiService, AuthApiError } 