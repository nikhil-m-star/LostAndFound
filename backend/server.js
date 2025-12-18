require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// connect to DB
connectDB(process.env.MONGO_URI);

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/ai', require('./routes/ai')); // New AI route

// health
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
