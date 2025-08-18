import React, { useState } from 'react';
import ApiManagementPageComponent from '../components/Api/ApiManagementPage';
import Header from '../components/Layout/Header';
import SidebarEnhanced from '../components/Layout/SidebarEnhanced';

const ApiManagementPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('api');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <SidebarEnhanced activeSection={activeSection} onSectionChange={handleSectionChange} isCollapsed={false} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header showUserMenu={true} />
        <main className="flex-1 p-6">
          <ApiManagementPageComponent />
        </main>
      </div>
    </div>
  );
};

export default ApiManagementPage;
