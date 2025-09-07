-- Script completo para solucionar todos los problemas

-- 1. VERIFICAR Y RECREAR POLÍTICAS DE TASKS (problema principal)
-- Eliminar todas las políticas de tasks por si hay conflictos
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias tareas" ON tasks;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias tareas" ON tasks;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias tareas" ON tasks;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias tareas" ON tasks;

-- Recrear políticas de tasks de forma simple
CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_policy" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- 2. ARREGLAR COLLABORATION_INVITATIONS
-- Eliminar la tabla si existe (para recrearla correctamente)
DROP TABLE IF EXISTS collaboration_invitations CASCADE;

-- Recrear la tabla sin la referencia problemática a profiles por ahora
CREATE TABLE collaboration_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    message TEXT
);

-- Habilitar RLS
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;

-- Política simple para collaboration_invitations
CREATE POLICY "collaboration_invitations_policy" ON collaboration_invitations
    FOR ALL USING (auth.uid() = invited_by);

-- 3. VERIFICAR QUE LAS TABLAS COMENTARIOS, ADJUNTOS Y ASIGNACIONES EXISTAN
-- Si no existen, las creamos de forma simple

-- Tabla de comentarios (verificar si existe)
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE
);

-- Tabla de adjuntos (verificar si existe)
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de asignaciones (verificar si existe)
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(task_id, assigned_to)
);

-- 4. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS MUY SIMPLES PARA EVITAR CONFLICTOS
-- Permitir todo a usuarios autenticados por ahora
CREATE POLICY "task_comments_all_policy" ON task_comments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "task_attachments_all_policy" ON task_attachments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "task_assignments_all_policy" ON task_assignments FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. ÍNDICES BÁSICOS
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_task_id ON collaboration_invitations(task_id);
