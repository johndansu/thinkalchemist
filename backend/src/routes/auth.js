const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    // Check Supabase configuration
    if (!supabase) {
      console.error('Supabase not initialized. Check environment variables.');
      return res.status(503).json({ 
        error: 'Authentication service not configured. Please add Supabase credentials to environment variables.',
        code: '503'
      });
    }
    
    // Verify Supabase is working by checking if we can access it
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY
      });
      return res.status(503).json({ 
        error: 'Supabase configuration incomplete. Missing SUPABASE_URL or SUPABASE_ANON_KEY.',
        code: '503'
      });
    }

    const { email, password, username, name } = req.body;

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

    // Name validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Full name is too long. Maximum length is 100 characters.' });
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

    // Check if username is available (optional - continue if check fails)
    try {
      try {
        const { data: usernameCheck, error: usernameError } = await supabase
          .rpc('check_username_available', { check_username: username.toLowerCase() });

        if (!usernameError && usernameCheck === false) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      } catch (rpcError) {
        // RPC function might not exist, try direct table query
        console.log('RPC function not available, trying direct query');
      }

      // Try direct table check as fallback
      try {
        const { data: existingUsername, error: tableError } = await supabase
          .from('usernames')
          .select('user_id')
          .eq('username', username.toLowerCase())
          .maybeSingle();
        
        if (existingUsername) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      } catch (tableError) {
        // Table might not exist yet - that's okay, we'll create it
        console.log('Usernames table check failed (table may not exist yet):', tableError?.message);
      }
    } catch (usernameCheckErr) {
      // If all username checks fail, continue anyway - signup will still work
      console.log('Username availability check failed, continuing with signup:', usernameCheckErr?.message);
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          name: name.trim(),
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Signup successful - no logging needed

    // Store username in usernames table for uniqueness (optional - don't fail if this fails)
    if (data.user) {
      try {
        const { error: usernameInsertError } = await supabase
          .from('usernames')
          .insert({
            username: username.toLowerCase(),
            user_id: data.user.id
          });

        if (usernameInsertError) {
          // Log but don't fail - the usernames table might not exist yet
          console.log('Note: Could not store username (table may not exist):', usernameInsertError.message);
          // This is not critical - signup is still successful
        }
      } catch (usernameInsertException) {
        // Silently continue - username storage is optional
        console.log('Note: Username storage skipped:', usernameInsertException?.message);
      }
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create account';
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection failed. Please check your Supabase configuration.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Could not reach database. Please check your Supabase URL.';
    }
    
    // In development or if error is from Supabase, return more details
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const response = {
      error: errorMessage
    };
    
    if (isDevelopment) {
      response.details = error.message;
      response.stack = error.stack;
    }
    
    res.status(statusCode).json(response);
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

