-- Extensión de la base de datos para colaboración
-- Ejecutar en Supabase SQL Editor

-- Tabla para colaboradores de tareas
CREATE TABLE IF NOT EXISTS task_collaborators (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission VARCHAR(20) DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(task_id, user_id)
);

-- Tabla para invitaciones de colaboración
CREATE TABLE IF NOT EXISTS collaboration_invitations (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  invited_email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission VARCHAR(20) DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Tabla para actividad/historial de tareas colaborativas
CREATE TABLE IF NOT EXISTS task_activity (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'completed', 'shared', 'commented'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS task_collaborators_task_id_idx ON task_collaborators(task_id);
CREATE INDEX IF NOT EXISTS task_collaborators_user_id_idx ON task_collaborators(user_id);
CREATE INDEX IF NOT EXISTS collaboration_invitations_email_idx ON collaboration_invitations(invited_email);
CREATE INDEX IF NOT EXISTS task_activity_task_id_idx ON task_activity(task_id);

-- Habilitar RLS
ALTER TABLE task_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- Políticas para task_collaborators
CREATE POLICY "Users can view collaborations for their tasks" ON task_collaborators
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = shared_by OR
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_collaborators.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Task owners can insert collaborators" ON task_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_collaborators.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Task owners can delete collaborators" ON task_collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_collaborators.task_id AND tasks.user_id = auth.uid()
    ) OR auth.uid() = user_id
  );

-- Políticas para collaboration_invitations
CREATE POLICY "Users can view their invitations" ON collaboration_invitations
  FOR SELECT USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = collaboration_invitations.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Task owners can create invitations" ON collaboration_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = collaboration_invitations.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Invited users can update invitation status" ON collaboration_invitations
  FOR UPDATE USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_by = auth.uid()
  );

-- Políticas para task_activity
CREATE POLICY "Users can view activity for accessible tasks" ON task_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = task_activity.task_id AND tasks.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM task_collaborators 
      WHERE task_collaborators.task_id = task_activity.task_id 
      AND task_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activity for accessible tasks" ON task_activity
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM tasks WHERE tasks.id = task_activity.task_id AND tasks.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM task_collaborators 
        WHERE task_collaborators.task_id = task_activity.task_id 
        AND task_collaborators.user_id = auth.uid()
        AND permission IN ('edit', 'admin')
      )
    )
  );

-- Actualizar políticas de tareas para incluir colaboradores
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias tareas" ON tasks;
CREATE POLICY "Users can view their own tasks and shared tasks" ON tasks
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM task_collaborators 
      WHERE task_collaborators.task_id = tasks.id 
      AND task_collaborators.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias tareas" ON tasks;
CREATE POLICY "Users can update their own tasks and editable shared tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM task_collaborators 
      WHERE task_collaborators.task_id = tasks.id 
      AND task_collaborators.user_id = auth.uid()
      AND permission IN ('edit', 'admin')
    )
  );

-- Función para aceptar invitación
CREATE OR REPLACE FUNCTION accept_collaboration_invitation(invitation_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record collaboration_invitations%ROWTYPE;
  current_user_id UUID;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  -- Buscar la invitación
  SELECT * INTO invitation_record 
  FROM collaboration_invitations 
  WHERE id = invitation_id 
  AND invited_email = (SELECT email FROM auth.users WHERE id = current_user_id)
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Crear la colaboración
  INSERT INTO task_collaborators (task_id, user_id, permission, shared_by)
  VALUES (
    invitation_record.task_id, 
    current_user_id, 
    invitation_record.permission, 
    invitation_record.invited_by
  )
  ON CONFLICT (task_id, user_id) DO NOTHING;
  
  -- Actualizar el estado de la invitación
  UPDATE collaboration_invitations 
  SET status = 'accepted' 
  WHERE id = invitation_id;
  
  -- Registrar actividad
  INSERT INTO task_activity (task_id, user_id, action, details)
  VALUES (
    invitation_record.task_id,
    current_user_id,
    'collaboration_accepted',
    jsonb_build_object('invitation_id', invitation_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
