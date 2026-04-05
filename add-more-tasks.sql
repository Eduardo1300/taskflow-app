-- Añadir más tareas al usuario taskflow
INSERT INTO taskflow.tasks (title, description, completed, favorite, created_at, user_id, category, priority, due_date, tags, updated_at) VALUES 
('Terminar proyecto frontend', 'Completar todas las funcionalidades del proyecto React', false, true, NOW(), '11111111-1111-1111-1111-111111111111', 'trabajo', 'high', NOW() + INTERVAL '7 days', ARRAY['react', 'frontend'], NOW()),
('Revisar correos', 'Revisar bandeja de entrada y responder mensajes importantes', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'personal', 'medium', NOW() + INTERVAL '1 day', ARRAY['email'], NOW()),
('Reunión de equipo', 'Reunión semanal con el equipo de desarrollo', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'trabajo', 'high', NOW() + INTERVAL '2 days', ARRAY['reunion'], NOW()),
('Comprar groceries', 'Comprar comida para la semana', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'compras', 'low', NOW() + INTERVAL '3 days', ARRAY['compras'], NOW()),
('Ejercicio', 'Hacer ejercicio durante 30 minutos', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'salud', 'medium', NOW() + INTERVAL '1 day', ARRAY['salud', 'ejercicio'], NOW()),
('Estudiar TypeScript', 'Continuar con el curso de TypeScript avanzado', false, true, NOW(), '11111111-1111-1111-1111-111111111111', 'estudio', 'medium', NOW() + INTERVAL '5 days', ARRAY['typescript', 'estudio'], NOW()),
('Actualizar CV', 'Agregar nuevos proyectos al currículum', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'profesional', 'low', NOW() + INTERVAL '14 days', ARRAY['cv'], NOW()),
('Llamar a mamá', 'Llamar para ver cómo están', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() + INTERVAL '2 days', ARRAY['familia'], NOW()),
('Pagar facturas', 'Pagar servicios de luz, agua e internet', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'finanzas', 'high', NOW() + INTERVAL '5 days', ARRAY['finanzas'], NOW()),
('Leer libro', 'Continuar leyendo el libro de productividad', false, false, NOW(), '11111111-1111-1111-1111-111111111111', 'personal', 'low', NOW() + INTERVAL '7 days', ARRAY['lectura'], NOW());
