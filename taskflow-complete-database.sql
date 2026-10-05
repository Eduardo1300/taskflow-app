-- ============================================
-- TaskFlow - Base de Datos Completa para PostgreSQL
-- ============================================
-- Ejecutar en orden: este script crea toda la estructura
-- Requiere PostgreSQL 12+ con extensiones pgcrypto y uuid-ossp
-- ============================================

-- ============================================
-- EXTENSIONES REQUERIDAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES (orden de dependencias)
-- ============================================

-- 1. PROFILES (Usuarios) - Sin dependencias
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    avatar TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'es',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES (Categorías) - Depende de profiles
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASKS (Tareas) - Depende de profiles y categories
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT,
    tags TEXT[],
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    ai_priority_suggestion TEXT,
    ai_category_suggestion TEXT,
    ai_due_date_suggestion TIMESTAMP WITH TIME ZONE,
    calendar_event_id TEXT
);

-- 4. GOALS (Metas/Objetivos) - Depende de profiles
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 5. TASK ACTIVITY (Actividad de tareas) - Depende de tasks y profiles
CREATE TABLE IF NOT EXISTS task_activity (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRODUCTIVITY METRICS (Métricas de productividad) - Depende de profiles
CREATE TABLE IF NOT EXISTS productivity_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
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

-- 7. PRODUCTIVITY INSIGHTS (Insights de productividad) - Depende de profiles
CREATE TABLE IF NOT EXISTS productivity_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    score INTEGER NOT NULL,
    data JSONB,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(completed);

CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_user_id ON task_activity(user_id);

CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_id ON productivity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_date ON productivity_metrics(date);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para goals
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS DE EJEMPLO (Usuario admin)
-- ============================================

-- Insertar usuario admin
INSERT INTO profiles (id, email, full_name, phone, location, bio, timezone, language, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@taskflow.com',
    'Admin',
    '+1234567890',
    'Madrid, España',
    'Usuario administrador de TaskFlow',
    'Europe/Madrid',
    'es',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insertar categorías de ejemplo
INSERT INTO categories (name, color, user_id, created_at) VALUES
('General', '#6366f1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW()),
('Trabajo', '#ef4444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW()),
('Personal', '#10b981', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW()),
('Salud', '#f59e0b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW()),
('Estudios', '#8b5cf6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW()),
('Finanzas', '#ec4899', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW()),
('Hogar', '#14b8a6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW())
ON CONFLICT DO NOTHING;

-- Insertar tareas de ejemplo
INSERT INTO tasks (title, description, completed, favorite, created_at, user_id, category, priority, due_date) VALUES
('Bienvenido a TaskFlow', 'Esta es tu primera tarea. ¡Organiza tu vida productiva!', false, true, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'general', 'medium', NOW() + INTERVAL '7 days'),
('Explora el dashboard', 'Revisa todas las funcionalidades disponibles en el panel', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'general', 'low', NOW() + INTERVAL '14 days'),
('Crea tu primera tarea', 'Usa el botón + para agregar nuevas tareas', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'general', 'high', NOW() + INTERVAL '3 days'),
('Revisar emails pendientes', 'Responder correos importantes del trabajo', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'trabajo', 'high', NOW() + INTERVAL '1 day'),
('Preparar presentación', 'Crear slides para reunión del viernes', false, true, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'trabajo', 'high', NOW() + INTERVAL '2 days'),
('Terminar informe mensual', 'Completar reporte de ventas del mes', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'trabajo', 'medium', NOW() + INTERVAL '5 days'),
('Gimnasio', 'Entrenamiento de cardio y fuerza', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'salud', 'medium', NOW() + INTERVAL '1 day'),
('Médico check-up', 'Cita anual con el doctor', false, true, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'salud', 'high', NOW() + INTERVAL '10 days'),
('Compra supermercado', 'Lista: frutas, verduras, leche, pan', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hogar', 'low', NOW() + INTERVAL '3 days'),
('Lavar ropa', 'Lavar y tender ropa', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hogar', 'low', NOW() + INTERVAL '2 days'),
('Estudiar React', 'Capítulo 5: Hooks personalizados', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'estudios', 'medium', NOW() + INTERVAL '4 days'),
('Hacer ejercicios de matemáticas', 'Resolver problemas del cuaderno', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'estudios', 'medium', NOW() + INTERVAL '1 day'),
('Pagar servicios', 'Luz, agua, internet', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'finanzas', 'high', NOW() + INTERVAL '5 days'),
('Revisar gastos mensuales', 'Analizar presupuesto de abril', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'finanzas', 'low', NOW() + INTERVAL '7 days'),
('Llamar a mamá', 'Hablar con la familia', false, true, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'personal', 'low', NOW() + INTERVAL '2 days'),
('Planificar vacaciones', 'Buscar destinos y precios', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'personal', 'low', NOW() + INTERVAL '30 days'),
('Actualizar LinkedIn', 'Añadir nuevas habilidades', false, false, NOW(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'personal', 'low', NOW() + INTERVAL '14 days'),
('Tarea completada 1', 'Esta tarea está completada', true, false, NOW() - INTERVAL '5 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'general', 'medium', NOW() - INTERVAL '3 days'),
('Tarea completada 2', 'Otra tarea completada', true, true, NOW() - INTERVAL '10 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'trabajo', 'high', NOW() - INTERVAL '8 days'),
('Tarea completada 3', 'Tercer tarea completada', true, false, NOW() - INTERVAL '3 days', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'salud', 'medium', NOW() - INTERVAL '1 day');

-- Insertar 3 metas de ejemplo
INSERT INTO goals (id, title, description, target, current, completed, category, type, user_id, created_at, updated_at, start_date, end_date) VALUES
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Completar 50 tareas', 'Completar un total de 50 tareas durante el mes', 50, 12, false, 'productividad', 'monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW(), NOW(), NOW() + INTERVAL '30 days'),
('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Mantener racha de 7 días', 'Completar al menos una tarea cada día durante 7 días consecutivos', 7, 3, false, 'racha', 'weekly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW(), NOW(), NOW() + INTERVAL '30 days'),
('a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Terminar proyecto principal', 'Completar todas las tareas del proyecto principal', 100, 35, false, 'proyecto', 'quarterly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW(), NOW(), NOW() + INTERVAL '90 days');

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
    'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Goals', COUNT(*) FROM goals
UNION ALL
SELECT 'Task Activity', COUNT(*) FROM task_activity
UNION ALL
SELECT 'Productivity Metrics', COUNT(*) FROM productivity_metrics
UNION ALL
SELECT 'Productivity Insights', COUNT(*) FROM productivity_insights
UNION ALL
SELECT 'Goals', COUNT(*) FROM goals;