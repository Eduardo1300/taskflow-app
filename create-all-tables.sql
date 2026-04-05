-- Crear todas las tablas faltantes
CREATE TABLE IF NOT EXISTS taskflow.task_collaborators (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    permission VARCHAR DEFAULT 'view',
    shared_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.collaboration_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id BIGINT NOT NULL,
    invited_email TEXT NOT NULL,
    invited_by UUID NOT NULL,
    status TEXT DEFAULT 'pending',
    permission TEXT DEFAULT 'view',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS taskflow.task_activity (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.ai_suggestions_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    task_id BIGINT,
    suggestion_type VARCHAR NOT NULL,
    suggested_value TEXT NOT NULL,
    confidence NUMERIC NOT NULL,
    was_applied BOOLEAN,
    feedback VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.notification_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type VARCHAR NOT NULL,
    events TEXT[] NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR NOT NULL,
    task_created BOOLEAN DEFAULT TRUE,
    task_completed BOOLEAN DEFAULT TRUE,
    task_reminder BOOLEAN DEFAULT TRUE,
    task_overdue BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    task_id BIGINT,
    integration_id UUID,
    external_event_id VARCHAR NOT NULL,
    event_data JSONB NOT NULL,
    sync_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.integration_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL,
    integration_type VARCHAR NOT NULL,
    external_id VARCHAR,
    status VARCHAR NOT NULL,
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.productivity_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    date DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    completion_rate NUMERIC,
    productivity_score INTEGER DEFAULT 0,
    overdue_tasks INTEGER,
    high_priority_completed INTEGER,
    avg_completion_time_hours NUMERIC,
    categories_used TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS taskflow.productivity_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    score INTEGER NOT NULL,
    data JSONB,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    key VARCHAR NOT NULL UNIQUE,
    permissions TEXT[] NOT NULL,
    rate_limit INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taskflow.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    trigger_config JSONB NOT NULL,
    actions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_executed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_collaborators_task_id ON taskflow.task_collaborators(task_id);
CREATE INDEX IF NOT EXISTS idx_task_collaborators_user_id ON taskflow.task_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON taskflow.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON taskflow.goals(completed);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON taskflow.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON taskflow.notifications(read);
