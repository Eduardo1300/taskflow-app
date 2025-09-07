import React, { useState, useEffect } from 'react';
import { TaskService } from '../services/taskService';
import { Task } from '../types';
import AnalyticsPageComponent from '../components/Analytics/AnalyticsPage';
import MainLayout from '../components/Layout/MainLayout';

const AnalyticsPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <MainLayout currentPage="analytics">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentPage="analytics">
      <div className="max-w-6xl mx-auto w-full">
        <AnalyticsPageComponent tasks={tasks} />
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
