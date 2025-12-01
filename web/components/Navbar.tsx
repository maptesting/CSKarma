import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Navbar({ user }: { user?: { username?: string; is_admin?: boolean } }) {
  return (
    <nav className="navbar">
      <Link href="/" className="logo" style={{ fontWeight: 700, fontSize: 24 }}>Karma</Link>
      <div style={{ flex: 1 }} />
      <Link href="/search">Search</Link>
      {user && <Link href="/dashboard" style={{ marginLeft: 24 }}>Dashboard</Link>}
      {user && <Link href="/notifications" style={{ marginLeft: 24 }}>Notifications</Link>}
      {user?.is_admin && <Link href="/admin" style={{ marginLeft: 24 }}>Admin</Link>}
      {user ? (
        <span style={{ marginLeft: 32 }}>Hello, {user.username || 'User'}</span>
      ) : (
        <a href={`${BACKEND_URL}/auth/steam`} className="btn-primary" style={{ marginLeft: 32 }}>Login with Steam</a>
      )}
    </nav>
  );
}
