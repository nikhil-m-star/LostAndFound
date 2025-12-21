const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
// const User = require('../models/User'); // Removed
const auth = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Get current user (synced from Clerk)
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is already populated by the auth middleware (contains Supabase User object)
    if (!req.user) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

