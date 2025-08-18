import React, { useState } from 'react';
import { X, Calendar, Clock, Repeat, Bell, MapPin, Tag } from 'lucide-react';
import { RecurringPattern, RecurringEventService, RecurringEventFormData } from '../../services/recurringEventService';

interface RecurringEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: RecurringEventFormData) => void;
  selectedDate?: Date;
}

const RecurringEventModal: React.FC<RecurringEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate
}) => {
  const [formData, setFormData] = useState<RecurringEventFormData>({
    title: '',
    description: '',
    startDate: selectedDate || new Date(),
    start_time: '09:00',
    end_time: '10:00',
    pattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [1], // Lunes por defecto
    },
    priority: 'medium',
    category: '',
    location: '',
    reminders: [15]
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar patrón
    const validation = RecurringEventService.validatePattern(formData.pattern);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    // Validar campos básicos
    const newErrors = [];
    if (!formData.title.trim()) {
      newErrors.push('El título es obligatorio');
    }
    
    if (formData.start_time >= formData.end_time) {
      newErrors.push('La hora de fin debe ser posterior a la hora de inicio');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    onSave(formData);
    onClose();
  };

  const handlePatternChange = (updates: Partial<RecurringPattern>) => {
    setFormData(prev => ({
      ...prev,
      pattern: { ...prev.pattern, ...updates }
    }));
  };

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = formData.pattern.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    handlePatternChange({ daysOfWeek: newDays });
  };

  const handleReminderToggle = (minutes: number) => {
    const currentReminders = formData.reminders || [];
    const newReminders = currentReminders.includes(minutes)
      ? currentReminders.filter(r => r !== minutes)
      : [...currentReminders, minutes].sort((a, b) => b - a);
    
    setFormData(prev => ({ ...prev, reminders: newReminders }));
  };

  if (!isOpen) return null;

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const patternDescription = RecurringEventService.getPatternDescription(formData.pattern);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Repeat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Crear Evento Recurrente
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {patternDescription}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Reunión de equipo, Clase de yoga..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Descripción opcional del evento..."
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha de inicio
              </label>
              <input
                type="date"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Hora inicio
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Hora fin
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Repeat className="h-4 w-4 inline mr-2" />
              Patrón de repetición
            </label>
            
            <div className="space-y-4">
              {/* Pattern Type */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'daily', label: 'Diario' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensual' },
                  { value: 'yearly', label: 'Anual' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePatternChange({ type: option.value as any })}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      formData.pattern.type === option.value
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Interval */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Cada</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.pattern.interval}
                  onChange={(e) => handlePatternChange({ interval: parseInt(e.target.value) || 1 })}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.pattern.type === 'daily' ? 'día(s)' :
                   formData.pattern.type === 'weekly' ? 'semana(s)' :
                   formData.pattern.type === 'monthly' ? 'mes(es)' : 'año(s)'}
                </span>
              </div>

              {/* Weekly Days */}
              {formData.pattern.type === 'weekly' && (
                <div>
                  <span className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Días de la semana:</span>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayOfWeekToggle(index)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          formData.pattern.daysOfWeek?.includes(index)
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Day */}
              {formData.pattern.type === 'monthly' && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">El día</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.pattern.dayOfMonth || formData.startDate.getDate()}
                    onChange={(e) => handlePatternChange({ dayOfMonth: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">de cada mes</span>
                </div>
              )}
            </div>
          </div>

          {/* End Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Finalización
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="endCondition"
                  checked={!formData.pattern.endDate && !formData.pattern.occurrences}
                  onChange={() => handlePatternChange({ endDate: undefined, occurrences: undefined })}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sin fin</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="endCondition"
                  checked={!!formData.pattern.endDate}
                  onChange={() => {
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 3);
                    handlePatternChange({ endDate, occurrences: undefined });
                  }}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Hasta el</span>
                <input
                  type="date"
                  value={formData.pattern.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handlePatternChange({ 
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                    occurrences: undefined 
                  })}
                  disabled={!formData.pattern.endDate}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="endCondition"
                  checked={!!formData.pattern.occurrences}
                  onChange={() => handlePatternChange({ occurrences: 10, endDate: undefined })}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Después de</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formData.pattern.occurrences || ''}
                  onChange={(e) => handlePatternChange({ 
                    occurrences: parseInt(e.target.value) || undefined,
                    endDate: undefined 
                  })}
                  disabled={!formData.pattern.occurrences}
                  className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">ocurrencias</span>
              </label>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            {showAdvanced ? 'Ocultar' : 'Mostrar'} opciones avanzadas
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ej: Trabajo, Personal..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Sala de reuniones, Casa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Bell className="h-4 w-4 inline mr-2" />
                  Recordatorios
                </label>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 30, 60, 120].map(minutes => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => handleReminderToggle(minutes)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        formData.reminders?.includes(minutes)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Crear Evento Recurrente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringEventModal;
