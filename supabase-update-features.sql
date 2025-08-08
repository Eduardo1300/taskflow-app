-- Actualización de la tabla tasks para soportar nuevas funcionalidades
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar nuevos campos a la tabla tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high'));

-- Crear tabla para categorías predefinidas
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en la tabla categorías
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías
CREATE POLICY "Los usuarios pueden ver sus propias categorías" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias categorías" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias categorías" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias categorías" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Insertar categorías por defecto para nuevos usuarios (se ejecutará con un trigger)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (name, color, user_id) VALUES
    ('Trabajo', '#3B82F6', NEW.id),
    ('Personal', '#10B981', NEW.id),
    ('Urgente', '#EF4444', NEW.id),
    ('Ideas', '#8B5CF6', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear categorías por defecto
DROP TRIGGER IF EXISTS create_default_categories_trigger ON profiles;
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

COMMENT ON COLUMN tasks.category IS 'Categoría de la tarea';
COMMENT ON COLUMN tasks.tags IS 'Etiquetas de la tarea';
COMMENT ON COLUMN tasks.due_date IS 'Fecha de vencimiento de la tarea';
COMMENT ON COLUMN tasks.priority IS 'Prioridad de la tarea: low, medium, high';
