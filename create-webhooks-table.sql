-- Crear tabla webhooks
CREATE TABLE IF NOT EXISTS taskflow.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON taskflow.webhooks(user_id);
