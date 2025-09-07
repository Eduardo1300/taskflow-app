import React from 'react';
import IntegrationsPageComponent from '../components/Integrations/IntegrationsPage';
import MainLayout from '../components/Layout/MainLayout';

const IntegrationsPage: React.FC = () => {
  return (
    <MainLayout currentPage="integrations">
      <div className="max-w-6xl mx-auto w-full">
        <IntegrationsPageComponent />
      </div>
    </MainLayout>
  );
};

export default IntegrationsPage;
