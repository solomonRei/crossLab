import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

// Pages
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { ProjectView } from './pages/ProjectView'
import { Profile } from './pages/Profile'
import { Showcase } from './pages/Showcase'
import { Review } from './pages/Review'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        
        {/* Dashboard routes - authenticated */}
        <Route path="/dashboard" element={<DashboardLayout><Projects /></DashboardLayout>} />
        <Route path="/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
        <Route path="/projects/:id" element={<DashboardLayout><ProjectView /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        <Route path="/showcase" element={<DashboardLayout><Showcase /></DashboardLayout>} />
        <Route path="/reviews" element={<DashboardLayout><Review /></DashboardLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
