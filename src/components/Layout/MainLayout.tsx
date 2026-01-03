import React, { useState } from 'react';
import Header from './Header';
import SidebarEnhanced from './SidebarEnhanced';
import ProfileSection from '../Profile/ProfileSection';
import SettingsSection from '../Settings/SettingsSection';
import HelpSection from '../Help/HelpSection';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage }) => {
  const [activeSection, setActiveSection] = useState(currentPage);

  const renderContent = () => {
    // Si currentPage es profile, settings o help, mostrar el children directamente
    // (que viene de las páginas enhanced)
    if (currentPage === 'profile' || currentPage === 'settings' || currentPage === 'help') {
      return children;
    }
    
    switch (activeSection) {
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto w-full">
            <ProfileSection />
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto w-full">
            <SettingsSection />
          </div>
        );
      case 'help':
        return (
          <div className="max-w-4xl mx-auto w-full">
            <HelpSection />
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        <SidebarEnhanced
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isCollapsed={false}
        />
        
        <div className="flex-1 flex flex-col min-w-0 -ml-8">
          <Header showUserMenu={true} />
          
          <main className="flex-1 py-6 pl-8 pr-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
