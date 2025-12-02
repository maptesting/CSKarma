import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

interface UserStats {
  vibeScore: number | null;
  totalVotesReceived: number;
  votesGiven: number;
  recentVotes: Array<{
    tag: string;
    created_at: string;
    reporter_id: string;
  }>;
  tagBreakdown: Record<string, number>;
}

interface GoodTeammate {
  userId: string;
  steamId: string;
  username: string;
  positiveTags: string[];
  totalPositiveVotes: number;
  lastPlayed: string;
  currentVibeScore: number | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [goodTeammates, setGoodTeammates] = useState<GoodTeammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      console.log('Dashboard user data:', userData);

      if (!userData.db_id) {
        setError('User account not properly configured. Please log in again.');
        setLoading(false);
        return;
      }

      setUser(userData);
      fetchUserStats(userData.db_id);
    } catch (e) {
      console.error('Failed to parse user data:', e);
      localStorage.removeItem('user');
      router.push('/');
    }
  }, []);

  const fetchUserStats = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch vibe score
      const vibeResponse = await fetch(`${BACKEND_URL}/api/votes/aggregate/${userId}`);
      const vibeData = await vibeResponse.json();

      // Fetch votes received
      const votesResponse = await fetch(`${BACKEND_URL}/api/votes/user/${userId}`);
      const votesData = await votesResponse.json();

      // Fetch votes given
      const givenResponse = await fetch(`${BACKEND_URL}/api/votes/by/${userId}`);
      const givenData = await givenResponse.json();

      // Fetch good teammates
      const teammatesResponse = await fetch(`${BACKEND_URL}/api/votes/good-teammates/${userId}`);
      const teammatesData = await teammatesResponse.json();

      // Calculate tag breakdown
      const tagBreakdown: Record<string, number> = {};
      votesData.forEach((vote: any) => {
        tagBreakdown[vote.tag] = (tagBreakdown[vote.tag] || 0) + 1;
      });

      setStats({
        vibeScore: vibeData.vibeScore,
        totalVotesReceived: votesData.length,
        votesGiven: givenData.length,
        recentVotes: votesData.slice(-10).reverse(),
        tagBreakdown
      });

      setGoodTeammates(teammatesData || []);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = (tag: string) => {
    const positiveSet = new Set(['Team Player', 'Clutch Master', 'Good Comms', 'Skilled', 'IGL Material', 'Entry Fragger']);
    const negativeSet = new Set(['Toxic', 'Rage Quit', 'Team Damage', 'Trolling', 'Cheater', 'AFK']);
    const neutralSet = new Set(['Silent', 'Eco Hunter']);
    const badSet = new Set(['Force Buyer', 'Lurk Only', 'Baiter']);

    if (positiveSet.has(tag)) return '#10b981';
    if (negativeSet.has(tag)) return '#ef4444';
    if (badSet.has(tag)) return '#f59e0b';
    if (neutralSet.has(tag)) return '#64748b';
    return '#f59e0b';
  };

  const getScoreClass = (score: number | null) => {
    if (!score) return '';
    if (score >= 4) return '';
    if (score >= 2.5) return 'medium';
    return 'low';
  };

  return (
    <>
      <Navbar user={user} />
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Dashboard
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
              Track your community reputation and activity
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📊</div>
              <p style={{ fontSize: '18px' }}>Loading your stats...</p>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid var(--color-danger)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--color-danger)', fontWeight: '600' }}>{error}</p>
            </div>
          )}

          {!loading && !error && stats && (
            <>
              {/* Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="result-card">
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    YOUR VIBE SCORE
                  </p>
                  <div className={`vibe-score ${getScoreClass(stats.vibeScore)}`}>
                    {stats.vibeScore ? `${stats.vibeScore}/5.0` : 'No ratings yet'}
                  </div>
                </div>

                <div className="result-card">
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    VOTES RECEIVED
                  </p>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {stats.totalVotesReceived}
                  </div>
                </div>

                <div className="result-card">
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    VOTES GIVEN
                  </p>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {stats.votesGiven}
                  </div>
                </div>
              </div>

              {/* Tag Breakdown */}
              {Object.keys(stats.tagBreakdown).length > 0 && (
                <div className="result-card" style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Community Tags Received
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {Object.entries(stats.tagBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([tag, count]) => (
                        <div
                          key={tag}
                          style={{
                            background: getTagColor(tag) + '20',
                            border: `2px solid ${getTagColor(tag)}`,
                            borderRadius: '10px',
                            padding: '1rem 1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: '120px'
                          }}
                        >
                          <div style={{ fontSize: '32px', fontWeight: '800', color: getTagColor(tag) }}>
                            {count}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)', marginTop: '0.5rem' }}>
                            {tag}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Good Teammates Section */}
              {goodTeammates.length > 0 && (
                <div className="result-card" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--color-text)' }}>
                        Good Teammates
                      </h2>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        Players you've positively rated - potential stack partners
                      </p>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>{goodTeammates.length}</span>
                      <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>found</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {goodTeammates.slice(0, 12).map((teammate, idx) => (
                      <div
                        key={teammate.userId}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '10px',
                          padding: '1.25rem',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        className="teammate-card"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                              {teammate.username}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                              {teammate.steamId}
                            </div>
                          </div>
                          {teammate.currentVibeScore && (
                            <div style={{
                              background: teammate.currentVibeScore >= 4 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: teammate.currentVibeScore >= 4 ? '#10b981' : '#f59e0b',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '700'
                            }}>
                              {teammate.currentVibeScore.toFixed(1)}★
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {teammate.positiveTags.map(tag => (
                            <span
                              key={tag}
                              style={{
                                background: getTagColor(tag) + '20',
                                color: getTagColor(tag),
                                padding: '0.25rem 0.625rem',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          <span>+{teammate.totalPositiveVotes} endorsements</span>
                          <span>Last: {new Date(teammate.lastPlayed).toLocaleDateString()}</span>
                        </div>

                        <a
                          href={`https://steamcommunity.com/profiles/${teammate.steamId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            marginTop: '0.75rem',
                            padding: '0.5rem',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease'
                          }}
                          className="teammate-steam-link"
                        >
                          Add on Steam →
                        </a>
                      </div>
                    ))}
                  </div>

                  {goodTeammates.length > 12 && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                      Showing 12 of {goodTeammates.length} good teammates
                    </div>
                  )}
                </div>
              )}

              {/* Recent Votes */}
              {stats.recentVotes.length > 0 && (
                <div className="result-card">
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Recent Feedback (Last 10)
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stats.recentVotes.map((vote, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(99, 102, 241, 0.05)',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            background: getTagColor(vote.tag) + '30',
                            color: getTagColor(vote.tag),
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}
                        >
                          {vote.tag}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                          {new Date(vote.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.totalVotesReceived === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎮</div>
                  <p style={{ fontSize: '18px', fontWeight: '500' }}>
                    No feedback yet!
                  </p>
                  <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
                    Play more matches to get community ratings
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
