const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
// Data model references are handled directly via Supabase queries in this architecture
// const User = require('../models/User'); // Removed
const auth = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Get current user profile (synced from Clerk via middleware)
// @access  Private (Requires valid Auth token)
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is already populated by the auth middleware which verifies the Clerk token
    // and fetches/syncs the user record in Supabase.
    if (!req.user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    // Return user data with _id alias for compatibility with frontend code expected format
    const user = { ...req.user, _id: req.user.id };
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

