-- Ver estructura de la tabla profiles
\d profiles

-- Ver perfiles en la BD
SELECT * FROM profiles;

-- Ver columnas
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';