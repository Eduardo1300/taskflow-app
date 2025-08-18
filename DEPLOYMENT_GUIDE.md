# 🚀 Guía de Despliegue - TaskFlow

## Pasos para Desplegar a Producción

### 1. 📋 Preparación del Proyecto

```bash
# Clonar el repositorio
git clone [tu-repositorio]
cd taskflow-app-main

# Instalar dependencias
npm install

# Verificar que no hay errores
npm run build
```

### 2. 🗄️ Configuración de Supabase

#### Crear Proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Guardar URL y ANON KEY del proyecto

#### Configurar Base de Datos
```sql
-- Ejecutar en Supabase SQL Editor
-- Paso 1: Ejecutar supabase-setup.sql (tablas básicas)
-- Paso 2: Ejecutar supabase-complete-setup.sql (funciones avanzadas)
```

#### Configurar Storage
```sql
-- Crear bucket para archivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true);

-- Política para subir archivos
CREATE POLICY "Users can upload task attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'task-attachments' 
  AND auth.role() = 'authenticated'
);

-- Política para ver archivos
CREATE POLICY "Users can view task attachments" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'task-attachments' 
  AND auth.role() = 'authenticated'
);

-- Política para eliminar archivos
CREATE POLICY "Users can delete their task attachments" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'task-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Configurar Autenticación
1. En Supabase Dashboard → Authentication → Settings
2. Habilitar Email confirmations
3. Configurar SMTP (opcional, usar built-in para pruebas)
4. Configurar Site URL y Redirect URLs

### 3. 🌐 Variables de Entorno

Crear archivo `.env.production`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_APP_ENV=production
```

### 4. 🏗️ Build de Producción

```bash
# Build optimizado
npm run build

# Previsualizar build (opcional)
npm run preview
```

### 5. 📦 Opciones de Despliegue

#### Opción A: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variables de entorno en Vercel Dashboard
```

#### Opción B: Netlify
```bash
# Instalar Netlify CLI  
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Configurar variables de entorno en Netlify Dashboard
```

#### Opción C: Firebase Hosting
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Inicializar
firebase init hosting

# Deploy
firebase deploy
```

#### Opción D: Railway
1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Deploy automático

### 6. 🔧 Configuraciones Adicionales

#### PWA Configuration
Verificar que `manifest.json` y service worker estén configurados:
```json
{
  "name": "TaskFlow",
  "short_name": "TaskFlow", 
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [...]
}
```

#### HTTPS y Dominio Personalizado
1. Configurar dominio personalizado
2. Habilitar HTTPS/SSL
3. Actualizar Site URL en Supabase

### 7. 🔒 Configuración de Seguridad

#### Supabase Security
```sql
-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Revisar políticas
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

#### Headers de Seguridad
Configurar en tu hosting provider:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 8. 📊 Monitoreo y Analytics

#### Configurar Error Tracking
```bash
# Instalar Sentry (opcional)
npm install @sentry/react @sentry/tracing
```

#### Performance Monitoring
- Google Analytics
- Sentry Performance
- Web Vitals

### 9. 🔄 CI/CD Pipeline

#### GitHub Actions (ejemplo)
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 10. ✅ Checklist Post-Despliegue

- [ ] ✅ La aplicación carga correctamente
- [ ] ✅ Registro de usuarios funciona
- [ ] ✅ Login/logout funciona  
- [ ] ✅ Creación de tareas funciona
- [ ] ✅ Calendario y Kanban funcionan
- [ ] ✅ Comentarios en tiempo real
- [ ] ✅ Subida de archivos funciona
- [ ] ✅ Notificaciones funcionan
- [ ] ✅ Analytics cargan correctamente
- [ ] ✅ PWA se puede instalar
- [ ] ✅ Funcionalidad offline
- [ ] ✅ Exportar PDF/CSV funciona
- [ ] ✅ Responsive en móvil
- [ ] ✅ Tema oscuro/claro funciona

### 11. 🐛 Troubleshooting

#### Error: "Failed to fetch"
```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verificar CORS en Supabase
# Dashboard → Settings → API → CORS origins
```

#### Error: "Row Level Security"
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'tasks';
```

#### Error: "Storage bucket not found"
```sql
-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true);
```

### 12. 📈 Optimización de Performance

#### Bundle Analysis
```bash
npm run build -- --analyze
```

#### Code Splitting
- Lazy loading de componentes
- Dynamic imports para rutas
- Tree shaking automático

#### CDN y Cache
- Configurar cache headers
- Usar CDN para assets estáticos
- Comprimir imágenes

### 13. 🔄 Mantenimiento

#### Backups Automáticos
- Configurar backups de Supabase
- Backup de storage objects
- Exportar configuraciones

#### Monitoring
- Uptime monitoring
- Error rates
- Performance metrics
- User analytics

#### Updates
```bash
# Actualizar dependencias
npm update

# Audit de seguridad  
npm audit

# Build y test
npm run build
npm run test
```

---

## 📞 Soporte

Para problemas específicos:
1. Revisar logs de la aplicación
2. Verificar logs de Supabase
3. Comprobar configuración de variables
4. Verificar políticas RLS

**TaskFlow está listo para producción** ✅🚀
