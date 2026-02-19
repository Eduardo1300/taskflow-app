// Ejemplo de uso de la API REST de TaskFlow
// Este archivo muestra cómo integrar con la API desde aplicaciones externas

class TaskFlowAPI {
  constructor(apiKey, baseUrl = 'https://taskflow.com/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Método helper para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== Métodos de Tareas ====================

  // Obtener todas las tareas
  async getTasks(options = {}) {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);
    if (options.category) params.append('category', options.category);
    if (options.priority) params.append('priority', options.priority);

    const endpoint = `/tasks${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(endpoint);
  }

  // Crear nueva tarea
  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  // Actualizar tarea
  async updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Eliminar tarea
  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  // Marcar tarea como completada
  async completeTask(taskId) {
    return this.updateTask(taskId, { completed: true });
  }

  // ==================== Ejemplos de Uso ====================

  // Ejemplo: Sincronizar tareas con un sistema externo
  async syncWithExternalSystem() {
    try {
      // Obtener todas las tareas pendientes
      const pendingTasks = await this.getTasks({ status: 'pending' });
      
      console.log(`Encontradas ${pendingTasks.data.length} tareas pendientes`);
      
      // Procesar cada tarea
      for (const task of pendingTasks.data) {
        // Aquí podrías enviar la tarea a tu sistema externo
        console.log(`Procesando tarea: ${task.title}`);
        
        // Ejemplo: Si la tarea es urgente, enviar notificación
        if (task.priority === 'high' && task.tags?.includes('urgente')) {
          await this.sendUrgentNotification(task);
        }
      }
      
      return pendingTasks;
    } catch (error) {
      console.error('Error en sincronización:', error);
      throw error;
    }
  }

  // Ejemplo: Crear tareas desde un formulario web
  async createTaskFromForm(formData) {
    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || 'medium',
      due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };

    try {
      const result = await this.createTask(taskData);
      console.log('Tarea creada exitosamente:', result.data);
      return result;
    } catch (error) {
      console.error('Error creando tarea:', error);
      throw error;
    }
  }

  // Ejemplo: Automatización - Completar tareas vencidas de baja prioridad
  async autoCompleteOverdueLowPriorityTasks() {
    try {
      const tasks = await this.getTasks({ status: 'pending', priority: 'low' });
      const now = new Date();
      let completedCount = 0;

      for (const task of tasks.data) {
        if (task.due_date && new Date(task.due_date) < now) {
          await this.completeTask(task.id);
          completedCount++;
          console.log(`Auto-completada tarea vencida: ${task.title}`);
        }
      }

      console.log(`Se auto-completaron ${completedCount} tareas vencidas de baja prioridad`);
      return completedCount;
    } catch (error) {
      console.error('Error en auto-completado:', error);
      throw error;
    }
  }

  // Ejemplo de notificación urgente
  async sendUrgentNotification(task) {
    // Aquí integrarías con tu sistema de notificaciones
    console.log(`🚨 TAREA URGENTE: ${task.title}`);
    
    // Ejemplo con webhook
    try {
      await fetch('https://hooks.slack.com/your-webhook-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Tarea urgente: ${task.title}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Descripción', value: task.description, short: false },
              { title: 'Vencimiento', value: task.due_date, short: true },
              { title: 'Prioridad', value: task.priority, short: true }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }
}

// ==================== Ejemplos de Integración ====================

// Ejemplo 1: Uso básico
async function ejemploBasico() {
  const api = new TaskFlowAPI('tf_tu_api_key_aqui');

  try {
    // Crear una tarea
    const nuevaTarea = await api.createTask({
      title: 'Revisar código de la API',
      description: 'Hacer code review del nuevo endpoint',
      priority: 'high',
      category: 'desarrollo',
      tags: ['review', 'api'],
      due_date: '2025-08-15T10:00:00Z'
    });

    console.log('Tarea creada:', nuevaTarea.data);

    // Obtener tareas
    const tareas = await api.getTasks({ status: 'pending', limit: 10 });
    console.log('Tareas pendientes:', tareas.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejemplo 2: Integración con webhook
function configurarWebhook() {
  // Configura un webhook en TaskFlow que apunte a tu servidor
  // Cuando ocurra un evento, recibirás un POST request como este:
  
  /*
  POST /webhook HTTP/1.1
  Content-Type: application/json
  X-TaskFlow-Event: task.created
  X-TaskFlow-Signature: signature_hash
  
  {
    "event": "task.created",
    "data": {
      "id": 123,
      "title": "Nueva tarea",
      "description": "...",
      "completed": false,
      ...
    },
    "timestamp": "2025-08-09T12:00:00Z"
  }
  */
}

// Ejemplo 3: Servidor Express.js que maneja webhooks
function ejemploServidorWebhook() {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  app.post('/webhook', (req, res) => {
    const event = req.headers['x-taskflow-event'];
    const signature = req.headers['x-taskflow-signature'];
    const { data } = req.body;
    
    // Verificar la firma del webhook (recomendado en producción)
    // ...
    
    switch (event) {
      case 'task.created':
        console.log('Nueva tarea creada:', data.title);
        // Procesar nueva tarea
        break;
        
      case 'task.completed':
        console.log('Tarea completada:', data.title);
        // Procesar tarea completada
        break;
        
      case 'task.deleted':
        console.log('Tarea eliminada:', data.title);
        // Procesar tarea eliminada
        break;
    }
    
    res.status(200).json({ received: true });
  });
  
  app.listen(3000, () => {
    console.log('Webhook server running on port 3000');
  });
}

// Ejemplo 4: Integración con React
function EjemploReactComponent() {
  /*
  import React, { useState, useEffect } from 'react';
  
  function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = new TaskFlowAPI('tf_tu_api_key_aqui');
    
    useEffect(() => {
      loadTasks();
    }, []);
    
    const loadTasks = async () => {
      try {
        const response = await api.getTasks();
        setTasks(response.data);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const createTask = async (title) => {
      try {
        await api.createTask({ title });
        loadTasks(); // Reload tasks
      } catch (error) {
        console.error('Error creating task:', error);
      }
    };
    
    if (loading) return <div>Loading...</div>;
    
    return (
      <div>
        <h2>My Tasks</h2>
        {tasks.map(task => (
          <div key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </div>
        ))}
      </div>
    );
  }
  */
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskFlowAPI;
}

// Ejemplo de uso en el navegador
if (typeof window !== 'undefined') {
  window.TaskFlowAPI = TaskFlowAPI;
}

console.log('TaskFlow API Client loaded. Usage example:');
console.log('const api = new TaskFlowAPI("your_api_key_here");');
console.log('api.getTasks().then(console.log);');
