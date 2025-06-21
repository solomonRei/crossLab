import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
        </Route>

        {/* Dashboard routes - authenticated */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/projects" replace />} />
        </Route>
        
        <Route path="/projects" element={<DashboardLayout />}>
          <Route index element={<Projects />} />
          <Route path=":id" element={<ProjectView />} />
        </Route>
        
        <Route path="/profile" element={<DashboardLayout />}>
          <Route index element={<Profile />} />
        </Route>
        
        <Route path="/showcase" element={<DashboardLayout />}>
          <Route index element={<Showcase />} />
        </Route>
        
        <Route path="/reviews" element={<DashboardLayout />}>
          <Route index element={<Review />} />
        </Route>

        <Route path="/settings" element={<DashboardLayout />}>
          <Route path="notifications" element={<NotificationSettings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
