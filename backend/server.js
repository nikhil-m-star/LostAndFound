require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// connect to DB - Supabase connection is handled in config/supabase.js and per request
// connectDB(process.env.MONGO_URI);


// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/ai', require('./routes/ai')); // New AI route
app.use('/api/chat', require('./routes/chat')); // User Chat route
app.use('/api/admin', require('./routes/admin')); // Admin routes

// health
app.get('/', (req, res) => res.send('Lost and Found Backend is Running'));
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Simple error handler (catches multer and other errors)
app.use((err, req, res, next) => {
	console.error(err && err.stack ? err.stack : err);
	if (err && err.code === 'LIMIT_FILE_SIZE') {
		return res.status(400).json({ message: 'File too large' });
	}
	res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Only listen if the file is run directly (not imported as a module)
if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
