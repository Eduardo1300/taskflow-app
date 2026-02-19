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
  private attachments: Map<number, TaskAttachment[]> = new Map();

  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    return this.attachments.get(taskId) || [];
  }

  async uploadAttachment(upload: AttachmentUpload): Promise<TaskAttachment | null> {
    console.log('[AttachmentService] Uploading:', upload.file.name);
    const attachment: TaskAttachment = {
      id: crypto.randomUUID(),
      task_id: upload.task_id,
      user_id: '',
      file_name: upload.file.name,
      file_path: '',
      file_size: upload.file.size,
      file_type: upload.file.type,
      created_at: new Date().toISOString()
    };

    const existing = this.attachments.get(upload.task_id) || [];
    existing.push(attachment);
    this.attachments.set(upload.task_id, existing);

    return attachment;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    for (const [taskId, attachments] of this.attachments.entries()) {
      const index = attachments.findIndex(a => a.id === attachmentId);
      if (index !== -1) {
        attachments.splice(index, 1);
        this.attachments.set(taskId, attachments);
        return;
      }
    }
  }

  async downloadAttachment(attachmentId: string): Promise<void> {
    console.log('[AttachmentService] Downloading:', attachmentId);
  }

  async subscribeToTaskAttachments(callback: any): Promise<void> {
    console.log('[AttachmentService] Subscribed to attachments');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async getPublicUrl(path: string): Promise<string> {
    return '';
  }
}

export const attachmentService = new AttachmentService();
