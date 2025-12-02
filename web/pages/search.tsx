import Navbar from '../components/Navbar';
import SearchInput from '../components/SearchInput';
import { useState } from 'react';

interface PlayerInfo {
  steam_id?: string;
  faceit_id?: string;
  username?: string;
  vibeScore?: number | null;
  tags?: string[];
  warning?: string;
  platform?: 'steam' | 'faceit';
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
      let searchQuery = q.trim();
      let platform: 'steam' | 'faceit' = 'steam';

      // Check if it's a Faceit URL or ID
      const faceitMatch = searchQuery.match(/faceit\.com\/[^\/]+\/players\/([^\/\?#]+)/i);

      if (faceitMatch) {
        searchQuery = faceitMatch[1];
        platform = 'faceit';
        console.log('Extracted Faceit ID:', searchQuery);
      } else if (searchQuery.toLowerCase().startsWith('faceit:')) {
        // Allow users to prefix with "faceit:" to search Faceit
        searchQuery = searchQuery.substring(7).trim();
        platform = 'faceit';
        console.log('Faceit search:', searchQuery);
      } else {
        // Steam URL parsing
        const vanityMatch = searchQuery.match(/steamcommunity\.com\/id\/([^\/\?#]+)/i);
        const profileMatch = searchQuery.match(/steamcommunity\.com\/profiles\/(\d+)/i);

        if (vanityMatch) {
          searchQuery = vanityMatch[1];
          console.log('Extracted vanity name:', searchQuery);
        } else if (profileMatch) {
          searchQuery = profileMatch[1];
          console.log('Extracted Steam ID:', searchQuery);
        } else if (searchQuery.includes('steamcommunity.com')) {
          setError('Could not parse Steam profile URL. Please copy just the Steam ID or username instead.');
          setLoading(false);
          return;
        }
      }

      console.log('Final search query:', searchQuery, 'Platform:', platform);

      // Use appropriate lookup endpoint based on platform
      const endpoint = platform === 'faceit'
        ? `${BACKEND_URL}/api/lookup/faceit/${encodeURIComponent(searchQuery)}`
        : `${BACKEND_URL}/api/lookup/${encodeURIComponent(searchQuery)}`;

      const lookupResponse = await fetch(endpoint);

      if (!lookupResponse.ok) {
        if (lookupResponse.status === 404) {
          setError(`${platform === 'faceit' ? 'Faceit' : 'Steam'} user not found. Please check the ${platform === 'faceit' ? 'Faceit ID' : 'Steam ID or username'}.`);
        } else {
          throw new Error('Failed to lookup player');
        }
        return;
      }

      const data = await lookupResponse.json();

      setResult({
        steam_id: data.steam_id,
        faceit_id: data.faceit_id,
        username: data.username,
        vibeScore: data.vibeScore,
        tags: data.tags || [],
        warning: data.warning,
        platform
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
              Search for any Steam or Faceit player to see their community vibe score
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
                      {result.platform === 'faceit' ? `Faceit ID: ${result.faceit_id}` : `Steam ID: ${result.steam_id}`}
                    </p>
                    {result.platform === 'faceit' && (
                      <span style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #FF5500 0%, #FF7700 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        marginTop: '8px'
                      }}>
                        FACEIT
                      </span>
                    )}
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
                  Enter a Steam ID, Faceit ID, or username to get started
                </p>
                <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
                  See player vibe scores and community feedback instantly
                </p>
                <p style={{ fontSize: '12px', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                  Tip: Prefix Faceit usernames with "faceit:" (e.g., faceit:s1mple)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
