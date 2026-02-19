export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  type: 'task_created' | 'task_assigned' | 'task_completed' | 'task_overdue' | 'task_reminder' | 'comment_added' | 'task_updated';
  taskId?: string;
  data?: any;
}

export class EmailService {
  static async sendEmailNotification(data: EmailNotificationData): Promise<{ success: boolean; error?: string }> {
    console.log('[EmailService] Email notifications disabled');
    return { success: false, error: 'Email service disabled' };
  }

  static async sendTaskCreatedEmail(): Promise<void> {
    console.log('[EmailService] Email sending disabled');
  }

  static async sendTaskCompletedEmail(): Promise<void> {
    console.log('[EmailService] Email sending disabled');
  }

  static async sendTaskDueSoonEmail(): Promise<void> {
    console.log('[EmailService] Email sending disabled');
  }

  static async sendInvitationEmail(): Promise<void> {
    console.log('[EmailService] Email sending disabled');
  }

  static async sendPasswordResetEmail(): Promise<void> {
    console.log('[EmailService] Email sending disabled');
  }
}
