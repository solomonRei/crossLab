import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authApiService, AuthApiError } from '../services/authApi'

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
      return {
        ...state,
        isLoading: false,
        error: null,
        errors: []
      }

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
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

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const logout = useCallback(() => {
    authApiService.logout()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }, [])

  const loadUser = useCallback(async () => {
    if (!authApiService.isAuthenticated()) {
      return
    }

    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })
    
    try {
      const response = await authApiService.getCurrentUser()
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: {
            user: response.data
          }
        })
      } else {
        throw new AuthApiError(
          response.message || 'Failed to load user',
          401
        )
      }
    } catch (error) {
      // If unauthorized, logout
      if (error.status === 401) {
        logout()
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: {
            message: error.message,
            errors: error.errors || []
          }
        })
      }
    }
  }, [logout])

  // Load user on mount if token exists
  useEffect(() => {
    if (state.token && !state.user && !state.isLoading) {
      loadUser()
    }
  }, [state.token, state.user, state.isLoading, loadUser])

  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    
    try {
      const response = await authApiService.login({ email, password })
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            token: response.data.token,
            user: response.data.user
          }
        })
        return { success: true, data: response.data }
      } else {
        throw new AuthApiError(
          response.message || 'Login failed',
          400,
          response.errors || []
        )
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: {
          message: error.message,
          errors: error.errors || []
        }
      })
      return { 
        success: false, 
        error: error.message, 
        errors: error.errors || [] 
      }
    }
  }

  const register = async (registerData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })
    
    try {
      const response = await authApiService.register(registerData)
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS })
        return { success: true, data: response.data }
      } else {
        throw new AuthApiError(
          response.message || 'Registration failed',
          400,
          response.errors || []
        )
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: {
          message: error.message,
          errors: error.errors || []
        }
      })
      return { 
        success: false, 
        error: error.message, 
        errors: error.errors || [] 
      }
    }
  }

  const clearErrors = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS })
  }, [])

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
    clearErrors
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 