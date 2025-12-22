const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Get all conversations for the current user
// Returns a list of users the current user has chatted with, plus the last message
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all messages where user is sender or receiver
        // We need to aggregate this to find unique conversation partners
        // Supabase/PostgREST doesn't support complex aggregation easily in one query without RPC
        // So we'll fetch distinct pairs or just fetch recent messages and filter in JS for MVP

        const { data: sent, error: sentError } = await supabase
            .from('messages')
            .select('*, receiver:users!receiver_id(id, name, email)')
            .eq('sender_id', userId)
            .order('created_at', { ascending: false });

        const { data: received, error: receivedError } = await supabase
            .from('messages')
            .select('*, sender:users!sender_id(id, name, email)')
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false });

        if (sentError) throw sentError;
        if (receivedError) throw receivedError;

        // Combine and map to conversation partners
        const conversations = new Map();

        // Process received messages first (partner is sender)
        received.forEach(msg => {
            const partnerId = msg.sender_id;
            if (!conversations.has(partnerId)) {
                conversations.set(partnerId, {
                    user: msg.sender,
                    lastMessage: msg,
                    unreadCount: !msg.is_read ? 1 : 0
                });
            } else {
                const conv = conversations.get(partnerId);
                // Since we sorted by date desc, the first one encountered is the latest
                // But we need to count unread
                if (!msg.is_read) conv.unreadCount++;
            }
        });

        // Process sent messages (partner is receiver)
        sent.forEach(msg => {
            const partnerId = msg.receiver_id;
            if (!conversations.has(partnerId)) {
                conversations.set(partnerId, {
                    user: msg.receiver,
                    lastMessage: msg,
                    unreadCount: 0
                });
            } else {
                const conv = conversations.get(partnerId);
                // Update last message if this one is newer
                if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
                    conv.lastMessage = msg;
                }
            }
        });

        // Convert map to array and sort by last message date
        const result = Array.from(conversations.values())
            .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));

        res.json(result);

    } catch (err) {
        console.error('Error fetching conversations:', err);
        // If table doesn't exist, return empty array gracefully but log error
        if (err.code === '42P01') { // undefined_table
            return res.json([]);
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages with a specific user
router.get('/:partnerId', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { partnerId } = req.params;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching messages:', err);
        if (err.code === '42P01') return res.json([]);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content, itemId } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content,
                item_id: itemId || null, // Optional context
                is_read: false
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark messages as read
router.post('/mark-read', auth, async (req, res) => {
    try {
        const { senderId } = req.body; // The user who sent the messages clearly is the "sender", current user is receiver
        const receiverId = req.user.id; // Me

        if (!senderId) return res.status(400).json({ message: 'Sender ID required' });

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('sender_id', senderId)
            .eq('receiver_id', receiverId)
            .eq('is_read', false);

        if (error) throw error;

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking read:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search users to start a chat
router.get('/users/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);

        // Search in name or email, exclude current user
        // Using ilike for case-insensitive partial match
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email')
            .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
            .neq('id', req.user.id)
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
