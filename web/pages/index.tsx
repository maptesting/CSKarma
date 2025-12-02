import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

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
        <div className="container" style={{ position: 'relative', marginRight: 'auto', marginLeft: 'auto' }}>
          {/* Main Content */}
          <div style={{ maxWidth: '1180px', margin: '0 auto', paddingRight: '0' }}>
            <h1 className="home-title" style={{ fontSize: '64px', marginBottom: '2rem', letterSpacing: '-2px' }}>
              Know your CS2 teammates before the knife round
            </h1>
            <p className="home-subtitle" style={{ fontSize: '24px', marginBottom: '2rem', lineHeight: '1.5' }}>
              Community-driven reputation system for Counter-Strike 2. Dodge toxic lobbies, pre-mute ragers, and adapt your strats based on real player data.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <a href={`${BACKEND_URL}/auth/steam`} className="btn-primary home-login" style={{ fontSize: '16px', padding: '0.875rem 2rem' }}>
                Get Started
              </a>
              <a href="/search" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '16px', fontWeight: '600' }}>
                Search Players
              </a>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '800px', margin: '0 auto', letterSpacing: '0.3px' }}>
              Global database • AI anti-abuse • 30-day rolling window • Anonymous ratings
            </p>
          </div>

          <div className="stats-grid" style={{ marginTop: '5rem', gap: '3rem' }}>
            <div className="stat-card">
              <div className="stat-number" style={{ fontSize: '48px', fontWeight: '700', marginBottom: '0.5rem' }}>10K+</div>
              <div className="stat-label" style={{ fontSize: '15px', fontWeight: '600' }}>CS2 Players Tracked</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ fontSize: '48px', fontWeight: '700', marginBottom: '0.5rem' }}>50K+</div>
              <div className="stat-label" style={{ fontSize: '15px', fontWeight: '600' }}>Community Ratings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ fontSize: '48px', fontWeight: '700', marginBottom: '0.5rem' }}>30-Day</div>
              <div className="stat-label" style={{ fontSize: '15px', fontWeight: '600' }}>Rolling Window</div>
            </div>
          </div>

          {/* Live Activity Feed - Fixed Grid */}
          <div style={{
            marginTop: '5rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            padding: '2.5rem',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            boxShadow: '0 0 30px rgba(255, 107, 53, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#e2e8f0' }}>
                    Live Activity
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d9ff', animation: 'pulse 2s infinite', boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#00d9ff', letterSpacing: '0.5px' }}>LIVE</span>
                  </div>
                </div>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>
                  Real-time player ratings from the community
                </p>
              </div>
            </div>

            {/* Fixed grid - 3 most recent votes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}>
              {liveVotes.slice(0, 3).map((vote, index) => (
                <div
                  key={vote.id}
                  className="live-vote-card"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    borderLeft: `3px solid ${getTagColor(vote.tag)}`,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    animation: index === 0 ? 'slideIn 0.3s ease' : 'none',
                    border: '1px solid rgba(51, 65, 85, 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Anonymous
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                        {vote.region}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                      {getTimeAgo(vote.timestamp)}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        background: getTagColor(vote.tag) + '20',
                        color: getTagColor(vote.tag),
                        padding: '0.5rem 0.875rem',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '13px',
                        display: 'inline-block',
                        border: `1px solid ${getTagColor(vote.tag)}40`
                      }}
                    >
                      {vote.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Props Section */}
          <div style={{ marginTop: '6rem', marginBottom: '4rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '1rem', color: '#e2e8f0', letterSpacing: '-0.5px' }}>
              What can you do with this data?
            </h2>
            <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto' }}>
              Actionable intelligence for better match outcomes
            </p>
          </div>

          <div className="features-grid" style={{ gap: '2rem', marginBottom: '6rem' }}>
            <div className="feature-card-animated" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3z"/>
                  <path d="M9 9l6 6M15 9l-6 6"/>
                </svg>
              </div>
              <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Dodge Bad Lobbies</h3>
              <p className="feature-desc" style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                See toxic players before accepting. Save your dodge penalty for lobbies with confirmed griefers—not close calls.
              </p>
            </div>
            <div className="feature-card-animated" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Pre-Mute Known Ragers</h3>
              <p className="feature-desc" style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                Mute toxic teammates before Round 1. Stay focused on the game instead of getting baited into arguments.
              </p>
            </div>
            <div className="feature-card-animated" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              </div>
              <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Adapt Your Strategy</h3>
              <p className="feature-desc" style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                Low vibe scores on your team? Don't rely on them for trades or util. Adjust your playstyle accordingly.
              </p>
            </div>
            <div className="feature-card-animated" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #00d9ff 0%, #00b8d4 100%)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Global Community Intel</h3>
              <p className="feature-desc" style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                Shared database across all regions. A player might be new to you, but thousands of others already rated them.
              </p>
            </div>
            <div className="feature-card-animated" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Anti-Abuse Protection</h3>
              <p className="feature-desc" style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                AI filtering prevents party stack abuse. Pre-made groups can't mass downvote solo queue players.
              </p>
            </div>
            <div className="feature-card-animated" style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '2rem', transition: 'all 0.3s ease' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #ff6b35 0%, #00d9ff 100%)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 className="feature-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>High-Confidence Data</h3>
              <p className="feature-desc" style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                Don't dodge every match. Use data to justify the cooldown penalty when it's truly worth avoiding 45 minutes of toxicity.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div style={{ marginTop: '6rem', marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '1rem', color: '#e2e8f0', letterSpacing: '-0.5px' }}>
              How it works
            </h2>
            <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Three simple steps to safer matches
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
            <div className="how-it-works-card" style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(51, 65, 85, 0.8)', transition: 'all 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '24px', boxShadow: '0 0 20px rgba(255, 107, 53, 0.4)' }}>1</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Play & Rate</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>After a match, rate your teammates anonymously. Tag them as Helpful, Toxic, Team Player, Cheater, etc.</p>
            </div>
            <div className="how-it-works-card" style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(51, 65, 85, 0.8)', transition: 'all 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d9ff 0%, #00b8d4 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '24px', boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)' }}>2</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>Community Builds Database</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>Your ratings join thousands of others. The more people contribute, the more accurate the vibe scores become.</p>
            </div>
            <div className="how-it-works-card" style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(51, 65, 85, 0.8)', transition: 'all 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '24px', boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' }}>3</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.75rem', color: '#e2e8f0' }}>See Scores Everywhere</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>Use our Chrome extension to see vibe scores on Steam profiles instantly. Or search any player before accepting a match.</p>
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .feature-card-animated:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(255, 107, 53, 0.3);
          border-color: rgba(255, 107, 53, 0.6);
        }

        .feature-card-animated svg {
          transition: transform 0.3s ease;
        }

        .feature-card-animated:hover svg {
          transform: scale(1.15) rotate(5deg);
        }

        .stat-card {
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        .stat-card:nth-child(1) {
          animation-delay: 0.1s;
        }

        .stat-card:nth-child(2) {
          animation-delay: 0.2s;
        }

        .stat-card:nth-child(3) {
          animation-delay: 0.3s;
        }

        .home-title {
          animation: fadeInUp 0.8s ease forwards;
        }

        .home-subtitle {
          animation: fadeInUp 0.8s ease 0.2s forwards;
          opacity: 0;
        }

        .btn-primary, .btn-secondary {
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(255, 107, 53, 0.6);
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(0, 217, 255, 0.5);
        }

        .live-vote-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 107, 53, 0.5);
        }

        .how-it-works-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 107, 53, 0.5);
        }

      `}</style>
    </>
  );
}
