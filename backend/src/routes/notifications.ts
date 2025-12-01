import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Get notification preferences for a user
router.get('/preferences/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences exist, return defaults
      if (error.code === 'PGRST116') {
        return res.json({
          user_id: userId,
          email_notifications: false,
          discord_notifications: false,
          notify_on_toxic: true,
          notify_on_positive: true,
          notify_on_threshold: 10
        });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Update notification preferences
router.put('/preferences/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    email,
    discord_webhook,
    email_notifications,
    discord_notifications,
    notify_on_toxic,
    notify_on_positive,
    notify_on_threshold
  } = req.body;

  try {
    // Check if preferences exist
    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          email,
          discord_webhook,
          email_notifications,
          discord_notifications,
          notify_on_toxic,
          notify_on_positive,
          notify_on_threshold,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email,
          discord_webhook,
          email_notifications,
          discord_notifications,
          notify_on_toxic,
          notify_on_positive,
          notify_on_threshold
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Get notification history for a user
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Mark all notifications as read for a user
router.patch('/read-all/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ updated: data?.length || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Helper function to send Discord notification
async function sendDiscordNotification(webhookUrl: string, message: string, color: number = 0x6366f1) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '🎮 Karma Notification',
          description: message,
          color,
          timestamp: new Date().toISOString()
        }]
      })
    });

    return response.ok;
  } catch (err) {
    console.error('Discord notification failed:', err);
    return false;
  }
}

// Trigger notification (called by vote system)
router.post('/trigger', async (req, res) => {
  const { userId, type, message, metadata } = req.body;

  if (!userId || !type || !message) {
    return res.status(400).json({ error: 'userId, type, and message are required' });
  }

  try {
    // Get user preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Store notification in database
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        message,
        metadata,
        read: false
      })
      .select()
      .single();

    if (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // Send Discord notification if enabled
    if (prefs?.discord_notifications && prefs?.discord_webhook) {
      const color = type === 'positive' ? 0x10b981 : type === 'warning' ? 0xef4444 : 0x6366f1;
      await sendDiscordNotification(prefs.discord_webhook, message, color);
    }

    // TODO: Send email notification if enabled
    // if (prefs?.email_notifications && prefs?.email) {
    //   await sendEmailNotification(prefs.email, message);
    // }

    res.json({ success: true, notification });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

export default router;
