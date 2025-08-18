import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LandingPageEnhanced from './pages/LandingPageEnhanced';
import LoginPageEnhanced from './pages/LoginPageEnhanced';
import RegisterPageEnhanced from './pages/RegisterPageEnhanced';
import DashboardPageEnhanced from './pages/DashboardPageEnhanced';
import KanbanPageEnhanced from './pages/KanbanPageEnhanced';
import CalendarPageEnhanced from './pages/CalendarPageEnhanced';
import AnalyticsPage from './pages/AnalyticsPage';
import ApiManagementPage from './pages/ApiManagementPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<LandingPageEnhanced />} />
              <Route path="/login" element={<LoginPageEnhanced />} />
              <Route path="/register" element={<RegisterPageEnhanced />} />
              
              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPageEnhanced />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/kanban" 
                element={
                  <ProtectedRoute>
                    <KanbanPageEnhanced />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <CalendarPageEnhanced />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/api" 
                element={
                  <ProtectedRoute>
                    <ApiManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/integrations" 
                element={
                  <ProtectedRoute>
                    <IntegrationsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/help" 
                element={
                  <ProtectedRoute>
                    <HelpPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;