import { useState } from 'react'
import { authApiService } from '../services/authApi'

export function ApiTester() {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const testApiConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Test with a simple request that doesn't require authentication
      const response = await fetch(authApiService.baseUrl + '/api/v1/auth/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = {
        status: response.status,
        statusText: response.statusText,
        url: authApiService.baseUrl,
        timestamp: new Date().toISOString()
      }

      if (response.ok) {
        try {
          const data = await response.json()
          result.data = data
          result.success = true
        } catch (e) {
          const text = await response.text()
          result.data = text
          result.success = true
        }
      } else {
        try {
          const errorData = await response.json()
          result.error = errorData
        } catch (e) {
          const errorText = await response.text()
          result.error = errorText
        }
        result.success = false
      }

      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        url: authApiService.baseUrl,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testRegisterEndpoint = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Test the specific register endpoint with OPTIONS method
      const response = await fetch(authApiService.baseUrl + '/api/v1/Auth/register', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
      })

      const result = {
        status: response.status,
        statusText: response.statusText,
        url: authApiService.baseUrl + '/api/v1/Auth/register',
        method: 'OPTIONS',
        timestamp: new Date().toISOString(),
        headers: {}
      }

      // Get response headers
      response.headers.forEach((value, key) => {
        result.headers[key] = value
      })

      if (response.ok) {
        result.success = true
        result.message = 'CORS preflight successful'
      } else {
        result.success = false
        result.error = `${response.status} ${response.statusText}`
      }

      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        url: authApiService.baseUrl + '/api/v1/Auth/register',
        method: 'OPTIONS',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">API Connection Test</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testApiConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={testRegisterEndpoint}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Register Endpoint'}
        </button>
      </div>

      {testResult && (
        <div className={`border rounded-lg p-3 ${
          testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full ${
              testResult.success ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="font-medium">
              {testResult.success ? 'Success' : 'Failed'}
            </span>
          </div>
          
          <div className="text-sm space-y-1">
            <p><strong>URL:</strong> {testResult.url}</p>
            {testResult.method && (
              <p><strong>Method:</strong> {testResult.method}</p>
            )}
            <p><strong>Status:</strong> {testResult.status} {testResult.statusText}</p>
            <p><strong>Time:</strong> {new Date(testResult.timestamp).toLocaleTimeString()}</p>
            
            {testResult.headers && Object.keys(testResult.headers).length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Response Headers</summary>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(testResult.headers, null, 2)}
                </pre>
              </details>
            )}
            
            {testResult.data && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Response Data</summary>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {typeof testResult.data === 'string' 
                    ? testResult.data 
                    : JSON.stringify(testResult.data, null, 2)
                  }
                </pre>
              </details>
            )}
            
            {testResult.error && (
              <div className="mt-2">
                <strong>Error:</strong>
                <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                  {typeof testResult.error === 'string' 
                    ? testResult.error 
                    : JSON.stringify(testResult.error, null, 2)
                  }
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 