import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import session from 'express-session';
import passport from 'passport';
import api from './routes';
import authRouter from './auth/steam';

const app = express();
const port = process.env.PORT || 4000;

// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  console.error('ERROR: SESSION_SECRET environment variable is required');
  process.exit(1);
}

// CORS configuration - restrict origins in production
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000'];

// Always allow steamcommunity.com for the Chrome extension
allowedOrigins.push('https://steamcommunity.com');

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));

// Session configuration with secure settings for cross-domain auth
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' allows cross-domain cookies
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'commsafe-backend' });
});

// Add /me endpoint to check authentication
app.get('/me', (req, res) => {
  console.log('=== /me endpoint hit ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);

  if (req.user) {
    const user = req.user as any;
    res.json({
      user: {
        username: user.displayName || user.username,
        steam_id: user.id,
        db_id: user.db_id
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.use('/auth', authRouter);
app.use('/api', api);

app.listen(port, () => {
  console.log(`Karma backend running at http://localhost:${port}`);
});
