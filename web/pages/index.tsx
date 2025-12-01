import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    console.log('Fetching user from:', `${BACKEND_URL}/me`);
    fetch(`${BACKEND_URL}/me`, { credentials: 'include' })
      .then(res => {
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        return res.ok ? res.json() : null;
      })
      .then(data => {
        console.log('User data received:', data);
        setUser(data?.user || null);
      })
      .catch(err => {
        console.error('Error fetching user:', err);
        setUser(null);
      });
  }, []);

  return (
    <>
      <Navbar user={user} />
      <div className="home-bg">
        <div className="container">
          <h1 className="home-title">
            Know the Vibe Before You Play
          </h1>
          <p className="home-subtitle">
            Community-powered player reputation for CS2 & Steam
          </p>
          <p className="home-desc">
            Karma shows you real teammate feedback on Steam profiles. See who brings positive energy and who might ruin your match—before you hit accept.
          </p>
          <a href={`${BACKEND_URL}/auth/steam`} className="btn-primary home-login">
            <span>🎮</span> Login with Steam
          </a>

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

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Overlays</h3>
              <p className="feature-desc">
                See vibe scores directly on Steam profiles with our Chrome extension—no extra clicks needed.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Toxic Player Warnings</h3>
              <p className="feature-desc">
                Get automatic alerts when viewing profiles of players with multiple toxic reports in the last 30 days.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Community Powered</h3>
              <p className="feature-desc">
                Real feedback from real teammates. Every rating comes from players who've actually teamed up together.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Smart Analytics</h3>
              <p className="feature-desc">
                Our algorithm weighs recent feedback more heavily and filters out spam to show you accurate vibes.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-desc">
                Anonymous voting option available. We never share your personal info without your consent.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Always Improving</h3>
              <p className="feature-desc">
                Regular updates with new features based on community feedback. Your voice shapes the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
