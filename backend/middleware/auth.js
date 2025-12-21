const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
// const User = require('../models/User');

// 1. Verify Clerk Token
const clerkAuth = ClerkExpressWithAuth();

// 2. Sync User with MongoDB
// 2. Sync User with MongoDB -> Supabase
const supabase = require('../config/supabase');

const syncUser = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized: No Clerk Session' });
  }

  try {
    const { userId, sessionClaims } = req.auth;
    const email = sessionClaims?.email || (sessionClaims?.email_addresses && sessionClaims?.email_addresses[0]?.email_address);

    // Enforce BMSCE Domain
    if (email && !email.endsWith('@bmsce.ac.in')) {
      return res.status(403).json({ message: 'Access restricted to bmsce.ac.in' });
    }

    // Check if user exists in Supabase
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (!user && email) {
      // Fallback: try finding by email (migration scenario)
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userByEmail) {
        // Link existing user to Clerk
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ clerk_id: userId })
          .eq('id', userByEmail.id)
          .select()
          .single();

        if (!updateError) user = updatedUser;
      }
    }

    if (!user) {
      // Create new user
      const newUser = {
        clerk_id: userId,
        email: email || `unknown-${userId}@example.com`,
        name: sessionClaims?.name || email?.split('@')[0] || 'User',
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ message: 'Error creating user record' });
      }
      user = createdUser;
    }

    req.user = user; // Attach Supabase User object to req.user (has .id, .email etc)
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ message: 'Server Error during Auth' });
  }
};

module.exports = [clerkAuth, syncUser];
