-- WS7: Add sender attribution to notifications for Thank You messages
-- sender_id: who sent the message (farmer or admin user)
-- sender_name: denormalised name stored at send time (avoids join on read)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sender_name TEXT;
