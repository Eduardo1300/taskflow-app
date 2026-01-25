import { supabase } from '../lib/supabase';

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  type: 'task_created' | 'task_assigned' | 'task_completed' | 'comment_added' | 'task_updated';
  taskId?: string;
  data?: any;
}

export class EmailService {
  /**
   * Enviar notificación por email usando Supabase Edge Function
   */
  static async sendEmailNotification(data: EmailNotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      // Usar la función edge de Supabase para enviar correos
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: data
      });

      if (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
      }

      console.log('✉️ Email sent successfully:', result);
      return { success: true };
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Enviar email de notificación de tarea creada
   */
  static async sendTaskCreatedEmail(userEmail: string, taskTitle: string, taskId: string): Promise<{ success: boolean; error?: string }> {
    const subject = `Nueva tarea: ${taskTitle}`;
    const html = `
      <h2>Se ha creado una nueva tarea</h2>
      <p><strong>Tarea:</strong> ${taskTitle}</p>
      <p>Accede a tu cuenta para ver más detalles.</p>
    `;

    return this.sendEmailNotification({
      to: userEmail,
      subject,
      html,
      type: 'task_created',
      taskId,
      data: { taskTitle }
    });
  }

  /**
   * Enviar email de notificación de tarea asignada
   */
  static async sendTaskAssignedEmail(userEmail: string, taskTitle: string, assignedBy: string): Promise<{ success: boolean; error?: string }> {
    const subject = `Te han asignado una tarea: ${taskTitle}`;
    const html = `
      <h2>Te han asignado una nueva tarea</h2>
      <p><strong>Tarea:</strong> ${taskTitle}</p>
      <p><strong>Asignada por:</strong> ${assignedBy}</p>
      <p>Accede a tu cuenta para ver más detalles.</p>
    `;

    return this.sendEmailNotification({
      to: userEmail,
      subject,
      html,
      type: 'task_assigned',
      data: { taskTitle, assignedBy }
    });
  }

  /**
   * Enviar email de tarea completada
   */
  static async sendTaskCompletedEmail(userEmail: string, taskTitle: string, completedBy: string): Promise<{ success: boolean; error?: string }> {
    const subject = `Tarea completada: ${taskTitle}`;
    const html = `
      <h2>Una tarea ha sido completada</h2>
      <p><strong>Tarea:</strong> ${taskTitle}</p>
      <p><strong>Completada por:</strong> ${completedBy}</p>
      <p>Accede a tu cuenta para ver más detalles.</p>
    `;

    return this.sendEmailNotification({
      to: userEmail,
      subject,
      html,
      type: 'task_completed',
      data: { taskTitle, completedBy }
    });
  }

  /**
   * Enviar email de comentario agregado
   */
  static async sendCommentAddedEmail(userEmail: string, taskTitle: string, commentAuthor: string, commentText: string): Promise<{ success: boolean; error?: string }> {
    const subject = `Nuevo comentario en: ${taskTitle}`;
    const html = `
      <h2>Han agregado un comentario a una tarea</h2>
      <p><strong>Tarea:</strong> ${taskTitle}</p>
      <p><strong>Autor:</strong> ${commentAuthor}</p>
      <p><strong>Comentario:</strong> ${commentText}</p>
      <p>Accede a tu cuenta para ver más detalles.</p>
    `;

    return this.sendEmailNotification({
      to: userEmail,
      subject,
      html,
      type: 'comment_added',
      data: { taskTitle, commentAuthor, commentText }
    });
  }
}
