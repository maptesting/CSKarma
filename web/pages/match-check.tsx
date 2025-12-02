import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

interface PlayerResult {
  steam_id: string;
  username: string;
  vibeScore: number | null;
  warning?: string;
  tags?: string[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function MatchCheck() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [steamIds, setSteamIds] = useState('');
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Parse Steam IDs from input (comma or newline separated)
      const ids = steamIds
        .split(/[,\n]/)
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (ids.length === 0) {
        setError('Please enter at least one Steam ID or profile URL');
        setLoading(false);
        return;
      }

      if (ids.length > 10) {
        setError('Maximum 10 players at a time');
        setLoading(false);
        return;
      }

      // Extract Steam IDs from URLs if needed
      const cleanIds = ids.map(id => {
        const vanityMatch = id.match(/steamcommunity\.com\/id\/([^\/\?#]+)/i);
        const profileMatch = id.match(/steamcommunity\.com\/profiles\/(\d+)/i);

        if (vanityMatch) return vanityMatch[1];
        if (profileMatch) return profileMatch[1];
        return id;
      });

      // Fetch all players
      const playerPromises = cleanIds.map(async (steamId) => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/lookup/${encodeURIComponent(steamId)}`);
          if (!response.ok) return null;
          const data = await response.json();
          return {
            steam_id: data.steam_id,
            username: data.username,
            vibeScore: data.vibeScore,
            warning: data.warning,
            tags: data.tags || []
          };
        } catch (e) {
          console.error(`Failed to fetch ${steamId}:`, e);
          return null;
        }
      });

      const playerResults = await Promise.all(playerPromises);
      const validResults = playerResults.filter(r => r !== null) as PlayerResult[];

      setResults(validResults);

      // Show notification for dangerous players
      const dangerousPlayers = validResults.filter(p => p.warning || (p.vibeScore && p.vibeScore < 2.5));
      if (dangerousPlayers.length > 0) {
        const message = `⚠️ WARNING: ${dangerousPlayers.length} player(s) with negative reputation detected!`;
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('CommSafe Match Alert', {
            body: message,
            icon: '/favicon.ico'
          });
        }
      }

    } catch (e) {
      console.error('Match check error:', e);
      setError('Failed to check players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score >= 4) return '#10b981';
    if (score >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <>
      <Navbar user={user} />
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ⚡ Match Safety Check
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Check your teammates before the match starts
            </p>
            <button
              onClick={requestNotificationPermission}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                border: '2px solid var(--color-primary)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🔔 Enable Browser Notifications
            </button>
          </div>

          <div className="result-card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem' }}>
              Enter Player Steam IDs or Profile URLs
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Enter up to 10 Steam IDs or profile URLs (one per line or comma-separated)
            </p>
            <textarea
              value={steamIds}
              onChange={(e) => setSteamIds(e.target.value)}
              placeholder="76561198012345678&#10;https://steamcommunity.com/id/username&#10;76561198087654321"
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem',
                color: '#ef4444'
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCheck}
              disabled={loading || !steamIds.trim()}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '1rem',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              {loading ? 'Checking Players...' : '🔍 Check Players'}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="result-card">
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                Match Safety Report
              </h2>

              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                      {results.filter(r => r.vibeScore && r.vibeScore >= 4).length}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Safe Players</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>
                      {results.filter(r => r.vibeScore && r.vibeScore >= 2.5 && r.vibeScore < 4).length}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Caution</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444' }}>
                      {results.filter(r => r.warning || (r.vibeScore && r.vibeScore < 2.5)).length}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>High Risk</div>
                  </div>
                </div>
              </div>

              {results.map((player, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    background: player.warning ? 'rgba(239, 68, 68, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                    border: `2px solid ${player.warning ? '#ef4444' : 'rgba(99, 102, 241, 0.2)'}`,
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.25rem' }}>
                        {player.username || 'Unknown Player'}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {player.steam_id}
                      </p>
                    </div>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: '800',
                      color: getScoreColor(player.vibeScore)
                    }}>
                      {player.vibeScore ? `${player.vibeScore}/5` : 'N/A'}
                    </div>
                  </div>

                  {player.warning && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid #ef4444',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ fontSize: '18px', marginRight: '0.5rem' }}>⚠️</span>
                      <span style={{ color: '#ef4444', fontWeight: '700' }}>{player.warning}</span>
                    </div>
                  )}

                  {player.tags && player.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {player.tags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            background: tag === 'Toxic' || tag === 'Cheater' || tag === 'Rager' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: tag === 'Toxic' || tag === 'Cheater' || tag === 'Rager' ? '#ef4444' : '#10b981',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
