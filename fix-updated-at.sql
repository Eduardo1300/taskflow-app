-- Eliminar la columna updated_at y recriarla correctamente
ALTER TABLE profiles DROP COLUMN IF EXISTS updated_at CASCADE;

-- Recrear con valor por default correcto
ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Crear trigger para actualizar automáticamente
CREATE OR REPLACE FUNCTION update_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_timestamp_trigger ON profiles;

CREATE TRIGGER update_profiles_timestamp_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_timestamp();

-- Verificar
SELECT column_name, data_type, column_default FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;