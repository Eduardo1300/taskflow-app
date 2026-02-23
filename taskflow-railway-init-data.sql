-- =====================================================
-- TASKFLOW - DATOS INICIALES PARA RAILWAY
-- =====================================================
-- Este script inserta datos de prueba y usuarios predeterminados

-- =====================================================
-- 1. CREAR USUARIO DE PRUEBA (Para login)
-- =====================================================

INSERT INTO profiles (id, email, full_name, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@taskflow.com', 'Admin TaskFlow', NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'prueba@gmail.com', 'Usuario Prueba', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREAR CATEGORÍAS POR DEFECTO
-- =====================================================

INSERT INTO categories (name, color, user_id, created_at)
VALUES 
    ('Trabajo', '#8B5CF6', '550e8400-e29b-41d4-a716-446655440000', NOW()),
    ('Personal', '#06B6D4', '550e8400-e29b-41d4-a716-446655440000', NOW()),
    ('Estudio', '#10B981', '550e8400-e29b-41d4-a716-446655440000', NOW()),
    ('Salud', '#F59E0B', '550e8400-e29b-41d4-a716-446655440000', NOW()),
    ('Compras', '#EF4444', '550e8400-e29b-41d4-a716-446655440000', NOW()),
    ('Viajes', '#EC4899', '550e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CREAR TAREAS DE EJEMPLO
-- =====================================================

INSERT INTO tasks (title, description, completed, created_at, user_id, category, priority, due_date)
VALUES 
    (
        'Configurar TaskFlow en Railway',
        'Migrar la base de datos de Render a Railway y verificar que todo funciona correctamente',
        FALSE,
        NOW(),
        '550e8400-e29b-41d4-a716-446655440000',
        'Trabajo',
        'high',
        NOW() + INTERVAL '2 days'
    ),
    (
        'Revisar panel de analytics',
        'Verificar que todas las métricas se muestran correctamente en el dashboard',
        FALSE,
        NOW(),
        '550e8400-e29b-41d4-a716-446655440000',
        'Trabajo',
        'medium',
        NOW() + INTERVAL '3 days'
    ),
    (
        'Actualizar documentación',
        'Documentar los cambios de la migración a Railway',
        FALSE,
        NOW(),
        '550e8400-e29b-41d4-a716-446655440000',
        'Trabajo',
        'medium',
        NOW() + INTERVAL '5 days'
    ),
    (
        'Hacer ejercicio',
        'Hacer 30 minutos de cardio',
        FALSE,
        NOW(),
        '550e8400-e29b-41d4-a716-446655440000',
        'Salud',
        'low',
        NOW() + INTERVAL '1 day'
    ),
    (
        'Comprar provisiones',
        'Hacer compras en el supermercado',
        FALSE,
        NOW(),
        '550e8400-e29b-41d4-a716-446655440000',
        'Compras',
        'low',
        NOW() + INTERVAL '2 days'
    )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. CREAR NOTIFICACIÓN DE BIENVENIDA
-- =====================================================

INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440000',
        '¡Bienvenido a TaskFlow!',
        'Tu cuenta ha sido configurada correctamente en Railway. ¡Comienza a organizar tus tareas!',
        'info',
        FALSE,
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CREAR PREFERENCIAS DE EMAIL
-- =====================================================

INSERT INTO email_preferences (id, user_id, email, task_created, task_completed, task_reminder, task_overdue, created_at)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440000',
        'admin@taskflow.com',
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. CREAR MÉTRICAS INICIALES
-- =====================================================

INSERT INTO productivity_metrics (id, user_id, date, tasks_created, tasks_completed, completion_rate, productivity_score, created_at)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440000',
        CURRENT_DATE,
        5,
        0,
        0,
        0,
        NOW()
    )
ON CONFLICT (id, date) DO NOTHING;

-- =====================================================
-- 7. VERIFICAR DATOS INSERTADOS
-- =====================================================

SELECT '=== VERIFICACIÓN DE DATOS INICIALES ===' as info;

SELECT 
    (SELECT count(*) FROM profiles) as "Usuarios creados",
    (SELECT count(*) FROM categories) as "Categorías creadas",
    (SELECT count(*) FROM tasks) as "Tareas creadas",
    (SELECT count(*) FROM notifications) as "Notificaciones creadas",
    (SELECT count(*) FROM email_preferences) as "Preferencias email",
    (SELECT count(*) FROM productivity_metrics) as "Métricas creadas";

-- =====================================================
-- CREDENCIALES DE PRUEBA
-- =====================================================
-- Email: admin@taskflow.com
-- Contraseña: admin123 (verifica en tu frontend cómo se valida)
-- 
-- Usuario Alternativo:
-- Email: prueba@gmail.com
-- Contraseña: 12345678

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
