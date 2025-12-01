import express from 'express';
import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import { supabase } from '../supabase';

const router = express.Router();

passport.serializeUser((user: any, done) => {
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Validate required Steam environment variables
if (!process.env.STEAM_RETURN_URL || !process.env.STEAM_REALM || !process.env.STEAM_API_KEY) {
  console.error('ERROR: STEAM_RETURN_URL, STEAM_REALM, and STEAM_API_KEY are required');
  process.exit(1);
}

const STEAM_RETURN_URL = process.env.STEAM_RETURN_URL;
const STEAM_REALM = process.env.STEAM_REALM;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

passport.use(new SteamStrategy({
  returnURL: STEAM_RETURN_URL,
  realm: STEAM_REALM,
  apiKey: STEAM_API_KEY,
}, async function(identifier, profile, done) {
  // profile has .id for steam_id, .displayName, etc.
  // Upsert user in Supabase
  try {
    const { data, error } = await (supabase.from('users').upsert({
      steam_id: profile.id,
      username: profile.displayName
    }, { onConflict: 'steam_id' }) as unknown as Promise<{ data: any[]; error: any }>);
    if (error) return done(error);
    let db_id;
    if (data && Array.isArray(data) && data[0] && data[0].id) {
      db_id = data[0].id;
    }
    return done(null, { ...profile, db_id });
  } catch (err) {
    done(err);
  }
}));

// Set up session before router usage in entrypoint
router.get('/steam', passport.authenticate('steam', { session: true }));

router.get('/steam/return', 
  passport.authenticate('steam', { failureRedirect: '/', session: true }),
  (req, res) => {
    // Success, can redirect to frontend/
    res.redirect(process.env.FRONTEND_URL || '/');
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL || '/');
  });
});

export default router;
