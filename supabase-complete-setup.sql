-- =====================================================
-- TASKFLOW - COMPLETE DATABASE SETUP
-- Sistema completo de gestión de tareas con funciones avanzadas
-- =====================================================

-- Limpiar tablas existentes si es necesario (CUIDADO: esto borra datos)
-- DROP TABLE IF EXISTS task_assignments CASCADE;
-- DROP TABLE IF EXISTS task_attachments CASCADE;
-- DROP TABLE IF EXISTS task_comments CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;

-- =====================================================
-- TABLA: task_comments
-- Sistema de comentarios en tiempo real para tareas
-- =====================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para optimizar consultas
  CONSTRAINT task_comments_task_id_idx FOREIGN KEY (task_id) REFERENCES tasks(id),
  CONSTRAINT task_comments_user_id_idx FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- =====================================================
-- TABLA: task_attachments  
-- Sistema de archivos adjuntos con Supabase Storage
-- =====================================================
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Ruta en Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT valid_file_size CHECK (file_size > 0),
  CONSTRAINT valid_file_name CHECK (LENGTH(file_name) > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_created_at ON task_attachments(created_at DESC);

-- =====================================================
-- TABLA: task_assignments
-- Sistema de asignación de usuarios a tareas
-- =====================================================
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Una persona solo puede ser asignada una vez por tarea
  UNIQUE(task_id, assigned_to)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);

-- =====================================================
-- TABLA: notifications
-- Sistema completo de notificaciones en tiempo real
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_comment', 'task_updated', 'task_attachment', 'task_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  
  -- Datos relacionados (JSON flexible)
  data JSONB DEFAULT '{}',
  
  -- Referencias opcionales
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES task_comments(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- Automatización de notificaciones y actualizaciones
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para task_comments
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN: Crear notificación automática para comentarios
-- =====================================================
CREATE OR REPLACE FUNCTION notify_task_comment()
RETURNS TRIGGER AS $$
DECLARE
    task_owner_id UUID;
    task_title TEXT;
    commenter_email TEXT;
BEGIN
    -- Obtener info de la tarea y el usuario
    SELECT t.user_id, t.title, u.email
    INTO task_owner_id, task_title, commenter_email
    FROM tasks t
    LEFT JOIN auth.users u ON u.id = NEW.user_id
    WHERE t.id = NEW.task_id;
    
    -- Solo notificar si el comentario no es del dueño de la tarea
    IF task_owner_id != NEW.user_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            task_id,
            comment_id,
            data
        ) VALUES (
            task_owner_id,
            'task_comment',
            'Nuevo comentario en tu tarea',
            commenter_email || ' comentó en "' || task_title || '"',
            NEW.task_id,
            NEW.id,
            json_build_object(
                'task_id', NEW.task_id,
                'comment_id', NEW.id,
                'commenter_id', NEW.user_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para comentarios
DROP TRIGGER IF EXISTS trigger_notify_task_comment ON task_comments;
CREATE TRIGGER trigger_notify_task_comment
    AFTER INSERT ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_comment();

-- =====================================================
-- FUNCIÓN: Crear notificación automática para asignaciones
-- =====================================================
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
    task_title TEXT;
    assigner_email TEXT;
BEGIN
    -- Obtener info de la tarea y el usuario asignador
    SELECT t.title, u.email
    INTO task_title, assigner_email
    FROM tasks t
    LEFT JOIN auth.users u ON u.id = NEW.assigned_by
    WHERE t.id = NEW.task_id;
    
    -- Crear notificación para el usuario asignado
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        task_id,
        data
    ) VALUES (
        NEW.assigned_to,
        'task_assigned',
        'Nueva tarea asignada',
        assigner_email || ' te asignó la tarea "' || task_title || '"',
        NEW.task_id,
        json_build_object(
            'task_id', NEW.task_id,
            'assigned_by', NEW.assigned_by,
            'assignment_id', NEW.id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignaciones
DROP TRIGGER IF EXISTS trigger_notify_task_assignment ON task_assignments;
CREATE TRIGGER trigger_notify_task_assignment
    AFTER INSERT ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

-- =====================================================
-- FUNCIÓN: Crear notificación automática para archivos adjuntos
-- =====================================================
CREATE OR REPLACE FUNCTION notify_task_attachment()
RETURNS TRIGGER AS $$
DECLARE
    task_owner_id UUID;
    task_title TEXT;
    uploader_email TEXT;
BEGIN
    -- Obtener info de la tarea y el usuario
    SELECT t.user_id, t.title, u.email
    INTO task_owner_id, task_title, uploader_email
    FROM tasks t
    LEFT JOIN auth.users u ON u.id = NEW.user_id
    WHERE t.id = NEW.task_id;
    
    -- Solo notificar si el archivo no es subido por el dueño de la tarea
    IF task_owner_id != NEW.user_id THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            task_id,
            data
        ) VALUES (
            task_owner_id,
            'task_attachment',
            'Nuevo archivo en tu tarea',
            uploader_email || ' subió "' || NEW.file_name || '" a "' || task_title || '"',
            NEW.task_id,
            json_build_object(
                'task_id', NEW.task_id,
                'attachment_id', NEW.id,
                'file_name', NEW.file_name,
                'uploader_id', NEW.user_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para archivos adjuntos
DROP TRIGGER IF EXISTS trigger_notify_task_attachment ON task_attachments;
CREATE TRIGGER trigger_notify_task_attachment
    AFTER INSERT ON task_attachments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_attachment();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD POR FILAS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: task_comments
-- =====================================================

-- Los usuarios pueden ver comentarios de tareas que les pertenecen o están asignadas
DROP POLICY IF EXISTS "Users can view comments on their tasks or assigned tasks" ON task_comments;
CREATE POLICY "Users can view comments on their tasks or assigned tasks"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id 
      AND (
        t.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM task_assignments ta 
          WHERE ta.task_id = t.id AND ta.assigned_to = auth.uid()
        )
      )
    )
  );

-- Los usuarios pueden crear comentarios en tareas que les pertenecen o están asignadas
DROP POLICY IF EXISTS "Users can create comments on accessible tasks" ON task_comments;
CREATE POLICY "Users can create comments on accessible tasks"
  ON task_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id 
      AND (
        t.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM task_assignments ta 
          WHERE ta.task_id = t.id AND ta.assigned_to = auth.uid()
        )
      )
    )
  );

