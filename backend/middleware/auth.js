const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// 1. Verify Clerk Token
const clerkAuth = ClerkExpressWithAuth();

// 2. Sync User with MongoDB
const syncUser = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized: No Clerk Session' });
  }

  try {
    const { userId, sessionClaims } = req.auth;
    const email = sessionClaims?.email || (sessionClaims?.email_addresses && sessionClaims?.email_addresses[0]?.email_address); // Clerk claims vary slightly by config

    // Enforce BMSCE Domain (Safety Net)
    if (email && !email.endsWith('@bmsce.ac.in')) {
      return res.status(403).json({ message: 'Access restricted to bmsce.ac.in' });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user && email) {
      // Fallback: try finding by email (migration from legacy system)
      user = await User.findOne({ email });
      if (user) {
        // Link existing user to Clerk
        user.clerkId = userId;
        await user.save();
      }
    }

    if (!user) {
      // Create new user
      // Note: We might not have 'name' in basic claims depending on Clerk settings.
      // Use fallback or fetch from Clerk API if absolutely needed, but claims usually have it if configured.
      // For now, use part of email or empty.
      user = new User({
        clerkId: userId,
        email: email || `unknown-${userId}@example.com`,
        name: sessionClaims?.name || email?.split('@')[0] || 'User',
      });
      await user.save();
    }

    req.user = user; // Attach MongoDB User to req.user for downstream use
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ message: 'Server Error during Auth' });
  }
};

module.exports = [clerkAuth, syncUser];
