import Navbar from '../components/Navbar';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function Login() {
  return (
    <>
      <Navbar />
      <div className="container" style={{ textAlign: 'center', marginTop: 60 }}>
        <h2>Login with Steam</h2>
        <p style={{ margin: '24px 0' }}>
          To use Karma, please log in with your Steam account.
        </p>
        <a href={`${BACKEND_URL}/auth/steam`} className="btn-primary" style={{ fontSize: 20, padding: '0.7em 2em' }}>
          <img src="https://community.cloudflare.steamstatic.com/public/shared/images/loginbuttons/steamlogingreen.png" alt="Login with Steam" style={{ height: 40, verticalAlign: 'middle', marginRight: 12 }} />
          Login with Steam
        </a>
      </div>
    </>
  );
}
