import { Router } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Get user by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// List all users (for dev/testing)
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create mock user (for testing)
router.post('/', async (req, res) => {
  const { steam_id, username, email } = req.body;

  // Input validation
  if (!steam_id) {
    return res.status(400).json({ error: 'steam_id is required' });
  }

  if (steam_id.length > 100) {
    return res.status(400).json({ error: 'steam_id must be 100 characters or less' });
  }

  if (username && username.length > 100) {
    return res.status(400).json({ error: 'username must be 100 characters or less' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ steam_id, username, email })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Create/get user by Faceit ID
router.post('/faceit', async (req, res) => {
  const { faceit_id, nickname } = req.body;

  // Input validation
  if (!faceit_id) {
    return res.status(400).json({ error: 'faceit_id is required' });
  }

  if (faceit_id.length > 100) {
    return res.status(400).json({ error: 'faceit_id must be 100 characters or less' });
  }

  if (nickname && nickname.length > 100) {
    return res.status(400).json({ error: 'nickname must be 100 characters or less' });
  }

  // Check if user already exists with this Faceit ID
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('faceit_id', faceit_id)
    .single();

  if (existing) {
    return res.json(existing);
  }

  // Create new user with Faceit ID
  const { data, error } = await supabase
    .from('users')
    .insert({
      faceit_id,
      username: nickname || faceit_id,
      steam_id: null  // Faceit users don't have Steam ID initially
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
