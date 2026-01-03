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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleSidebarItemClick = () => {
    // Cerrar sidebar al seleccionar un item en móvil
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on lg */}
        <div className="hidden lg:block">
          <SidebarEnhanced
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isCollapsed={false}
            isOpen={false}
          />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <SidebarEnhanced
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              handleSidebarItemClick();
            }}
            isCollapsed={false}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 lg:-ml-8">
          <Header 
            showUserMenu={true}
            onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <main className="flex-1 py-6 px-4 sm:px-6 lg:pl-8 lg:pr-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
