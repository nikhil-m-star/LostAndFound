const { ClerkExpressWithAuth, clerkClient } = require('@clerk/clerk-sdk-node');
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

    // Try to get details from claims first
    let email = sessionClaims?.email || (sessionClaims?.email_addresses && sessionClaims?.email_addresses[0]?.email_address);
    let fullName = sessionClaims?.name;

    if (!fullName && sessionClaims?.first_name) {
      fullName = sessionClaims.first_name + (sessionClaims.last_name ? ' ' + sessionClaims.last_name : '');
    }

    // If details are missing or it's a "User" placeholder scenario, fetch from Clerk API
    // We check !email, or !fullName, or corresponding placeholders just in case
    if (!email || !fullName || fullName === 'User' || !email.includes('@')) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        if (clerkUser) {
          // Get primary email
          const primaryEmailObj = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId) || clerkUser.emailAddresses[0];
          if (primaryEmailObj) {
            email = primaryEmailObj.emailAddress;
          }

          // Construct full name
          const first = clerkUser.firstName || '';
          const last = clerkUser.lastName || '';
          fullName = `${first} ${last}`.trim();
        }
      } catch (clerkErr) {
        console.error('Failed to fetch user details from Clerk API:', clerkErr);
        // Continue with whatever data we have to avoid blocking complete auth failure if possible,
        // but note that email is required for the BMSCE check below.
      }
    }

    // Enforce BMSCE Domain
    // Check if we have an email now
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
        name: fullName || email?.split('@')[0] || 'User',
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
    } else {
      // User exists: Sync name/email if changed
      // We rely on the `fullName` and `email` variables which are now populated potentially from Clerk API

      let updates = {};
      if (fullName && user.name !== fullName) {
        updates.name = fullName;
      }
      // Ideally we sync email too if it changed in Clerk (though rare to change email without ID change)
      if (email && user.email !== email) {
        updates.email = email;
      }

      if (Object.keys(updates).length > 0) {
        const { data: updated, error: upErr } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (!upErr && updated) {
          user = updated; // Use fresh data
        }
      }
    }

    req.user = user; // Attach Supabase User object to req.user (has .id, .email etc)
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ message: 'Server Error during Auth' });
  }
};

module.exports = [clerkAuth, syncUser];
