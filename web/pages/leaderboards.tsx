import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface TopPlayer {
  rank: number;
  steam_id: string;
  username: string;
  vibeScore: number;
  totalVotes: number;
}

interface Stats {
  totalUsers: number;
  totalVotes: number;
  votesLast30Days: number;
  topTags: Array<{ tag: string; count: number }>;
}

interface LiveVote {
  id: string;
  tag: string;
  region: string;
  timestamp: Date;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const VOTE_TAGS = [
  // Positive
  'Team Player', 'Clutch Master', 'Good Comms', 'Skilled', 'IGL Material', 'Entry Fragger',
  // Neutral
  'Silent', 'Eco Hunter',
  // Negative
  'Toxic', 'Rage Quit', 'Force Buyer', 'Team Damage', 'Baiter', 'Trolling', 'Lurk Only', 'Cheater', 'AFK'
];
const REGIONS = ['NA East', 'NA West', 'EU West', 'EU North', 'Asia', 'OCE', 'SA'];

export default function Leaderboards() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'live' | 'stats'>('players');
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveVotes, setLiveVotes] = useState<LiveVote[]>([]);

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

  // Simulate live votes feed
  useEffect(() => {
    if (activeTab === 'live') {
      // Generate initial votes
      const initialVotes: LiveVote[] = Array.from({ length: 5 }, (_, i) => ({
        id: `vote-${Date.now()}-${i}`,
        tag: VOTE_TAGS[Math.floor(Math.random() * VOTE_TAGS.length)],
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        timestamp: new Date(Date.now() - Math.random() * 60000)
      }));
      setLiveVotes(initialVotes);

      // Add new vote every 3-8 seconds
      const interval = setInterval(() => {
        const newVote: LiveVote = {
          id: `vote-${Date.now()}-${Math.random()}`,
          tag: VOTE_TAGS[Math.floor(Math.random() * VOTE_TAGS.length)],
          region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
          timestamp: new Date()
        };

        setLiveVotes(prev => [newVote, ...prev].slice(0, 20)); // Keep last 20 votes
      }, Math.random() * 5000 + 3000); // 3-8 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'players') {
        const response = await fetch(`${BACKEND_URL}/api/leaderboards/top-players?limit=50`);
        const data = await response.json();
        setTopPlayers(data);
      } else if (activeTab === 'stats') {
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

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
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
              Top rated players and real-time community activity
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
              className={activeTab === 'live' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('live')}
              style={{ minWidth: '150px' }}
            >
              Live Feed
            </button>
            <button
              className={activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('stats')}
              style={{ minWidth: '150px' }}
            >
              Statistics
            </button>
          </div>

          {loading && activeTab !== 'live' && (
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

          {/* Live Feed Tab */}
          {activeTab === 'live' && (
            <div className="result-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '0.5rem' }}>
                    Live Vote Feed
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    Real-time anonymous community ratings from around the world
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>LIVE</span>
                </div>
              </div>

              {liveVotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📡</div>
                  <p>Waiting for votes...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {liveVotes.map((vote, index) => (
                    <div
                      key={vote.id}
                      style={{
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: 1 - (index * 0.03),
                        transition: 'all 0.3s ease',
                        animation: index === 0 ? 'slideIn 0.3s ease' : 'none',
                        borderLeft: `4px solid ${getTagColor(vote.tag)}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div style={{ fontSize: '20px' }}>👤</div>
                        <div>
                          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            Anonymous player from <strong>{vote.region}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>voted</span>
                            <span
                              style={{
                                background: getTagColor(vote.tag) + '30',
                                color: getTagColor(vote.tag),
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '13px'
                              }}
                            >
                              {vote.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        {getTimeAgo(vote.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '2px solid rgba(99, 102, 241, 0.2)' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-text)', textAlign: 'center', marginBottom: '0.5rem' }}>
                  <strong>All votes are completely anonymous.</strong>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  We never show who voted for whom. Your privacy is protected.
                </p>
              </div>
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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
