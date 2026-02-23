# Ì∫Ä MIGRATION: Render ‚Üí Railway

## Ì≥ã Informaci√≥n de Conexi√≥n

### Old (Render - Deprecado)
```
Host: dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com
Database: tienda_db_0rhl
User: tienda_db_0rhl_user
Password: MgdRVS5Kn30WuQM64u7ZHBANrleLh0eb
```

### New (Railway - ACTIVO)
```
DATABASE_URL: postgresql://postgres:gocGeoscwCKhaKEVlMtBYWmkAQwBDtyh@centerbeam.proxy.rlwy.net:16642/railway
Host: centerbeam.proxy.rlwy.net
Port: 16642
Database: railway
User: postgres
Password: gocGeoscwCKhaKEVlMtBYWmkAQwBDtyh
```

## ‚úÖ Cambios Realizados

### 1. Backend .env Actualizado
- ‚úÖ `taskflow-backend/.env` - Actualizado con nueva DATABASE_URL de Railway
- Usuario anterior: `tienda_db_0rhl_user`
- Usuario nuevo: `postgres`
- Host anterior: `dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com`
- Host nuevo: `centerbeam.proxy.rlwy.net:16642`

### 2. Base de Datos
- Schema SQL completo disponible en: `taskflow-complete-database.sql`
- Script de setup disponible en: `database-taskflow.sql`

## Ì¥Ñ Pasos para Migrar

### Opci√≥n 1: Exportar de Render ‚Üí Importar en Railway (Recomendado)

#### Paso 1: Exportar datos de Render
```bash
PGPASSWORD="MgdRVS5Kn30WuQM64u7ZHBANrleLh0eb" pg_dump \
  -h dpg-d6d3kpsr85hc73bkaoa0-a.oregon-postgres.render.com \
  -U tienda_db_0rhl_user \
  -d tienda_db_0rhl \
  --no-password \
  > taskflow-render-backup.sql
```

#### Paso 2: Restaurar en Railway
```bash
PGPASSWORD="gocGeoscwCKhaKEVlMtBYWmkAQwBDtyh" psql \
  -h centerbeam.proxy.rlwy.net \
  -p 16642 \
  -U postgres \
  -d railway \
  -f taskflow-render-backup.sql
```

### Opci√≥n 2: usar el archivo SQL completo en Railway

#### Paso 1: Conectar a Railway
```bash
PGPASSWORD="gocGeoscwCKhaKEVlMtBYWmkAQwBDtyh" psql \
  -h centerbeam.proxy.rlwy.net \
  -p 16642 \
  -U postgres \
  -d railway
```

#### Paso 2: Ejecutar schema
```sql
-- En la consola de Railway:
\i taskflow-complete-database.sql
```

## Ì≥¶ Archivos Necesarios para Railway

1. **taskflow-complete-database.sql** - Schema completo con todas las tablas (21 tablas)
2. **database-taskflow.sql** - Schema alternativo (12 tablas core)
3. **taskflow-render-backup.sql** - Backup completo de Render (si ejecutas exportaci√≥n)

## Ì¥ó Apps Conectadas

### Backend (NestJS)
- Archivo: `taskflow-backend/.env`
- Variable: `DATABASE_URL`
- Estado: ‚úÖ Actualizado con Railway URL

### Frontend (Vite/React)
- Verificar si usa Supabase o la BD directa
- Actualizar URLs de API si es necesario

## ‚ö†Ô∏è Pr√≥ximos Pasos

1. [ ] Exportar datos completos de Render (si necesitas migrar datos existentes)
2. [ ] Crear las tablas en Railway usando `taskflow-complete-database.sql`
3. [ ] Restaurar datos desde backup de Render (si aplica)
4. [ ] Probar conexi√≥n desde backend NestJS
5. [ ] Actualizar variables de entorno en servidor (si est√° hosteado)
6. [ ] Desactivar Render (una vez confirmado en Railway)

## Ì∑™ Test de Conexi√≥n

### Desde terminal
```bash
PGPASSWORD="gocGeoscwCKhaKEVlMtBYWmkAQwBDtyh" psql \
  -h centerbeam.proxy.rlwy.net \
  -p 16642 \
  -U postgres \
  -d railway \
  -c "SELECT version();"
```

### Desde NestJS (despu√©s de restart)
El backend se conectar√° autom√°ticamente usando la DATABASE_URL en `.env`

## Ì≥ä Estado de Tablas

Despu√©s de ejecutar `taskflow-complete-database.sql`, tendr√°s:

```
‚úÖ Tablas CORE:
   - profiles
   - tasks
   - categories
   - goals
   - task_activity

‚úÖ Tablas COLABORACI√ìN:
   - task_collaborators
   - collaboration_invitations

‚úÖ Tablas NOTIFICACIONES:
   - notifications
   - notification_configs
   - email_preferences

‚úÖ Tablas INTEGRACIONES:
   - integrations
   - calendar_events
   - integration_sync_history

‚úÖ Tablas PRODUCTIVIDAD:
   - productivity_metrics
   - productivity_insights

‚úÖ Tablas IA:
   - ai_suggestions_history

‚úÖ Tablas API:
   - api_keys
   - api_rate_limits
   - automation_rules
```

Total: **21 Tablas + 15+ √çndices + Triggers y Functions**

## Ì¥ê Seguridad

‚ö†Ô∏è IMPORTANTE:
- No commitear credenciales en GitHub
- `.env` est√° en `.gitignore` (verificar)
- Cambiar contrase√±a de Railway en producci√≥n
- Usar variables de entorno en servidor

## Ì≥û Soporte Rails

- Dashboard: https://railway.app
- Docs: https://railway.app/docs
- Support: https://help.railway.app

