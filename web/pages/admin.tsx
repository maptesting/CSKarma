import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';

interface FlaggedUser {
  id: string;
  steam_id: string;
  toxicCount: number;
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

function fetchFlaggedUsers(setUsers: (users: FlaggedUser[]) => void) {
  fetch(`${BACKEND_URL}/api/votes/user`) // Will adjust to real route
    .then(r => r.json())
    .then(data => setUsers(data || []))
    .catch(err => console.error('Failed to fetch flagged users:', err));
}

function fetchRecentVotes(setVotes: (votes: Vote[]) => void) {
  fetch(`${BACKEND_URL}/api/votes/user`) // Will adjust to real route
    .then(r => r.json())
    .then(data => setVotes(data || []))
    .catch(err => console.error('Failed to fetch votes:', err));
}

export default function Admin() {
  const [flagged, setFlagged] = useState<FlaggedUser[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    // In real deployment, restrict to admins/mods only
    fetchFlaggedUsers(setFlagged); // Substitute with real logic routing for flagged users only
    fetchRecentVotes(setVotes);    // Substitute with logic for recent/flagged votes only
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Admin Dashboard (Moderator)</h2>
        <section style={{ marginTop: 32 }}>
          <h4>Flagged Users (demo)</h4>
          <table width="100%">
            <thead><tr>
                <th>Steam ID</th>
                <th>Toxic Reports (30d)</th>
                <th>Action</th>
            </tr></thead>
            <tbody>
              {flagged.length === 0 && <tr><td colSpan={3}>No flagged users.</td></tr>}
              {flagged.map((u) => (
                <tr key={u.id}>
                  <td>{u.steam_id}</td>
                  <td>{u.toxicCount}</td>
                  <td>
                    <button style={{ background: '#0ea5e9', color: '#fff', border: 0, borderRadius: 5 }}>
                      Ban</button>{' '}
                    <button style={{ background: '#fbbf24', color: '#fff', border: 0, borderRadius: 5 }}>
                      Clear</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section style={{ marginTop: 32 }}>
          <h4>Recent Comments/Reports (demo)</h4>
          <table width="100%">
            <thead><tr>
              <th>Reporter</th><th>Target</th><th>Tag</th><th>Comment</th><th>Time</th><th>Action</th>
            </tr></thead>
            <tbody>
              {votes.length === 0 && <tr><td colSpan={6}>No recent votes.</td></tr>}
              {votes.map((v) => (
                <tr key={v.id}>
                  <td>{v.reporter_id}</td>
                  <td>{v.target_id}</td>
                  <td>{v.tag}</td>
                  <td>{v.optional_comment || ''}</td>
                  <td>{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</td>
                  <td><button style={{ background: '#f43f5e', color: '#fff', border: 0, borderRadius: 5 }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
