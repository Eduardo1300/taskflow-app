-- Script SQL para configurar integraciones y IA
-- Ejecutar en Supabase SQL Editor

-- Tabla para integraciones externas
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'google_calendar', 'outlook', 'slack', 'discord', 'email', 'webhook'
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Validación de tipos
    CONSTRAINT valid_integration_type CHECK (
        type IN ('google_calendar', 'outlook', 'slack', 'discord', 'email', 'webhook')
    )
);

-- Tabla para configuraciones de notificaciones
CREATE TABLE IF NOT EXISTS notification_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'email', 'slack', 'discord', 'webhook'
    events TEXT[] NOT NULL DEFAULT '{}',
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validación de tipos y eventos
    CONSTRAINT valid_notification_type CHECK (
        type IN ('email', 'slack', 'discord', 'webhook')
    ),
    CONSTRAINT valid_events CHECK (
        events <@ ARRAY['task_created', 'task_completed', 'task_overdue', 'task_reminder']::TEXT[]
    )
);

-- Tabla para insights de productividad generados por IA
CREATE TABLE IF NOT EXISTS productivity_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'pattern', 'recommendation', 'achievement', 'warning'
    score INTEGER NOT NULL DEFAULT 0, -- 0-100
    data JSONB DEFAULT '{}',
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validación
    CONSTRAINT valid_insight_type CHECK (
        type IN ('pattern', 'recommendation', 'achievement', 'warning')
    ),
    CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100)
);

-- Tabla para reglas de automatización IA
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_config JSONB NOT NULL, -- configuración del trigger
    actions JSONB NOT NULL, -- array de acciones a ejecutar
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_executed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para historial de sugerencias de IA
CREATE TABLE IF NOT EXISTS ai_suggestions_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL, -- 'category', 'due_date', 'priority'
    suggested_value TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL, -- 0.00-1.00
    was_applied BOOLEAN DEFAULT FALSE,
    feedback VARCHAR(20), -- 'helpful', 'not_helpful', 'wrong'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validación
    CONSTRAINT valid_suggestion_type CHECK (
        suggestion_type IN ('category', 'due_date', 'priority', 'productivity_tip')
    ),
    CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1),
    CONSTRAINT valid_feedback CHECK (
        feedback IS NULL OR feedback IN ('helpful', 'not_helpful', 'wrong')
    )
);

-- Tabla para métricas de productividad
CREATE TABLE IF NOT EXISTS productivity_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0, -- porcentaje
    avg_completion_time_hours DECIMAL(8,2) DEFAULT 0,
    overdue_tasks INTEGER DEFAULT 0,
    high_priority_completed INTEGER DEFAULT 0,
    categories_used TEXT[] DEFAULT '{}',
    productivity_score INTEGER DEFAULT 0, -- 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicados por usuario y fecha
    UNIQUE(user_id, date)
);

