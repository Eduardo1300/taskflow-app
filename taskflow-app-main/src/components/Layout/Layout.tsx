import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import PWAUpdate from '../PWA/PWAUpdate';
import IntegrationNotifications from '../Integrations/IntegrationNotifications';
import { ThemeProvider } from '../../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeSection = 'dashboard', 
  onSectionChange = () => {}, 
  showSidebar = true 
}) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* PWA Update notification */}
        <PWAUpdate />
        
        {/* Integration notifications */}
        <IntegrationNotifications />

        <div className="flex h-screen">
          {/* Sidebar */}
          {showSidebar && (
            <Sidebar 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          )}

          {/* Contenido principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />
            
            {/* Contenido */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
