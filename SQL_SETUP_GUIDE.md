# 🗄️ Configuración de Base de Datos - TaskFlow

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos de TaskFlow en Supabase.

## 📋 **Orden de Ejecución**

**IMPORTANTE**: Ejecuta los scripts en este orden exacto para evitar errores de dependencias.

### 1. 🏗️ **Configuración Básica** 
```sql
-- Archivo: supabase-setup.sql
-- Descripción: Tablas principales (tasks, profiles) y configuración inicial
-- Tiempo estimado: 30 segundos
```

### 2. ✨ **Funcionalidades Avanzadas**
```sql
-- Archivo: supabase-update-features.sql  
-- Descripción: Categorías, etiquetas, fechas, prioridades
-- Tiempo estimado: 20 segundos
```

### 3. 🏷️ **Datos Iniciales**
```sql
-- Archivo: supabase-create-default-categories.sql
-- Descripción: Categorías predefinidas para nuevos usuarios
-- Tiempo estimado: 10 segundos
```

### 4. 🤝 **Sistema de Colaboración**
```sql
-- Archivo: supabase-collaboration.sql
-- Descripción: Tablas para compartir tareas e invitaciones
-- Tiempo estimado: 25 segundos
```

### 5. 🔌 **API REST y Webhooks**
```sql
-- Archivo: supabase-api-setup.sql
-- Descripción: API keys, webhooks, rate limiting
-- Tiempo estimado: 30 segundos
```

### 6. 🔗 **Integraciones e IA**
```sql
-- Archivo: supabase-integrations-setup.sql
-- Descripción: Integraciones externas, IA, analytics
-- Tiempo estimado: 40 segundos
```

## 🚀 **Ejecución Rápida**

### Método 1: Manual (Recomendado para desarrollo)
1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega cada script **en orden**
4. Ejecuta uno por uno verificando que no haya errores

### Método 2: Por lotes (Para expertos)
```sql
-- Puedes ejecutar todos juntos, pero recomendamos el método manual
-- para verificar cada paso
```

## ✅ **Verificación de Instalación**

Después de ejecutar todos los scripts, verifica que tienes estas tablas:

### 📊 **Tablas Principales (6)**
- ✅ `tasks` - Tareas de usuarios
- ✅ `profiles` - Perfiles extendidos
- ✅ `categories` - Categorías personalizadas
- ✅ `task_collaborators` - Colaboradores en tareas
- ✅ `collaboration_invitations` - Invitaciones pendientes
- ✅ `task_activity` - Historial de actividades

### 🔌 **Tablas de API (3)**
- ✅ `api_keys` - Claves de API
- ✅ `webhooks` - Configuración de webhooks
- ✅ `api_rate_limits` - Control de rate limiting

### 🔗 **Tablas de Integraciones (7)**
- ✅ `integrations` - Configuración de servicios externos
- ✅ `notification_configs` - Preferencias de notificaciones
- ✅ `productivity_insights` - Insights de IA
- ✅ `automation_rules` - Reglas de automatización
- ✅ `ai_suggestions_history` - Historial de sugerencias
- ✅ `productivity_metrics` - Métricas de rendimiento
- ✅ `calendar_events` - Eventos de calendario

## 🔒 **Seguridad Implementada**

Todos los scripts incluyen:
- ✅ **Row Level Security (RLS)** habilitado
- ✅ **Políticas granulares** para cada operación
- ✅ **Validación de permisos** a nivel de base de datos
- ✅ **Índices optimizados** para performance

## 🐛 **Solución de Problemas**

### Error: "relation does not exist"
- **Causa**: Ejecutaste los scripts fuera de orden
- **Solución**: Ejecuta en el orden correcto listado arriba

### Error: "permission denied"
- **Causa**: Usuario sin permisos de administrador
- **Solución**: Usa el SQL Editor de Supabase Dashboard

### Error: "function/trigger already exists"
- **Causa**: Script ejecutado múltiples veces
- **Solución**: Ignora este error o resetea la base de datos

## 📞 **Soporte**

Si encuentras problemas:
1. 📋 Verifica que tienes un proyecto activo en Supabase
2. 🔍 Revisa los logs en Supabase Dashboard
3. 📧 Abre un issue en GitHub con el error específico

---

## 📈 **Estadísticas de la Base de Datos**

- **🗄️ Total de tablas**: 16
- **🔗 Total de relaciones**: 25+
- **🔒 Políticas RLS**: 50+
- **📊 Índices optimizados**: 30+
- **⚡ Triggers**: 10+
- **🔧 Funciones**: 5+

**¡La base de datos de TaskFlow está lista para escalar! 🚀**
