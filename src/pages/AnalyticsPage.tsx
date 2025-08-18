import React, { useState, useEffect } from 'react';
import { TaskService } from '../services/taskService';
import { Task } from '../types';
import AnalyticsPageComponent from '../components/Analytics/AnalyticsPage';
import Header from '../components/Layout/Header';
import SidebarEnhanced from '../components/Layout/SidebarEnhanced';

const AnalyticsPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('analytics');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const result = await TaskService.getTasks();
      if (result.data) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
        <SidebarEnhanced activeSection={activeSection} onSectionChange={handleSectionChange} isCollapsed={false} />
        <div className="flex-1 flex flex-col lg:ml-72">
          <Header showUserMenu={true} />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <SidebarEnhanced activeSection={activeSection} onSectionChange={handleSectionChange} isCollapsed={false} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header showUserMenu={true} />
        <main className="flex-1 p-6">
          <AnalyticsPageComponent tasks={tasks} />
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
