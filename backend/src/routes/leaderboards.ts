import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Get top rated players (highest vibe scores)
router.get('/top-players', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Get all votes from last 30 days
    const cutoff = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('target_id, tag, created_at')
      .gte('created_at', cutoff);

    if (votesError) return res.status(500).json({ error: votesError.message });

    // Calculate vibe scores for each player
    const ratingMap: Record<string, number> = {
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
    };

    const playerScores = new Map<string, { scores: number[]; totalVotes: number }>();

    (votes || []).forEach(vote => {
      const score = ratingMap[vote.tag] || 3;
      const player = playerScores.get(vote.target_id) || { scores: [], totalVotes: 0 };
      player.scores.push(score);
      player.totalVotes++;
      playerScores.set(vote.target_id, player);
    });

    // Calculate averages and filter for players with enough votes
    const MIN_VOTES = 5;
    const topPlayers = Array.from(playerScores.entries())
      .filter(([_, stats]) => stats.totalVotes >= MIN_VOTES)
      .map(([userId, stats]) => ({
        userId,
        vibeScore: stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
        totalVotes: stats.totalVotes
      }))
      .sort((a, b) => b.vibeScore - a.vibeScore)
      .slice(0, limit);

    // Get user details
    const leaderboard = await Promise.all(
      topPlayers.map(async (player, index) => {
        const { data: user } = await supabase
          .from('users')
          .select('steam_id, username')
          .eq('id', player.userId)
          .single();

        return {
          rank: index + 1,
          steam_id: user?.steam_id || 'Unknown',
          username: user?.username || 'Unknown Player',
          vibeScore: Number(player.vibeScore.toFixed(2)),
          totalVotes: player.totalVotes
        };
      })
    );

    res.json(leaderboard);
  } catch (err: any) {
    console.error('Top players leaderboard error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Get most active voters
router.get('/top-voters', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Get all votes from last 30 days
    const cutoff = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('reporter_id')
      .gte('created_at', cutoff);

    if (votesError) return res.status(500).json({ error: votesError.message });

    // Count votes per reporter
    const voterCounts = new Map<string, number>();
    (votes || []).forEach(vote => {
      voterCounts.set(vote.reporter_id, (voterCounts.get(vote.reporter_id) || 0) + 1);
    });

    // Sort and get top voters
    const topVoters = Array.from(voterCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Get user details
    const leaderboard = await Promise.all(
      topVoters.map(async (voter, index) => {
        const { data: user } = await supabase
          .from('users')
          .select('steam_id, username')
          .eq('id', voter.userId)
          .single();

        return {
          rank: index + 1,
          steam_id: user?.steam_id || 'Unknown',
          username: user?.username || 'Unknown Voter',
          votesGiven: voter.count
        };
      })
    );

    res.json(leaderboard);
  } catch (err: any) {
    console.error('Top voters leaderboard error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Get platform statistics
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

    // Votes last 30 days
    const cutoff = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { count: votesLast30Days } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoff);

    // Most common tags (last 30 days)
    const { data: recentVotes } = await supabase
      .from('votes')
      .select('tag')
      .gte('created_at', cutoff);

    const tagCounts: Record<string, number> = {};
    (recentVotes || []).forEach(vote => {
      tagCounts[vote.tag] = (tagCounts[vote.tag] || 0) + 1;
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    res.json({
      totalUsers: totalUsers || 0,
      totalVotes: totalVotes || 0,
      votesLast30Days: votesLast30Days || 0,
      topTags
    });
  } catch (err: any) {
    console.error('Leaderboard stats error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

export default router;
