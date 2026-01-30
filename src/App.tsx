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
import ProfilePageEnhanced from './pages/ProfilePageEnhanced';
import SettingsPageEnhanced from './pages/SettingsPageEnhanced';
import HelpPageEnhanced from './pages/HelpPageEnhanced';
import GuidesPage from './pages/GuidesPage';
import DocumentationPage from './pages/DocumentationPage';

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
                    <ProfilePageEnhanced />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPageEnhanced />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/help" 
                element={
                  <ProtectedRoute>
                    <HelpPageEnhanced />
                  </ProtectedRoute>
                } 
              />

              {/* Nueva ruta para las guías */}
              <Route
                path="/guides"
                element={
                  <ProtectedRoute>
                    <GuidesPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Nueva ruta para documentación */}
              <Route
                path="/docs"
                element={<DocumentationPage />}
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