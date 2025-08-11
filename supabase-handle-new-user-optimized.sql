-- =============================================================================
-- FUNCIÓN OPTIMIZADA PARA CREAR PERFILES AUTOMÁTICAMENTE
-- =============================================================================
-- Esta función se ejecuta automáticamente cuando se crea un nuevo usuario
-- en auth.users y crea el perfil correspondiente en la tabla profiles.

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Crear función mejorada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Log para debugging (remover en producción)
    RAISE LOG 'Creating profile for user: %', NEW.email;
    
    -- Extraer nombre con fallback inteligente
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',           -- Nombre desde metadata
        NEW.raw_user_meta_data->>'name',                -- Nombre alternativo
        split_part(NEW.email, '@', 1),                  -- Parte del email antes de @
        'Usuario'                                       -- Fallback final
    );
    
    -- Insertar perfil con manejo de errores
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            trim(user_name),                            -- Limpiar espacios
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Profile created successfully for: %', NEW.email;
        
    EXCEPTION
        WHEN unique_violation THEN
            -- Si ya existe el perfil, no es un error crítico
            RAISE LOG 'Profile already exists for user: %', NEW.email;
            
        WHEN OTHERS THEN
            -- Log el error pero no fallar el registro
            RAISE LOG 'Error creating profile for %: %', NEW.email, SQLERRM;
            -- En desarrollo puedes usar RAISE EXCEPTION para debugging:
            -- RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- =============================================================================
-- TRIGGER PARA EJECUTAR LA FUNCIÓN
-- =============================================================================

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger optimizado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- FUNCIÓN PARA ACTUALIZAR PERFILES CUANDO CAMBIAN LOS METADATOS
-- =============================================================================

-- Función para sincronizar cambios en metadatos
CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    new_name TEXT;
BEGIN
    -- Solo actualizar si cambió el full_name en metadata
    IF (OLD.raw_user_meta_data->>'full_name') IS DISTINCT FROM (NEW.raw_user_meta_data->>'full_name') THEN
        
        new_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1),
            'Usuario'
        );
        
        -- Actualizar perfil existente
        UPDATE public.profiles 
        SET 
            full_name = trim(new_name),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        RAISE LOG 'Profile updated for user: %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para actualizaciones de metadata
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_user_metadata_update();

-- =============================================================================
-- VERIFICACIÓN DE LA CONFIGURACIÓN
-- =============================================================================

-- Verificar que las funciones se crearon correctamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE NOTICE '✅ Función handle_new_user creada correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Función handle_new_user no se creó';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created creado correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Trigger on_auth_user_created no se creó';
    END IF;
    
    RAISE NOTICE '🎉 Configuración de perfiles automáticos completada';
END $$;

-- =============================================================================
-- TESTING (OPCIONAL - Solo para verificar que funciona)
-- =============================================================================

-- Función para probar la creación de perfiles (solo para testing)
-- UNCOMMENT para probar:
/*
CREATE OR REPLACE FUNCTION test_profile_creation()
RETURNS void AS $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Contar perfiles antes
    SELECT COUNT(*) INTO test_count FROM profiles;
    RAISE NOTICE 'Perfiles antes del test: %', test_count;
    
    -- El test real sería crear un usuario desde la aplicación
    RAISE NOTICE '💡 Para probar, crea un usuario desde la aplicación React';
    RAISE NOTICE '💡 El perfil debería crearse automáticamente';
END $$;

-- Ejecutar test
-- SELECT test_profile_creation();
*/
