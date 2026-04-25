const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    if (!normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({ message: 'First name and last name cannot be empty' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUserError) {
      console.error('Supabase existing user lookup error:', existingUserError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert({
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: normalizedEmail,
        password_hash: passwordHash,
      })
      .select('id, first_name, last_name, email')
      .single();

    if (insertError) {
      console.error('Supabase insert user error:', insertError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: insertedUser.id,
        firstName: insertedUser.first_name,
        lastName: insertedUser.last_name,
        email: insertedUser.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { data: user, error: userLookupError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, password_hash')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userLookupError) {
      console.error('Supabase login lookup error:', userLookupError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (tokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { data: user, error: userLookupError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', payload.sub)
      .maybeSingle();

    if (userLookupError) {
      console.error('Supabase profile lookup error:', userLookupError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/test-results
router.post('/test-results', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (tokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { score, totalQuestions } = req.body;
    if (!Number.isInteger(score) || !Number.isInteger(totalQuestions)) {
      return res.status(400).json({ message: 'Score and totalQuestions must be integers' });
    }

    if (totalQuestions <= 0 || score < 0 || score > totalQuestions) {
      return res.status(400).json({ message: 'Invalid score values' });
    }

    const { data: savedResult, error: saveError } = await supabase
      .from('test_results')
      .insert({
        user_id: payload.sub,
        score,
        total_questions: totalQuestions,
      })
      .select('id, score, total_questions, created_at')
      .single();

    if (saveError) {
      console.error('Supabase save test result error:', saveError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(201).json({ result: savedResult });
  } catch (error) {
    console.error('Save test result error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/test-results
router.get('/test-results', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (tokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { data: latest, error: latestError } = await supabase
      .from('test_results')
      .select('id, score, total_questions, created_at')
      .eq('user_id', payload.sub)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error('Supabase latest result lookup error:', latestError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const { data: bestRows, error: bestError } = await supabase
      .from('test_results')
      .select('id, score, total_questions, created_at')
      .eq('user_id', payload.sub)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1);

    if (bestError) {
      console.error('Supabase best result lookup error:', bestError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({
      latest: latest || null,
      best: bestRows?.[0] || null,
    });
  } catch (error) {
    console.error('Get test results error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
