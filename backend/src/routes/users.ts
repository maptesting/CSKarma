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

export default router;
