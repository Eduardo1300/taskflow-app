-- Create integration_sync_history table for tracking sync events
CREATE TABLE IF NOT EXISTS integration_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success' or 'error'
  external_id VARCHAR(255), -- ID from the external service (Google Calendar event ID, Outlook event ID, etc.)
  error_message TEXT, -- Error message if status is 'error'
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for better query performance
  CONSTRAINT valid_status CHECK (status IN ('success', 'error'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_integration_sync_history_integration_id 
  ON integration_sync_history(integration_id);

CREATE INDEX IF NOT EXISTS idx_integration_sync_history_synced_at 
  ON integration_sync_history(synced_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_sync_history_status 
  ON integration_sync_history(status);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE integration_sync_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own integration sync history
CREATE POLICY integration_sync_history_user_policy 
  ON integration_sync_history 
  FOR SELECT 
  USING (
    integration_id IN (
      SELECT id FROM integrations WHERE user_id = auth.uid()
    )
  );

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_sync_history TO authenticated;
