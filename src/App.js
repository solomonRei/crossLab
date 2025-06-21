import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ApiSwitcher } from './components/ApiSwitcher'
import { shouldShowApiSwitcher } from './config/devTools'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

// Pages
import { Home } from './pages/Home'
import { Auth } from './pages/Auth'
import { Projects } from './pages/Projects'
import { ProjectView } from './pages/ProjectView'
import { Profile } from './pages/Profile'
import { Showcase } from './pages/Showcase'
import { Review } from './pages/Review'
import { NotificationSettings } from './pages/NotificationSettings'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="auth" element={<Auth />} />
          </Route>

          {/* Dashboard routes - authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/projects" replace />} />
          </Route>
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Projects />} />
            <Route path=":id" element={<ProjectView />} />
          </Route>
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Profile />} />
          </Route>
          
          <Route path="/showcase" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Showcase />} />
          </Route>
          
          <Route path="/review" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Review />} />
          </Route>
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="notifications" element={<NotificationSettings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* API Switcher - only available in development */}
        {shouldShowApiSwitcher() && <ApiSwitcher />}
        
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App
