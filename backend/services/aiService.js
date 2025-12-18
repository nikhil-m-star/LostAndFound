const OpenAI = require('openai');
const Item = require('../models/Item');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Initialize Groq Client (OpenAI Compatible)
let client = null;
try {
    if (process.env.GROQ_API_KEY) {
        client = new OpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: process.env.GROQ_API_KEY.trim()
        });
        console.log(`[AI] Groq Client Initialized (Key: ${process.env.GROQ_API_KEY.trim().substring(0, 8)}...)`);
    } else {
        console.warn("[AI] GROQ_API_KEY is missing in .env.local");
    }
} catch (err) {
    console.error("[AI] Failed to initialize Groq client:", err.message);
}

exports.processQuery = async (userText) => {
    try {
        if (!client) throw new Error("AI Client not initialized");

        // 1. Extract intent using Groq (Llama 3)
        const systemPrompt = `
        You are a smart assistant for a 'Lost and Found' system.
        Analyze this user query: "${userText}"
        
        Extract the following information in strict JSON format:
        {
            "intent": "lost" or "found" or "general" or "chat", 
            "keywords": ["array", "of", "important", "nouns", "colors"],
            "location": "string or null",
            "reply": "A brief, friendly response to the user if it is general chat. otherwise null"
        }
        
        Behavior Rules:
        1. If user says "Hi", "Hello", "How are you?", intent is "chat". Reply friendly.
        2. If user describes an item ("I lost X"), intent is "lost" or "found". Reply is null.
        3. If user asks "What can you do?", explain you help find lost items.

        Return ONLY the raw JSON string. Do not use Markdown.
        `;

        const combinedPrompt = `${systemPrompt}\n\nUSER QUERY: "${userText}"`;

        console.log('[AI] Sending request to Groq...');
        const completion = await client.chat.completions.create({
            messages: [
                { role: "user", content: combinedPrompt }
            ],
            model: "llama3-8b-8192"
        });

        const content = completion.choices[0].message.content;
        console.log('[AI] DeepSeek Analysis:', content);

        let analysis;
        try {
            analysis = JSON.parse(content);
        } catch (e) {
            // Cleanup just in case
            const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
            analysis = JSON.parse(clean);
        }

        // 2. Build MongoDB Query
        let query = {};

        // Filter by status (Inverse logic: Lost user looking for Found items)
        if (analysis.intent === 'lost') query.status = 'found';
        else if (analysis.intent === 'found') query.status = 'lost';

        const conditions = [];

        // Keyword matching
        if (analysis.keywords && analysis.keywords.length > 0) {
            const keywordConditions = analysis.keywords.map(kw => ({
                $or: [
                    { title: { $regex: kw, $options: 'i' } },
                    { description: { $regex: kw, $options: 'i' } },
                    { category: { $regex: kw, $options: 'i' } }
                ]
            }));
            conditions.push(...keywordConditions);
        }

        // Location matching
        if (analysis.location) {
            conditions.push({ location: { $regex: analysis.location, $options: 'i' } });
        }

        if (conditions.length > 0) query.$and = conditions;

        console.log('[AI] Mongo Query:', JSON.stringify(query, null, 2));

        // 3. Search Database
        const items = await Item.find(query).limit(10).sort({ date: -1 });

        // 4. Formulate Response
        let botMessage = "";

        if (items.length > 0) {
            botMessage = `I found ${items.length} items that match directly.`;
        } else if (analysis.reply) {
            // Use the AI's generated reply for chat/general
            botMessage = analysis.reply;
        } else {
            botMessage = "I searched, but couldn't find exact matches yet.";
        }

        if (analysis.intent === 'general' && !analysis.reply) {
            botMessage = "Here are the most recent listings.";
        }

        return {
            message: botMessage,
            results: items,
            debug: { source: 'DeepSeek-V3', analysis }
        };

    } catch (error) {
        console.log("!!! CATCH BLOCK HIT !!!");
        console.error("AI Service Error - Switching to Fallback:");
        console.error(JSON.stringify(error, null, 2));
        try {
            fs.appendFileSync('ai_error.log', `${new Date().toISOString()} - Error: ${error.message}\nFull: ${JSON.stringify(error)}\n`);
        } catch (e) { console.error("Log failed", e); }
        return fallbackProcessor(userText);
    }
};

// --- FALLBACK ENGINE (Local Regex) ---
// Kept for robustness
const fallbackProcessor = async (userText) => {
    console.log("[AI] Using Fallback Regex Engine");

    const text = userText.toLowerCase();
    let intent = 'general';
    let location = null;
    let keywords = [];

    // Basic Chat Handling in Fallback
    if (text === 'hi' || text === 'hello' || text.includes('how are you')) {
        return {
            message: "Hello! I'm operating in offline mode right now, but I can still help you find lost items. Try saying 'I lost my wallet'.",
            results: [],
            debug: { source: 'Fallback-Chat' }
        };
    }

    if (text.includes('lost') || text.includes('missing')) intent = 'lost';
    else if (text.includes('found') || text.includes('saw')) intent = 'found';

    const locations = ['canteen', 'library', 'lab', 'class', 'hall', 'park', 'parking', 'office', 'gym'];
    for (const loc of locations) {
        if (text.includes(loc)) { location = loc; break; }
    }

    const stopWords = ['i', 'my', 'the', 'in', 'at', 'lost', 'found', 'please', 'help', 'is'];
    keywords = text.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 2);

    let query = {};
    if (intent === 'lost') query.status = 'found';
    if (intent === 'found') query.status = 'lost';

    const conditions = [];
    if (location) conditions.push({ location: { $regex: location, $options: 'i' } });
    if (keywords.length > 0) {
        conditions.push({ $or: keywords.map(kw => ({ title: { $regex: kw, $options: 'i' } })) });
    }
    if (conditions.length > 0) query.$and = conditions;

    const items = await Item.find(query).limit(5).sort({ date: -1 });

    let msg = items.length > 0
        ? `(Offline) I found ${items.length} potential matches.`
        : "(Offline) No matches found right now.";

    if (intent === 'general') msg = "(Offline) Here are the most recent listings.";

    return {
        message: msg,
        results: items,
        debug: { source: 'Fallback-Regex', intent, keywords }
    };
};

