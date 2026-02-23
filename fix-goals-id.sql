-- Crear extensión uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Arreglar la columna id de goals para generar UUIDs automáticamente
ALTER TABLE goals ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verificar
SELECT column_name, data_type, column_default FROM information_schema.columns 
WHERE table_name = 'goals' AND column_name = 'id';