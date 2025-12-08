const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured. Please add Supabase credentials to .env' });
    }

    const { email, password, name, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Username validation
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Password is too long' });
    }

    // Check if username is available
    const { data: usernameCheck, error: usernameError } = await supabase
      .rpc('check_username_available', { check_username: username.toLowerCase() });

    if (usernameError) {
      console.error('Username check error:', usernameError);
      // Continue if function doesn't exist yet (for backwards compatibility)
    } else if (usernameCheck === false) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          username: username.toLowerCase(),
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Store username in usernames table for uniqueness
    if (data.user) {
      const { error: usernameInsertError } = await supabase
        .from('usernames')
        .insert({
          username: username.toLowerCase(),
          user_id: data.user.id
        });

      if (usernameInsertError) {
        console.error('Failed to store username:', usernameInsertError);
        // Don't fail signup if username storage fails, but log it
      }
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured. Please add Supabase credentials to .env' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    if (supabase) {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await supabase.auth.signOut();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured. Please add Supabase credentials to .env' });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;

