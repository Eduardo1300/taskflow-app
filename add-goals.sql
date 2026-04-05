-- Añadir metas para el usuario
INSERT INTO taskflow.goals (id, title, description, target, current, completed, category, type, user_id, created_at, updated_at) VALUES 
('22222222-2222-2222-2222-222222222222', 'Tareas diarias', 'Completar minimum 5 tareas diarias', 5, 3, false, 'tasks', 'daily', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Tareas semanales', 'Completar 20 tareas por semana', 20, 12, false, 'tasks', 'weekly', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Meta mensual', 'Completar 50 tareas al mes', 50, 28, false, 'tasks', 'monthly', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Tasa de completación', 'Mantener 80% de tareas completadas', 80, 75, false, 'productivity', 'monthly', '11111111-1111-1111-1111-111111111111', NOW(), NOW());
