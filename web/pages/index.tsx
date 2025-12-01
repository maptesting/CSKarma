import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Home() {
  const [user, setUser] = useState<any>(null);

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

  return (
    <>
      <Navbar user={user} />
      <div className="home-bg">
        <div className="container">
          <h1 className="home-title">
            Know Your Teammates Before The Match Starts
          </h1>
          <p className="home-subtitle">
            Stop wasting 45 minutes with toxic players. Make informed decisions.
          </p>
          <p className="home-desc">
            CommSafe is a <strong>shared, community-driven database</strong> that shows you real teammate behavior ratings before you commit. See toxic warnings from hundreds of other players—not just your own history.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href={`${BACKEND_URL}/auth/steam`} className="btn-primary home-login">
              <span>🎮</span> Login with Steam - It's Free
            </a>
            <a href="/search" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '18px', fontWeight: '700' }}>
              Try a Search First
            </a>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            ✓ Shared global database · ✓ AI-filtered ratings · ✓ 30-day rolling data · ✓ Anonymous voting
          </p>

          <div className="stats-grid">
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
          <div style={{ marginTop: '4rem', marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              What Can You Actually Do With This Data?
            </h2>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto 2rem' }}>
              CommSafe gives you actionable intelligence for better match outcomes
            </p>
          </div>

          <div className="features-grid">
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
          <div style={{ marginTop: '4rem', marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              How CommSafe Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
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
    </>
  );
}
