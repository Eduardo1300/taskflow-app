-- Script para crear categorías por defecto para usuarios existentes
-- Ejecuta este script DESPUÉS del anterior

-- Crear categorías por defecto para usuarios que ya existen
INSERT INTO categories (name, color, user_id)
SELECT 'Trabajo', '#3B82F6', auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = auth.uid() AND name = 'Trabajo'
);

INSERT INTO categories (name, color, user_id)
SELECT 'Personal', '#10B981', auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = auth.uid() AND name = 'Personal'
);

INSERT INTO categories (name, color, user_id)
SELECT 'Urgente', '#EF4444', auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = auth.uid() AND name = 'Urgente'
);

INSERT INTO categories (name, color, user_id)
SELECT 'Ideas', '#8B5CF6', auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id = auth.uid() AND name = 'Ideas'
);
