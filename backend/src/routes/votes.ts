import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Cast a vote
router.post('/', async (req, res) => {
  const { reporter_id, target_id, match_id, tag, optional_comment } = req.body;

  // Input validation
  if (!reporter_id || !target_id || !tag) {
    return res.status(400).json({ error: 'reporter_id, target_id, and tag are required' });
  }

  const validTags = [
    // Positive tags
    'Team Player', 'Clutch Master', 'Good Comms', 'Skilled', 'IGL Material', 'Entry Fragger',
    // Neutral tags
    'Silent', 'Eco Hunter',
    // Negative tags
    'Toxic', 'Rage Quit', 'Force Buyer', 'Team Damage', 'Baiter', 'Trolling', 'Lurk Only', 'Cheater', 'AFK'
  ];
  if (!validTags.includes(tag)) {
    return res.status(400).json({ error: 'Invalid tag. Must be one of: ' + validTags.join(', ') });
  }

  if (optional_comment && optional_comment.length > 500) {
    return res.status(400).json({ error: 'Comment must be 500 characters or less' });
  }

  try {
    // Prevent duplicate voting by reporter for target per match
    const { data: existing, error: existingError } = await supabase
      .from('votes')
      .select('*')
      .eq('reporter_id', reporter_id)
      .eq('target_id', target_id)
      .eq('match_id', match_id || '');

    if (existingError) return res.status(500).json({ error: existingError.message });
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Already voted for this user this match.' });
    }

    const { data, error } = await supabase
      .from('votes')
      .insert({ reporter_id, target_id, match_id, tag, optional_comment })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Trigger notification if it's a significant vote
    const negativeSet = new Set(['Toxic', 'Rage Quit', 'Cheater', 'AFK', 'Team Damage', 'Trolling', 'Baiter']);
    const positiveSet = new Set(['Team Player', 'Clutch Master', 'Good Comms', 'Skilled', 'IGL Material', 'Entry Fragger']);

    if (negativeSet.has(tag)) {
      // Check if user has notification preferences
      fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: target_id,
          type: 'warning',
          message: `You received a "${tag}" rating from another player`,
          metadata: { tag, match_id }
        })
      }).catch(err => console.error('Notification trigger failed:', err));
    } else if (positiveSet.has(tag)) {
      fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: target_id,
          type: 'positive',
          message: `You received a "${tag}" rating from another player! 🎉`,
          metadata: { tag, match_id }
        })
      }).catch(err => console.error('Notification trigger failed:', err));
    }

    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Get all votes for a user (target_id)
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('votes').select('*').eq('target_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Aggregate Vibe Score for a user (simple average for MVP, 5 = best)
router.get('/aggregate/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('votes').select('tag, created_at').eq('target_id', id);
  if (error) return res.status(500).json({ error: error.message });

  // Only last 30 days
  const cutoff = new Date(Date.now() - 30*24*60*60*1000);
  const recent = (data || []).filter(v => new Date(v.created_at) > cutoff);
  // Tag weighting for scores (1-5 scale, 5 = best)
  const ratingMap = {
    // Positive (5)
    'Team Player': 5,
    'Clutch Master': 5,
    'Good Comms': 5,
    'IGL Material': 5,
    // Good (4)
    'Skilled': 4,
    'Entry Fragger': 4,
    // Neutral (3)
    'Silent': 3,
    'Eco Hunter': 3,
    // Bad (2)
    'Force Buyer': 2,
    'Lurk Only': 2,
    'Baiter': 2,
    // Very Bad (1)
    'Toxic': 1,
    'Rage Quit': 1,
    'Team Damage': 1,
    'Trolling': 1,
    'AFK': 1,
    'Cheater': 1
  } as const;
  const scores = recent.map(v => ratingMap[v.tag as keyof typeof ratingMap] ?? 3);
  const avg = scores.length > 0 ? (scores.reduce((a,b)=>a+b,0) / scores.length) : null;

  // Warnings for serious issues
  const toxicCount = recent.filter(v => v.tag === 'Toxic').length;
  const cheaterCount = recent.filter(v => v.tag === 'Cheater').length;
  const afkCount = recent.filter(v => v.tag === 'AFK').length;
  const teamDamageCount = recent.filter(v => v.tag === 'Team Damage').length;
  const trollingCount = recent.filter(v => v.tag === 'Trolling').length;
  const rageQuitCount = recent.filter(v => v.tag === 'Rage Quit').length;

  let warning = undefined;
  if (cheaterCount >= 5) {
    warning = `WARNING: Reported as cheater by ${cheaterCount} users!`;
  } else if (teamDamageCount >= 8) {
    warning = `Team killer detected - ${teamDamageCount} reports this month`;
  } else if (trollingCount >= 10) {
    warning = `Griefer alert: ${trollingCount} trolling reports`;
  } else if (toxicCount >= 10) {
    warning = `Flagged as toxic by ${toxicCount} users in the last month`;
  } else if (rageQuitCount >= 7) {
    warning = `Serial rage quitter - ${rageQuitCount} reports`;
  } else if (afkCount >= 8) {
    warning = `Frequently AFK - reported ${afkCount} times this month`;
  }
  res.json({ vibeScore: avg ? Number(avg.toFixed(2)) : null, warning });
});

