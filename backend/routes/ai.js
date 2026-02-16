const express = require('express');
const router = express.Router();
const aiService = require('../services/geminiService');
const auth = require('../middleware/auth');

// @route   POST /api/ai/chat
// @desc    Process a user query using Google Gemini AI
// @access  Public (currently, though often protected in production)
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Validation: Ensure message is provided
        if (!message) {
            return res.status(400).json({ msg: 'Message is required' });
        }

        console.log(`User asked: ${message}`);

        // Call the AI service to process the message logic
        // The service handles context, item matching, or general assistance
        const response = await aiService.processQuery(message);

        // Return the AI's response to the frontend
        res.json(response);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
