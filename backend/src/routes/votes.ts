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

  const validTags = ['Toxic', 'Helpful', 'No Mic', 'Rager', 'Team Player', 'AFK', 'Cheater', 'Friendly', 'Skilled'];
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
    const negativeSet = new Set(['Toxic', 'Rager', 'Cheater', 'AFK']);
    const positiveSet = new Set(['Helpful', 'Team Player', 'Friendly', 'Skilled']);

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
    'Team Player': 5,
    'Helpful': 5,
    'Friendly': 5,
    'Skilled': 4,
    'No Mic': 3,
    'Rager': 2,
    'AFK': 1,
    'Toxic': 1,
    'Cheater': 1
  } as const;
  const scores = recent.map(v => ratingMap[v.tag as keyof typeof ratingMap] ?? 3);
  const avg = scores.length > 0 ? (scores.reduce((a,b)=>a+b,0) / scores.length) : null;

  // Warnings for serious issues
  const toxicCount = recent.filter(v => v.tag === 'Toxic').length;
  const cheaterCount = recent.filter(v => v.tag === 'Cheater').length;
  const afkCount = recent.filter(v => v.tag === 'AFK').length;

  let warning = undefined;
  if (cheaterCount >= 5) {
    warning = `🚫 WARNING: Reported as cheater by ${cheaterCount} users!`;
  } else if (toxicCount >= 10) {
    warning = `⚠️ Flagged as toxic by ${toxicCount} users in the last month!`;
  } else if (afkCount >= 8) {
    warning = `💤 Frequently AFK - reported ${afkCount} times this month`;
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

export default router;
