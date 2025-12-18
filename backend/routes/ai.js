const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// POST /api/ai/chat
// Protected route - user must be logged in
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ msg: 'Message is required' });
        }

        console.log(`User asked: ${message}`);

        const response = await aiService.processQuery(message);

        res.json(response);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
