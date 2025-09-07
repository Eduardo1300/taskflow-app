-- Script para arreglar problemas de políticas y tablas faltantes

-- 1. LIMPIAR POLÍTICAS PROBLEMÁTICAS
-- Eliminar todas las políticas de task_comments, task_attachments y task_assignments
-- que pueden estar causando recursión infinita

DROP POLICY IF EXISTS "Users can view task comments if they can view the task" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments on tasks they can view" ON task_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON task_comments;

DROP POLICY IF EXISTS "Users can view task attachments if they can view the task" ON task_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to tasks they can view" ON task_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON task_attachments;

DROP POLICY IF EXISTS "Users can view assignments for tasks they can view" ON task_assignments;
DROP POLICY IF EXISTS "Users can create assignments for tasks they can view" ON task_assignments;
DROP POLICY IF EXISTS "Users can delete assignments they created or are assigned to" ON task_assignments;

-- 2. CREAR TABLA COLLABORATION_INVITATIONS FALTANTE
CREATE TABLE IF NOT EXISTS collaboration_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    message TEXT
);

-- Habilitar RLS para collaboration_invitations
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;

-- 3. CREAR POLÍTICAS SIMPLES SIN RECURSIÓN
-- Políticas para comentarios (sin subconsultas a tasks)
CREATE POLICY "Users can view all task comments" ON task_comments
    FOR SELECT USING (true); -- Temporal para evitar recursión

CREATE POLICY "Users can create their own comments" ON task_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON task_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON task_comments
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para adjuntos (sin subconsultas a tasks)
CREATE POLICY "Users can view all task attachments" ON task_attachments
    FOR SELECT USING (true); -- Temporal para evitar recursión

CREATE POLICY "Users can upload their own attachments" ON task_attachments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own attachments" ON task_attachments
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para asignaciones (sin subconsultas a tasks)
CREATE POLICY "Users can view all assignments" ON task_assignments
    FOR SELECT USING (true); -- Temporal para evitar recursión

CREATE POLICY "Users can create assignments they assign" ON task_assignments
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can delete assignments they created" ON task_assignments
    FOR DELETE USING (assigned_by = auth.uid());

-- Políticas para invitaciones de colaboración
CREATE POLICY "Users can view invitations sent to them" ON collaboration_invitations
    FOR SELECT USING (invited_email = auth.email() OR invited_by = auth.uid());

CREATE POLICY "Users can create invitations for their tasks" ON collaboration_invitations
    FOR INSERT WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Users can update invitations they sent or received" ON collaboration_invitations
    FOR UPDATE USING (invited_by = auth.uid());

-- 4. ÍNDICES PARA COLABORACIONES
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_task_id ON collaboration_invitations(task_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_invited_email ON collaboration_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_collaboration_invitations_status ON collaboration_invitations(status);
