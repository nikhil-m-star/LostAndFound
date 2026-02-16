// Load environment variables from .env.local if present, otherwise from .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware Setup
// Enable Cross-Origin Resource Sharing (CORS) to allow frontend requests
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Database Connection
// Note: Supabase connection is handled in config/supabase.js and instanced per request or globally where needed.
// The line below is a placeholder for MongoDB if it were used.
// connectDB(process.env.MONGO_URI);


// Route Definitions
// Mounts authentication routes at /api/auth
app.use('/api/auth', require('./routes/auth'));
// Mounts item management routes at /api/items (Create, Read, Update, Delete items)
app.use('/api/items', require('./routes/items'));
// Mounts AI-related routes at /api/ai (Gemini integration)
app.use('/api/ai', require('./routes/ai'));
// Mounts Chat routes at /api/chat (User-to-User messaging)
app.use('/api/chat', require('./routes/chat'));
// Mounts Admin routes at /api/admin (Dashboard and management)
app.use('/api/admin', require('./routes/admin'));

// Health Check Routes
// Simple root route to verify server is running
app.get('/', (req, res) => res.send('Lost and Found Backend is Running'));
// JSON health check for monitoring
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Global Error Handler
// Catches errors from middleware and routes (e.g., Multer file size limits)
app.use((err, req, res, next) => {
	console.error(err && err.stack ? err.stack : err);

	// Handle specific file upload error
	if (err && err.code === 'LIMIT_FILE_SIZE') {
		return res.status(400).json({ message: 'File too large' });
	}

	// meaningful default error response
	res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Server Startup
// Only listen if the file is run directly (not imported as a module for testing)
if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
