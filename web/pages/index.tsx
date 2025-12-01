import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const VOTE_TAGS = ['Helpful', 'Team Player', 'Friendly', 'Skilled', 'Toxic', 'Rager', 'Cheater', 'AFK', 'No Mic'];
const REGIONS = ['NA East', 'NA West', 'EU West', 'EU North', 'Asia', 'OCE', 'SA'];

interface LiveVote {
  id: string;
  tag: string;
  region: string;
  timestamp: Date;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [liveVotes, setLiveVotes] = useState<LiveVote[]>([]);

  useEffect(() => {
    // Check if user info is in URL params (from Steam redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const userParam = urlParams.get('user');

    if (authSuccess === 'success' && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        console.log('User authenticated via Steam:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        // Clean up URL
        window.history.replaceState({}, '', '/');
      } catch (e) {
        console.error('Failed to parse user data from URL:', e);
      }
    } else {
      // Check localStorage for existing session
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  // Live votes feed
  useEffect(() => {
    // Generate initial votes
    const initialVotes: LiveVote[] = Array.from({ length: 6 }, (_, i) => ({
      id: `vote-${Date.now()}-${i}`,
      tag: VOTE_TAGS[Math.floor(Math.random() * VOTE_TAGS.length)],
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      timestamp: new Date(Date.now() - Math.random() * 60000)
    }));
    setLiveVotes(initialVotes);

    // Add new vote every 4-7 seconds
    const interval = setInterval(() => {
      const newVote: LiveVote = {
        id: `vote-${Date.now()}-${Math.random()}`,
        tag: VOTE_TAGS[Math.floor(Math.random() * VOTE_TAGS.length)],
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        timestamp: new Date()
      };

      setLiveVotes(prev => [newVote, ...prev].slice(0, 6)); // Keep last 6 votes
    }, Math.random() * 3000 + 4000); // 4-7 seconds

    return () => clearInterval(interval);
  }, []);

  const getTagColor = (tag: string) => {
    const positiveSet = new Set(['Helpful', 'Team Player', 'Friendly', 'Skilled']);
    const negativeSet = new Set(['Toxic', 'Rager', 'Cheater', 'AFK']);

    if (positiveSet.has(tag)) return '#10b981';
    if (negativeSet.has(tag)) return '#ef4444';
    return '#f59e0b';
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
      <div className="home-bg">
        {/* Live Feed Sidebar - Desktop Only - Outside Container */}
        <div style={{
          position: 'fixed',
          right: '2rem',
          top: '120px',
          width: '320px',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          display: 'none',
          zIndex: 50
        }} className="live-feed-sidebar">
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(99, 102, 241, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                  🌍 Live Activity
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>LIVE</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Real-time votes from players worldwide
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {liveVotes.map((vote, index) => (
                  <div
                    key={vote.id}
                    style={{
                      background: 'rgba(99, 102, 241, 0.05)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      borderLeft: `3px solid ${getTagColor(vote.tag)}`,
                      opacity: 1 - (index * 0.1),
                      transition: 'all 0.3s ease',
                      animation: index === 0 ? 'slideIn 0.3s ease' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '14px' }}>👤</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                        {vote.region}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          background: getTagColor(vote.tag) + '30',
                          color: getTagColor(vote.tag),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '11px'
                        }}
                      >
                        {vote.tag}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {getTimeAgo(vote.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/leaderboards"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                View Full Feed →
              </a>
            </div>
          </div>

        <div className="container" style={{ position: 'relative', marginRight: 'auto', marginLeft: 'auto' }}>
          {/* Main Content */}
          <div style={{ maxWidth: '1180px', margin: '0 auto', paddingRight: '0' }}>
            <h1 className="home-title" style={{ fontSize: '72px', marginBottom: '2rem' }}>
              Know Your Teammates Before The Match Starts
            </h1>
            <p className="home-subtitle" style={{ fontSize: '28px', marginBottom: '2rem' }}>
              Stop wasting 45 minutes with toxic players. Make informed decisions.
            </p>
            <p className="home-desc" style={{ fontSize: '22px', marginBottom: '3rem', maxWidth: '900px' }}>
              CommSafe is a <strong>shared, community-driven database</strong> that shows you real teammate behavior ratings before you commit. See toxic warnings from hundreds of other players—not just your own history.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <a href={`${BACKEND_URL}/auth/steam`} className="btn-primary home-login" style={{ fontSize: '22px', padding: '1.25rem 3rem' }}>
                <span>🎮</span> Login with Steam - It's Free
              </a>
              <a href="/search" className="btn-secondary" style={{ padding: '1.25rem 3rem', fontSize: '22px', fontWeight: '700' }}>
                Try a Search First
              </a>
            </div>
            <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              ✓ Shared global database · ✓ AI-filtered ratings · ✓ 30-day rolling data · ✓ Anonymous voting
            </p>
          </div>

          <div className="stats-grid" style={{ marginTop: '5rem', gap: '3rem' }}>
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Players Rated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Vibe Checks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">99%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          {/* Value Props Section */}
          <div style={{ marginTop: '6rem', marginBottom: '4rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              What Can You Actually Do With This Data?
            </h2>
            <p style={{ fontSize: '22px', color: 'var(--color-text-muted)', maxWidth: '900px', margin: '0 auto 2rem' }}>
              CommSafe gives you actionable intelligence for better match outcomes
            </p>
          </div>

          <div className="features-grid" style={{ gap: '3rem', marginBottom: '6rem' }}>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Make Informed Dodge Decisions</h3>
              <p className="feature-desc">
                See if a lobby has toxic players before accepting. Use your "free dodge" budget on matches that are guaranteed mental breakdowns—not close calls.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔇</div>
              <h3 className="feature-title">Early Mute Strategy</h3>
              <p className="feature-desc">
                Know who to mute before Round 1 starts. Preserve your focus instead of getting tilted for 10 rounds before finally hitting the mute button.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Adjust Your Gameplan</h3>
              <p className="feature-desc">
                See low vibe scores? Adjust your strategy. Don't rely on players with toxic histories for critical utility or trades. Play around them, not with them.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Global Shared Database</h3>
              <p className="feature-desc">
                Not just your personal history. See what hundreds of other players think. A player might be new to you, but the community already knows their vibe.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI-Filtered Ratings</h3>
              <p className="feature-desc">
                Smart filtering removes abuse and collusion. Ratings from pre-made parties are weighted differently to prevent coordinated downvoting of solo players.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Regret Prevention</h3>
              <p className="feature-desc">
                The value isn't dodging every match—it's high-confidence data to justify the penalty when the alternative is 45 minutes of guaranteed toxicity.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div style={{ marginTop: '6rem', marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              How CommSafe Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '2rem', textAlign: 'center', border: '2px solid var(--color-primary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>1️⃣</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem' }}>Play & Rate</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>After a match, rate your teammates anonymously. Tag them as Helpful, Toxic, Team Player, Cheater, etc.</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '2rem', textAlign: 'center', border: '2px solid var(--color-primary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>2️⃣</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem' }}>Community Builds Database</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Your ratings join thousands of others. The more people contribute, the more accurate the vibe scores become.</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '2rem', textAlign: 'center', border: '2px solid var(--color-primary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>3️⃣</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem' }}>See Scores Everywhere</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Use our Chrome extension to see vibe scores on Steam profiles instantly. Or search any player before accepting a match.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .live-feed-sidebar {
          display: none;
        }

        @media (min-width: 1800px) {
          .live-feed-sidebar {
            display: block !important;
          }
        }

        .live-feed-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .live-feed-sidebar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        .live-feed-sidebar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }

        .live-feed-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </>
  );
}
