import { useState, useEffect, useRef } from 'react';
import { Task } from '../../types';
import { TaskService } from '../../services/taskService';
import { X, Flag, Upload, FileText, Target, AlertCircle, CheckCircle2, Sparkles, Plus, Hash, Paperclip, MessageSquare, Clock, Trash2, Download, AlertTriangle, Eye } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onTaskSaved: (task: Task) => void;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  created_at: string;
  user_name?: string;
}

const TaskModalEnhanced: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onTaskSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'activity'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskCategories = [
    { name: 'Trabajo', icon: '💼' },
    { name: 'Personal', icon: '🏠' },
    { name: 'Estudio', icon: '📚' },
    { name: 'Salud', icon: '⚕️' },
    { name: 'Compras', icon: '🛒' },
    { name: 'Viajes', icon: '✈️' },
  ];

  // Efectos de entrada
  useEffect(() => {
    if (isOpen && task) {
      // Convert tags from string to array if needed
      let taskTags: string[] = [];
      if (task.tags) {
        if (Array.isArray(task.tags)) {
          taskTags = task.tags;
        } else if (typeof task.tags === 'string') {
          taskTags = task.tags.split(',').filter(t => t.trim());
        }
      }
      
      setTitle(task.title);
      setDescription(task.description || '');
      const validPriority = ['low', 'medium', 'high'].includes(task.priority) ? (task.priority as 'low' | 'medium' | 'high') : 'medium';
      setPriority(validPriority);
      setDueDate(task.due_date ? (typeof task.due_date === 'string' ? task.due_date.split('T')[0] : '') : '');
      setCategory(task.category || '');
      setTags(taskTags);
      addActivity('Tarea abierta', `Se abrió la tarea "${task.title}"`);
      loadTaskAttachments(task.id);
    } else {
      resetForm();
    }
  }, [isOpen, task]);

  // Cargar adjuntos de la tarea (funcionalidad暂不可用)
  const loadTaskAttachments = async (taskId: number) => {
    // Adjuntos暂不支持 - 需要后端支持
    setAttachments([]);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setCategory('');
    setTags([]);
    setActiveTab('details');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addActivity = (action: string, details: string) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      action,
      details,
      created_at: new Date().toISOString(),
      user_name: 'Tú'
    };
    setActivity(prev => [newActivity, ...prev]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = Date.now().toString() + '-' + i;
        
        // Para nueva tarea, guardar archivo temporalmente
        const tempAttachment: Attachment = {
          id: fileId,
          name: file.name,
          url: '', // Se completará después
          type: file.type,
          size: file.size,
          created_at: new Date().toISOString()
        };

        setAttachments(prev => [...prev, tempAttachment]);
        setPendingFiles(prev => [...prev, file]);
        addActivity('Archivo agregado', `Se agregó "${file.name}"`);
      }
    } catch (err: any) {
      setError('Error al procesar archivos: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (!attachment) return;

    const attachmentIndex = attachments.findIndex(a => a.id === attachmentId);
    
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    setPendingFiles(prev => prev.filter((_, i) => i !== attachmentIndex));
    
    addActivity('Archivo eliminado', `Se eliminó "${attachment.name}"`);
  };

  // Subir adjuntos (funcionalidad暂不可用)
  const uploadAttachments = async (savedTaskId: number, userId: string) => {
    // Adjuntos暂不支持 - 需要后端支持
    return [];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (attachment: Attachment) => {
    // Abrir directamente en nueva pestaña para descargar
    window.open(attachment.url, '_blank');
  };

  const openPreview = (attachment: Attachment) => {
    // Abrir en nueva pestaña para ver
    window.open(attachment.url, '_blank');
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isPDF = (type: string) => type === 'application/pdf';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority: priority as 'low' | 'medium' | 'high',
        due_date: dueDate || null,
        category: category || null,
        tags: tags.length > 0 ? tags.join(',') : '',
      };

      let result;
      let savedTaskId: number | undefined;
      
      if (task?.id) {
        result = await TaskService.updateTask(task.id, taskData);
        savedTaskId = task.id;
      } else {
        result = await TaskService.createTask(taskData);
        savedTaskId = result.data?.id;
      }
      
      if (result.data) {
        // Si hay archivos pendientes y tenemos el ID, subirlos
        if (pendingFiles.length > 0 && savedTaskId) {
          await uploadAttachments(savedTaskId, result.data.user_id);
        }
        
        onTaskSaved(result.data);
        onClose();
      } else if (result.error) {
        setError('Error al guardar: ' + result.error);
      }
    } catch (err: any) {
      setError('Error al guardar la tarea: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return Flag;
      case 'medium': return AlertCircle;
      case 'low': return Target;
      default: return AlertCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex-shrink-0 relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 text-white overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {task?.id ? 'Editar Tarea' : 'Nueva Tarea'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {task?.id ? 'Actualiza los detalles de tu tarea' : 'Crea una nueva tarea productiva'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:rotate-90"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {[
              { id: 'details', label: 'Detalles', icon: FileText },
              { id: 'attachments', label: 'Archivos', icon: Paperclip, badge: attachments.length },
              { id: 'activity', label: 'Actividad', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-blue-500' : ''}`} />
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' && (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Título de la tarea
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    placeholder="¿En qué vas a trabajar hoy?"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 resize-none"
                    placeholder="Describe los detalles y objetivos de esta tarea..."
                  />
                </div>

                {/* Grid Layout para campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Prioridad
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => {
                        const PriorityIcon = getPriorityIcon(p);
                        const isSelected = priority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex items-center justify-center p-3 border-2 rounded-xl transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <PriorityIcon className={`h-4 w-4 mr-2 ${getPriorityColor(p)}`} />
                            <span className="text-sm font-medium capitalize">{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Fecha límite
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
                    >
                      <option value="">Seleccionar categoría</option>
                      {taskCategories.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                      placeholder="Agregar etiqueta..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

                {activeTab === 'attachments' && (
                  <div className="p-6 space-y-4">
                    {/* Upload Area */}
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        {isUploading ? 'Subiendo...' : 'Agregar archivos'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click para seleccionar o arrastra aquí
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                      />
                    </div>

                    {/* Files List */}
                    {attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Archivos ({attachments.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {attachments.map((attachment) => (
                            <div 
                              key={attachment.id}
                              className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                            >
                              {/* Preview for images */}
                              {isImage(attachment.type) && attachment.url ? (
                                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                  <img 
                                    src={attachment.url} 
                                    alt={attachment.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).parentElement!.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                          <span class="text-4xl">📷</span>
                                        </div>
                                      `;
                                    }}
                                  />
                                  {/* Preview button overlay */}
                                  <button
                                    onClick={() => openPreview(attachment)}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <Eye className="h-8 w-8 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                                  <span className="text-4xl">{isPDF(attachment.type) ? '📄' : '📎'}</span>
                                  <button
                                    onClick={() => openPreview(attachment)}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <Eye className="h-8 w-8 text-white" />
                                  </button>
                                </div>
                              )}

                              {/* File Info */}
                              <div className="p-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={attachment.name}>
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>

                              {/* Actions Overlay */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                <button
                                  onClick={() => openPreview(attachment)}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                                  title="Ver"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => downloadFile(attachment)}
                                  className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors"
                                  title="Descargar"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAttachment(attachment.id)}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {attachments.length === 0 && !isUploading && (
                      <div className="text-center py-8">
                        <Paperclip className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No hay archivos adjuntos
                        </p>
                      </div>
                    )}
                  </div>
                )}

            {activeTab === 'activity' && (
              <div className="p-8">
                {activity.length > 0 ? (
                  <div className="space-y-4">
                    {activity.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.user_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {item.details}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Actividad de la tarea
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                     Aún no hay actividad registrada
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewAttachment && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              {/* Close button */}
              <button
                onClick={() => setPreviewAttachment(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Image preview */}
              {isImage(previewAttachment.type) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black">
                    <img 
                      src={previewAttachment.url} 
                      alt={previewAttachment.name}
                      className="max-w-full max-h-[70vh] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `
                          <div class="flex flex-col items-center justify-center p-8">
                            <span class="text-6xl mb-4">⚠️</span>
                            <p class="text-white text-center">No se pudo cargar la imagen</p>
                            <a href="${previewAttachment.url}" target="_blank" class="text-blue-400 mt-2 underline">Abrir en nueva pestaña</a>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{previewAttachment.name}</p>
                    <button
                      onClick={() => downloadFile(previewAttachment)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PDF preview */}
              {isPDF(previewAttachment.type) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{previewAttachment.name}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadFile(previewAttachment)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </button>
                    </div>
                  </div>
                  <div className="h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📄</span>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">PDF: {previewAttachment.name}</p>
                      <a 
                        href={previewAttachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Abrir PDF</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {task?.id ? `Última actualización: ${new Date().toLocaleDateString()}` : 'Nueva tarea'}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !title.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {task?.id ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {task?.id ? 'Actualizar tarea' : 'Crear tarea'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModalEnhanced;
