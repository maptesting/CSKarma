import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

interface NotificationPreferences {
  email?: string;
  discord_webhook?: string;
  email_notifications: boolean;
  discord_notifications: boolean;
  notify_on_toxic: boolean;
  notify_on_positive: boolean;
  notify_on_threshold: number;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Notifications() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: false,
    discord_notifications: false,
    notify_on_toxic: true,
    notify_on_positive: true,
    notify_on_threshold: 10
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchPreferences(userData.db_id);
      fetchNotifications(userData.db_id);
    } catch (e) {
      console.error('Failed to parse user data:', e);
      localStorage.removeItem('user');
      router.push('/');
    }
  }, []);

  const fetchPreferences = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/preferences/${userId}`);
      const data = await response.json();
      setPreferences(data);
    } catch (e) {
      console.error('Failed to fetch preferences:', e);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/history/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/preferences/${user.db_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setMessage('✅ Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error('Failed to save preferences:', e);
      setMessage('❌ Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const markAllRead = async () => {
    if (!user) return;

    try {
      await fetch(`${BACKEND_URL}/api/notifications/read-all/${user.db_id}`, {
        method: 'PATCH'
      });
      fetchNotifications(user.db_id);
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Notifications
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
              Manage your notification preferences
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
          )}

          {!loading && (
            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr', maxWidth: '1200px', margin: '0 auto' }}>

              {/* Notification Preferences */}
              <div className="result-card">
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                  Notification Settings
                </h2>

                {/* Discord Settings */}
                <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>
                    🎮 Discord Notifications
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.discord_notifications}
                      onChange={(e) => setPreferences({ ...preferences, discord_notifications: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '16px' }}>Enable Discord notifications</span>
                  </label>
                  {preferences.discord_notifications && (
                    <div style={{ marginLeft: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '600' }}>
                        Discord Webhook URL
                      </label>
                      <input
                        type="url"
                        value={preferences.discord_webhook || ''}
                        onChange={(e) => setPreferences({ ...preferences, discord_webhook: e.target.value })}
                        placeholder="https://discord.com/api/webhooks/..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '2px solid rgba(99, 102, 241, 0.2)',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                          Learn how to create a webhook
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                {/* Email Settings */}
                <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>
                    📧 Email Notifications (Coming Soon)
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', cursor: 'not-allowed', opacity: 0.5 }}>
                    <input
                      type="checkbox"
                      checked={preferences.email_notifications}
                      disabled
                      style={{ width: '20px', height: '20px', cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: '16px' }}>Enable email notifications (Coming Soon)</span>
                  </label>
                </div>

                {/* Notification Triggers */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>
                    ⚙️ What to notify me about
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.notify_on_positive}
                      onChange={(e) => setPreferences({ ...preferences, notify_on_positive: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '16px' }}>Positive ratings (Helpful, Team Player, etc.)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.notify_on_toxic}
                      onChange={(e) => setPreferences({ ...preferences, notify_on_toxic: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '16px' }}>Negative ratings (Toxic, Cheater, etc.)</span>
                  </label>
                </div>

                {message && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: message.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.includes('✅') ? '#10b981' : '#ef4444',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {message}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '16px', fontWeight: '700' }}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>

              {/* Notification History */}
              <div className="result-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
                    Recent Notifications
                  </h2>
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={markAllRead}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '14px' }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔔</div>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          background: notif.read ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.15)',
                          border: `2px solid ${notif.read ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.3)'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: notif.read ? 'normal' : '700', marginBottom: '0.25rem' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {new Date(notif.created_at).toLocaleString()}
                          </div>
                        </div>
                        {!notif.read && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            marginLeft: '1rem'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
