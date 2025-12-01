-- Phase 1 Database Migrations
-- Run these in your Supabase SQL Editor

-- 1. Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  discord_webhook TEXT,
  email_notifications BOOLEAN DEFAULT false,
  discord_notifications BOOLEAN DEFAULT false,
  notify_on_toxic BOOLEAN DEFAULT true,
  notify_on_positive BOOLEAN DEFAULT true,
  notify_on_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'positive', 'warning', 'info'
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 3. Update Row Level Security (RLS) policies

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own preferences
CREATE POLICY notification_preferences_select ON notification_preferences
  FOR SELECT USING (true);

-- Allow users to insert/update their own preferences
CREATE POLICY notification_preferences_insert ON notification_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY notification_preferences_update ON notification_preferences
  FOR UPDATE USING (true);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (true);

-- Allow system to insert notifications
CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (true);

-- 4. Add helpful functions

-- Function to clean up old notifications (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily (you can set this up in Supabase Dashboard > Database > Cron Jobs)
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications()');

COMMENT ON TABLE notification_preferences IS 'User notification preferences for email and Discord';
COMMENT ON TABLE notifications IS 'Notification history for users';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Removes notifications older than 90 days';
