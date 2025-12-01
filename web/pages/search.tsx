import Navbar from '../components/Navbar';
import SearchInput from '../components/SearchInput';
import { useState } from 'react';

interface PlayerInfo {
  steam_id: string;
  username?: string;
  vibeScore?: number | null;
  tags?: string[];
  warning?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Search() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<PlayerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (q: string) => {
    setQuery(q);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Use the new lookup endpoint that searches Steam directly
      const lookupResponse = await fetch(`${BACKEND_URL}/api/lookup/${encodeURIComponent(q)}`);

      if (!lookupResponse.ok) {
        if (lookupResponse.status === 404) {
          setError('Steam user not found. Please check the Steam ID or username.');
        } else {
          throw new Error('Failed to lookup player');
        }
        return;
      }

      const data = await lookupResponse.json();

      setResult({
        steam_id: data.steam_id,
        username: data.username,
        vibeScore: data.vibeScore,
        tags: data.tags || [],
        warning: data.warning
      });
    } catch (e) {
      setError('Failed to fetch user info. Make sure backend is running.');
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score: number | null | undefined) => {
    if (!score) return '';
    if (score >= 4) return '';
    if (score >= 2.5) return 'medium';
    return 'low';
  };

  return (
    <>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Player Lookup
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
              Search for any Steam player to see their community vibe score
            </p>
          </div>

          <div className="search-container">
            <SearchInput onSearch={handleSearch} />

            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
                <p style={{ fontSize: '18px' }}>Searching for player...</p>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid var(--color-danger)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginTop: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚠️</div>
                <p style={{ color: 'var(--color-danger)', fontWeight: '600', fontSize: '16px' }}>{error}</p>
              </div>
            )}

            {!loading && !error && result && (
              <div className="result-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '0.5rem' }}>
                      {result.username || 'Unknown Player'}
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontFamily: 'monospace' }}>
                      Steam ID: {result.steam_id}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    VIBE SCORE (30 DAYS)
                  </p>
                  <div className={`vibe-score ${getScoreClass(result.vibeScore)}`}>
                    {result.vibeScore ? `${result.vibeScore}/5.0` : 'No ratings yet'}
                  </div>
                  {result.warning && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid var(--color-danger)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '24px' }}>🚨</span>
                      <span style={{ color: 'var(--color-danger)', fontWeight: '700', fontSize: '15px' }}>
                        {result.warning}
                      </span>
                    </div>
                  )}
                </div>

                {result.tags && result.tags.length > 0 && (
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                      COMMUNITY TAGS
                    </p>
                    <div className="tag-list">
                      {result.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`tag ${tag.toLowerCase() === 'toxic' || tag.toLowerCase() === 'rager' ? 'toxic' : tag.toLowerCase() === 'helpful' ? 'helpful' : ''}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && !result && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎮</div>
                <p style={{ fontSize: '18px', fontWeight: '500' }}>
                  Enter a Steam ID or username to get started
                </p>
                <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
                  See player vibe scores and community feedback instantly
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
