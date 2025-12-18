const { GoogleGenerativeAI } = require("@google/generative-ai");
const Item = require('../models/Item');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.processQuery = async (userText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        console.log(`[Gemini] Using Key: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
        console.log(`[Gemini] Using Model: gemini-1.5-flash`);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 1. Extract intent and entities using Gemini
        const prompt = `
      You are a smart assistant for a 'Lost and Found' system.
      Analyze this user query: "${userText}"
      
      Extract the following information in strict JSON format:
      {
        "intent": "lost" or "found" or "general", 
        "keywords": ["array", "of", "important", "nouns", "colors"],
        "location": "string or null"
      }
      
      Example: "I lost my black wallet in the canteen"
      Output: {"intent": "lost", "keywords": ["black", "wallet"], "location": "canteen"}
      
      Do not include markdown code blocks. Return ONLY the raw JSON string.
    `;

        // Log before calling
        console.log('[Gemini] Sending request...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(text);
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

        // 3. Execute Search
        // Use $and if we have specific conditions, otherwise just return recent items relative to status
        const items = await Item.find(query).limit(10).sort({ date: -1 });

        // 4. Formulate Response Message
        let botMessage = "";
        if (items.length > 0) {
            botMessage = `I found ${items.length} items that match your description.`;
        } else {
            botMessage = "I couldn't find any items matching that description in our database yet.";
        }

        if (analysis.intent === 'general') {
            botMessage = "Here are the most recent items reported in the system.";
        }

        return {
            message: botMessage,
            results: items,
            debug: analysis
        };

    } catch (error) {
        console.error("Gemini Service Error - Switching to Fallback Mode:", error.message);

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
        const stopWords = ['i', 'my', 'a', 'an', 'the', 'in', 'at', 'near', 'lost', 'found', 'missing', 'saw', 'please', 'help', 'find', 'me', 'some', 'is'];
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
        const items = await Item.find(query).limit(5).sort({ date: -1 });

        return {
            message: items.length > 0
                ? `(Offline Mode) I found ${items.length} items that might match.`
                : "(Offline Mode) I couldn't find any matches in the database right now.",
            results: items,
            debug: { intent, keywords, location, fallback: true }
        };
    }
};
