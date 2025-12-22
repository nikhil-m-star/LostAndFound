const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../config/supabase');

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
            let query = supabase.from('items').select('*');

            // Logic: If user "lost" a phone, they want to see items with status 'found'
            if (analysis.intent === 'lost') query = query.eq('status', 'found');
            else if (analysis.intent === 'found') query = query.eq('status', 'lost');

            const conditions = [];

            // Keyword Search
            if (analysis.keywords && analysis.keywords.length > 0) {
                const orClauses = [];
                analysis.keywords.forEach(kw => {
                    orClauses.push(`title.ilike.%${kw}%`);
                    orClauses.push(`description.ilike.%${kw}%`);
                    orClauses.push(`category.ilike.%${kw}%`);
                });
                if (orClauses.length > 0) {
                    query = query.or(orClauses.join(','));
                }
            } else {
                // FALLBACK: If no keywords, but intent is specific (lost/found), 
                // just return recent items of that status to be helpful.
                // We don't filter by keyword, so we rely on sorting by date below.
                console.log('[Gemini] No keywords extracted, fetching recent items for intent:', analysis.intent);
            }

            // Location Search
            if (analysis.location) {
                query = query.ilike('location', `%${analysis.location}%`);
            }

            // Perform Search
            if (analysis.intent !== 'chat') {
                searchPerformed = true;

                // Add sorting and limit
                query = query.order('date_event', { ascending: false }).limit(5);

                const { data, error } = await query;

                if (error) {
                    console.error('Gemini Search Error:', error);
                } else {
                    // Map items to match what Gemini prompt expects (and what frontend might expect if returned directly)
                    items = data.map(i => ({
                        ...i,
                        dateEvent: i.date_event,
                        contactMethod: i.contact_method
                    }));
                }
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
