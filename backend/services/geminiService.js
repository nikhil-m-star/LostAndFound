const { GoogleGenerativeAI } = require("@google/generative-ai");
const Item = require('../models/Item');

// Initialize Gemini
// Using the latest preview model as requested
const MODEL_NAME = "gemini-3-flash-preview";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.processQuery = async (userText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        console.log(`[Gemini] Using Model: ${MODEL_NAME}`);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // --- STEP 1: UNDERSTAND INTENT (Extraction) ---
        const extractionPrompt = `
      You are an engine for a Lost and Found system. Analyze this query: "${userText}"
      
      Return a STRICT JSON object (no markdown) with:
      {
        "isGeneralChat": boolean, // true if user is just saying hi, asking general questions, or asking about the app. False if looking for items.
        "intent": "lost" | "found" | "chat", // "lost" if they lost something (so we search FOUND items), "found" if they found something (so we search LOST items)
        "keywords": string[], // Important nouns/adjectives to search for (e.g. "black", "wallet", "iphone")
        "location": string | null,
        "date": string | null
      }
    `;

        const extractionResult = await model.generateContent(extractionPrompt);
        const extractionText = extractionResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        let analysis;

        try {
            analysis = JSON.parse(extractionText);
        } catch (e) {
            console.error("Failed to parse Gemini extraction:", extractionText);
            analysis = { isGeneralChat: true, intent: 'chat', keywords: [] }; // Fallback
        }

        console.log('[Gemini] Analysis:', analysis);

        // --- STEP 2: SEARCH DATABASE (Retrieval) ---
        let items = [];
        let searchPerformed = false;

        if (!analysis.isGeneralChat) {
            let query = {};

            // Logic: If user "lost" a phone, they want to see items with status 'found'
            if (analysis.intent === 'lost') query.status = 'found';
            else if (analysis.intent === 'found') query.status = 'lost';

            // If intent is ambiguous but they differ from chat keyowrds, just search everything or default to one
            // But usually 'lost' vs 'found' is key. If unknown, we might search both? 
            // Let's stick to the mapped logic.

            const conditions = [];

            // Keyword Search
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

            // Location Search
            if (analysis.location) {
                conditions.push({ location: { $regex: analysis.location, $options: 'i' } });
            }

            if (conditions.length > 0) {
                query.$and = conditions;
            }

            // Perform Search
            if (analysis.intent !== 'chat') {
                searchPerformed = true;
                items = await Item.find(query)
                    .limit(5)
                    .sort({ dateEvent: -1, createdAt: -1 })
                    .lean(); // Faster
            }
        }

        // --- STEP 3: GENERATE ANSWER (Augmented Generation) ---
        // We feed the search results (or lack thereof) back to Gemini to form a natural sentence.

        const generationPrompt = `
      You are "FoundIt AI", a helpful assistant for a university Lost & Found portal.
      
      User Query: "${userText}"
      User Intent Analysis: ${JSON.stringify(analysis)}
      
      Database Search Results (${items.length} items found):
      ${JSON.stringify(items.map(i => ({
            title: i.title,
            desc: i.description,
            loc: i.location,
            date: i.dateEvent,
            contact: i.contactMethod
        })))}

      INSTRUCTIONS:
      1. If the user asked a general question (e.g., "how are you?", "what is this app?"), answer it conversationally. You are a Lost & Found bot.
      2. If the user is looking for an item:
         - If text matches are found, summarize them naturally (e.g., "I found a few matches! There is a black wallet found in the canteen...").
         - If NO matches, apologize and suggest they file a report or check back later.
      3. Keep the tone helpful, empathetic, and concise.
      4. Do NOT output JSON. Output plain text (or markdown).
    `;

        const finalResult = await model.generateContent(generationPrompt);
        const botMessage = finalResult.response.text();

        return {
            message: botMessage,
            results: items, // Frontend might still want these to render cards
            debug: { analysis, searchPerformed }
        };

    } catch (error) {
        console.error("Gemini Service Error:", error);
        return {
            message: "I'm having trouble connecting to my brain right now. Please try again later.",
            results: [],
            error: error.message
        };
    }
};
