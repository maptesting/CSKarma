import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Get flagged users (users with high toxic/cheater/afk reports)
router.get('/flagged-users', async (req, res) => {
  try {
    // Get all votes from last 30 days
    const cutoff = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('target_id, tag, created_at')
      .gte('created_at', cutoff);

    if (votesError) return res.status(500).json({ error: votesError.message });

    // Group by target_id and count negative tags
    const userStats = new Map<string, { toxicCount: number; cheaterCount: number; afkCount: number; totalVotes: number }>();

    (votes || []).forEach(vote => {
      const stats = userStats.get(vote.target_id) || { toxicCount: 0, cheaterCount: 0, afkCount: 0, totalVotes: 0 };

      if (vote.tag === 'Toxic') stats.toxicCount++;
      if (vote.tag === 'Cheater') stats.cheaterCount++;
      if (vote.tag === 'AFK') stats.afkCount++;
      stats.totalVotes++;

      userStats.set(vote.target_id, stats);
    });

    // Filter users with significant negative reports
    const flaggedUserIds = Array.from(userStats.entries())
      .filter(([_, stats]) => stats.toxicCount >= 5 || stats.cheaterCount >= 3 || stats.afkCount >= 5)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => (b.toxicCount + b.cheaterCount * 2) - (a.toxicCount + a.cheaterCount * 2))
      .slice(0, 50); // Top 50 flagged users

    // Get user details
    const flaggedWithDetails = await Promise.all(
      flaggedUserIds.map(async ({ userId, toxicCount, cheaterCount, afkCount, totalVotes }) => {
        const { data: user } = await supabase
          .from('users')
          .select('id, steam_id, username')
          .eq('id', userId)
          .single();

        return {
          id: user?.id || userId,
          steam_id: user?.steam_id || 'Unknown',
          username: user?.username || 'Unknown',
          toxicCount,
          cheaterCount,
          afkCount,
          totalVotes
        };
      })
    );

    res.json(flaggedWithDetails);
  } catch (err: any) {
    console.error('Admin flagged users error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Get recent votes
router.get('/recent-votes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err: any) {
    console.error('Admin recent votes error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Delete a vote (admin moderation)
router.delete('/votes/:voteId', async (req, res) => {
  try {
    const { voteId } = req.params;

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', voteId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, message: 'Vote deleted successfully' });
  } catch (err: any) {
    console.error('Admin delete vote error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Get admin stats (overview)
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total votes
    const { count: totalVotes } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });

    // Votes last 24h
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString();
    const { count: votesLast24h } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday);

    res.json({
      totalUsers: totalUsers || 0,
      totalVotes: totalVotes || 0,
      votesLast24h: votesLast24h || 0
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

export default router;