-- Los usuarios solo pueden actualizar sus propios comentarios
DROP POLICY IF EXISTS "Users can update their own comments" ON task_comments;
CREATE POLICY "Users can update their own comments"
  ON task_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Los usuarios solo pueden eliminar sus propios comentarios
DROP POLICY IF EXISTS "Users can delete their own comments" ON task_comments;
CREATE POLICY "Users can delete their own comments"
  ON task_comments FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: task_attachments
-- =====================================================

-- Ver archivos de tareas propias o asignadas
DROP POLICY IF EXISTS "Users can view attachments on accessible tasks" ON task_attachments;
CREATE POLICY "Users can view attachments on accessible tasks"
  ON task_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id 
      AND (
        t.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM task_assignments ta 
          WHERE ta.task_id = t.id AND ta.assigned_to = auth.uid()
        )
      )
    )
  );

-- Subir archivos a tareas accesibles
DROP POLICY IF EXISTS "Users can upload attachments to accessible tasks" ON task_attachments;
CREATE POLICY "Users can upload attachments to accessible tasks"
  ON task_attachments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id 
      AND (
        t.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM task_assignments ta 
          WHERE ta.task_id = t.id AND ta.assigned_to = auth.uid()
        )
      )
    )
  );

-- Solo eliminar archivos propios
DROP POLICY IF EXISTS "Users can delete their own attachments" ON task_attachments;
CREATE POLICY "Users can delete their own attachments"
  ON task_attachments FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS: task_assignments
