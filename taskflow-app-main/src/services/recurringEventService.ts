export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // cada cuántos días/semanas/meses
  daysOfWeek?: number[]; // Para eventos semanales [0=domingo, 1=lunes, etc.]
  dayOfMonth?: number; // Para eventos mensuales
  endDate?: Date; // Fecha de fin de la recurrencia
  occurrences?: number; // Número máximo de ocurrencias
}

export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  pattern: RecurringPattern;
  startDate: Date;
  duration: number; // minutos
  start_time: string;
  end_time: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  location?: string;
  reminders?: number[]; // minutos antes
  created_at: Date;
  user_id: string;
  is_active: boolean;
}

export class RecurringEventService {
  // Generar instancias de un evento recurrente en un rango de fechas
  static generateInstances(
    recurringTask: RecurringTask, 
    startRange: Date, 
    endRange: Date
  ): Array<{
    id: string;
    original_recurring_id: string;
    title: string;
    description?: string;
    due_date: Date;
    start_time: string;
    end_time: string;
    duration: number;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    location?: string;
    reminders?: number[];
    is_recurring_instance: boolean;
    instance_date: Date;
  }> {
    const instances = [];
    const { pattern, startDate } = recurringTask;
    
    let currentDate = new Date(Math.max(startDate.getTime(), startRange.getTime()));
    let occurrenceCount = 0;
    
    while (currentDate <= endRange) {
      // Verificar si hemos alcanzado el límite
      if (pattern.occurrences && occurrenceCount >= pattern.occurrences) {
        break;
      }
      
      if (pattern.endDate && currentDate > pattern.endDate) {
        break;
      }
      
      // Generar la instancia si la fecha coincide con el patrón
      if (this.shouldGenerateInstance(currentDate, recurringTask)) {
        instances.push({
          id: `${recurringTask.id}-${currentDate.toISOString().split('T')[0]}`,
          original_recurring_id: recurringTask.id,
          title: recurringTask.title,
          description: recurringTask.description,
          due_date: new Date(currentDate),
          start_time: recurringTask.start_time,
          end_time: recurringTask.end_time,
          duration: recurringTask.duration,
          priority: recurringTask.priority,
          category: recurringTask.category,
          location: recurringTask.location,
          reminders: recurringTask.reminders,
          is_recurring_instance: true,
          instance_date: new Date(currentDate)
        });
        
        occurrenceCount++;
      }
      
      // Avanzar a la siguiente fecha posible
      currentDate = this.getNextDate(currentDate, pattern);
    }
    
    return instances;
  }
  
