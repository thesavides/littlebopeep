-- Workstream 7: Add message_text to notifications for Thank You messages
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS message_text TEXT;
