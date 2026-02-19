import React, { useState } from 'react';
import { MessageCircle, Paperclip, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskComments } from './TaskComments';
import { TaskAttachments } from './TaskAttachments';
import { TaskAssignments } from './TaskAssignments';
import { Task } from '../../types';

interface TaskDetailsProps {
  task: Task;
  onClose?: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'assignments'>('comments');
  const [commentsCount, setCommentsCount] = useState(0);
  const [attachmentsCount, setAttachmentsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const tabs = [
    {
      id: 'comments' as const,
      label: 'Comentarios',
      icon: MessageCircle,
      count: commentsCount
    },
    {
      id: 'attachments' as const,
      label: 'Archivos',
      icon: Paperclip,
      count: attachmentsCount
    },
    {
      id: 'assignments' as const,
      label: 'Asignados',
      icon: Users,
      count: assignmentsCount
    }
  ];

  if (!task.id) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          Detalles de la tarea
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'comments' && (
              <TaskComments
                taskId={task.id}
                onCommentsCountChange={setCommentsCount}
              />
            )}
            
            {activeTab === 'attachments' && (
              <TaskAttachments
                taskId={task.id}
                onAttachmentsCountChange={setAttachmentsCount}
              />
            )}
            
            {activeTab === 'assignments' && (
              <TaskAssignments
                taskId={task.id}
                onAssignmentsCountChange={setAssignmentsCount}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
