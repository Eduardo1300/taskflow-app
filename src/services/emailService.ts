    import { supabase } from '../lib/supabase';

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  type: 'task_created' | 'task_assigned' | 'task_completed' | 'task_overdue' | 'task_reminder' | 'comment_added' | 'task_updated';
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
  static async sendTaskCreatedEmail(userEmail: string, taskTitle: string, taskId: string, taskData?: any): Promise<{ success: boolean; error?: string }> {
    const subject = `✨ Nueva tarea: ${taskTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-details { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Nueva Tarea Creada</h1>
            <p>Una nueva tarea ha sido agregada a tu lista</p>
          </div>
          
          <div class="content">
            <h2>${taskTitle}</h2>
            
            <div class="task-details">
              ${taskData?.description ? `<div class="detail-row"><span><strong>Descripción:</strong></span></div><div style="padding: 8px 0;">${taskData.description}</div>` : ''}
              
              <div class="detail-row">
                <span class="label">ID de Tarea:</span>
                <span>#${taskId}</span>
              </div>
              
              ${taskData?.priority ? `<div class="detail-row">
                <span class="label">Prioridad:</span>
                <span>${taskData.priority === 'high' ? '🔴 Alta' : taskData.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}</span>
              </div>` : ''}
              
              ${taskData?.category ? `<div class="detail-row">
                <span class="label">Categoría:</span>
                <span>${taskData.category}</span>
              </div>` : ''}
              
              ${taskData?.tags && taskData.tags.length > 0 ? `<div class="detail-row">
                <span class="label">Etiquetas:</span>
                <span>${taskData.tags.join(', ')}</span>
              </div>` : ''}
              
              ${taskData?.due_date ? `<div class="detail-row">
                <span class="label">Fecha de Vencimiento:</span>
                <span>${new Date(taskData.due_date).toLocaleDateString('es-ES')}</span>
              </div>` : ''}
            </div>
            
            <p>Accede a tu app para ver más detalles y empezar a trabajar en esta tarea.</p>
            
            <center>
              <a href="https://taskflow.app" class="button">Ver Tarea</a>
            </center>
          </div>
          
          <div class="footer">
            <p>TaskFlow - Tu gestor de tareas inteligente</p>
          </div>
        </div>
      </body>
      </html>
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
  static async sendTaskCompletedEmail(userEmail: string, taskTitle: string, completedBy?: string): Promise<{ success: boolean; error?: string }> {
    const subject = `✅ Tarea completada: ${taskTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-details { background: #f0fff4; padding: 15px; border-left: 4px solid #38ef7d; border-radius: 4px; margin: 15px 0; }
          .button { display: inline-block; background: #38ef7d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Felicidades!</h1>
            <p>Una tarea ha sido completada</p>
          </div>
          
          <div class="content">
            <h2>${taskTitle}</h2>
            
            <div class="task-details">
              <p><strong>Estado:</strong> Completada ✓</p>
              ${completedBy ? `<p><strong>Completada por:</strong> ${completedBy}</p>` : ''}
              <p><strong>Fecha de Completación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            
            <p>¡Excelente trabajo! Sigue así con tus próximas tareas.</p>
            
            <center>
              <a href="https://taskflow.app" class="button">Ver Detalles</a>
            </center>
          </div>
          
          <div class="footer">
            <p>TaskFlow - Tu gestor de tareas inteligente</p>
          </div>
        </div>
      </body>
      </html>
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
   * Enviar email de tarea vencida
   */
  static async sendTaskOverdueEmail(userEmail: string, taskTitle: string, dueDate?: string): Promise<{ success: boolean; error?: string }> {
    const subject = `⚠️ Tarea Vencida: ${taskTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-details { background: #fff5f5; padding: 15px; border-left: 4px solid #f5576c; border-radius: 4px; margin: 15px 0; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Tarea Vencida</h1>
            <p>Una de tus tareas ha excedido su fecha de vencimiento</p>
          </div>
          
          <div class="content">
            <h2>${taskTitle}</h2>
            
            <div class="task-details">
              <p><strong>Estado:</strong> ⚠️ Vencida</p>
              ${dueDate ? `<p><strong>Fecha de Vencimiento:</strong> ${new Date(dueDate).toLocaleDateString('es-ES')}</p>` : ''}
            </div>
            
            <p>Por favor, completa esta tarea lo antes posible o actualiza su fecha de vencimiento.</p>
            
            <center>
              <a href="https://taskflow.app" class="button">Actualizar Tarea</a>
            </center>
          </div>
          
          <div class="footer">
            <p>TaskFlow - Tu gestor de tareas inteligente</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmailNotification({
      to: userEmail,
      subject,
      html,
      type: 'task_overdue',
      data: { taskTitle, dueDate }
    });
  }

  /**
   * Enviar email de recordatorio de tarea
   */
  static async sendTaskReminderEmail(userEmail: string, taskTitle: string, dueDate?: string, taskData?: any): Promise<{ success: boolean; error?: string }> {
    const subject = `🔔 Recordatorio: ${taskTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .task-details { background: #f0f7ff; padding: 15px; border-left: 4px solid #4facfe; border-radius: 4px; margin: 15px 0; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Recordatorio de Tarea</h1>
            <p>Te recordamos que tienes una tarea pendiente</p>
          </div>
          
          <div class="content">
            <h2>${taskTitle}</h2>
            
            <div class="task-details">
              ${dueDate ? `<p><strong>Fecha de Vencimiento:</strong> ${new Date(dueDate).toLocaleDateString('es-ES')}</p>` : ''}
              ${taskData?.category ? `<p><strong>Categoría:</strong> ${taskData.category}</p>` : ''}
              ${taskData?.priority ? `<p><strong>Prioridad:</strong> ${taskData.priority === 'high' ? '🔴 Alta' : taskData.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}</p>` : ''}
            </div>
            
            <p>¿Listo para completarla? Accede a tu app ahora.</p>
            
            <center>
              <a href="https://taskflow.app" class="button">Ver Tarea</a>
            </center>
          </div>
          
          <div class="footer">
            <p>TaskFlow - Tu gestor de tareas inteligente</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmailNotification({
      to: userEmail,
      subject,
      html,
      type: 'task_reminder',
      data: { taskTitle, dueDate }
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
