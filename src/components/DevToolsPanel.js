import React, { useState } from 'react'
import { ApiTester } from './ApiTester'
import { shouldShowDevTools, devLog, logAction } from '../config/devTools'
import { Settings, Bug, Activity, Database, Monitor } from 'lucide-react'

export function DevToolsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('console')

  // Only render in development
  if (!shouldShowDevTools()) {
    return null
  }

  const togglePanel = () => {
    setIsOpen(!isOpen)
    logAction('DEV_PANEL_TOGGLE', { isOpen: !isOpen })
  }

  const tabs = [
    { id: 'console', label: 'Console Debug', icon: Monitor },
    { id: 'api', label: 'API Tester', icon: Database },
    { id: 'debug', label: 'Debug Info', icon: Bug },
    { id: 'actions', label: 'Actions', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Browser Console Debugging</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <p className="font-medium text-blue-800 mb-2">🚀 CrossLab Debug Active!</p>
                <p className="text-blue-700">Откройте Console в DevTools (F12) для debugging</p>
              </div>
              
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-medium mb-2">Доступные команды в консоли:</p>
                <div className="space-y-1 font-mono text-xs">
                  <p>CrossLabDebug.inspectStorage()</p>
                  <p>CrossLabDebug.getApiInfo()</p>
                  <p>CrossLabDebug.clearAll()</p>
                  <p>CrossLabDebug.startTimer("label")</p>
                  <p>CrossLabDebug.endTimer("label")</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                <p className="font-medium text-green-800 mb-2">✅ Автоматическое логирование:</p>
                <div className="text-green-700 space-y-1">
                  <p>• API запросы и ответы</p>
                  <p>• Auth actions (login, logout)</p>
                  <p>• State changes</p>
                  <p>• Ошибки с stack traces</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  console.log('%c🎯 Console Test Message', 'background: #FF6B35; color: white; padding: 8px; border-radius: 4px; font-weight: bold;')
                  devLog('Test message from DevToolsPanel')
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                🎯 Test Console Logging
              </button>
            </div>
          </div>
        )
      
      case 'api':
        return <ApiTester />
      
      case 'debug':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Debug Information</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Environment:</strong> {process.env.NODE_ENV}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>React Version:</strong> {React.version}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>User Agent:</strong> {navigator.userAgent.slice(0, 50)}...
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>URL:</strong> {window.location.href}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>localStorage Keys:</strong> {Object.keys(localStorage).join(', ') || 'Empty'}
              </div>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                <strong>Global Debug Object:</strong> window.CrossLabDebug
              </div>
            </div>
          </div>
        )
      
      case 'actions':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (window.CrossLabDebug) {
                    window.CrossLabDebug.clearAll()
                  } else {
                    localStorage.clear()
                    console.clear()
                    devLog('localStorage and console cleared')
                  }
                }}
                className="w-full px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                🧹 Clear All Data
              </button>
              
              <button
                onClick={() => {
                  if (window.CrossLabDebug) {
                    window.CrossLabDebug.inspectStorage()
                  } else {
                    console.log('localStorage:', localStorage)
                  }
                }}
                className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                📦 Inspect Storage
              </button>
              
              <button
                onClick={() => {
                  if (window.CrossLabDebug) {
                    console.log('API Info:', window.CrossLabDebug.getApiInfo())
                  } else {
                    console.log('CrossLabDebug not available')
                  }
                }}
                className="w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                🌐 Show API Info
              </button>
              
              <button
                onClick={() => {
                  window.location.reload()
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                🔄 Reload Page
              </button>
            </div>
          </div>
        )
      
      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Debug Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localStorage.getItem('debug_mode') === 'true'}
                  onChange={(e) => {
                    localStorage.setItem('debug_mode', e.target.checked.toString())
                    devLog('Debug mode toggled:', e.target.checked)
                  }}
                />
                <span className="text-sm">Enhanced Debug Logging</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localStorage.getItem('force_api_switcher') === 'true'}
                  onChange={(e) => {
                    localStorage.setItem('force_api_switcher', e.target.checked.toString())
                    devLog('Force API Switcher:', e.target.checked)
                  }}
                />
                <span className="text-sm">Force Show API Switcher</span>
              </label>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2">Browser Debugging:</p>
                <div className="text-xs bg-gray-100 p-2 rounded space-y-1">
                  <p>✅ Console logging активен</p>
                  <p>✅ Global debug object доступен</p>
                  <p>✅ API monitoring включен</p>
                  <p>❌ Desktop Reactotron не требуется</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        className="fixed top-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Open Dev Tools Panel"
      >
        <Settings size={20} />
      </button>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-purple-400 rounded-lg shadow-lg z-50 w-96 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-purple-50">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-purple-600" />
          <h2 className="font-semibold text-purple-900">Dev Tools Panel</h2>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">BROWSER</span>
        </div>
        <button
          onClick={togglePanel}
          className="text-purple-400 hover:text-purple-600"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-1 p-2 text-xs transition-colors min-w-[70px] ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  )
} 