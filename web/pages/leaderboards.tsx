import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface TopPlayer {
  rank: number;
  steam_id: string;
  username: string;
  vibeScore: number;
  totalVotes: number;
}

interface TopVoter {
  rank: number;
  steam_id: string;
  username: string;
  votesGiven: number;
}

interface Stats {
  totalUsers: number;
  totalVotes: number;
  votesLast30Days: number;
  topTags: Array<{ tag: string; count: number }>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Leaderboards() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'voters' | 'stats'>('players');
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [topVoters, setTopVoters] = useState<TopVoter[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'players') {
        const response = await fetch(`${BACKEND_URL}/api/leaderboards/top-players?limit=50`);
        const data = await response.json();
        setTopPlayers(data);
      } else if (activeTab === 'voters') {
        const response = await fetch(`${BACKEND_URL}/api/leaderboards/top-voters?limit=50`);
        const data = await response.json();
        setTopVoters(data);
      } else {
        const response = await fetch(`${BACKEND_URL}/api/leaderboards/stats`);
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return '#10b981';
    if (score >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const getTagColor = (tag: string) => {
    const positiveSet = new Set(['Helpful', 'Team Player', 'Friendly', 'Skilled']);
    const negativeSet = new Set(['Toxic', 'Rager', 'Cheater', 'AFK']);

    if (positiveSet.has(tag)) return '#10b981';
    if (negativeSet.has(tag)) return '#ef4444';
    return '#f59e0b';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <>
      <Navbar user={user} />
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏆 Leaderboards
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
              Top rated players and most active community members
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              className={activeTab === 'players' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('players')}
              style={{ minWidth: '150px' }}
            >
              Top Players
            </button>
            <button
              className={activeTab === 'voters' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('voters')}
              style={{ minWidth: '150px' }}
            >
              Top Voters
            </button>
            <button
              className={activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('stats')}
              style={{ minWidth: '150px' }}
            >
              Statistics
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📊</div>
              <p style={{ fontSize: '18px' }}>Loading leaderboard...</p>
            </div>
          )}

          {/* Top Players Tab */}
          {!loading && activeTab === 'players' && (
            <div className="result-card">
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                Highest Vibe Scores (Last 30 Days)
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Players with minimum 5 votes
              </p>
              {topPlayers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>No players qualify yet. Keep voting!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topPlayers.map((player) => (
                    <div
                      key={player.steam_id}
                      style={{
                        background: player.rank <= 3 ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)' : 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: player.rank <= 3 ? '2px solid rgba(251, 191, 36, 0.3)' : 'none',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '200px' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900', minWidth: '60px', textAlign: 'center' }}>
                          {getRankEmoji(player.rank)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '0.25rem' }}>
                            {player.username}
                          </div>
                          <a
                            href={`https://steamcommunity.com/profiles/${player.steam_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}
                          >
                            View Steam Profile →
                          </a>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            VIBE SCORE
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: '800', color: getScoreColor(player.vibeScore) }}>
                            {player.vibeScore}/5.0
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            VOTES
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {player.totalVotes}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top Voters Tab */}
          {!loading && activeTab === 'voters' && (
            <div className="result-card">
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                Most Active Community Members (Last 30 Days)
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Thank you for making the community safer!
              </p>
              {topVoters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>No votes recorded yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topVoters.map((voter) => (
                    <div
                      key={voter.steam_id}
                      style={{
                        background: voter.rank <= 3 ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' : 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: voter.rank <= 3 ? '2px solid rgba(139, 92, 246, 0.3)' : 'none',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '200px' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900', minWidth: '60px', textAlign: 'center' }}>
                          {getRankEmoji(voter.rank)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '0.25rem' }}>
                            {voter.username}
                          </div>
                          <a
                            href={`https://steamcommunity.com/profiles/${voter.steam_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}
                          >
                            View Steam Profile →
                          </a>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                          VOTES GIVEN
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-secondary)' }}>
                          {voter.votesGiven}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {!loading && activeTab === 'stats' && stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="result-card">
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    TOTAL USERS
                  </p>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {stats.totalUsers.toLocaleString()}
                  </div>
                </div>

                <div className="result-card">
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    TOTAL VOTES
                  </p>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {stats.totalVotes.toLocaleString()}
                  </div>
                </div>

                <div className="result-card">
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    VOTES (30 DAYS)
                  </p>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-success)' }}>
                    {stats.votesLast30Days.toLocaleString()}
                  </div>
                </div>
              </div>

              {stats.topTags.length > 0 && (
                <div className="result-card">
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Most Common Tags (Last 30 Days)
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {stats.topTags.map((tag, index) => (
                      <div
                        key={tag.tag}
                        style={{
                          background: 'rgba(99, 102, 241, 0.05)',
                          borderRadius: '10px',
                          padding: '1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: `2px solid ${getTagColor(tag.tag)}30`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-muted)', minWidth: '40px' }}>
                            #{index + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.25rem' }}>
                              {tag.tag}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                              Used {tag.count.toLocaleString()} times
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            background: getTagColor(tag.tag) + '30',
                            color: getTagColor(tag.tag),
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            fontWeight: '800',
                            fontSize: '24px'
                          }}
                        >
                          {tag.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
