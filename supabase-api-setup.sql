-- Crear tablas para API REST
-- Ejecutar en Supabase SQL Editor

-- Tabla para API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit INTEGER DEFAULT 60, -- requests per minute
    
    -- Índices para optimización
    CONSTRAINT valid_permissions CHECK (
        permissions <@ ARRAY['read', 'write', 'delete']::TEXT[]
    )
);

-- Tabla para Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url VARCHAR(2048) NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validación de eventos
    CONSTRAINT valid_events CHECK (
        events <@ ARRAY['task.created', 'task.updated', 'task.deleted', 'task.completed']::TEXT[]
    )
);

-- Tabla para Rate Limiting (opcional, para tracking)
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_api_key_id ON api_rate_limits(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON api_rate_limits(window_start);

-- RLS (Row Level Security) Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para api_keys
CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para webhooks
CREATE POLICY "Users can view their own webhooks" ON webhooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks" ON webhooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks" ON webhooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" ON webhooks
    FOR DELETE USING (auth.uid() = user_id);

-- Función para limpiar rate limits antiguos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM api_rate_limits 
    WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
