const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth'); // Now uses Clerk middleware

// @route   GET /api/auth/me
// @desc    Get current user (synced from Clerk)
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is already populated by the auth middleware
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
