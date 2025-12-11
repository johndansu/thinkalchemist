const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured. Please add Supabase credentials to .env' });
    }

    const { email, password, username } = req.body;

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
          username: username.toLowerCase(),
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Signup successful - no logging needed

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

// Resend confirmation email
router.post('/resend-confirmation', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured. Please add Supabase credentials to .env' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Resend confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      message: 'Confirmation email sent. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Resend confirmation error:', error);
    res.status(500).json({ error: 'Failed to resend confirmation email' });
  }
});

// Update username
router.post('/update-username', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured. Please add Supabase credentials to .env' });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { username } = req.body;

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

    // Check if username is available (excluding current user)
    const { data: existingUsername } = await supabase
      .from('usernames')
      .select('user_id')
      .eq('username', username.toLowerCase())
      .neq('user_id', user.id)
      .single();

    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        username: username.toLowerCase()
      }
    });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Store/update username in usernames table
    const { error: upsertError } = await supabase
      .from('usernames')
      .upsert({
        username: username.toLowerCase(),
        user_id: user.id
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Failed to store username:', upsertError);
    }

    res.json({
      success: true,
      user: updatedUser.user,
      message: 'Username updated successfully'
    });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Failed to update username' });
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

    // If username is not in user_metadata, try to get it from usernames table
    if (!user.user_metadata?.username) {
      const { data: usernameData, error: usernameError } = await supabase
        .from('usernames')
        .select('username')
        .eq('user_id', user.id)
        .single();
      
      if (!usernameError && usernameData?.username) {
        // Add username to user_metadata in the response (even if not in DB yet)
        user.user_metadata = {
          ...user.user_metadata,
          username: usernameData.username
        };
      }
    }

    // User data retrieved - no logging needed

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;

