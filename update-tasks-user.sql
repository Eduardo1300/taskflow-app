-- Actualizar todas las tareas que inserté al usuario admin correcto
UPDATE tasks 
SET user_id = '3d0945f1-3458-44da-a555-d3e4f7d17a11'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' 
  OR (title LIKE '%Reportes%' OR title LIKE '%Reunión%' OR title LIKE '%Revisar propuestas%');

-- Verificar el resultado
SELECT COUNT(*) as total_tasks FROM tasks WHERE user_id = '3d0945f1-3458-44da-a555-d3e4f7d17a11';