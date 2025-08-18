import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { Task } from '../../types';

interface CalendarEvent extends Task {
  start_time: string;
  end_time: string;
  duration?: number; // en minutos
}

interface CalendarWeekViewProps {
  tasks: Task[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onCreateEvent: (date: Date, hour?: number) => void;
}

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  tasks,
  currentDate,
  onDateChange,
  onTaskClick,
  onCreateEvent
}) => {
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(currentDate));

  useEffect(() => {
    setWeekStart(getWeekStart(currentDate));
  }, [currentDate]);

  function getWeekStart(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekStart(newStart);
    onDateChange(newStart);
  };

  const getWeekDays = (): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDateAndHour = (date: Date, hour: number): CalendarEvent[] => {
    const dateStr = date.toDateString();
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === dateStr;
      })
      .map(task => {
        // Simular horarios si no existen
        const baseHour = task.priority === 'high' ? 9 : 
                        task.priority === 'medium' ? 14 : 16;
        return {
          ...task,
          start_time: `${String(baseHour).padStart(2, '0')}:00`,
          end_time: `${String(baseHour + 1).padStart(2, '0')}:00`,
          duration: 60
        };
      })
      .filter(event => {
        const eventHour = parseInt(event.start_time.split(':')[0]);
        return eventHour === hour;
      });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekDays = getWeekDays();
  const today = new Date();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Semana del {weekStart.getDate()} de {monthNames[weekStart.getMonth()]} {weekStart.getFullYear()}
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <button
              onClick={() => {
                const today = new Date();
                setWeekStart(getWeekStart(today));
                onDateChange(today);
              }}
              className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
            >
              Esta semana
            </button>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-8 gap-px mt-4">
          <div className="p-3"></div> {/* Espacio para la columna de horas */}
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center border-l border-gray-200 dark:border-gray-600 ${
                day.toDateString() === today.toDateString() 
                  ? 'bg-purple-50 dark:bg-purple-900/20' 
                  : ''
              }`}
            >
              <div className={`text-sm font-medium ${
                day.toDateString() === today.toDateString()
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {dayNames[day.getDay()]}
              </div>
              <div className={`text-lg font-bold mt-1 ${
                day.toDateString() === today.toDateString()
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 h-full">
          {/* Time Column */}
          <div className="border-r border-gray-200 dark:border-gray-600">
            {hours.map(hour => (
              <div
                key={hour}
                className="h-16 border-b border-gray-100 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400"
              >
                {hour === 0 ? '12 AM' : 
                 hour < 12 ? `${hour} AM` : 
                 hour === 12 ? '12 PM' : 
                 `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {weekDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="border-r border-gray-200 dark:border-gray-600 last:border-r-0"
            >
              {hours.map(hour => {
                const events = getEventsForDateAndHour(day, hour);
                const isToday = day.toDateString() === today.toDateString();
                const currentHour = new Date().getHours();
                const isCurrentHour = isToday && hour === currentHour;

                return (
                  <div
                    key={hour}
                    className={`relative h-16 border-b border-gray-100 dark:border-gray-700 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      isCurrentHour ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                    }`}
                    onClick={() => onCreateEvent(day, hour)}
                  >
                    {/* Current time indicator */}
                    {isCurrentHour && (
                      <div className="absolute left-0 top-1/2 w-full h-0.5 bg-purple-500 z-10">
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                    )}

                    {/* Events */}
                    {events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(event);
                        }}
                        className={`absolute left-1 right-1 top-1 p-2 rounded cursor-pointer hover:shadow-md transition-all duration-200 ${
                          event.priority === 'high'
                            ? 'bg-red-100 border-l-4 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            : event.priority === 'medium'
                            ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-blue-100 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        } ${event.completed ? 'opacity-60' : ''}`}
                        style={{
                          zIndex: eventIndex + 1
                        }}
                      >
                        <div className="text-xs font-medium truncate">
                          {event.title}
                        </div>
                        <div className="flex items-center text-xs mt-1 opacity-75">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{event.start_time} - {event.end_time}</span>
                        </div>
                      </div>
                    ))}

                    {/* Quick add button (visible on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateEvent(day, hour);
                        }}
                        className="p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Plus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWeekView;
