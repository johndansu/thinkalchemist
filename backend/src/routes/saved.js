const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Helper function to create a user-authenticated Supabase client for RLS
function getUserSupabase(req) {
  const authHeader = req.headers.authorization;
  const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: userToken ? { Authorization: `Bearer ${userToken}` } : {}
      }
    }
  );
}

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

    // Use user-authenticated client for RLS
    const userSupabase = getUserSupabase(req);
    
    const { data, error } = await userSupabase
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
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Provide more helpful error messages
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'A forge with this title already exists' });
      } else if (error.code === '42P01') { // Table doesn't exist
        return res.status(503).json({ error: 'Database table not found. Please run the database migration.' });
      } else if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({ error: 'Invalid user reference' });
      }
      
      return res.status(400).json({ error: error.message || 'Failed to save forge' });
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

    // Use user-authenticated client for RLS
    const userSupabase = getUserSupabase(req);
    
    const { data, error } = await userSupabase
      .from('forges')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('List error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '42P01') { // Table doesn't exist
        return res.status(503).json({ error: 'Database table not found. Please run the database migration.' });
      }
      
      return res.status(400).json({ error: error.message || 'Failed to list forges' });
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

    // Use user-authenticated client for RLS
    const userSupabase = getUserSupabase(req);
    
    const { data, error } = await userSupabase
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

    // Use user-authenticated client for RLS
    const userSupabase = getUserSupabase(req);
    
    const { error } = await userSupabase
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

