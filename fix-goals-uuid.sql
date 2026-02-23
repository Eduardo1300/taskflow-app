-- Crear extensión uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ver el estado actual de la columna id
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' AND column_name = 'id';

-- Establecer el DEFAULT correctamente
ALTER TABLE goals ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verificar nuevamente
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' AND column_name = 'id';