// Get all votes submitted by user (mock, for dashboard)
router.get('/by/:reporter_id', async (req, res) => {
  const { reporter_id } = req.params;
  const { data, error } = await supabase.from('votes').select('*').eq('reporter_id', reporter_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get "Good Teammates" - players the user has positively rated
router.get('/good-teammates/:reporter_id', async (req, res) => {
  try {
    const { reporter_id } = req.params;

    // Get all positive votes from this user
    const positiveTagsQuery = ['Team Player', 'Clutch Master', 'Good Comms', 'Skilled', 'IGL Material', 'Entry Fragger'];

    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('target_id, tag, created_at')
      .eq('reporter_id', reporter_id)
      .in('tag', positiveTagsQuery)
      .order('created_at', { ascending: false });

    if (votesError) return res.status(500).json({ error: votesError.message });

    // Group by target_id and count positive ratings
    interface TeammateStats {
      targetId: string;
      positiveTags: string[];
      lastPlayed: string;
      totalPositiveVotes: number;
    }

    const teammateMap = new Map<string, TeammateStats>();

    (votes || []).forEach(vote => {
      const existing: TeammateStats = teammateMap.get(vote.target_id) || {
        targetId: vote.target_id,
        positiveTags: [],
        lastPlayed: vote.created_at,
        totalPositiveVotes: 0
      };

      if (!existing.positiveTags.includes(vote.tag)) {
        existing.positiveTags.push(vote.tag);
      }
      existing.totalPositiveVotes++;

      // Update last played if this vote is more recent
      if (new Date(vote.created_at) > new Date(existing.lastPlayed)) {
        existing.lastPlayed = vote.created_at;
      }

      teammateMap.set(vote.target_id, existing);
    });

    // Get user details and current vibe scores
    const teammates = await Promise.all(
      Array.from(teammateMap.entries()).map(async ([targetId, stats]) => {
        // Get user info
        const { data: user } = await supabase
          .from('users')
          .select('steam_id, username')
          .eq('id', targetId)
          .single();

        // Get current vibe score
        const vibeResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/votes/aggregate/${targetId}`);
        const vibeData: any = await vibeResponse.json();

        return {
          userId: targetId,
          steamId: user?.steam_id || 'Unknown',
          username: user?.username || 'Unknown Player',
          positiveTags: stats.positiveTags,
          totalPositiveVotes: stats.totalPositiveVotes,
          lastPlayed: stats.lastPlayed,
          currentVibeScore: vibeData?.vibeScore || null
        };
      })
    );

    // Sort by total positive votes (most endorsed first)
    teammates.sort((a, b) => b.totalPositiveVotes - a.totalPositiveVotes);

    res.json(teammates);
  } catch (err: any) {
    console.error('Good teammates error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

export default router;
