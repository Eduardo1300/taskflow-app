import { Task } from '../types';

export interface AISuggestion {
  id: string;
  type: 'category' | 'due_date' | 'priority' | 'productivity_tip';
  title: string;
  description: string;
  confidence: number; // 0-1
  action?: {
    type: 'apply_category' | 'set_due_date' | 'change_priority';
    value: any;
  };
}

export interface ProductivityInsight {
  id: string;
  title: string;
  description: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  score: number; // 0-100
  data: Record<string, any>;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  trigger: {
    type: 'task_created' | 'task_overdue' | 'pattern_detected';
    conditions: Record<string, any>;
  };
  actions: {
    type: 'auto_categorize' | 'set_priority' | 'predict_due_date' | 'send_notification';
    config: Record<string, any>;
  }[];
  is_active: boolean;
  created_at: string;
}

class AIService {
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  // ==================== Categoría Inteligente ====================

  async suggestCategory(title: string, description?: string): Promise<AISuggestion[]> {
    try {
      // Primero intentar con patrones locales basados en keywords
      const localSuggestions = this.analyzeLocalPatterns(title, description);
      
      // Si tenemos API de OpenAI configurada, usarla
      if (import.meta.env.VITE_OPENAI_API_KEY) {
        const aiSuggestions = await this.getAICategorySuggestions(title, description);
        return [...aiSuggestions, ...localSuggestions].slice(0, 3);
      }

      return localSuggestions;
    } catch (error) {
      console.error('Error in category suggestion:', error);
      return this.analyzeLocalPatterns(title, description);
    }
  }

  private analyzeLocalPatterns(title: string, description?: string): AISuggestion[] {
    const text = `${title} ${description || ''}`.toLowerCase();
    const suggestions: AISuggestion[] = [];

    const categoryPatterns = {
      trabajo: {
        keywords: ['trabajo', 'reunión', 'proyecto', 'jefe', 'oficina', 'empresa', 'cliente', 'presentación', 'informe', 'tarea laboral'],
        confidence: 0.8
      },
      personal: {
        keywords: ['personal', 'casa', 'familia', 'compras', 'médico', 'dentista', 'ejercicio', 'hobbie'],
        confidence: 0.7
      },
      estudio: {
        keywords: ['estudiar', 'examen', 'tarea', 'universidad', 'colegio', 'libro', 'investigación', 'curso'],
        confidence: 0.8
      },
      salud: {
        keywords: ['médico', 'hospital', 'medicina', 'ejercicio', 'gym', 'deporte', 'salud', 'cita médica'],
        confidence: 0.9
      },
      finanzas: {
        keywords: ['banco', 'dinero', 'pago', 'factura', 'presupuesto', 'inversión', 'ahorro', 'compra'],
        confidence: 0.8
      },
      casa: {
        keywords: ['limpieza', 'reparación', 'jardín', 'cocina', 'hogar', 'mantenimiento'],
        confidence: 0.7
      },
      tecnología: {
        keywords: ['código', 'programar', 'app', 'software', 'bug', 'desarrollo', 'api', 'database'],
        confidence: 0.9
      }
    };

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      const matchCount = pattern.keywords.filter(keyword => text.includes(keyword)).length;
      if (matchCount > 0) {
        const confidence = Math.min(pattern.confidence * (matchCount / pattern.keywords.length) * 2, 1);
        
        suggestions.push({
          id: `category-${category}`,
          type: 'category',
          title: `Categoría sugerida: ${category}`,
          description: `Detecté ${matchCount} palabra(s) relacionada(s) con ${category}`,
          confidence,
          action: {
            type: 'apply_category',
            value: category
          }
        });
      }
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  }

  private async getAICategorySuggestions(title: string, description?: string): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Analiza la siguiente tarea y sugiere una categoría apropiada:
        
        Título: "${title}"
        ${description ? `Descripción: "${description}"` : ''}
        
