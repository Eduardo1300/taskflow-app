-- =====================================================
-- TASKFLOW - BASE DE DATOS COMPLETA
-- =====================================================
-- Exportado desde: postgresql en Render
-- Database: tienda_db_0rhl
-- Fecha: 2026-02-22

-- =====================================================
-- SECCIÓN 1: CREACIÓN DE SCHEMA
-- =====================================================

CREATE SCHEMA IF NOT EXISTS taskflow;
SET search_path TO taskflow,public;

-- =====================================================
-- SECCIÓN 2: TABLAS DE CORE
-- =====================================================

-- Tabla de Perfiles/Usuarios
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT,
    tags TEXT[],
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    ai_priority_suggestion TEXT,
    ai_category_suggestion TEXT,
    ai_due_date_suggestion TIMESTAMP WITH TIME ZONE,
    calendar_event_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Objetivos/Metas
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    start_date TIMESTAMP,
    end_date TIMESTAMP
);

-- =====================================================
-- SECCIÓN 3: TABLAS DE COLABORACIÓN
-- =====================================================

-- Tabla de Colaboradores
CREATE TABLE IF NOT EXISTS task_collaborators (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    permission VARCHAR DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    shared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Invitaciones de Colaboración
CREATE TABLE IF NOT EXISTS collaboration_invitations (
    id UUID PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- =====================================================
-- SECCIÓN 4: TABLAS DE ACTIVIDAD Y AUDITORÍA
-- =====================================================

-- Tabla de Actividad de Tareas
CREATE TABLE IF NOT EXISTS task_activity (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historial de Sugerencias IA
CREATE TABLE IF NOT EXISTS ai_suggestions_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    suggestion_type VARCHAR NOT NULL,
    suggested_value TEXT NOT NULL,
    confidence NUMERIC NOT NULL,
    was_applied BOOLEAN,
    feedback VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECCIÓN 5: TABLAS DE NOTIFICACIONES E INTEGRACIONES
-- =====================================================

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración de Notificaciones
CREATE TABLE IF NOT EXISTS notification_configs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    events TEXT[] NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Preferencias de Email
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email VARCHAR NOT NULL,
    task_created BOOLEAN DEFAULT TRUE,
    task_completed BOOLEAN DEFAULT TRUE,
    task_reminder BOOLEAN DEFAULT TRUE,
    task_overdue BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECCIÓN 6: TABLAS DE INTEGRACIONES
-- =====================================================

-- Tabla de Integraciones
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de Eventos de Calendario
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    external_event_id VARCHAR NOT NULL,
    event_data JSONB NOT NULL,
    sync_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historial de Sincronización
CREATE TABLE IF NOT EXISTS integration_sync_history (
    id UUID PRIMARY KEY,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    integration_type VARCHAR NOT NULL,
    external_id VARCHAR,
    status VARCHAR NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECCIÓN 7: TABLAS DE PRODUCTIVIDAD Y MÉTRICAS
-- =====================================================

-- Tabla de Métricas de Productividad
CREATE TABLE IF NOT EXISTS productivity_metrics (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    completion_rate NUMERIC,
    productivity_score INTEGER DEFAULT 0,
    overdue_tasks INTEGER,
    high_priority_completed INTEGER,
    avg_completion_time_hours NUMERIC,
    categories_used TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Tabla de Insights de Productividad
CREATE TABLE IF NOT EXISTS productivity_insights (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    score INTEGER NOT NULL,
    data JSONB,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECCIÓN 8: TABLAS DE API Y AUTOMATIZACIÓN
-- =====================================================

-- Tabla de Claves de API
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    key VARCHAR NOT NULL UNIQUE,
    permissions TEXT[] NOT NULL,
    rate_limit INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Límites de Tasa de API
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY,
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reglas de Automatización
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    trigger_config JSONB NOT NULL,
    actions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_executed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SECCIÓN 9: ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_user_id ON task_activity(user_id);

CREATE INDEX IF NOT EXISTS idx_task_collaborators_task_id ON task_collaborators(task_id);
CREATE INDEX IF NOT EXISTS idx_task_collaborators_user_id ON task_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(completed);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_id ON productivity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_date ON productivity_metrics(date);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);

-- =====================================================
-- SECCIÓN 10: FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para tareas
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para objetivos
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECCIÓN 11: CONTROL DE ACCESO (Opcional)
-- =====================================================

-- Descomentar si necesitas Row Level Security
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 
    tablename,
    (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.tablename) as num_columns
FROM pg_tables t
WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
ORDER BY tablename;

