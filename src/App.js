import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Pages
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Projects } from "./pages/Projects";
import { Showcase } from "./pages/Showcase";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Review } from "./pages/Review";
import { NotificationSettings } from "./pages/NotificationSettings";
import { ProjectView } from "./pages/ProjectView";
import { ProjectCreate } from "./pages/ProjectCreate";

// Protected Route component
import { ProtectedRoute } from "./components/ProtectedRoute";

// Development Tools
import { ApiSwitcher } from "./components/ApiSwitcher";
import { DevToolsPanel } from "./components/DevToolsPanel";
import { TokenStatus } from "./components/TokenStatus";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
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
                <Route index element={<Projects />} />
              </Route>

              {/* Protected individual routes */}
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Projects />} />
                <Route path="create" element={<ProjectCreate />} />
                <Route path=":id" element={<ProjectView />} />
              </Route>

              <Route
                path="/showcase"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Showcase />} />
              </Route>

              <Route
                path="/reviews"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Review />} />
              </Route>

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Profile />} />
              </Route>

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="notifications" element={<NotificationSettings />} />
              </Route>
            </Routes>

            {/* Development Tools - shown on all pages in development */}
            <ApiSwitcher />
            <DevToolsPanel />
            <TokenStatus />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
