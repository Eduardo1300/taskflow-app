-- Script DRÁSTICO para eliminar TODAS las políticas y empezar desde cero

-- 1. DESHABILITAR RLS TEMPORALMENTE PARA LIMPIAR TODO
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invitations DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS DE TASKS (pueden haber múltiples con nombres diferentes)
DO $$
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'tasks' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON tasks';
    END LOOP;
END $$;

-- 3. ELIMINAR TODAS LAS POLÍTICAS DE OTRAS TABLAS
DO $$
DECLARE
    pol_name text;
    table_name text;
BEGIN
    FOR table_name, pol_name IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('task_comments', 'task_attachments', 'task_assignments', 'collaboration_invitations') 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON ' || table_name;
    END LOOP;
END $$;

-- 4. HABILITAR RLS NUEVAMENTE
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICA SIMPLE PARA TASKS (SIN RECURSIÓN)
CREATE POLICY "simple_tasks_policy" ON tasks
    FOR ALL USING (user_id = auth.uid());

-- 6. POLÍTICAS SIMPLES PARA OTRAS TABLAS
CREATE POLICY "simple_comments_policy" ON task_comments
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "simple_attachments_policy" ON task_attachments
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "simple_assignments_policy" ON task_assignments
    FOR ALL USING (assigned_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "simple_invitations_policy" ON collaboration_invitations
    FOR ALL USING (invited_by = auth.uid());