        Categorías disponibles: trabajo, personal, estudio, salud, finanzas, casa, tecnología, compras, viajes, entretenimiento
        
        Responde SOLO con un JSON en este formato:
        {
          "category": "nombre_categoria",
          "confidence": 0.8,
          "reasoning": "breve explicación"
        }
      `;

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return [{
        id: `ai-category-${result.category}`,
        type: 'category',
        title: `IA sugiere: ${result.category}`,
        description: result.reasoning,
        confidence: result.confidence,
        action: {
          type: 'apply_category',
          value: result.category
        }
      }];
    } catch (error) {
      console.error('Error getting AI category suggestions:', error);
      return [];
    }
  }

  // ==================== Predicción de Fechas de Vencimiento ====================

  async predictDueDate(title: string, description?: string, category?: string): Promise<AISuggestion[]> {
    try {
      const localPredictions = this.analyzeDueDatePatterns(title, description, category);
      
      if (import.meta.env.VITE_OPENAI_API_KEY) {
        const aiPredictions = await this.getAIDueDatePredictions(title, description, category);
        return [...aiPredictions, ...localPredictions].slice(0, 2);
      }

      return localPredictions;
    } catch (error) {
      console.error('Error in due date prediction:', error);
      return this.analyzeDueDatePatterns(title, description, category);
    }
  }

  private analyzeDueDatePatterns(title: string, description?: string, category?: string): AISuggestion[] {
    const text = `${title} ${description || ''}`.toLowerCase();
    const suggestions: AISuggestion[] = [];
    const now = new Date();

    // Patrones de urgencia
    const urgencyPatterns = {
      urgente: { days: 1, confidence: 0.9 },
      'hoy': { days: 0, confidence: 0.95 },
      'mañana': { days: 1, confidence: 0.9 },
      'esta semana': { days: 3, confidence: 0.8 },
      'próxima semana': { days: 7, confidence: 0.7 },
      'fin de mes': { days: 30 - now.getDate(), confidence: 0.8 },
      'trimestre': { days: 90, confidence: 0.6 }
    };

    // Patrones por tipo de tarea
    const taskTypePatterns = {
      'cita médica': { days: 7, confidence: 0.8 },
      'reunión': { days: 2, confidence: 0.7 },
      'presentación': { days: 5, confidence: 0.8 },
      'examen': { days: 14, confidence: 0.9 },
      'pago': { days: 3, confidence: 0.8 },
      'compras': { days: 2, confidence: 0.6 }
    };

    // Patrones por categoría
    const categoryPatterns = {
      trabajo: { days: 3, confidence: 0.7 },
      salud: { days: 7, confidence: 0.8 },
      estudio: { days: 7, confidence: 0.7 },
      finanzas: { days: 2, confidence: 0.8 },
      personal: { days: 5, confidence: 0.6 }
    };

    // Buscar patrones de urgencia
    for (const [pattern, config] of Object.entries(urgencyPatterns)) {
      if (text.includes(pattern)) {
        const dueDate = new Date(now.getTime() + config.days * 24 * 60 * 60 * 1000);
        suggestions.push({
          id: `due-urgency-${pattern}`,
          type: 'due_date',
          title: `Fecha sugerida: ${dueDate.toLocaleDateString('es-ES')}`,
          description: `Detecté "${pattern}" en la tarea`,
          confidence: config.confidence,
          action: {
            type: 'set_due_date',
            value: dueDate.toISOString()
          }
        });
      }
    }

    // Buscar patrones por tipo de tarea
    for (const [taskType, config] of Object.entries(taskTypePatterns)) {
      if (text.includes(taskType)) {
        const dueDate = new Date(now.getTime() + config.days * 24 * 60 * 60 * 1000);
        suggestions.push({
          id: `due-type-${taskType}`,
          type: 'due_date',
          title: `Fecha sugerida: ${dueDate.toLocaleDateString('es-ES')}`,
          description: `Basado en el tipo de tarea: ${taskType}`,
          confidence: config.confidence,
          action: {
            type: 'set_due_date',
            value: dueDate.toISOString()
          }
        });
      }
    }

    // Usar patrón de categoría si no hay otros patrones
    if (suggestions.length === 0 && category && categoryPatterns[category as keyof typeof categoryPatterns]) {
      const config = categoryPatterns[category as keyof typeof categoryPatterns];
      const dueDate = new Date(now.getTime() + config.days * 24 * 60 * 60 * 1000);
      suggestions.push({
        id: `due-category-${category}`,
        type: 'due_date',
        title: `Fecha sugerida: ${dueDate.toLocaleDateString('es-ES')}`,
        description: `Basado en la categoría: ${category}`,
        confidence: config.confidence,
        action: {
          type: 'set_due_date',
          value: dueDate.toISOString()
        }
      });
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  }

  private async getAIDueDatePredictions(title: string, description?: string, category?: string): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Analiza esta tarea y predice una fecha de vencimiento apropiada:
        
        Título: "${title}"
        ${description ? `Descripción: "${description}"` : ''}
        ${category ? `Categoría: "${category}"` : ''}
        
        Fecha actual: ${new Date().toLocaleDateString('es-ES')}
        
        Considera:
        - Urgencia implícita en el texto
        - Tipo de tarea
        - Tiempo típico necesario
        
        Responde SOLO con JSON:
        {
          "days_from_now": 3,
          "confidence": 0.8,
          "reasoning": "explicación breve"
        }
      `;

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + result.days_from_now);

      return [{
        id: `ai-due-date`,
        type: 'due_date',
        title: `IA sugiere: ${dueDate.toLocaleDateString('es-ES')}`,
        description: result.reasoning,
        confidence: result.confidence,
        action: {
          type: 'set_due_date',
          value: dueDate.toISOString()
        }
      }];
    } catch (error) {
      console.error('Error getting AI due date predictions:', error);
      return [];
    }
  }

  // ==================== Análisis de Productividad con IA ====================

  async analyzeProductivity(tasks: Task[]): Promise<ProductivityInsight[]> {
    try {
      const insights: ProductivityInsight[] = [];

      // Análisis de patrones locales
      insights.push(...this.analyzeCompletionPatterns(tasks));
      insights.push(...this.analyzeTimePatterns(tasks));
      insights.push(...this.analyzeCategoryPatterns(tasks));
      insights.push(...this.analyzePriorityPatterns(tasks));

      // Si hay IA disponible, obtener insights adicionales
      if (import.meta.env.VITE_OPENAI_API_KEY && tasks.length > 10) {
        const aiInsights = await this.getAIProductivityInsights(tasks);
        insights.push(...aiInsights);
      }

      return insights
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    } catch (error) {
      console.error('Error analyzing productivity:', error);
      return [];
    }
  }

  private analyzeCompletionPatterns(tasks: Task[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);
    const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

    // Tasa de completitud
    if (completionRate >= 80) {
      insights.push({
        id: 'completion-excellent',
        title: '🎉 Excelente productividad',
        description: `Tienes una tasa de completitud del ${completionRate.toFixed(1)}%. ¡Sigue así!`,
        type: 'achievement',
        score: 90,
        data: { completion_rate: completionRate },
        created_at: new Date().toISOString()
      });
    } else if (completionRate < 50) {
      insights.push({
        id: 'completion-warning',
        title: '⚠️ Mejora tu tasa de completitud',
        description: `Solo completas el ${completionRate.toFixed(1)}% de tus tareas. Considera dividir tareas grandes en subtareas más pequeñas.`,
        type: 'warning',
        score: 70,
        data: { completion_rate: completionRate },
        created_at: new Date().toISOString()
      });
    }

    // Tareas pendientes acumuladas
    if (pending.length > 20) {
      insights.push({
        id: 'pending-overload',
        title: '📊 Muchas tareas pendientes',
        description: `Tienes ${pending.length} tareas pendientes. Considera priorizar y eliminar tareas obsoletas.`,
        type: 'warning',
        score: 75,
        data: { pending_count: pending.length },
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  private analyzeTimePatterns(tasks: Task[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const now = new Date();
    
    // Análisis de tareas vencidas
    const overdueTasks = tasks.filter(t => 
      !t.completed && 
      t.due_date && 
      new Date(t.due_date) < now
    );

    if (overdueTasks.length > 0) {
      insights.push({
        id: 'overdue-tasks',
        title: '🚨 Tareas vencidas detectadas',
        description: `Tienes ${overdueTasks.length} tarea(s) vencida(s). Revisa y actualiza sus fechas o márcalas como completadas.`,
        type: 'warning',
        score: 85,
        data: { overdue_count: overdueTasks.length },
        created_at: new Date().toISOString()
      });
    }

    // Análisis de tareas próximas a vencer
    const upcomingTasks = tasks.filter(t => {
      if (!t.due_date || t.completed) return false;
      const dueDate = new Date(t.due_date);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return dueDate <= threeDaysFromNow && dueDate >= now;
    });

    if (upcomingTasks.length > 3) {
      insights.push({
        id: 'upcoming-busy',
        title: '⏰ Próximos días ocupados',
        description: `Tienes ${upcomingTasks.length} tareas que vencen en los próximos 3 días. Planifica tu tiempo con cuidado.`,
        type: 'recommendation',
        score: 70,
        data: { upcoming_count: upcomingTasks.length },
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  private analyzeCategoryPatterns(tasks: Task[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    
    // Análisis por categorías
    const categoryStats: Record<string, { total: number; completed: number }> = {};
    
    tasks.forEach(task => {
      const category = task.category || 'sin_categoria';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0 };
      }
      categoryStats[category].total++;
      if (task.completed) categoryStats[category].completed++;
    });

    // Encontrar categoría más productiva
    let bestCategory = '';
    let bestRate = 0;
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.total >= 3) { // Solo considerar categorías con al menos 3 tareas
        const rate = stats.completed / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestCategory = category;
        }
      }
    });

    if (bestCategory && bestRate > 0.8) {
      insights.push({
        id: 'category-champion',
        title: `🏆 Campeón en ${bestCategory}`,
        description: `Eres muy productivo en tareas de ${bestCategory} con ${(bestRate * 100).toFixed(1)}% de completitud.`,
        type: 'achievement',
        score: 80,
        data: { category: bestCategory, rate: bestRate },
        created_at: new Date().toISOString()
      });
    }

    return insights;
  }

  private analyzePriorityPatterns(tasks: Task[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    const completedHighPriority = highPriorityTasks.filter(t => t.completed);
    
    if (highPriorityTasks.length > 0) {
      const highPriorityRate = completedHighPriority.length / highPriorityTasks.length;
      
      if (highPriorityRate >= 0.8) {
        insights.push({
          id: 'priority-master',
          title: '🎯 Maestro de prioridades',
          description: `Completas el ${(highPriorityRate * 100).toFixed(1)}% de tus tareas de alta prioridad. ¡Excelente enfoque!`,
          type: 'achievement',
          score: 85,
          data: { high_priority_rate: highPriorityRate },
          created_at: new Date().toISOString()
        });
      } else if (highPriorityRate < 0.5) {
        insights.push({
          id: 'priority-warning',
          title: '🎯 Mejora el enfoque en prioridades',
          description: `Solo completas el ${(highPriorityRate * 100).toFixed(1)}% de tus tareas importantes. Considera revisar tu planificación.`,
          type: 'recommendation',
          score: 75,
          data: { high_priority_rate: highPriorityRate },
          created_at: new Date().toISOString()
        });
      }
    }

    return insights;
  }

  private async getAIProductivityInsights(tasks: Task[]): Promise<ProductivityInsight[]> {
    try {
      const taskSummary = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        by_priority: {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        categories: [...new Set(tasks.map(t => t.category).filter(Boolean))],
        avg_completion_days: this.calculateAvgCompletionDays(tasks)
      };

      const prompt = `
        Analiza estos datos de productividad del usuario:
        ${JSON.stringify(taskSummary, null, 2)}
        
        Genera 1-2 insights únicos y accionables que no sean obvios.
        Enfócate en patrones sutiles y recomendaciones específicas.
        
        Responde SOLO con JSON:
        [
          {
            "title": "título del insight",
            "description": "descripción detallada",
            "type": "pattern|recommendation|achievement",
            "score": 75
          }
        ]
      `;

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      const aiInsights = JSON.parse(data.choices[0].message.content);

      return aiInsights.map((insight: any, index: number) => ({
        id: `ai-insight-${index}`,
        title: `🤖 ${insight.title}`,
        description: insight.description,
        type: insight.type,
        score: insight.score,
        data: {},
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting AI productivity insights:', error);
      return [];
    }
  }

  private calculateAvgCompletionDays(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.completed && t.created_at);
    if (completedTasks.length === 0) return 0;

    // Como no tenemos updated_at, usamos la fecha actual para tareas completadas
    const now = new Date();
    const totalDays = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at);
      const days = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return sum + Math.max(days, 0); // Evitar días negativos
    }, 0);

    return totalDays / completedTasks.length;
  }

  // ==================== Sugerencias de Prioridad ====================

  async suggestPriority(title: string, description?: string, dueDate?: string): Promise<AISuggestion[]> {
    try {
      const localSuggestions = this.analyzePriorityPatterns_local(title, description, dueDate);
      
      if (import.meta.env.VITE_OPENAI_API_KEY) {
        const aiSuggestions = await this.getAIPrioritySuggestions(title, description, dueDate);
        return [...aiSuggestions, ...localSuggestions].slice(0, 2);
      }

      return localSuggestions;
    } catch (error) {
      console.error('Error in priority suggestion:', error);
      return this.analyzePriorityPatterns_local(title, description, dueDate);
    }
  }

  private analyzePriorityPatterns_local(title: string, description?: string, dueDate?: string): AISuggestion[] {
    const text = `${title} ${description || ''}`.toLowerCase();
    let suggestedPriority: 'low' | 'medium' | 'high' = 'medium';
    let confidence = 0.6;
    let reasoning = 'Prioridad media por defecto';

    // Palabras clave de alta prioridad
    const highPriorityKeywords = ['urgente', 'emergencia', 'crítico', 'importante', 'inmediato', 'hoy', 'asap'];
    const mediumPriorityKeywords = ['normal', 'regular', 'esta semana', 'pronto'];
    const lowPriorityKeywords = ['cuando pueda', 'algún día', 'opcional', 'idea'];

    // Analizar palabras clave
    const highMatches = highPriorityKeywords.filter(keyword => text.includes(keyword)).length;
    const mediumMatches = mediumPriorityKeywords.filter(keyword => text.includes(keyword)).length;
    const lowMatches = lowPriorityKeywords.filter(keyword => text.includes(keyword)).length;

    if (highMatches > 0) {
      suggestedPriority = 'high';
      confidence = 0.8 + (highMatches * 0.1);
      reasoning = `Detecté ${highMatches} palabra(s) de alta prioridad`;
    } else if (lowMatches > 0) {
      suggestedPriority = 'low';
      confidence = 0.7;
      reasoning = `Detecté ${lowMatches} palabra(s) de baja prioridad`;
    } else if (mediumMatches > 0) {
      confidence = 0.7;
      reasoning = `Detecté ${mediumMatches} palabra(s) de prioridad media`;
    }

    // Analizar fecha de vencimiento
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 1) {
        suggestedPriority = 'high';
        confidence = Math.max(confidence, 0.9);
        reasoning += '. Vence muy pronto';
      } else if (daysUntilDue <= 3) {
        suggestedPriority = suggestedPriority === 'low' ? 'medium' : 'high';
        confidence = Math.max(confidence, 0.8);
        reasoning += '. Vence pronto';
      } else if (daysUntilDue > 14) {
        if (suggestedPriority !== 'high') {
          suggestedPriority = 'low';
          confidence = Math.max(confidence, 0.7);
          reasoning += '. Tiene tiempo suficiente';
        }
      }
    }

    return [{
      id: `priority-${suggestedPriority}`,
      type: 'priority',
      title: `Prioridad sugerida: ${suggestedPriority.toUpperCase()}`,
      description: reasoning,
      confidence: Math.min(confidence, 1),
      action: {
        type: 'change_priority',
        value: suggestedPriority
      }
    }];
  }

  private async getAIPrioritySuggestions(title: string, description?: string, dueDate?: string): Promise<AISuggestion[]> {
    try {
      const prompt = `
        Analiza esta tarea y sugiere una prioridad:
        
        Título: "${title}"
        ${description ? `Descripción: "${description}"` : ''}
        ${dueDate ? `Fecha límite: ${dueDate}` : ''}
        
        Considera:
        - Urgencia implícita
        - Importancia del contenido
        - Tiempo disponible
        
        Responde SOLO con JSON:
        {
          "priority": "low|medium|high",
          "confidence": 0.8,
          "reasoning": "explicación breve"
        }
      `;

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return [{
        id: `ai-priority-${result.priority}`,
        type: 'priority',
        title: `IA sugiere prioridad: ${result.priority.toUpperCase()}`,
        description: result.reasoning,
        confidence: result.confidence,
        action: {
          type: 'change_priority',
          value: result.priority
        }
      }];
    } catch (error) {
      console.error('Error getting AI priority suggestions:', error);
      return [];
    }
  }

  // ==================== API Pública ====================

  async getAllSuggestions(title: string, description?: string, category?: string, dueDate?: string): Promise<AISuggestion[]> {
    try {
      const [categorySuggestions, dueDateSuggestions, prioritySuggestions] = await Promise.all([
        this.suggestCategory(title, description),
        this.predictDueDate(title, description, category),
        this.suggestPriority(title, description, dueDate)
      ]);

      return [
        ...categorySuggestions,
        ...dueDateSuggestions,
        ...prioritySuggestions
      ].sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error getting all suggestions:', error);
      return [];
    }
  }

  async applySuggestion(suggestion: AISuggestion): Promise<{ success: boolean; value: any }> {
    try {
      return {
        success: true,
        value: suggestion.action?.value
      };
    } catch (error) {
      return { success: false, value: null };
    }
  }

  // Método para generar tips de productividad
  generateProductivityTips(insights: ProductivityInsight[]): AISuggestion[] {
    const tips: AISuggestion[] = [];

    // Tips basados en los insights
    insights.forEach(insight => {
      if (insight.type === 'warning') {
        if (insight.id.includes('completion')) {
          tips.push({
            id: 'tip-completion',
            type: 'productivity_tip',
            title: '💡 Mejora tu productividad',
            description: 'Divide tareas grandes en subtareas más pequeñas y específicas. Esto aumenta la sensación de logro y mantiene el momentum.',
            confidence: 0.8
          });
        }
        
        if (insight.id.includes('overdue')) {
          tips.push({
            id: 'tip-planning',
            type: 'productivity_tip',
            title: '📅 Planifica mejor tu tiempo',
            description: 'Revisa tus tareas semanalmente y ajusta las fechas de vencimiento de forma realista. Considera usar la técnica Pomodoro.',
            confidence: 0.9
          });
        }
      }
    });

    // Tips generales
    if (tips.length < 2) {
      tips.push({
        id: 'tip-general',
        type: 'productivity_tip',
        title: '🚀 Consejo del día',
        description: 'Comienza cada día con 2-3 tareas importantes. Completar tareas temprano te dará energía para el resto del día.',
        confidence: 0.7
      });
    }

    return tips.slice(0, 3);
  }
}

export const aiService = new AIService();
