/*
# Phase 15: Audit Logging Table

1. New Table
- `audit_logs`: Tracks security-relevant events
  - `id` (uuid, primary key)
  - `event` (text - event type)
  - `user_id` (uuid, FK to auth.users, nullable)
  - `ip_address` (text)
  - `user_agent` (text)
  - `path` (text - request path)
  - `method` (text - HTTP method)
  - `status_code` (integer)
  - `details` (jsonb - additional context)
  - `created_at` (timestamptz)

2. Security
- Enable RLS with admin-only access.
- No insert policy from client (only via service role / edge functions).
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  path TEXT,
  method TEXT,
  status_code INTEGER,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "select_audit_as_admin" ON audit_logs;
CREATE POLICY "select_audit_as_admin" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- No insert from client - only service role / edge functions
-- The middleware uses the service role key via createServerClient
