import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authApiService } from '../services/authApi'
import { shouldShowApiSwitcher, devLog, logAction } from '../config/devTools'

export function ApiSwitcher() {
  const [apiInfo, setApiInfo] = useState(authApiService.getApiInfo())
  const [isVisible, setIsVisible] = useState(false)

  // React hooks must be called before any conditional returns
  useEffect(() => {
    // Update API info when component mounts
    setApiInfo(authApiService.getApiInfo())
    devLog('ApiSwitcher mounted with config:', apiInfo)
  }, [])

  // Only render if allowed by configuration (should be true for all pages in dev)
  if (!shouldShowApiSwitcher()) {
    return null
  }

  const handleSwitchMode = (mode) => {
    try {
      const oldMode = apiInfo.mode
      const newUrl = authApiService.switchApiMode(mode)
      setApiInfo(authApiService.getApiInfo())
      
      // Log action to Reactotron
      logAction('API_MODE_SWITCH', {
        from: oldMode,
        to: mode,
        url: newUrl
      })
      
      devLog(`API switched from ${oldMode} to ${mode}:`, newUrl)
      
      // Show success message
      toast.success(`API switched to ${mode.toUpperCase()}`, {
        description: `Now using: ${newUrl}`,
        duration: 3000,
      })
      
      // Auto reload after short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Failed to switch API mode:', error)
      toast.error(`Failed to switch API mode: ${error.message}`)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors z-50 border-2 border-yellow-400"
        title={`DEV TOOL - Current API: ${apiInfo.mode.toUpperCase()} - ${apiInfo.baseUrl}`}
      >
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          API: {apiInfo.mode.toUpperCase()}
        </div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-yellow-400 rounded-lg shadow-lg p-4 z-50 min-w-64">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          <h3 className="font-semibold text-gray-900">API Configuration</h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">DEV</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Mode:</p>
          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {apiInfo.mode.toUpperCase()}: {apiInfo.baseUrl}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Switch to:</p>
          <div className="flex gap-2">
            {Object.keys(apiInfo.available).map((mode) => (
              <button
                key={mode}
                onClick={() => handleSwitchMode(mode)}
                disabled={mode === apiInfo.mode}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mode === apiInfo.mode
                    ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.toUpperCase()}
                <br />
                <span className="text-xs opacity-75">
                  {mode === 'https' ? 'Port 7001' : 'Port 5059'}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 border-t pt-2">
          <p>• HTTPS: Secure connection (port 7001)</p>
          <p>• HTTP: Development mode (port 5059)</p>
          <p className="text-yellow-600 mt-1">⚠️ Development tool only</p>
          <p className="text-xs text-gray-400 mt-1">
            NODE_ENV: {process.env.NODE_ENV}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            📊 Logs sent to Reactotron
          </p>
        </div>
      </div>
    </div>
  )
} 