import React, { useState, useEffect } from 'react';
import { Paperclip, X, Download, File, Image, FileText } from 'lucide-react';
import { attachmentService, TaskAttachment } from '../../services/attachmentService';
import { useAuth } from '../../contexts/AuthContext';

interface TaskAttachmentsProps {
  taskId: number;
  onAttachmentsCountChange?: (count: number) => void;
  maxFileSize?: number; // en MB
  allowedTypes?: string[];
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  taskId,
  onAttachmentsCountChange,
  maxFileSize = 10,
  allowedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx']
}) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { } = useAuth();

  // Cargar adjuntos al montar el componente
  useEffect(() => {
    const loadAttachments = async () => {
      try {
        const taskAttachments = await attachmentService.getTaskAttachments(taskId);
        setAttachments(taskAttachments);
        onAttachmentsCountChange?.(taskAttachments.length);
      } catch (error) {
        console.error('Error loading attachments:', error);
      }
    };

    if (taskId) {
      loadAttachments();
      
      // Suscribirse a cambios en tiempo real
      const subscription = attachmentService.subscribeToTaskAttachments(taskId, (updatedAttachments) => {
        setAttachments(updatedAttachments);
        onAttachmentsCountChange?.(updatedAttachments.length);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [taskId, onAttachmentsCountChange]);

  // Formatear tamaño de archivo (usar el del servicio)
  const formatFileSize = (bytes: number): string => {
    return attachmentService.formatFileSize(bytes);
  };

  // Obtener icono por tipo de archivo
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf' || type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Validar archivo
  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo es demasiado grande. Máximo ${maxFileSize}MB.`;
    }

    // Validar tipo
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isAllowed) {
      return 'Tipo de archivo no permitido.';
    }

    return null;
  };

  // Manejar subida de archivos
  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validar archivos
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Subir archivos usando el servicio
      const uploadedAttachments = await Promise.all(
        validFiles.map(async (file) => {
          return await attachmentService.uploadAttachment({
            task_id: taskId,
            file
          });
        })
      );
      
      // Actualizar lista local
      setAttachments(prev => [...uploadedAttachments, ...prev]);
      onAttachmentsCountChange?.(attachments.length + uploadedAttachments.length);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar archivo adjunto
  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      await attachmentService.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      onAttachmentsCountChange?.(attachments.length - 1);
    } catch (error) {
      console.error('Error removing attachment:', error);
      alert('Error al eliminar el archivo. Inténtalo de nuevo.');
    }
  };

  // Descargar archivo
  const handleDownloadAttachment = async (attachment: TaskAttachment) => {
    try {
      if (attachment.public_url) {
        // Si tenemos URL pública, usar esa
        const link = document.createElement('a');
        link.href = attachment.public_url;
        link.download = attachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Usar URL firmada para descarga segura
        const signedUrl = await attachmentService.getSignedUrl(attachment.file_path);
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = attachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar el archivo. Inténtalo de nuevo.');
    }
  };

  // Eventos de drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Archivos adjuntos ({attachments.length})
          </h3>
        </div>
      </div>

      {/* Zona de subida */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = allowedTypes.join(',');
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFileUpload(files);
          };
          input.click();
        }}
      >
        <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {isUploading ? 'Subiendo archivos...' : 'Haz clic o arrastra archivos aquí'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Máximo {maxFileSize}MB por archivo
        </p>
      </div>

      {/* Lista de archivos adjuntos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {getFileIcon(attachment.file_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.file_size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Botón descargar */}
                <button
                  onClick={() => handleDownloadAttachment(attachment)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Descargar"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Botón eliminar */}
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
