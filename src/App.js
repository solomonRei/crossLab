import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

// Layouts
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

// Pages
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { Auth } from './pages/Auth'
import { Profile } from './pages/Profile'
import { Review } from './pages/Review'

// Protected Route component
import { ProtectedRoute } from './components/ProtectedRoute'

// Development Tools
import { ApiSwitcher } from './components/ApiSwitcher'
import { DevToolsPanel } from './components/DevToolsPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="auth" element={<Auth />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="review" element={<Review />} />
              <Route path="projects" element={<Projects />} />
            </Route>
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: 'white',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                  color: 'white',
                },
              },
            }}
          />

          {/* Development Tools - shown on all pages in development */}
          <ApiSwitcher />
          <DevToolsPanel />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
