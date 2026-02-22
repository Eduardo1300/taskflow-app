import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock,
  Users,
  Repeat,
  TrendingUp
} from 'lucide-react';
import { Task } from '../types';
import { TaskService } from '../services/taskService';
import { CategoryService, Category } from '../services/categoryService';
import TaskModal from '../components/Tasks/TaskModal';
import CalendarWeekView from '../components/Calendar/CalendarWeekView';
import CalendarDayView from '../components/Calendar/CalendarDayView';
import RecurringEventModal from '../components/Calendar/RecurringEventModal';
import MainLayout from '../components/Layout/MainLayout';


type ViewMode = 'month' | 'week' | 'day';
type TabMode = 'calendar' | 'collaboration';

const CalendarPageEnhanced = () => {
  const [events, setEvents] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [activeTab, setActiveTab] = useState<TabMode>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const tasksResult = await TaskService.getTasks();
        if (tasksResult.data) {
          const calendarEvents = tasksResult.data.filter(task => task.due_date);
          setEvents(calendarEvents);
        }
        
        const categoriesResult = await CategoryService.getCategories();
        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDate]);

  const handleTaskSaved = async (taskData: { 
    title: string; 
    description?: string; 
    completed?: boolean;
    category?: string;
    tags?: string[];
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    try {
      // Convert tags array to string if needed
      const taskPayload = {
        ...taskData,
        tags: taskData.tags ? taskData.tags.join(',') : undefined,
      };
      
      if (editingTask?.id) {
        await TaskService.updateTask(editingTask.id, taskPayload);
      } else {
        await TaskService.createTask(taskPayload);
      }
      
      const result = await TaskService.getTasks();
      if (result.data) {
        const calendarEvents = result.data.filter(task => task.due_date);
        setEvents(calendarEvents);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
    }
  };

  const handleRecurringEventSaved = async () => {
    try {
      setIsRecurringModalOpen(false);
      
      const result = await TaskService.getTasks();
      if (result.data) {
        const calendarEvents = result.data.filter(task => task.due_date);
        setEvents(calendarEvents);
      }
    } catch (error) {
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      if (!event.due_date) return false;
      const eventDate = new Date(event.due_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getTodayEvents = () => {
    const today = new Date();
    return getEventsForDate(today);
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return events
      .filter(event => {
        if (!event.due_date) return false;
        const eventDate = new Date(event.due_date);
        return eventDate > now && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <MainLayout currentPage="calendar">
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl">
              <CalendarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Calendario
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {events.length} eventos programados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {getTodayEvents().length} hoy
                </span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {getUpcomingEvents().length} esta semana
                </span>
              </div>
            </div>

            <button
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo evento
            </button>
            
            <button
              onClick={() => setIsRecurringModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Repeat className="h-5 w-5 mr-2" />
              Repetir
            </button>
          </div>
        </header>

        <div className="flex justify-center mb-8 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'calendar' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Calendario
          </button>
          <button
            onClick={() => setActiveTab('collaboration')}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'collaboration' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Colaboración
          </button>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {activeTab === 'calendar' && (
            <>
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => navigateMonth('prev')} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {getMonthName(currentDate)} {currentDate.getFullYear()}
                      </h2>
                      <button 
                        onClick={() => navigateMonth('next')} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                      {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            viewMode === mode 
                              ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-md' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {viewMode === 'month' && (
                      <>
                        <div className="grid grid-cols-7 gap-2 mb-4">
                          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <div key={day} className="p-3 text-center">
                              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">{day}</div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {getMonthDays(currentDate).map((day, index) => {
                            const dayEvents = getEventsForDate(day.date);
                            const isToday = day.isToday;
                            
                            return (
                              <div
                                key={index}
                                onClick={() => { setSelectedDate(day.date); setIsModalOpen(true); }}
                                className={`min-h-24 p-2 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                                  day.isCurrentMonth 
                                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600' 
                                    : 'bg-gray-50 dark:bg-gray-900/50 border-transparent opacity-50'
                                } ${isToday ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`}
                              >
                                <div className={`text-sm font-medium mb-1 ${
                                  isToday 
                                    ? 'text-purple-600 dark:text-purple-400 font-bold' 
                                    : day.isCurrentMonth 
                                      ? 'text-gray-900 dark:text-white' 
                                      : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                  {day.date.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {dayEvents.slice(0, 2).map(event => (
                                    <div 
                                      key={event.id}
                                      className="text-xs px-2 py-1 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 truncate font-medium"
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                  {dayEvents.length > 2 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      +{dayEvents.length - 2} más
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {viewMode === 'week' && (
                      <CalendarWeekView
                        tasks={events}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onTaskClick={(task: Task) => { setEditingTask(task); setIsModalOpen(true); }}
                        onCreateEvent={(date: Date) => { setSelectedDate(date); setIsModalOpen(true); }}
                      />
                    )}

                    {viewMode === 'day' && (
                      <CalendarDayView
                        selectedDate={currentDate}
                        tasks={events}
                        onDateChange={setCurrentDate}
                        onTaskClick={(task: Task) => { setEditingTask(task); setIsModalOpen(true); }}
                        onCreateEvent={(date: Date) => { setSelectedDate(date); setIsModalOpen(true); }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Eventos de hoy
                  </h3>
                  
                  {getTodayEvents().length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No tienes eventos para hoy</p>
                  ) : (
                    <div className="space-y-3">
                      {getTodayEvents().map((event, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <div className={`w-3 h-3 rounded-full ${
                            event.priority === 'high' ? 'bg-red-500' : event.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Todo el día
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Próximos eventos
                  </h3>
                  
                  {getUpcomingEvents().length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No hay eventos próximos</p>
                  ) : (
                    <div className="space-y-3">
                      {getUpcomingEvents().map((event, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
                          <div className={`w-3 h-3 rounded-full ${
                            event.priority === 'high' ? 'bg-red-500' : event.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {event.due_date ? new Date(event.due_date).toLocaleDateString('es-ES', {
                                weekday: 'short', month: 'short', day: 'numeric'
                              }) : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Estadísticas
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total eventos</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{events.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Este mes</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {events.filter(event => {
                          if (!event.due_date) return false;
                          const eventDate = new Date(event.due_date);
                          return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completados</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {events.filter(event => event.completed).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'collaboration' && (
            <div className="lg:col-span-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Colaboración de Eventos</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Comparte eventos, invita colaboradores y gestiona permisos.
                  </p>
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                    Próximamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); setSelectedDate(null); }}
          editingTask={editingTask}
          onSave={handleTaskSaved}
          categories={categories}
          selectedDate={selectedDate}
        />

        <RecurringEventModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          onSave={handleRecurringEventSaved}
          selectedDate={selectedDate || currentDate}
        />
      </div>
    </MainLayout>
  );
};

export default CalendarPageEnhanced;