-- =====================================================

-- Ver asignaciones de tareas propias
DROP POLICY IF EXISTS "Users can view assignments of their tasks" ON task_assignments;
CREATE POLICY "Users can view assignments of their tasks"
  ON task_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id AND t.user_id = auth.uid()
    )
    OR assigned_to = auth.uid()
  );

-- Solo el dueño de la tarea puede crear asignaciones
DROP POLICY IF EXISTS "Task owners can create assignments" ON task_assignments;
CREATE POLICY "Task owners can create assignments"
  ON task_assignments FOR INSERT
  WITH CHECK (
    assigned_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id AND t.user_id = auth.uid()
    )
  );

-- Solo el dueño puede eliminar asignaciones
DROP POLICY IF EXISTS "Task owners can delete assignments" ON task_assignments;
CREATE POLICY "Task owners can delete assignments"
  ON task_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_id AND t.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLÍTICAS RLS: notifications
-- =====================================================

-- Los usuarios solo pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Los usuarios solo pueden actualizar sus propias notificaciones (marcar como leído)
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Los usuarios solo pueden eliminar sus propias notificaciones
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Las notificaciones se crean automáticamente por triggers (permitir insert desde triggers)
DROP POLICY IF EXISTS "Allow system to create notifications" ON notifications;
CREATE POLICY "Allow system to create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- CONFIGURACIÓN DE REALTIME
-- Habilitar realtime para actualizaciones en tiempo real
-- =====================================================

-- Publicar cambios en tiempo real para todas las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE task_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE task_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL - Remover en producción)
-- =====================================================

-- Insertar categorías por defecto si no existen
INSERT INTO categories (name, color, user_id) 
SELECT 'Trabajo', '#3B82F6', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Trabajo' AND user_id = auth.uid());

INSERT INTO categories (name, color, user_id) 
SELECT 'Personal', '#10B981', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Personal' AND user_id = auth.uid());

INSERT INTO categories (name, color, user_id) 
SELECT 'Urgente', '#EF4444', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Urgente' AND user_id = auth.uid());

-- =====================================================
-- FUNCIONES AUXILIARES PARA LA APLICACIÓN
-- =====================================================

-- Función para obtener estadísticas de notificaciones por usuario
CREATE OR REPLACE FUNCTION get_user_notification_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'unread', COUNT(*) FILTER (WHERE read = false),
        'by_type', json_object_agg(type, type_count)
    )
    INTO result
    FROM (
        SELECT type, COUNT(*) as type_count
        FROM notifications 
        WHERE user_id = user_uuid
        GROUP BY type
    ) t;
    
    RETURN COALESCE(result, '{"total": 0, "unread": 0, "by_type": {}}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar notificaciones antiguas (más de 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND read = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este script crea un sistema completo de gestión de tareas con:
-- ✅ Comentarios en tiempo real
-- ✅ Archivos adjuntos con storage
-- ✅ Sistema de asignaciones
-- ✅ Notificaciones automáticas
-- ✅ Seguridad RLS completa
-- ✅ Triggers automáticos
-- ✅ Optimización con índices
-- ✅ Realtime habilitado

-- Para usar este sistema:
-- 1. Ejecutar este script completo en Supabase SQL Editor
-- 2. Configurar Supabase Storage bucket llamado 'task-attachments'
-- 3. Verificar que las políticas RLS están activas
-- 4. Probar las funcionalidades desde la aplicación React

COMMENT ON TABLE task_comments IS 'Comentarios en tareas con notificaciones automáticas';
COMMENT ON TABLE task_attachments IS 'Archivos adjuntos con integración a Supabase Storage';
COMMENT ON TABLE task_assignments IS 'Sistema de asignación de usuarios a tareas';
COMMENT ON TABLE notifications IS 'Sistema completo de notificaciones en tiempo real';

-- Script completado exitosamente ✅
