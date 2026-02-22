import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '../../types/database';
import { Category } from '../../services/categoryService';
import AISuggestions from './AISuggestions';
import { TaskDetails } from './TaskDetails';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { 
    title: string; 
    description?: string; 
    completed?: boolean;
    category?: string;
    tags?: string[];
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => void;
  editingTask?: Task | null;
  categories?: Category[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, editingTask, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false,
    category: '',
    tags: [] as string[],
    due_date: '',
    priority: '' as '' | 'low' | 'medium' | 'high'
  });
  
  const [tagInput, setTagInput] = useState('');

  // Resetear formulario cuando el modal se abre/cierra o cambia la tarea editada
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      
      if (editingTask) {
        setFormData({
          title: editingTask.title,
          description: editingTask.description || '',
          completed: editingTask.completed,
          category: editingTask.category || '',
          tags: editingTask.tags || [],
          due_date: editingTask.due_date || '',
          priority: editingTask.priority || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          completed: false,
          category: '',
          tags: [],
          due_date: '',
          priority: ''
        });
      }
      setTagInput('');
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = 'auto';
    }

    // Cleanup function para restaurar scroll cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const submitData = {
      ...formData,
      priority: formData.priority || undefined,
      due_date: formData.due_date || undefined,
      category: formData.category || undefined,
      tags: formData.tags.length > 0 ? formData.tags.join(',') : undefined
    };
    
    onSave(submitData);
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleAISuggestion = (type: 'category' | 'due_date' | 'priority', value: any) => {
    switch (type) {
      case 'category':
        setFormData(prev => ({ ...prev, category: value }));
        break;
      case 'due_date':
        setFormData(prev => ({ ...prev, due_date: value }));
        break;
      case 'priority':
        setFormData(prev => ({ ...prev, priority: value }));
        break;
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[60vh] min-h-[400px] flex flex-col"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            {editingTask ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          className="flex-1 overflow-y-scroll min-h-0 modal-scroll" 
          style={{ 
            maxHeight: 'calc(60vh - 160px)' // Resta el header y footer
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <form id="task-form" onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              placeholder="¿Qué necesitas hacer?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descripción de la tarea..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiquetas
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Presiona Enter para agregar etiqueta..."
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              value={formData.priority || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | '' }))}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar prioridad...</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Sugerencias de IA */}
          <AISuggestions
            title={formData.title}
            description={formData.description}
            onSuggestionAccept={handleAISuggestion}
          />

            {/* Task Details - Solo mostrar si estamos editando una tarea existente */}
            {editingTask && editingTask.id && (
              <div className="mt-6">
                <TaskDetails task={editingTask} />
              </div>
            )}
            </form>
        </div>

        {/* Botones fijos en la parte inferior */}
        <div className="flex justify-end space-x-3 p-4 md:p-6 border-t dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="task-form"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {editingTask ? 'Actualizar' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
