import { reactotronLog, reactotronError, reactotronApi } from './reactotron'

// Development Tools Configuration
export const DEV_TOOLS_CONFIG = {
  // Enable dev tools based on environment
  enabled: process.env.NODE_ENV === 'development',
  
  // Individual tool toggles
  apiSwitcher: {
    // Enable for all pages in development
    enabled: process.env.NODE_ENV === 'development',
    // Can be overridden with localStorage for specific debugging
    forceEnabled: localStorage.getItem('dev_api_switcher') === 'true'
  },
  
  // Reactotron integration
  reactotron: {
    enabled: process.env.NODE_ENV === 'development',
    logApi: true,
    logActions: true,
    logErrors: true
  },
  
  // Debug logging
  debugMode: process.env.NODE_ENV === 'development' || localStorage.getItem('debug_mode') === 'true',
  
  // API debugging
  logApiRequests: process.env.NODE_ENV === 'development',
}

// Helper function to check if dev tools should be shown
export const shouldShowDevTools = () => {
  return DEV_TOOLS_CONFIG.enabled || 
         localStorage.getItem('force_dev_tools') === 'true'
}

// Helper function specifically for API switcher - now enabled for all pages
export const shouldShowApiSwitcher = () => {
  return DEV_TOOLS_CONFIG.apiSwitcher.enabled || 
         DEV_TOOLS_CONFIG.apiSwitcher.forceEnabled ||
         localStorage.getItem('force_api_switcher') === 'true'
}

// Debug logger that only works in development
export const devLog = (...args) => {
  if (DEV_TOOLS_CONFIG.debugMode) {
    console.log('[DEV]', ...args)
    // Also log to Reactotron
    reactotronLog('[DEV]', ...args)
  }
}

// API request logger with Reactotron integration
export const logApiRequest = (method, url, data) => {
  if (DEV_TOOLS_CONFIG.logApiRequests) {
    console.group(`[API] ${method} ${url}`)
    if (data) console.log('Data:', data)
    console.groupEnd()
    
    // Log to Reactotron
    if (DEV_TOOLS_CONFIG.reactotron.logApi) {
      reactotronApi(
        { method, url, data },
        { timestamp: new Date().toISOString() }
      )
    }
  }
}

// Error logger with Reactotron integration
export const logError = (error, context = '') => {
  if (DEV_TOOLS_CONFIG.debugMode) {
    console.error('[ERROR]', context, error)
    
    // Log to Reactotron
    if (DEV_TOOLS_CONFIG.reactotron.logErrors) {
      reactotronError(error, context)
    }
  }
}

// Action logger for state changes
export const logAction = (action, payload) => {
  if (DEV_TOOLS_CONFIG.reactotron.logActions && process.env.NODE_ENV === 'development') {
    reactotronLog(`[ACTION] ${action}`, payload)
  }
} 