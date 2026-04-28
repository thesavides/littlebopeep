-- Migration 035: Offline capture metadata
-- Adds columns to sheep_reports that distinguish reports captured offline
-- from reports submitted directly online, and records device metadata.

-- Flag: true when the report was captured offline and later synced
ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS captured_offline BOOLEAN NOT NULL DEFAULT FALSE;

-- Unique device identifier (UUID stored in localStorage per device).
-- Allows correlating multiple reports from the same device across sessions.
ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS device_id TEXT DEFAULT NULL;

-- Full navigator.userAgent string captured at submit / sync time.
ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT NULL;

-- Partial index for fast admin queries on offline-only reports
CREATE INDEX IF NOT EXISTS idx_sheep_reports_captured_offline
  ON sheep_reports (captured_offline)
  WHERE captured_offline = TRUE;
