import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar, MapPin, Users, Bell } from 'lucide-react';
import { Task } from '../../types';

interface CalendarEvent extends Task {
  start_time: string;
  end_time: string;
  duration?: number;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // minutos antes del evento
}

interface CalendarDayViewProps {
  tasks: Task[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onCreateEvent: (date: Date, hour?: number) => void;
}

const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  tasks,
  selectedDate,
  onDateChange,
  onTaskClick,
  onCreateEvent
}) => {
  const [currentHour] = useState(new Date().getHours());

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const getEventsForHour = (hour: number): CalendarEvent[] => {
    const dateStr = selectedDate.toDateString();
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === dateStr;
      })
      .map(task => {
        // Simular horarios detallados si no existen
        const baseHour = task.priority === 'high' ? 9 : 
                        task.priority === 'medium' ? 14 : 16;
        const duration = task.priority === 'high' ? 120 : 60; // minutos
        return {
          ...task,
          start_time: `${String(baseHour).padStart(2, '0')}:00`,
          end_time: `${String(baseHour + Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`,
          duration,
          location: task.category ? `Sala ${task.category}` : undefined,
          attendees: ['Tú'],
          reminders: [15, 5] // 15 y 5 minutos antes
        };
      })
      .filter(event => {
        const eventHour = parseInt(event.start_time.split(':')[0]);
        return eventHour === hour;
      });
  };

  const getAllDayEvents = (): CalendarEvent[] => {
    const dateStr = selectedDate.toDateString();
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === dateStr && !task.completed;
      })
      .slice(0, 3) // Solo primeros 3 para todo el día
      .map(task => ({
        ...task,
        start_time: '00:00',
        end_time: '23:59',
        duration: 1440, // todo el día
        location: undefined,
        attendees: ['Tú'],
        reminders: [60, 15] // 1 hora y 15 minutos antes
      }));
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const allDayEvents = getAllDayEvents();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="h-full flex bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
      
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {dayNames[selectedDate.getDay()]}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                {isToday && <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">• Hoy</span>}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDay('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => onDateChange(new Date())}
                className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                Hoy
              </button>
              
              <button
                onClick={() => navigateDay('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => onCreateEvent(selectedDate)}
                className="ml-4 flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo evento
              </button>
            </div>
          </div>

          {/* All Day Events */}
          {allDayEvents.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Todo el día
              </h3>
              <div className="space-y-1">
                {allDayEvents.map((event, index) => (
                  <div
                    key={index}
                    onClick={() => onTaskClick(event)}
                    className={`p-2 rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200 ${
                      event.priority === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        : event.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{event.title}</span>
                      {event.reminders && event.reminders.length > 0 && (
                        <Bell className="h-4 w-4 opacity-60" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {/* Current time indicator */}
            {isToday && (
              <div 
                className="absolute left-0 right-0 z-10 flex items-center"
                style={{ top: `${(currentHour * 80) + (new Date().getMinutes() * 80 / 60)}px` }}
              >
                <div className="w-16 text-xs text-purple-600 dark:text-purple-400 font-medium text-right pr-2">
                  {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex-1 h-0.5 bg-purple-500">
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Hours */}
            {hours.map(hour => {
              const events = getEventsForHour(hour);
              const isCurrentHour = isToday && hour === currentHour;

              return (
                <div
                  key={hour}
                  className={`flex border-b border-gray-100 dark:border-gray-700 ${
                    isCurrentHour ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                  }`}
                  style={{ height: '80px' }}
                >
                  {/* Time Label */}
                  <div className="w-16 p-2 text-xs text-gray-500 dark:text-gray-400 text-right border-r border-gray-200 dark:border-gray-600">
                    {hour === 0 ? '12 AM' : 
                     hour < 12 ? `${hour} AM` : 
                     hour === 12 ? '12 PM' : 
                     `${hour - 12} PM`}
                  </div>

                  {/* Events Area */}
                  <div
                    className="flex-1 relative group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                    onClick={() => onCreateEvent(selectedDate, hour)}
                  >
                    {/* Events */}
                    {events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(event);
                        }}
                        className={`absolute left-2 right-2 top-1 p-3 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${
                          event.priority === 'high'
                            ? 'bg-red-100 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200'
                            : event.priority === 'medium'
                            ? 'bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200'
                            : 'bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200'
                        } ${event.completed ? 'opacity-60' : ''}`}
                        style={{
                          zIndex: eventIndex + 1,
                          height: event.duration ? `${Math.min(event.duration / 60 * 80, 240)}px` : '60px'
                        }}
                      >
                        <div className="font-medium text-sm mb-1">{event.title}</div>
                        <div className="flex items-center text-xs opacity-75 mb-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{event.start_time} - {event.end_time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs opacity-75 mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 1 && (
                          <div className="flex items-center text-xs opacity-75">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{event.attendees.length} asistentes</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Quick add button (visible on hover) */}
                    {events.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateEvent(selectedDate, hour);
                          }}
                          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumen del día
        </h3>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === selectedDate.toDateString()).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Eventos</div>
          </div>
          
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === selectedDate.toDateString() && t.completed).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completados</div>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Navegación rápida</h4>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                <div key={day} className="text-center py-1 text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 10);
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const hasEvents = tasks.some(t => t.due_date && new Date(t.due_date).toDateString() === date.toDateString());

                return (
                  <button
                    key={i}
                    onClick={() => onDateChange(date)}
                    className={`text-center py-1 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : isCurrentMonth
                        ? hasEvents
                          ? 'text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20'
                          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Próximos eventos</h4>
          <div className="space-y-2">
            {tasks
              .filter(task => task.due_date && new Date(task.due_date) > selectedDate)
              .slice(0, 3)
              .map((task, index) => (
                <div
                  key={index}
                  onClick={() => onTaskClick(task)}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {task.due_date && new Date(task.due_date).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDayView;
