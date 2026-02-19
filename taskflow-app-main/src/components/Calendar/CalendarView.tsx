import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../../types';
import { CalendarDay } from './CalendarDay';
import { CalendarAgenda } from './CalendarAgenda';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onCreateTask
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filtrar tareas por mes actual
  const currentMonthTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    return taskDate.getMonth() === currentDate.getMonth() && 
           taskDate.getFullYear() === currentDate.getFullYear();
  });

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayTasks = currentMonthTasks.filter(task => 
        task.due_date && 
        new Date(task.due_date).toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        tasks: dayTasks
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const days = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="h-full flex">
      {/* Calendario principal */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Hoy
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div
              key={day}
              className="bg-gray-50 dark:bg-gray-800 p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {days.map((day, index) => (
            <CalendarDay
              key={index}
              date={day.date}
              tasks={day.tasks}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              isSelected={selectedDate?.toDateString() === day.date.toDateString()}
              onTaskClick={onTaskClick}
              onCreateTask={onCreateTask}
              onDateClick={setSelectedDate}
            />
          ))}
        </div>
      </div>

      {/* Panel lateral de agenda */}
      <CalendarAgenda
        selectedDate={selectedDate}
        tasks={currentMonthTasks}
        onTaskClick={onTaskClick}
        onCreateTask={onCreateTask}
      />
    </div>
  );
};