-- Tabla para eventos de calendario sincronizados
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255) NOT NULL, -- ID del evento en el servicio externo
    event_data JSONB NOT NULL DEFAULT '{}',
    sync_status VARCHAR(20) DEFAULT 'synced', -- 'synced', 'error', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicados
    UNIQUE(integration_id, external_event_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_notification_configs_user_id ON notification_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_user_id ON productivity_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_insights_type ON productivity_insights(type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_task_id ON ai_suggestions_history(task_id);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_date ON productivity_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);

-- RLS (Row Level Security) Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas para integrations
CREATE POLICY "Users can manage their own integrations" ON integrations
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para notification_configs
CREATE POLICY "Users can manage their own notification configs" ON notification_configs
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para productivity_insights
CREATE POLICY "Users can view their own insights" ON productivity_insights
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para automation_rules
CREATE POLICY "Users can manage their own automation rules" ON automation_rules
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_suggestions_history
CREATE POLICY "Users can view their own AI suggestions" ON ai_suggestions_history
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para productivity_metrics
CREATE POLICY "Users can view their own metrics" ON productivity_metrics
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para calendar_events
CREATE POLICY "Users can manage their own calendar events" ON calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- Funciones para automatización

-- Función para calcular métricas diarias de productividad
CREATE OR REPLACE FUNCTION calculate_daily_productivity_metrics(target_user_id UUID, target_date DATE)
RETURNS void AS $$
DECLARE
    tasks_created_count INTEGER;
    tasks_completed_count INTEGER;
    completion_rate_calc DECIMAL(5,2);
    overdue_count INTEGER;
    high_priority_completed_count INTEGER;
    categories_list TEXT[];
    productivity_score_calc INTEGER;
BEGIN
    -- Contar tareas creadas en la fecha
    SELECT COUNT(*) INTO tasks_created_count
    FROM tasks
    WHERE user_id = target_user_id 
    AND DATE(created_at) = target_date;
    
    -- Contar tareas completadas en la fecha
    SELECT COUNT(*) INTO tasks_completed_count
    FROM tasks
    WHERE user_id = target_user_id 
    AND completed = TRUE
    AND DATE(created_at) <= target_date;
    
    -- Calcular tasa de completitud
    completion_rate_calc := CASE 
        WHEN tasks_created_count > 0 THEN 
            (tasks_completed_count::DECIMAL / tasks_created_count) * 100
        ELSE 0 
    END;
    
    -- Contar tareas vencidas
    SELECT COUNT(*) INTO overdue_count
    FROM tasks
    WHERE user_id = target_user_id 
    AND completed = FALSE
    AND due_date IS NOT NULL
    AND DATE(due_date) < target_date;
    
    -- Contar tareas de alta prioridad completadas
    SELECT COUNT(*) INTO high_priority_completed_count
    FROM tasks
    WHERE user_id = target_user_id 
    AND completed = TRUE
    AND priority = 'high'
    AND DATE(created_at) = target_date;
    
    -- Obtener categorías usadas
    SELECT ARRAY_AGG(DISTINCT category) INTO categories_list
    FROM tasks
    WHERE user_id = target_user_id 
    AND DATE(created_at) = target_date
    AND category IS NOT NULL;
    
    -- Calcular score de productividad (algoritmo simple)
    productivity_score_calc := LEAST(100, 
        (completion_rate_calc * 0.4)::INTEGER + 
        (GREATEST(0, 50 - overdue_count * 5)) + 
        (high_priority_completed_count * 5)
    );
    
    -- Insertar o actualizar métricas
    INSERT INTO productivity_metrics (
        user_id, date, tasks_created, tasks_completed, completion_rate,
        overdue_tasks, high_priority_completed, categories_used, productivity_score
    ) VALUES (
        target_user_id, target_date, tasks_created_count, tasks_completed_count,
        completion_rate_calc, overdue_count, high_priority_completed_count,
        COALESCE(categories_list, '{}'), productivity_score_calc
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        tasks_created = EXCLUDED.tasks_created,
        tasks_completed = EXCLUDED.tasks_completed,
        completion_rate = EXCLUDED.completion_rate,
        overdue_tasks = EXCLUDED.overdue_tasks,
        high_priority_completed = EXCLUDED.high_priority_completed,
        categories_used = EXCLUDED.categories_used,
        productivity_score = EXCLUDED.productivity_score;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar datos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpiar insights antiguos desestimados (más de 30 días)
    DELETE FROM productivity_insights 
    WHERE is_dismissed = TRUE 
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Limpiar historial de sugerencias IA antiguas (más de 90 días)
    DELETE FROM ai_suggestions_history 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Limpiar métricas muy antiguas (más de 1 año)
    DELETE FROM productivity_metrics 
    WHERE date < CURRENT_DATE - INTERVAL '1 year';
    
    -- Limpiar eventos de calendario de tareas eliminadas
    DELETE FROM calendar_events 
    WHERE task_id NOT IN (SELECT id FROM tasks);
END;
$$ LANGUAGE plpgsql;

-- Función para generar automáticamente métricas diarias (puede ser llamada por un cron job)
CREATE OR REPLACE FUNCTION generate_daily_metrics_for_all_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM tasks LOOP
        PERFORM calculate_daily_productivity_metrics(user_record.user_id, CURRENT_DATE - INTERVAL '1 day');
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Agregar columnas a la tabla tasks para tracking de IA (opcional)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_category_suggestion VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_priority_suggestion VARCHAR(10);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ai_due_date_suggestion TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255);

-- Índices adicionales para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_tasks_ai_suggestions ON tasks(user_id) 
WHERE ai_category_suggestion IS NOT NULL OR ai_priority_suggestion IS NOT NULL;
