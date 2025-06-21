import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { authApiService, AuthApiError } from '../services/authApi'
import { logAction, logError, devLog } from '../config/devTools'

// Auth states
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
}

const initialState = {
  user: null,
  token: authApiService.getToken(),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  errors: []
}

function authReducer(state, action) {
  // Log actions to Reactotron
  logAction(action.type, action.payload)
  
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        errors: []
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      devLog('User logged in:', action.payload.user)
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
        errors: []
      }

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      devLog('User registered successfully')
      return {
        ...state,
        isLoading: false,
        error: null,
        errors: []
      }

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      devLog('User data loaded:', action.payload.user)
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
        errors: []
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      logError(action.payload.message, `Auth ${action.type}`)
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload.message,
        errors: action.payload.errors
      }

    case AUTH_ACTIONS.LOGOUT:
      devLog('User logged out')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        errors: []
      }

    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
        errors: []
      }

    default:
      return state
  }
}

// Create Auth Context
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start if token exists
  const loadUser = useCallback(async () => {
    if (!authApiService.getToken()) {
      return
    }

    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })

    try {
      const response = await authApiService.getCurrentUser()
      
      if (response.success && response.data) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: { user: response.data }
        })
      } else {
        throw new Error('Failed to load user data')
      }
    } catch (error) {
      console.error('Load user error:', error)
      
      // Clear invalid token
      authApiService.setToken(null)
      
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: {
          message: error.message || 'Failed to load user',
          errors: error instanceof AuthApiError ? error.errors : []
        }
      })
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await authApiService.login({ email, password })
      
      if (response.success && response.data) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            token: response.data.token,
            user: response.data.user
          }
        })
        
        toast.success(`Welcome back, ${response.data.user?.firstName || 'User'}!`)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      const errorMessage = error.message || 'Login failed'
      const errors = error instanceof AuthApiError ? error.errors : []
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { message: errorMessage, errors }
      })
      
      // Show toast error
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage, errors }
    }
  }

  // Register function
  const register = async (registerData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })

    try {
      const response = await authApiService.register(registerData)
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS })
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Register error:', error)
      
      const errorMessage = error.message || 'Registration failed'
      const errors = error instanceof AuthApiError ? error.errors : []
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { message: errorMessage, errors }
      })
      
      // Show toast error
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage, errors }
    }
  }

  // Logout function
  const logout = () => {
    authApiService.logout()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    toast.success('Logged out successfully')
  }

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    clearErrors,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 