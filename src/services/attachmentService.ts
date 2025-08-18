import { supabase } from '../lib/supabase';

export interface TaskAttachment {
  id: string;
  task_id: number;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  public_url?: string;
}

export interface AttachmentUpload {
  task_id: number;
  file: File;
}

class AttachmentService {
  private readonly BUCKET_NAME = 'task-attachments';

  // Obtener adjuntos de una tarea
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attachments:', error);
        throw error;
      }

      // Generar URLs públicas para los archivos
      const attachmentsWithUrls = await Promise.all(
        (data || []).map(async (attachment) => {
          const { data: urlData } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(attachment.file_path);

          return {
            ...attachment,
            public_url: urlData.publicUrl
          };
        })
      );

      return attachmentsWithUrls;
    } catch (error) {
      console.error('Error in getTaskAttachments:', error);
      throw error;
    }
  }

  // Subir archivo
  async uploadAttachment(uploadData: AttachmentUpload): Promise<TaskAttachment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { file, task_id } = uploadData;
      
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${task_id}/${fileName}`;

      // Subir archivo al storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Guardar metadata en la base de datos
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single();

      if (error) {
        // Si hay error guardando metadata, eliminar el archivo del storage
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        throw error;
      }

      // Generar URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        ...data,
        public_url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error in uploadAttachment:', error);
      throw error;
    }
  }

  // Eliminar adjunto
  async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      // Obtener información del adjunto
      const { data: attachment, error: fetchError } = await supabase
        .from('task_attachments')
        .select('file_path')
        .eq('id', attachmentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        throw dbError;
      }
    } catch (error) {
      console.error('Error in deleteAttachment:', error);
      throw error;
    }
  }

  // Descargar archivo
  async downloadAttachment(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in downloadAttachment:', error);
      throw error;
    }
  }

  // Obtener URL firmada para descarga segura
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error in getSignedUrl:', error);
      throw error;
    }
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obtener icono por tipo de archivo
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '📦';
    return '📎';
  }

  // Suscribirse a cambios en adjuntos de una tarea
  subscribeToTaskAttachments(taskId: number, callback: (attachments: TaskAttachment[]) => void) {
    const subscription = supabase
      .channel(`task_attachments_${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_attachments',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          // Recargar adjuntos cuando hay cambios
          this.getTaskAttachments(taskId).then(callback);
        }
      )
      .subscribe();

    return subscription;
  }
}

export const attachmentService = new AttachmentService();
