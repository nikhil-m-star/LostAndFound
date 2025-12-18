const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      user = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email required'), body('password').exists().withMessage('Password required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Google Login
router.post('/google', async (req, res) => {
  const { credential, access_token } = req.body;

  try {
    let email, name, googleId, hd;

    if (credential) {
      // 1a. Verify ID Token (Old Component Method)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      hd = payload.hd;
    } else if (access_token) {
      // 1b. Verify Access Token (New Hook Method)
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      email = userInfo.data.email;
      name = userInfo.data.name;
      googleId = userInfo.data.sub;
      hd = userInfo.data.hd;
    } else {
      return res.status(400).json({ message: 'Missing token' });
    }

    // 2. Domain Check
    if (hd !== 'bmsce.ac.in') {
      return res.status(403).json({ message: 'Access restricted to bmsce.ac.in users only.' });
    }

    // 3. User Lookup / Creation
    let user = await User.findOne({ email });

    if (!user) {
      // New user
      user = new User({
        name,
        email,
        googleId,
        // password not required due to model update
      });
      await user.save();
    } else if (!user.googleId) {
      // Existing user (email matched), link googleId
      user.googleId = googleId;
      await user.save();
    }

    // 4. Issue App Token
    const appPayload = { user: { id: user.id } };
    jwt.sign(appPayload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(400).json({ message: 'Google Auth Failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
