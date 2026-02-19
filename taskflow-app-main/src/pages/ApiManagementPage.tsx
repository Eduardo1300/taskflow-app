import React from 'react';
import ApiManagementPageComponent from '../components/Api/ApiManagementPage';
import MainLayout from '../components/Layout/MainLayout';

const ApiManagementPage: React.FC = () => {
  return (
    <MainLayout currentPage="api">
      <div className="max-w-6xl mx-auto w-full">
        <ApiManagementPageComponent />
      </div>
    </MainLayout>
  );
};

export default ApiManagementPage;
