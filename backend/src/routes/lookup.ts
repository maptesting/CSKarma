import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Steam API endpoint for player summaries
const STEAM_API_URL = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';

/**
 * Lookup any Steam user by Steam ID or vanity URL
 * Returns user info from Steam API + vibe score if they have ratings
 */
router.get('/:steamIdOrVanity', async (req, res) => {
  const { steamIdOrVanity } = req.params;

  try {
    let steamId = steamIdOrVanity;

    // If input is not a numeric Steam ID, try to resolve vanity URL
    if (!/^\d+$/.test(steamIdOrVanity)) {
      const vanityUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${steamIdOrVanity}`;
      const vanityResponse = await fetch(vanityUrl);
      const vanityData = await vanityResponse.json() as any;

      if (vanityData.response.success === 1) {
        steamId = vanityData.response.steamid;
      } else {
        return res.status(404).json({ error: 'Steam user not found' });
      }
    }

    // Get player info from Steam API
    const steamApiUrl = `${STEAM_API_URL}?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
    const steamResponse = await fetch(steamApiUrl);
    const steamData = await steamResponse.json() as any;

    if (!steamData.response?.players?.length) {
      return res.status(404).json({ error: 'Steam user not found' });
    }

    const steamPlayer = steamData.response.players[0];

    // Check if user exists in our database
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('steam_id', steamId)
      .single();

    let vibeScore = null;
    let warning = null;
    let tags: string[] = [];

    // If user exists in database, fetch their ratings
    if (dbUser) {
      // Get vibe score
      const { data: scoreData } = await supabase
        .from('votes')
        .select('tag, created_at')
        .eq('target_id', dbUser.id);

      if (scoreData && scoreData.length > 0) {
        // Calculate vibe score (last 30 days)
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recent = scoreData.filter((v) => new Date(v.created_at) > cutoff);

        const ratingMap = { Helpful: 5, 'No Mic': 3, Rager: 2, Toxic: 1 } as const;
        const scores = recent.map((v) => ratingMap[v.tag as keyof typeof ratingMap] ?? 3);
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        vibeScore = avg ? Number(avg.toFixed(2)) : null;

        // Check for toxic warning
        const toxicCount = recent.filter((v) => v.tag === 'Toxic').length;
        if (toxicCount >= 10) {
          warning = `Warning: flagged as toxic by ${toxicCount} users in the last month!`;
        }

        // Get unique tags
        tags = [...new Set(recent.map((v) => v.tag))];
      }
    }

    // Return combined data
    res.json({
      steam_id: steamId,
      username: steamPlayer.personaname,
      avatar: steamPlayer.avatarfull,
      profileurl: steamPlayer.profileurl,
      vibeScore,
      warning,
      tags,
      hasRatings: !!dbUser
    });

  } catch (error: any) {
    console.error('Lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup player', details: error.message });
  }
});

export default router;
