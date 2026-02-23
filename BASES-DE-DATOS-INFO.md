# 📊 TaskFlow - Información de Bases de Datos

## 🗄️ Ubicación de la Base de Datos

### Base de Datos Activa (PRODUCCIÓN)
**Proveedor:** PostgreSQL en Render  
**Host:** `dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com`  
**Database:** `tienda_db_0rhl`  
**Usuario:** `tienda_db_0rhl_user`  
**URL Completa:**
```
postgresql://tienda_db_0rhl_user:MgdRVS5Kn30WuQM64u7ZHBANrleLh0eb@dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com/tienda_db_0rhl
```

**Ubicación en proyecto:**  
📁 `taskflow-backend/.env` - Contiene DATABASE_URL

---

## 📋 Archivos de Schema en el Proyecto

### 1. **database-taskflow.sql** ⭐ (RECOMENDADO)
📁 Ubicación: `taskflow-backend/database-taskflow.sql`  
- Schema unificado para Render PostgreSQL
- 12 tablas principales
- Índices optimizados
- Funciones y triggers
- ✅ **USAR ESTE - ES EL MÁS ACTUALIZADO**

### 2. **taskflow-complete-database.sql** ⭐⭐ (COMPLETO)
📁 Ubicación: `taskflow-complete-database.sql` (raíz del proyecto)  
- Schema completo con TODAS las tablas
- 21 tablas incluyendo:
  - Core: profiles, tasks, categories, goals
  - Colaboración: task_collaborators, collaboration_invitations
  - Integraciones: integrations, calendar_events, integration_sync_history
  - Productividad: productivity_metrics, productivity_insights
  - API: api_keys, api_rate_limits
  - Automatización: automation_rules, etc.
- Índices completos
- Funciones y triggers
- ✅ **ESTE ES EL MÁS COMPLETO - USAR PARA BACKUP**

### 3. **src/database/schema.sql**
📁 Ubicación: `taskflow-backend/src/database/schema.sql`  
- Schema básico local
- Más antiguo
- ⚠️ Usar solo como referencia

### 4. **basededatos.json**
📁 Ubicación: `taskflow-app-main/basededatos.json`  
- Exportación JSON de todas las tablas
- Útil para ver estructura sin PostgreSQL
- Formato: Array de objetos con CREATE TABLE SQL

---

## 📊 Tablas en la Base de Datos Completa

### Core (5 tablas)
- `profiles` - Usuarios del sistema
- `tasks` - Tareas principales
- `categories` - Categorías de tareas
- `goals` - Objetivos/metas
- `task_activity` - Auditoría de cambios

### Colaboración (2 tablas)
- `task_collaborators` - Usuarios colaboradores en tareas
- `collaboration_invitations` - Invitaciones pendientes

### Notificaciones (2 tablas)
- `notifications` - Notificaciones de usuarios
- `notification_configs` - Config de notificaciones
- `email_preferences` - Preferencias de email

### Integraciones (3 tablas)
- `integrations` - Conexiones a otros servicios
- `calendar_events` - Eventos de calendario sincronizados
- `integration_sync_history` - Historial de sincronizaciones

### Productividad (2 tablas)
- `productivity_metrics` - Métricas diarias de productividad
- `productivity_insights` - Insights y análisis

### IA (1 tabla)
- `ai_suggestions_history` - Historial de sugerencias de IA

### API & Automatización (3 tablas)
- `api_keys` - Claves de API para integraciones
- `api_rate_limits` - Límites de tasa por API key
- `automation_rules` - Reglas de automatización

---

## 🔧 Cómo Exportar la Base de Datos de Render

### Opción 1: Usar pg_dump (Recomendado)
```bash
pg_dump "postgresql://tienda_db_0rhl_user:MgdRVS5Kn30WuQM64u7ZHBANrleLh0eb@dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com/tienda_db_0rhl" \
  --no-password \
  --verbose \
  > taskflow-backup-$(date +%Y%m%d).sql
```

### Opción 2: Usar DBeaver (GUI)
1. Instalar DBeaver Community
2. Crear conexión:
   - Connection Type: PostgreSQL
   - Host: dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com
   - Port: 5432
   - Database: tienda_db_0rhl
   - User: tienda_db_0rhl_user
   - Password: MgdRVS5Kn30WuQM64u7ZHBANrleLh0eb
3. Tools → Export Database
4. Seleccionar formato SQL

### Opción 3: Usar Render Dashboard
1. Ir a Render.com → Tu proyecto
2. Database → Backups
3. Descargar backup

---

## 💾 Cómo Restaurar/Aplicar el Schema

### En Render (usando SQL Editor)
1. Ir a Render Dashboard → Database → SQL Editor
2. Copiar contenido de `taskflow-complete-database.sql`
3. Pegar y ejecutar

### Localmente con PostgreSQL
```bash
# Crear base de datos local
createdb taskflow

# Restaurar schema
psql -U postgres -d taskflow < taskflow-complete-database.sql

# O aplicar gradualmente
psql -U postgres -d taskflow < database-taskflow.sql
psql -U postgres -d taskflow < taskflow-complete-database.sql
```

---

## 🔑 Variables de Entorno

### Backend (.env)
```dotenv
DATABASE_URL=postgresql://tienda_db_0rhl_user:MgdRVS5Kn30WuQM64u7ZHBANrleLh0eb@dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com/tienda_db_0rhl
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

### Frontend (Supabase - si lo usas)
Configurar en `.env.production` y código de auth

---

## 📈 Estadísticas de la Base de Datos

**Total de Tablas:** 21  
**Total de Índices:** 15+  
**Total de Functions:** 1 (update_updated_at_column)  
**Total de Triggers:** 2 (tasks, goals)

---

## ⚠️ Importantes

1. **Base de Datos Actual:** Está en Render PostgreSQL (es de PRODUCCIÓN)
2. **Schema Completo:** Está en `taskflow-complete-database.sql`
3. **Contraseña:** ⚠️ CAMBIAR EN PRODUCCIÓN - Actualmente expuesta en .env
4. **Backups:** Hacer backup regular desde Render Dashboard
5. **Migración:** Si necesitas cambiar proveedor, usar `pg_dump` + `psql`

---

## 🚀 Siguientes Pasos

- [ ] Cambiar contraseña de BD en Render
- [ ] Hacer backup automático semanal
- [ ] Revisar Row Level Security (RLS) para seguridad
- [ ] Documentar políticas de acceso

