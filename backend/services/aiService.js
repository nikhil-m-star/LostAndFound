const { GoogleGenerativeAI } = require("@google/generative-ai");
const Item = require('../models/Item');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Initialize Gemini
let genAI;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
        console.warn("GEMINI_API_KEY is missing in environment variables.");
    }
} catch (e) {
    console.error("Error initializing Gemini:", e);
}

exports.processQuery = async (userText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }
        if (!genAI) {
            genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }

        const MODEL_NAME = "gemini-2.5-flash";

        console.log(`[Gemini] Using Key: ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);
        console.log(`[Gemini] Using Model: ${MODEL_NAME}`);

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // 1. Extract intent and entities using Gemini
        const prompt = `
      You are a smart AI assistant for a university 'Lost and Found' system, but you are also a helpful general assistant.
      
      Analyze this user query: "${userText}"
      
      Extract the following information in strict JSON format:
      {
        "intent": "lost" or "found" or "general", 
        "keywords": ["array", "of", "important", "nouns", "colors"],
        "location": "string or null",
        "reply": "string or null"
      }
      
      Rules:
      1. If the user is reporting a lost item or looking for something they lost, set "intent" to "lost".
      2. If the user is reporting a found item, set "intent" to "found".
      3. If the user asks a general question (e.g., "What is the capital of France?", "Tell me a joke") or greets you, set "intent" to "general".
         - IN THIS CASE, YOU MUST PROVIDE A HELPFUL ANSWER IN THE "reply" FIELD.
         - Do not be dry. Be helpful and conversational.
      4. If the intent is "lost" or "found", set "reply" to null (the system will generate the search results message).
      
      Example 1: "I lost my black wallet in the canteen"
      Output: {"intent": "lost", "keywords": ["black", "wallet"], "location": "canteen", "reply": null}
      
      Example 2: "Hi, can you help me?"
      Output: {"intent": "general", "keywords": [], "location": null, "reply": "Hello! I am your AI assistant. I can help you find lost items, report found ones, or answer your questions."}
      
      Example 3: "What is 2 + 2?"
      Output: {"intent": "general", "keywords": [], "location": null, "reply": "The answer is 4."}

      Do not include markdown code blocks. Return ONLY the raw JSON string.
    `;

        // Log before calling
        console.log('[Gemini] Sending request...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log('[Gemini] Raw response:', text);

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            throw new Error("Failed to parse Gemini response");
        }

        console.log('Gemini Analysis:', analysis);

        // 2. Build MongoDB Query
        let query = {};

        // Filter by status if intent is clear
        if (analysis.intent === 'lost') {
            // If user lost something, they are looking for 'found' items
            query.status = 'found';
        } else if (analysis.intent === 'found') {
            // If user found something, they are looking for 'lost' reports
            query.status = 'lost';
        }

        const conditions = [];

        // Keyword matching (Title or Description)
        if (analysis.keywords && analysis.keywords.length > 0) {
            // Create a regex for each keyword
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
            conditions.push({
                location: { $regex: analysis.location, $options: 'i' }
            });
        }

        // Combine conditions
        if (conditions.length > 0) {
            query.$and = conditions;
        }

        console.log('Mongo Query:', JSON.stringify(query, null, 2));

        // 3. Execute Search ONLY if it's a lost/found related intent
        let items = [];
        if (analysis.intent !== 'general' || (analysis.intent === 'general' && analysis.keywords && analysis.keywords.length > 0 && !analysis.reply)) {
            try {
                items = await Item.find(query).limit(10).sort({ date: -1 });
            } catch (err) {
                console.error("DB Search Error", err);
            }
        }

        // 4. Formulate Response Message
        let botMessage = "";

        if (items.length > 0) {
            botMessage = `I found ${items.length} items that match your description.`;
        } else if (analysis.reply) {
            // Priority: Use the AI's generated reply (for general chat/questions)
            botMessage = analysis.reply;
        } else {
            // Only if it was a search intent but nothing found
            if (analysis.intent === 'lost' || analysis.intent === 'found') {
                botMessage = "I couldn't find any items matching that description in our database yet.";
            } else {
                // General intent, no reply, no items (fallback)
                botMessage = "I'm not sure how to help with that. Try asking to find a lost item.";
            }
        }

        return {
            message: botMessage,
            results: items,
            debug: analysis
        };

    } catch (error) {
        console.error("Gemini Service Error - Switching to Fallback Mode:", error.message);
        try {
            fs.appendFileSync('ai_error.log', `${new Date().toISOString()} - Gemini Error: ${error.message}\n`);
        } catch (e) { }

        // --- FALLBACK: REGEX BASED PARSING ---
        console.log("Using Fallback Regex Parser");

        const text = userText.toLowerCase();
        let intent = 'general';
        let location = null;
        let keywords = [];

        // 1. Detect Intent
        if (text.includes('lost') || text.includes('missing') || text.includes('dropped')) {
            intent = 'lost';
        } else if (text.includes('found') || text.includes('saw') || text.includes('spotted')) {
            intent = 'found';
        }

        // 2. Detect Common Locations (Expand as needed)
        const locations = ['canteen', 'library', 'lab', 'class', 'hall', 'park', 'parking', 'office', 'corridor', 'gym'];
        for (const loc of locations) {
            if (text.includes(loc)) {
                location = loc;
                break;
            }
        }

        // 3. Extract Keywords (remove stop words)
        const stopWords = ['i', 'my', 'a', 'an', 'the', 'in', 'at', 'near', 'lost', 'found', 'missing', 'saw', 'please', 'help', 'find', 'me', 'some', 'is', 'hi', 'hello', 'what', 'who', 'where'];
        const words = text.split(/\s+/).map(w => w.replace(/[.,?!]/g, ''));
        keywords = words.filter(w => !stopWords.includes(w) && w.length > 2);

        // Build Query for Fallback
        let query = {};
        if (intent === 'lost') query.status = 'found';
        if (intent === 'found') query.status = 'lost';

        const conditions = [];
        if (location) conditions.push({ location: { $regex: location, $options: 'i' } });

        if (keywords.length > 0) {
            conditions.push({
                $or: keywords.map(kw => ({ title: { $regex: kw, $options: 'i' } }))
            });
        }

        if (conditions.length > 0) query.$and = conditions;

        // Search
        let items = [];
        if (intent !== 'general') {
            items = await Item.find(query).limit(5).sort({ date: -1 });
        }

        let msg = "";
        if (items.length > 0) {
            msg = `(Offline Mode) I found ${items.length} potential matches.`;
        } else if (intent === 'general') {
            msg = "(Offline Mode) I can't answer general questions right now, but I can help you find lost items.";
        } else {
            msg = "(Offline Mode) I couldn't find any matches in the database right now.";
        }

        return {
            message: msg,
            results: items,
            debug: { intent, keywords, location, fallback: true }
        };
    }
};
