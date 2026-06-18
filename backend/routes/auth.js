const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Cookie configuration helper
const cookieOptions = {
  httpOnly: true, // Prevents XSS attacks from reading the token
  secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
  sameSite: 'lax', // Protects against CSRF attacks while keeping usability
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days matching JWT expiration
};

// @route   POST /api/auth/register
// @desc    Register a new user & set cookie
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      const token = generateToken(user._id);

      // Set JWT via HttpOnly Cookie
      res.cookie('token', token, cookieOptions);

      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to create user' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user, get token & set cookie
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Set JWT via HttpOnly Cookie
      res.cookie('token', token, cookieOptions);

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// @route   GET /api/auth/me
// @desc    Get user profile details
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;