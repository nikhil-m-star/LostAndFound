const adminAuth = (req, res, next) => {
    // Ensure user is authenticated first (auth middleware should run before this)
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const ADMIN_EMAIL = 'nikhilm.cs24@bmsce.ac.in';

    if (req.user.email === ADMIN_EMAIL) {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied: Admin priveleges required' });
    }
};

module.exports = adminAuth;
