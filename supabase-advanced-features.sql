-- Crear tabla para comentarios de tareas
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE -- Para replies
);

-- Habilitar RLS para comentarios
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Política para comentarios: usuarios pueden ver y crear comentarios en tareas que pueden ver
CREATE POLICY "Users can view task comments if they can view the task" ON task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = task_comments.task_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create comments on tasks they can view" ON task_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = task_comments.task_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own comments" ON task_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON task_comments
    FOR DELETE USING (user_id = auth.uid());

-- Crear tabla para archivos adjuntos
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

-- Habilitar RLS para adjuntos
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para adjuntos
CREATE POLICY "Users can view task attachments if they can view the task" ON task_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = task_attachments.task_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload attachments to tasks they can view" ON task_attachments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = task_attachments.task_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own attachments" ON task_attachments
    FOR DELETE USING (user_id = auth.uid());

-- Crear tabla para asignaciones de tareas
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(task_id, assigned_to)
);

-- Habilitar RLS para asignaciones
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para asignaciones
CREATE POLICY "Users can view assignments for tasks they can view" ON task_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = task_assignments.task_id 
            AND user_id = auth.uid()
        )
        OR assigned_to = auth.uid()
    );

CREATE POLICY "Users can create assignments for tasks they can view" ON task_assignments
    FOR INSERT WITH CHECK (
        assigned_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = task_assignments.task_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete assignments they created or are assigned to" ON task_assignments
    FOR DELETE USING (assigned_by = auth.uid() OR assigned_to = auth.uid());

-- Crear tabla para notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
    read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}', -- datos adicionales
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para notificaciones
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para notificaciones
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en comentarios
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear función para generar notificaciones automáticas
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (p_user_id, p_title, p_message, p_type, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar cuando se asigna una tarea
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar al usuario asignado
    PERFORM create_notification(
        NEW.assigned_to,
        'Nueva tarea asignada',
        'Se te ha asignado una nueva tarea',
        'info',
        json_build_object('task_id', NEW.task_id, 'assigned_by', NEW.assigned_by)::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones de asignación
DROP TRIGGER IF EXISTS trigger_notify_task_assignment ON task_assignments;
CREATE TRIGGER trigger_notify_task_assignment
    AFTER INSERT ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

-- Función para notificar cuando se comenta una tarea
CREATE OR REPLACE FUNCTION notify_task_comment()
RETURNS TRIGGER AS $$
DECLARE
    task_owner UUID;
    task_title TEXT;
BEGIN
    -- Obtener información de la tarea
    SELECT user_id, title INTO task_owner, task_title
    FROM tasks WHERE id = NEW.task_id;
    
    -- Notificar al dueño de la tarea si no es quien comentó
    IF task_owner != NEW.user_id THEN
        PERFORM create_notification(
            task_owner,
            'Nuevo comentario',
            'Hay un nuevo comentario en tu tarea: ' || task_title,
            'info',
            json_build_object('task_id', NEW.task_id, 'comment_id', NEW.id, 'commented_by', NEW.user_id)::jsonb
        );
    END IF;
    
    -- También notificar a otros usuarios asignados a la tarea
    INSERT INTO notifications (user_id, title, message, type, data)
    SELECT 
        ta.assigned_to,
        'Nuevo comentario',
        'Hay un nuevo comentario en una tarea asignada: ' || task_title,
        'info',
        json_build_object('task_id', NEW.task_id, 'comment_id', NEW.id, 'commented_by', NEW.user_id)::jsonb
    FROM task_assignments ta
    WHERE ta.task_id = NEW.task_id 
    AND ta.assigned_to != NEW.user_id 
    AND ta.assigned_to != task_owner;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificaciones de comentarios
DROP TRIGGER IF EXISTS trigger_notify_task_comment ON task_comments;
CREATE TRIGGER trigger_notify_task_comment
    AFTER INSERT ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_comment();

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_user_id ON task_attachments(user_id);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Crear storage bucket para archivos adjuntos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para archivos adjuntos
CREATE POLICY "Users can upload their own task attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'task-attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view task attachments they have access to" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'task-attachments' AND
        EXISTS (
            SELECT 1 FROM task_attachments ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.storage_path = storage.objects.name
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own task attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'task-attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
