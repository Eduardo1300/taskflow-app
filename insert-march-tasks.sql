-- Insertar muchas tareas para marzo 2026
INSERT INTO tasks (title, description, completed, created_at, user_id, category, priority, due_date, tags, updated_at)
VALUES 
    -- Trabajo
    ('Reportes mensuales de febrero', 'Compilar y enviar reportes mensuales', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'high', '2026-03-05 09:00:00'::timestamp with time zone, ARRAY['reportes', 'mensual', 'urgente'], NOW()),
    ('Reunión con stakeholders', 'Discutir objetivos Q1 2026', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'high', '2026-03-10 14:00:00'::timestamp with time zone, ARRAY['reunión', 'stakeholders', 'importante'], NOW()),
    ('Revisar propuestas de proyectos', 'Evaluar 5 nuevas propuestas', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'medium', '2026-03-12 10:00:00'::timestamp with time zone, ARRAY['proyectos', 'evaluación'], NOW()),
    ('Actualizar documentación técnica', 'Documentar cambios en arquitectura', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'medium', '2026-03-15 15:30:00'::timestamp with time zone, ARRAY['documentación', 'técnica'], NOW()),
    ('Code review del equipo', 'Revisar pull requests pendientes', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'high', '2026-03-08 11:00:00'::timestamp with time zone, ARRAY['código', 'review', 'desarrollo'], NOW()),
    ('Implementar nuevas features', 'Desarrollar 3 features de roadmap', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'high', '2026-03-20 09:00:00'::timestamp with time zone, ARRAY['desarrollo', 'features', 'roadmap'], NOW()),
    ('Optimizar performance base de datos', 'Mejorar queries lentos', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'medium', '2026-03-18 10:00:00'::timestamp with time zone, ARRAY['optimización', 'base datos', 'performance'], NOW()),
    ('Capacitación al equipo', 'Entrenamiento en nueva tecnología', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Trabajo', 'medium', '2026-03-25 14:00:00'::timestamp with time zone, ARRAY['capacitación', 'entrenamiento', 'equipo'], NOW()),
    
    -- Personal
    ('Planificar viaje a playa', 'Arreglar reservas y transporte', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Personal', 'medium', '2026-03-02 16:00:00'::timestamp with time zone, ARRAY['viaje', 'playa', 'vacaciones'], NOW()),
    ('Organizar armario', 'Clasificar y donar ropa', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Personal', 'low', '2026-03-07 19:00:00'::timestamp with time zone, ARRAY['organización', 'casa'], NOW()),
    ('Renovar pasaporte', 'Tramitar actualización de documentos', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Personal', 'high', '2026-03-01 09:00:00'::timestamp with time zone, ARRAY['documentos', 'trámites'], NOW()),
    ('Cena familiar', 'Organizar almuerzo con familia', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Personal', 'low', '2026-03-22 18:30:00'::timestamp with time zone, ARRAY['familia', 'evento', 'social'], NOW()),
    ('Limpiar casa', 'Limpieza profunda semanal', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Personal', 'low', '2026-03-14 15:00:00'::timestamp with time zone, ARRAY['limpieza', 'casa', 'mantenimiento'], NOW()),
    
    -- Estudio
    ('Estudiar para certificación AWS', 'Completar 3 módulos de curso', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Estudio', 'high', '2026-03-31 19:00:00'::timestamp with time zone, ARRAY['certificación', 'aws', 'cloud'], NOW()),
    ('Leer libro de arquitectura', 'Avanzar 100 páginas', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Estudio', 'medium', '2026-03-20 20:00:00'::timestamp with time zone, ARRAY['lectura', 'arquitectura'], NOW()),
    ('Hacer ejercicios de inglés', 'Prácticar conversación 3 veces', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Estudio', 'medium', '2026-03-15 18:00:00'::timestamp with time zone, ARRAY['idiomas', 'inglés', 'práctica'], NOW()),
    ('Investigar frameworks JavaSCript', 'Comparar React, Vue, Svelte', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Estudio', 'medium', '2026-03-12 19:30:00'::timestamp with time zone, ARRAY['javascript', 'frameworks', 'investigación'], NOW()),
    
    -- Salud
    ('Hacer ejercicio - Lunes', 'Rutina de 45 minutos', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Salud', 'high', '2026-03-03 07:00:00'::timestamp with time zone, ARRAY['ejercicio', 'rutina', 'fitness'], NOW()),
    ('Hacer ejercicio - Miércoles', 'Rutina de 45 minutos', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Salud', 'high', '2026-03-05 07:00:00'::timestamp with time zone, ARRAY['ejercicio', 'rutina', 'fitness'], NOW()),
    ('Hacer ejercicio - Viernes', 'Rutina de 45 minutos', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Salud', 'high', '2026-03-07 07:00:00'::timestamp with time zone, ARRAY['ejercicio', 'rutina', 'fitness'], NOW()),
    ('Cita con doctor', 'Checkup anual', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Salud', 'medium', '2026-03-18 10:30:00'::timestamp with time zone, ARRAY['médico', 'salud', 'cita'], NOW()),
    ('Meditar 10 minutos diarios', 'Práctica de meditación', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Salud', 'medium', '2026-03-10 20:00:00'::timestamp with time zone, ARRAY['meditación', 'bienestar', 'mindfulness'], NOW()),
    ('Comprar vitaminas', 'Vitamina D y magnesio', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Salud', 'low', '2026-03-06 18:00:00'::timestamp with time zone, ARRAY['suplementos', 'salud', 'compras'], NOW()),
    
    -- Compras
    ('Comprar ropa de primavera', 'Actualizar guardarropa', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Compras', 'low', '2026-03-09 15:00:00'::timestamp with time zone, ARRAY['ropa', 'moda', 'compras'], NOW()),
    ('Hacer compras de supermercado', 'Alimentos y artículos básicos', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Compras', 'low', '2026-03-04 18:00:00'::timestamp with time zone, ARRAY['supermercado', 'compras', 'alimentos'], NOW()),
    ('Cambiar aceite del coche', 'Mantenimiento preventivo', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Compras', 'medium', '2026-03-17 10:00:00'::timestamp with time zone, ARRAY['coche', 'mantenimiento', 'auto'], NOW()),
    ('Comprar regalos para cumpleaños', 'Preparar regalos de marzo', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Compras', 'medium', '2026-03-14 14:00:00'::timestamp with time zone, ARRAY['regalos', 'cumpleaños', 'compras'], NOW()),
    
    -- Viajes
    ('Reservar hotel en playa', 'Buscar mejores precios', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Viajes', 'high', '2026-03-02 11:00:00'::timestamp with time zone, ARRAY['viaje', 'hotel', 'reserva'], NOW()),
    ('Comprar boletos de avión', 'Ida y vuelta', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Viajes', 'high', '2026-03-01 09:00:00'::timestamp with time zone, ARRAY['vuelo', 'boletos', 'viaje'], NOW()),
    ('Planificar itinerario del viaje', 'Día a día del viaje', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Viajes', 'medium', '2026-03-03 19:00:00'::timestamp with time zone, ARRAY['planificación', 'itinerario', 'viaje'], NOW()),
    ('Empacar maleta', 'Preparar todo lo necesario', FALSE, NOW(), '550e8400-e29b-41d4-a716-446655440000', 'Viajes', 'medium', '2026-03-15 18:00:00'::timestamp with time zone, ARRAY['empaque', 'viaje', 'preparación'], NOW());

-- Verificar que se insertaron las tareas
SELECT COUNT(*) as total_tareas, COUNT(DISTINCT tags) as tareas_con_tags FROM tasks WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
