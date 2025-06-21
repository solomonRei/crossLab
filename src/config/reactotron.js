// Browser-based debugging without desktop app
const isDevelopment = process.env.NODE_ENV === 'development'

// Enhanced console logging for browser
const createBrowserLogger = () => {
  const styles = {
    action: 'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px;',
    api: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px;',
    error: 'background: #F44336; color: white; padding: 2px 6px; border-radius: 3px;',
    state: 'background: #FF9800; color: white; padding: 2px 6px; border-radius: 3px;',
    log: 'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px;'
  }

  return {
    action: (type, payload) => {
      if (isDevelopment) {
        console.groupCollapsed(`%c ACTION `, styles.action, type)
        console.log('Payload:', payload)
        console.log('Timestamp:', new Date().toISOString())
        console.groupEnd()
      }
    },
    
    api: (method, url, data, response) => {
      if (isDevelopment) {
        console.groupCollapsed(`%c API `, styles.api, `${method} ${url}`)
        if (data) console.log('Request:', data)
        if (response) console.log('Response:', response)
        console.log('Timestamp:', new Date().toISOString())
        console.groupEnd()
      }
    },
    
    error: (error, context) => {
      if (isDevelopment) {
        console.groupCollapsed(`%c ERROR `, styles.error, context)
        console.error(error)
        console.log('Timestamp:', new Date().toISOString())
        console.groupEnd()
      }
    },
    
    state: (action, oldState, newState) => {
      if (isDevelopment) {
        console.groupCollapsed(`%c STATE `, styles.state, action)
        console.log('Previous State:', oldState)
        console.log('New State:', newState)
        console.log('Timestamp:', new Date().toISOString())
        console.groupEnd()
      }
    },
    
    log: (...args) => {
      if (isDevelopment) {
        console.log(`%c LOG `, styles.log, ...args)
      }
    }
  }
}

// Browser logger instance
const browserLogger = createBrowserLogger()

// Helper functions for logging (compatible with Reactotron API)
export const reactotronLog = (...args) => {
  browserLogger.log(...args)
}

export const reactotronError = (error, message) => {
  browserLogger.error(error, message)
}

export const reactotronApi = (request, response) => {
  browserLogger.api(
    request.method || 'GET', 
    request.url || 'Unknown URL', 
    request.data, 
    response
  )
}

export const reactotronAction = (type, payload) => {
  browserLogger.action(type, payload)
}

export const reactotronState = (action, oldState, newState) => {
  browserLogger.state(action, oldState, newState)
}

// Browser DevTools integration
if (isDevelopment) {
  // Add global debugging helpers
  window.CrossLabDebug = {
    logger: browserLogger,
    
    // API info
    getApiInfo: () => {
      const authService = window.__CROSSLAB_AUTH_SERVICE__
      return authService ? authService.getApiInfo() : 'Auth service not available'
    },
    
    // Local storage inspector
    inspectStorage: () => {
      console.group('📦 Local Storage Inspector')
      Object.keys(localStorage).forEach(key => {
        try {
          const value = localStorage.getItem(key)
          const parsed = JSON.parse(value)
          console.log(`${key}:`, parsed)
        } catch {
          console.log(`${key}:`, localStorage.getItem(key))
        }
      })
      console.groupEnd()
    },
    
    // Clear all debug data
    clearAll: () => {
      console.clear()
      localStorage.clear()
      console.log('🧹 All debug data cleared')
    },
    
    // Performance monitor
    startTimer: (label) => {
      console.time(label)
    },
    
    endTimer: (label) => {
      console.timeEnd(label)
    }
  }
  
  console.log(
    '%c🚀 CrossLab Debug Mode Active',
    'background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border-radius: 8px; font-size: 16px; font-weight: bold;'
  )
  
  console.log(
    '%cТипы команд в консоли:',
    'background: #333; color: #f0f0f0; padding: 8px; border-radius: 4px; font-weight: bold;'
  )
  
  console.log('🔍 CrossLabDebug.inspectStorage() - Посмотреть localStorage')
  console.log('🌐 CrossLabDebug.getApiInfo() - Информация об API')  
  console.log('🧹 CrossLabDebug.clearAll() - Очистить все данные')
  console.log('⏱️ CrossLabDebug.startTimer("label") - Начать замер времени')
  console.log('⏹️ CrossLabDebug.endTimer("label") - Закончить замер времени')
}

export default browserLogger 