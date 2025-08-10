# 🌐 API REST - TaskFlow

Una API REST completa para integrar TaskFlow con aplicaciones externas.

## 🚀 Características

### ✅ Implementado
- **API Keys** - Autenticación segura con permisos granulares
- **Endpoints CRUD** - Operaciones completas de tareas
- **Webhooks** - Notificaciones en tiempo real
- **Rate Limiting** - Control de límites de uso
- **Documentación Swagger** - Documentación interactiva integrada
- **Ejemplos de Código** - Implementaciones en JavaScript/Node.js

### 🔧 Configuración de Base de Datos

Ejecuta el siguiente SQL en tu panel de Supabase:

```sql
-- Ejecutar el script supabase-api-setup.sql
-- Crea las tablas: api_keys, webhooks, api_rate_limits
-- Configura RLS y políticas de seguridad
```

## 📚 Uso de la API

### 1. Crear API Key

1. Ve a **Dashboard → API REST**
2. Haz clic en **"Nueva API Key"**
3. Configura permisos: `read`, `write`, `delete`
4. Establece límite de velocidad (requests/minuto)
5. **¡Importante!** Copia y guarda la API key inmediatamente

### 2. Realizar Requests

```javascript
// Headers requeridos
{
  'Content-Type': 'application/json',
  'X-API-Key': 'tf_tu_api_key_aqui'
}
```

### 3. Endpoints Disponibles

#### Obtener Tareas
```http
GET /api/v1/tasks?page=1&limit=20&status=pending
```

#### Crear Tarea
```http
POST /api/v1/tasks
{
  "title": "Nueva tarea",
  "description": "Descripción opcional",
  "priority": "high",
  "due_date": "2025-08-15T10:00:00Z",
  "category": "trabajo",
  "tags": ["importante", "api"]
}
```

#### Actualizar Tarea
```http
PUT /api/v1/tasks/123
{
  "title": "Tarea actualizada",
  "completed": true
}
```

#### Eliminar Tarea
```http
DELETE /api/v1/tasks/123
```

## 🔗 Webhooks

### Configurar Webhook

1. Ve a **Dashboard → API REST → Webhooks**
2. Agrega la URL de tu servidor
3. Selecciona eventos: `task.created`, `task.updated`, `task.completed`, `task.deleted`

### Ejemplo de Payload
```json
{
  "event": "task.created",
  "data": {
    "id": 123,
    "title": "Nueva tarea",
    "description": "...",
    "completed": false,
    "priority": "medium",
    "due_date": "2025-08-15T10:00:00Z",
    "created_at": "2025-08-09T12:00:00Z"
  },
  "timestamp": "2025-08-09T12:00:00Z"
}
```

### Headers del Webhook
```
Content-Type: application/json
X-TaskFlow-Event: task.created
X-TaskFlow-Signature: signature_hash
```

## 💻 Ejemplos de Código

### JavaScript/Node.js

```javascript
const TaskFlowAPI = require('./taskflow-api-client');

const api = new TaskFlowAPI('tf_tu_api_key_aqui');

// Obtener tareas
const tasks = await api.getTasks({ status: 'pending' });

// Crear tarea
const newTask = await api.createTask({
  title: 'Tarea desde API',
  priority: 'high'
});

// Marcar como completada
await api.completeTask(newTask.data.id);
```

### React Integration

```jsx
import { useState, useEffect } from 'react';

function ExternalTaskList() {
  const [tasks, setTasks] = useState([]);
  const api = new TaskFlowAPI('tf_tu_api_key_aqui');

  useEffect(() => {
    api.getTasks().then(response => {
      setTasks(response.data);
    });
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### Webhook Server (Express.js)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const event = req.headers['x-taskflow-event'];
  const { data } = req.body;
  
  switch (event) {
    case 'task.created':
      console.log('Nueva tarea:', data.title);
      // Procesar nueva tarea
      break;
      
    case 'task.completed':
      console.log('Tarea completada:', data.title);
      // Enviar notificación, actualizar estadísticas, etc.
      break;
  }
  
  res.json({ received: true });
});

app.listen(3000);
```

## 🔒 Seguridad

### Permisos Granulares
- **read**: Solo lectura de tareas
- **write**: Crear y actualizar tareas
- **delete**: Eliminar tareas

### Rate Limiting
- Configurable por API key
- Por defecto: 60 requests/minuto
- Headers de respuesta incluyen límites restantes

### Verificación de Webhooks
```javascript
// Verificar firma del webhook (recomendado en producción)
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = btoa(payload + secret);
  return signature === expectedSignature;
}
```

## 📊 Casos de Uso

### 1. Integración con Slack
```javascript
// Notificar tareas urgentes en Slack
async function notifyUrgentTasks() {
  const urgentTasks = await api.getTasks({ 
    priority: 'high', 
    status: 'pending' 
  });
  
  for (const task of urgentTasks.data) {
    if (task.tags?.includes('urgent')) {
      await sendSlackNotification(task);
    }
  }
}
```

### 2. Sincronización con CRM
```javascript
// Crear tareas desde leads del CRM
async function syncCRMLeads(leads) {
  for (const lead of leads) {
    await api.createTask({
      title: `Seguimiento: ${lead.name}`,
      description: `Lead desde CRM: ${lead.email}`,
      priority: 'medium',
      category: 'ventas',
      tags: ['crm', 'lead'],
      due_date: lead.followUpDate
    });
  }
}
```

### 3. Automatización con Zapier
```javascript
// Webhook que puede conectarse con Zapier
app.post('/zapier-webhook', async (req, res) => {
  const { trigger, data } = req.body;
  
  if (trigger === 'new_email') {
    await api.createTask({
      title: `Responder email: ${data.subject}`,
      description: `De: ${data.from}`,
      priority: 'medium',
      category: 'comunicacion'
    });
  }
  
  res.json({ success: true });
});
```

## 🚨 Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Recurso creado |
| 400 | Petición inválida |
| 401 | API key inválida |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 429 | Límite de velocidad excedido |
| 500 | Error del servidor |

## 📱 Ejemplo de Respuesta

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Revisar documentación",
      "description": "Actualizar guías de usuario",
      "completed": false,
      "priority": "medium",
      "due_date": "2025-08-15T10:00:00Z",
      "category": "documentacion",
      "tags": ["revision", "docs"],
      "created_at": "2025-08-09T12:00:00Z",
      "updated_at": "2025-08-09T12:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "rate_limit": {
      "remaining": 58,
      "reset_time": "2025-08-09T12:01:00Z"
    }
  }
}
```

## 🔧 Archivos Incluidos

- `src/services/apiService.ts` - Servicio principal de la API
- `src/components/Api/ApiManagementPage.tsx` - Interfaz de gestión
- `supabase-api-setup.sql` - Script de configuración de DB
- `public/taskflow-api-example.js` - Cliente JavaScript completo

## 🎯 Próximos Pasos

1. **Probar la API** - Crear API key y hacer requests de prueba
2. **Configurar Webhooks** - Integrar con tu aplicación externa
3. **Implementar Rate Limiting** - Monitorear uso y ajustar límites
4. **Documentación OpenAPI** - Usar la documentación interactiva integrada

¡La API REST está lista para integraciones! 🚀
