-- Añadir tareas con fechas variadas para analytics
INSERT INTO taskflow.tasks (title, description, completed, favorite, created_at, user_id, category, priority, due_date, tags, updated_at) VALUES 
-- Tareas de hace 2 semanas (completadas)
('Proyecto anterior', 'Terminar módulo de autenticación', true, true, NOW() - INTERVAL '14 days', '11111111-1111-1111-1111-111111111111', 'trabajo', 'high', NOW() - INTERVAL '13 days', ARRAY['proyecto', 'backend'], NOW() - INTERVAL '13 days'),
('Revisión de código', 'Revisar PRs pendientes', true, false, NOW() - INTERVAL '14 days', '11111111-1111-1111-1111-111111111111', 'trabajo', 'medium', NOW() - INTERVAL '13 days', ARRAY['code-review'], NOW() - INTERVAL '12 days'),
('Documentación API', 'Actualizar documentación endpoints', true, false, NOW() - INTERVAL '13 days', '11111111-1111-1111-1111-111111111111', 'documentacion', 'low', NOW() - INTERVAL '12 days', ARRAY['docs'], NOW() - INTERVAL '11 days'),

-- Tareas de hace 1 semana (completadas)
('Configurar CI/CD', 'Pipeline de deployment', true, true, NOW() - INTERVAL '7 days', '11111111-1111-1111-1111-111111111111', 'devops', 'high', NOW() - INTERVAL '6 days', ARRAY['ci-cd', 'devops'], NOW() - INTERVAL '6 days'),
('Optimizar base de datos', 'Añadir índices y optimizar queries', true, false, NOW() - INTERVAL '7 days', '11111111-1111-1111-1111-111111111111', 'base de datos', 'medium', NOW() - INTERVAL '6 days', ARRAY['database'], NOW() - INTERVAL '5 days'),
('Test unitarios', 'Escribir tests para módulo users', true, false, NOW() - INTERVAL '6 days', '11111111-1111-1111-1111-111111111111', 'testing', 'medium', NOW() - INTERVAL '5 days', ARRAY['testing'], NOW() - INTERVAL '4 days'),

-- Tareas de hace 3 días (algunas completadas)
('Investigación libs', 'Evaluar librerías para gráficos', true, false, NOW() - INTERVAL '3 days', '11111111-1111-1111-1111-111111111111', 'investigacion', 'low', NOW() - INTERVAL '2 days', ARRAY['research'], NOW() - INTERVAL '2 days'),
('Reunión sprint', 'Daily standup', true, false, NOW() - INTERVAL '3 days', '11111111-1111-1111-1111-111111111111', 'trabajo', 'medium', NOW() - INTERVAL '2 days', ARRAY['meeting'], NOW() - INTERVAL '2 days'),

-- Tareas de hace 1 día (pendientes)
('Planificación próxima semana', 'Definir objetivos', false, false, NOW() - INTERVAL '1 day', '11111111-1111-1111-1111-111111111111', 'planificacion', 'medium', NOW() + INTERVAL '1 day', ARRAY['planning'], NOW()),
('Desarrollo feature X', 'Implementar nueva funcionalidad', false, true, NOW() - INTERVAL '1 day', '11111111-1111-1111-1111-111111111111', 'trabajo', 'high', NOW() + INTERVAL '3 days', ARRAY['development', 'feature'], NOW()),

-- Tareas de hace 5 días con diferentes horarios
('Tarea morning', 'Primera tarea del día', true, false, NOW() - INTERVAL '5 days', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '4 days', ARRAY['vacio'], NOW() - INTERVAL '4 days'),
('Tarea afternoon', 'Tarea de la tarde', true, false, NOW() - INTERVAL '5 days' + INTERVAL '6 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '4 days', ARRAY['vacio'], NOW() - INTERVAL '4 days'),
('Tarea night', 'Tarea nocturna', true, false, NOW() - INTERVAL '5 days' + INTERVAL '20 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '4 days', ARRAY['vacio'], NOW() - INTERVAL '4 days'),

-- Más tareas de hace 2 semanas para variety
('Tarea domingo', 'Completar義務', true, false, NOW() - INTERVAL '14 days' + INTERVAL '10 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '13 days', ARRAY['vacio'], NOW() - INTERVAL '13 days'),
('Tarea lunes', 'Reunión inicio semana', true, false, NOW() - INTERVAL '13 days' + INTERVAL '9 hours', '11111111-1111-1111-1111-111111111111', 'trabajo', 'medium', NOW() - INTERVAL '12 days', ARRAY['vacio'], NOW() - INTERVAL '12 days'),
('Tarea martes', 'Tarea martes', true, false, NOW() - INTERVAL '12 days' + INTERVAL '14 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '11 days', ARRAY['vacio'], NOW() - INTERVAL '11 days'),
('Tarea miércoles', 'Tarea miércoles', true, false, NOW() - INTERVAL '11 days' + INTERVAL '11 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'medium', NOW() - INTERVAL '10 days', ARRAY['vacio'], NOW() - INTERVAL '10 days'),
('Tarea jueves', 'Tarea jueves', true, false, NOW() - INTERVAL '10 days' + INTERVAL '15 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '9 days', ARRAY['vacio'], NOW() - INTERVAL '9 days'),
('Tarea viernes', 'Tarea viernes', true, false, NOW() - INTERVAL '9 days' + INTERVAL '16 hours', '11111111-1111-1111-1111-111111111111', 'trabajo', 'high', NOW() - INTERVAL '8 days', ARRAY['vacio'], NOW() - INTERVAL '8 days'),
('Tarea sábado', 'Tarea sábado', true, false, NOW() - INTERVAL '8 days' + INTERVAL '12 hours', '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() - INTERVAL '7 days', ARRAY['vacio'], NOW() - INTERVAL '7 days');
