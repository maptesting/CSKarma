import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface FlaggedUser {
  id: string;
  steam_id: string;
  username: string;
  toxicCount: number;
  cheaterCount: number;
  afkCount: number;
  totalVotes: number;
}

interface Vote {
  id: string;
  reporter_id: string;
  target_id: string;
  tag: string;
  optional_comment?: string;
  created_at: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [flagged, setFlagged] = useState<FlaggedUser[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in and is admin
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      console.log('Admin page - user data:', userData);

      // Check if user is admin
      if (!userData.is_admin) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      setUser(userData);
      fetchFlaggedUsers();
      fetchRecentVotes();
    } catch (e) {
      console.error('Failed to parse user data:', e);
      router.push('/');
    }
  }, []);

  const fetchFlaggedUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/flagged-users`);
      if (!response.ok) {
        throw new Error('Failed to fetch flagged users');
      }
      const data = await response.json();
      setFlagged(data || []);
    } catch (err) {
      console.error('Failed to fetch flagged users:', err);
      setError('Failed to load flagged users');
    }
  };

  const fetchRecentVotes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/recent-votes?limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent votes');
      }
      const data = await response.json();
      setVotes(data || []);
    } catch (err) {
      console.error('Failed to fetch votes:', err);
      setError('Failed to load recent votes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVote = async (voteId: string) => {
    if (!confirm('Are you sure you want to delete this vote?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/votes/${voteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete vote');
      }

      // Refresh votes list
      fetchRecentVotes();
      alert('Vote deleted successfully');
    } catch (err) {
      console.error('Failed to delete vote:', err);
      alert('Failed to delete vote');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} />
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Loading admin dashboard...</p>
        </div>
      </>
    );
  }

  if (error && !user?.is_admin) {
    return (
      <>
        <Navbar user={user} />
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '1rem' }}>🚫</h1>
          <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            You do not have permission to access the admin dashboard.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>
              Moderator tools and user management
            </p>
          </div>

          {/* Flagged Users Section */}
          <div className="result-card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
              🚨 Flagged Users (High Reports)
            </h2>
            {flagged.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                No flagged users at this time
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(99, 102, 241, 0.2)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Username</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Steam ID</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Toxic</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Cheater</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>AFK</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flagged.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>{u.username || 'Unknown'}</td>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '14px' }}>{u.steam_id}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#ef4444', fontWeight: '700' }}>{u.toxicCount}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#f59e0b', fontWeight: '700' }}>{u.cheaterCount}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontWeight: '700' }}>{u.afkCount}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>{u.totalVotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Votes Section */}
          <div className="result-card">
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '1.5rem' }}>
              📋 Recent Votes (Last 50)
            </h2>
            {votes.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                No recent votes
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(99, 102, 241, 0.2)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Tag</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Target ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Reporter ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Comment</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Time</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            background: v.tag === 'Toxic' || v.tag === 'Cheater' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: v.tag === 'Toxic' || v.tag === 'Cheater' ? '#ef4444' : '#10b981',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {v.tag}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '12px' }}>
                          {v.target_id.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '12px' }}>
                          {v.reporter_id.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.optional_comment || '-'}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                          {new Date(v.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteVote(v.id)}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