  private static shouldGenerateInstance(date: Date, recurringTask: RecurringTask): boolean {
    const { pattern, startDate } = recurringTask;
    
    // La fecha debe ser >= fecha de inicio
    if (date < startDate) return false;
    
    switch (pattern.type) {
      case 'daily':
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff % pattern.interval === 0;
        
      case 'weekly':
        const weeksDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (weeksDiff % pattern.interval !== 0) return false;
        
        // Verificar si el día de la semana coincide
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          return pattern.daysOfWeek.includes(date.getDay());
        }
        return date.getDay() === startDate.getDay();
        
      case 'monthly':
        const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                          (date.getMonth() - startDate.getMonth());
        if (monthsDiff % pattern.interval !== 0) return false;
        
        // Usar dayOfMonth si está especificado, sino usar el día de startDate
        const targetDay = pattern.dayOfMonth || startDate.getDate();
        return date.getDate() === targetDay;
        
      case 'yearly':
        const yearsDiff = date.getFullYear() - startDate.getFullYear();
        if (yearsDiff % pattern.interval !== 0) return false;
        
        return date.getMonth() === startDate.getMonth() && 
               date.getDate() === startDate.getDate();
        
      default:
        return false;
    }
  }
  
  private static getNextDate(currentDate: Date, pattern: RecurringPattern): Date {
    const nextDate = new Date(currentDate);
    
    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;
        
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (pattern.interval * 7));
        break;
        
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        break;
        
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
        
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }
  
  // Crear un evento recurrente
  static async createRecurringEvent(recurringTask: Omit<RecurringTask, 'id' | 'created_at'>): Promise<RecurringTask> {
    const newTask: RecurringTask = {
      ...recurringTask,
      id: `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date()
    };
    
    // En una implementación real, aquí se guardaría en la base de datos
    // Por ahora, simularemos guardándolo en localStorage
    const existingTasks = this.getRecurringTasks();
    existingTasks.push(newTask);
    localStorage.setItem('recurring_tasks', JSON.stringify(existingTasks));
    
    return newTask;
  }
  
  // Obtener eventos recurrentes del usuario
  static getRecurringTasks(): RecurringTask[] {
    try {
      const stored = localStorage.getItem('recurring_tasks');
      if (!stored) return [];
      
      return JSON.parse(stored).map((task: any) => ({
        ...task,
        startDate: new Date(task.startDate),
        created_at: new Date(task.created_at),
        pattern: {
          ...task.pattern,
          endDate: task.pattern.endDate ? new Date(task.pattern.endDate) : undefined
        }
      }));
    } catch {
      return [];
    }
  }
  
  // Actualizar evento recurrente
  static async updateRecurringEvent(id: string, updates: Partial<RecurringTask>): Promise<boolean> {
    try {
      const tasks = this.getRecurringTasks();
      const index = tasks.findIndex(task => task.id === id);
      
      if (index === -1) return false;
      
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem('recurring_tasks', JSON.stringify(tasks));
      
      return true;
    } catch {
      return false;
    }
  }
  
  // Eliminar evento recurrente
  static async deleteRecurringEvent(id: string): Promise<boolean> {
    try {
      const tasks = this.getRecurringTasks();
      const filtered = tasks.filter(task => task.id !== id);
      localStorage.setItem('recurring_tasks', JSON.stringify(filtered));
      
      return true;
    } catch {
      return false;
    }
  }
  
  // Pausar/reactivar evento recurrente
  static async toggleRecurringEvent(id: string): Promise<boolean> {
    try {
      const tasks = this.getRecurringTasks();
      const index = tasks.findIndex(task => task.id === id);
      
      if (index === -1) return false;
      
      tasks[index].is_active = !tasks[index].is_active;
      localStorage.setItem('recurring_tasks', JSON.stringify(tasks));
      
      return true;
    } catch {
      return false;
    }
  }
  
  // Obtener todas las instancias de eventos recurrentes para un rango de fechas
  static getRecurringInstances(startDate: Date, endDate: Date): Array<any> {
    const recurringTasks = this.getRecurringTasks().filter(task => task.is_active);
    const allInstances = [];
    
    for (const task of recurringTasks) {
      const instances = this.generateInstances(task, startDate, endDate);
      allInstances.push(...instances);
    }
    
    return allInstances.sort((a, b) => a.due_date.getTime() - b.due_date.getTime());
  }
  
  // Validar patrón de recurrencia
  static validatePattern(pattern: RecurringPattern): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (pattern.interval < 1) {
      errors.push('El intervalo debe ser mayor a 0');
    }
    
    if (pattern.type === 'weekly' && pattern.daysOfWeek) {
      if (pattern.daysOfWeek.length === 0) {
        errors.push('Debe seleccionar al menos un día de la semana');
      }
      
      if (pattern.daysOfWeek.some(day => day < 0 || day > 6)) {
        errors.push('Los días de la semana deben estar entre 0 y 6');
      }
    }
    
    if (pattern.type === 'monthly' && pattern.dayOfMonth) {
      if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
        errors.push('El día del mes debe estar entre 1 y 31');
      }
    }
    
    if (pattern.endDate && pattern.occurrences) {
      errors.push('No puede especificar tanto fecha de fin como número de ocurrencias');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Obtener descripción legible del patrón
  static getPatternDescription(pattern: RecurringPattern): string {
    const { type, interval } = pattern;
    
    switch (type) {
      case 'daily':
        return interval === 1 ? 'Todos los días' : `Cada ${interval} días`;
        
      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          const selectedDays = pattern.daysOfWeek.map(day => dayNames[day]).join(', ');
          return interval === 1 
            ? `Todas las semanas los ${selectedDays}`
            : `Cada ${interval} semanas los ${selectedDays}`;
        }
        return interval === 1 ? 'Todas las semanas' : `Cada ${interval} semanas`;
        
      case 'monthly':
        const dayText = pattern.dayOfMonth ? `día ${pattern.dayOfMonth}` : 'mismo día';
        return interval === 1 
          ? `Todos los meses el ${dayText}`
          : `Cada ${interval} meses el ${dayText}`;
          
      case 'yearly':
        return interval === 1 ? 'Todos los años' : `Cada ${interval} años`;
        
      default:
        return 'Patrón personalizado';
    }
  }
}

// Tipos auxiliares para el componente de creación
export interface RecurringEventFormData {
  title: string;
  description?: string;
  startDate: Date;
  start_time: string;
  end_time: string;
  pattern: RecurringPattern;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  location?: string;
  reminders?: number[];
}
