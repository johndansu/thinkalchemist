const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { verifyAuth } = require('../middleware/auth');

// Save a forge
router.post('/save', verifyAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured. Please add Supabase credentials to .env' });
    }

    const { title, inputText, outputJson, alchemyMode } = req.body;

    // Validation
    if (!title || !inputText || !outputJson) {
      return res.status(400).json({ error: 'Title, inputText, and outputJson are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title is too long. Maximum length is 200 characters.' });
    }

    if (typeof outputJson !== 'object') {
      return res.status(400).json({ error: 'outputJson must be a valid JSON object' });
    }

    const { data, error } = await supabase
      .from('forges')
      .insert({
        user_id: req.user.id,
        title,
        input_text: inputText,
        output_json: outputJson,
        alchemy_mode: alchemyMode || 'mixed',
      })
      .select()
      .single();

    if (error) {
      console.error('Save error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, forge: data });
  } catch (error) {
    console.error('Save forge error:', error);
    res.status(500).json({ error: 'Failed to save forge' });
  }
});

// List all forges for user
router.get('/list', verifyAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured. Please add Supabase credentials to .env' });
    }

    const { data, error } = await supabase
      .from('forges')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('List error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, forges: data || [] });
  } catch (error) {
    console.error('List forges error:', error);
    res.status(500).json({ error: 'Failed to list forges' });
  }
});

// Get a specific forge
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured. Please add Supabase credentials to .env' });
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('forges')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Get error:', error);
      return res.status(404).json({ error: 'Forge not found' });
    }

    res.json({ success: true, forge: data });
  } catch (error) {
    console.error('Get forge error:', error);
    res.status(500).json({ error: 'Failed to get forge' });
  }
});

// Delete a forge
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured. Please add Supabase credentials to .env' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('forges')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Delete error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete forge error:', error);
    res.status(500).json({ error: 'Failed to delete forge' });
  }
});

module.exports = router;

