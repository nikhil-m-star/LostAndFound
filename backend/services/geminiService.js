const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../config/supabase');

// Initialize Gemini
const PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || "gemini-2.5-flash-lite";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";
const SECOND_FALLBACK_MODEL = process.env.GEMINI_SECOND_FALLBACK_MODEL || "gemini-2.0-flash-lite";

const MODEL_CANDIDATES = [...new Set(
    [PRIMARY_MODEL, FALLBACK_MODEL, SECOND_FALLBACK_MODEL].filter(Boolean)
)];

let cachedGeminiKey = null;
let cachedGeminiClient = null;

const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || !key.trim()) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    if (cachedGeminiClient && cachedGeminiKey === key) {
        return cachedGeminiClient;
    }

    cachedGeminiKey = key;
    cachedGeminiClient = new GoogleGenerativeAI(key);
    return cachedGeminiClient;
};

const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'to', 'for', 'of', 'on', 'in', 'at', 'by',
    'with', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'this',
    'that', 'my', 'our', 'your', 'i', 'me', 'we', 'us', 'you', 'please', 'can',
    'could', 'would', 'should', 'show', 'find', 'help', 'item', 'items', 'lost',
    'found', 'report', 'reports', 'any', 'near', 'around'
]);

const LOST_PATTERNS = [
    /\blost\b/i,
    /\bmissing\b/i,
    /\bmisplaced\b/i,
    /\bcan'?t find\b/i,
    /\bwhere (?:is|are)\b/i,
    /\bleft\b/i,
    /\bdropped\b/i
];

const FOUND_PATTERNS = [
    /\bfound\b/i,
    /\bi found\b/i,
    /\bpicked up\b/i,
    /\bdiscovered\b/i,
    /\breturned\b/i
];

const GENERAL_CHAT_PATTERNS = [
    /^\s*(hi|hello|hey)\b/i,
    /\bhow are you\b/i,
    /\bwho are you\b/i,
    /\bwhat can you do\b/i,
    /\bwhat is this app\b/i,
    /\btell me about yourself\b/i,
    /\bthank(s| you)\b/i,
    /\bgood (morning|afternoon|evening)\b/i
];

const HELP_PATTERNS = [
    /\bhow (?:do|can) i (?:report|post|submit|claim)\b/i,
    /\bwhere (?:do|can) i (?:report|post|submit|claim)\b/i,
    /\bhow does this app work\b/i,
    /\bhow to use\b/i,
    /\bwhat should i do if i (?:lost|found)\b/i
];

const SEARCH_ACTION_PATTERNS = [
    /\bfind\b/i,
    /\bsearch\b/i,
    /\blook(?:ing)? for\b/i,
    /\bshow\b/i,
    /\blist\b/i,
    /\bcheck\b/i,
    /\blocate\b/i,
    /\bmatch(?:es)?\b/i
];

const ITEM_CONTEXT_PATTERNS = [
    /\bitem(s)?\b/i,
    /\breport(s)?\b/i,
    /\bwallet\b/i,
    /\bphone\b/i,
    /\biphone\b/i,
    /\bkeys?\b/i,
    /\bbag\b/i,
    /\bbackpack\b/i,
    /\blaptop\b/i,
    /\bcharger\b/i,
    /\bwatch\b/i,
    /\bcard\b/i,
    /\bid\b/i,
    /\bpassport\b/i,
    /\bglasses\b/i,
    /\bheadphones?\b/i,
    /\bearbuds?\b/i,
    /\bumbrella\b/i,
    /\bbottle\b/i
];

const isRetryableModelError = (error) => {
    const message = (error?.message || '').toLowerCase();
    return (
        message.includes('429') ||
        message.includes('too many requests') ||
        message.includes('quota') ||
        message.includes('rate limit') ||
        message.includes('503') ||
        message.includes('service unavailable') ||
        message.includes('overloaded')
    );
};

const getModelOrder = (preferredModel) => {
    return [...new Set([preferredModel, ...MODEL_CANDIDATES].filter(Boolean))];
};

const generateContentWithFallback = async (prompt, label, preferredModel = null) => {
    let lastError;

    for (const modelName of getModelOrder(preferredModel)) {
        try {
            console.log(`[Gemini] ${label} using model: ${modelName}`);
            const model = getGeminiClient().getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return { result, modelName };
        } catch (error) {
            lastError = error;
            console.error(`[Gemini] ${label} failed on ${modelName}: ${error.message}`);
            if (!isRetryableModelError(error)) {
                throw error;
            }
        }
    }

    throw lastError || new Error("All configured Gemini models failed");
};

const extractKeywordsHeuristically = (text) => {
    const tokens = (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map(t => t.trim())
        .filter(Boolean);

    const deduped = [];
    const seen = new Set();
    for (const token of tokens) {
        if (token.length < 3 || STOPWORDS.has(token) || seen.has(token)) continue;
        seen.add(token);
        deduped.push(token);
        if (deduped.length >= 8) break;
    }

    return deduped;
};

const extractLocationHeuristically = (text) => {
    const match = (text || '').match(/\b(?:in|at|near)\s+([a-z0-9\s]{2,40})/i);
    if (!match || !match[1]) return null;
    return match[1].trim();
};

const heuristicAnalysis = (userText) => {
    const hasLostSignal = LOST_PATTERNS.some(pattern => pattern.test(userText));
    const hasFoundSignal = FOUND_PATTERNS.some(pattern => pattern.test(userText));
    const hasGeneralChatSignal = GENERAL_CHAT_PATTERNS.some(pattern => pattern.test(userText));
    const hasHelpSignal = HELP_PATTERNS.some(pattern => pattern.test(userText));
    const hasSearchActionSignal = SEARCH_ACTION_PATTERNS.some(pattern => pattern.test(userText));
    const hasItemContextSignal = ITEM_CONTEXT_PATTERNS.some(pattern => pattern.test(userText));

    const isGeneralChat =
        hasHelpSignal ||
        (hasGeneralChatSignal && !hasLostSignal && !hasFoundSignal) ||
        (!hasLostSignal && !hasFoundSignal && !hasSearchActionSignal && !hasItemContextSignal);

    let intent = 'chat';
    if (hasLostSignal && !hasFoundSignal) intent = 'lost';
    else if (hasFoundSignal && !hasLostSignal) intent = 'found';

    return {
        isGeneralChat,
        intent,
        keywords: extractKeywordsHeuristically(userText),
        location: extractLocationHeuristically(userText),
        date: null
    };
};

const normalizeAnalysis = (rawAnalysis, fallbackAnalysis) => {
    if (!rawAnalysis || typeof rawAnalysis !== 'object') return fallbackAnalysis;

    const cleanedKeywords = Array.isArray(rawAnalysis.keywords)
        ? [...new Set(rawAnalysis.keywords
            .filter(k => typeof k === 'string')
            .map(k => k.trim().toLowerCase())
            .filter(Boolean))]
        : [];

    const normalized = {
        isGeneralChat: typeof rawAnalysis.isGeneralChat === 'boolean'
            ? rawAnalysis.isGeneralChat
            : fallbackAnalysis.isGeneralChat,
        intent: ['lost', 'found', 'chat'].includes(rawAnalysis.intent)
            ? rawAnalysis.intent
            : fallbackAnalysis.intent,
        keywords: cleanedKeywords.length > 0 ? cleanedKeywords : fallbackAnalysis.keywords,
        location: typeof rawAnalysis.location === 'string' && rawAnalysis.location.trim()
            ? rawAnalysis.location.trim()
            : fallbackAnalysis.location,
        date: typeof rawAnalysis.date === 'string' && rawAnalysis.date.trim()
            ? rawAnalysis.date.trim()
            : null
    };

    // If fallback clearly recognized this as chat/help, keep it as general chat.
    if (fallbackAnalysis.isGeneralChat && normalized.intent === 'chat') {
        normalized.isGeneralChat = true;
    }

    return normalized;
};

const escapeToken = (value) => value.replace(/[,%]/g, ' ').trim();

const searchItems = async (analysis) => {
    let query = supabase
        .from('items')
        .select('*')
        .in('status', ['lost', 'found']);

    if (analysis.keywords && analysis.keywords.length > 0) {
        const orClauses = [];
        analysis.keywords.forEach(rawKeyword => {
            const keyword = escapeToken(rawKeyword);
            if (!keyword) return;
            orClauses.push(`title.ilike.%${keyword}%`);
            orClauses.push(`description.ilike.%${keyword}%`);
            orClauses.push(`category.ilike.%${keyword}%`);
        });
        if (orClauses.length > 0) {
            query = query.or(orClauses.join(','));
        }
    }

    if (analysis.location) {
        query = query.ilike('location', `%${analysis.location}%`);
    }

    query = query.order('date_event', { ascending: false }).limit(12);

    const { data, error } = await query;
    if (error) throw error;

    let mappedItems = (data || []).map(i => ({
        ...i,
        dateEvent: i.date_event,
        contactMethod: i.contact_method
    }));

    if (analysis.intent === 'lost' || analysis.intent === 'found') {
        const preferredStatus = analysis.intent === 'lost' ? 'found' : 'lost';
        mappedItems = mappedItems.sort((a, b) => {
            const aRank = a.status === preferredStatus ? 0 : 1;
            const bRank = b.status === preferredStatus ? 0 : 1;
            return aRank - bRank;
        });
    }

    return mappedItems.slice(0, 8);
};

const buildDeterministicReply = (analysis, items) => {
    if (analysis.isGeneralChat) {
        return "I can help you search both lost and found reports. Tell me what item you're looking for and where you last saw it.";
    }

    if (!items || items.length === 0) {
        return "I checked both lost and found reports but could not find a close match yet. Try adding color, location, or date details.";
    }

    const foundCount = items.filter(i => i.status === 'found').length;
    const lostCount = items.filter(i => i.status === 'lost').length;
    const preview = items
        .slice(0, 3)
        .map(i => `- ${i.title} (${i.status} at ${i.location || 'unknown location'})`)
        .join('\n');

    return `I found ${items.length} possible matches across both lost and found reports (${foundCount} found, ${lostCount} lost).\n${preview}`;
};

exports.processQuery = async (userText) => {
    try {
        const safeUserText = String(userText || '').trim();
        if (!safeUserText) {
            return {
                message: "Please type a message so I can help you search lost and found reports.",
                results: [],
                debug: { searchPerformed: false }
            };
        }

        let analysis = heuristicAnalysis(safeUserText);
        let extractionModel = null;
        let extractionUsedHeuristicOnly = true;

        // --- STEP 1: UNDERSTAND INTENT (Extraction) ---
        const extractionPrompt = `
      You are an engine for a Lost and Found system. Analyze this query: "${safeUserText}"
      
      Return a STRICT JSON object (no markdown) with:
      {
        "isGeneralChat": boolean, // true if user is just saying hi, asking general questions, or asking about the app. False if looking for items.
        "intent": "lost" | "found" | "chat", // user's wording intent only; search will include both lost and found reports
        "keywords": string[], // Important nouns/adjectives to search for (e.g. "black", "wallet", "iphone")
        "location": string | null,
        "date": string | null
      }
    `;

        try {
            const extractionResponse = await generateContentWithFallback(extractionPrompt, 'Intent extraction');
            extractionModel = extractionResponse.modelName;
            const extractionText = extractionResponse.result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(extractionText);
            analysis = normalizeAnalysis(parsed, analysis);
            extractionUsedHeuristicOnly = false;
        } catch (e) {
            console.error("Gemini extraction unavailable, using heuristic analysis:", e.message);
        }

        console.log('[Gemini] Analysis:', analysis);

        // --- STEP 2: SEARCH DATABASE (Retrieval) ---
        let items = [];
        let searchPerformed = false;

        if (!analysis.isGeneralChat) {
            searchPerformed = true;
            try {
                items = await searchItems(analysis);
            } catch (searchError) {
                console.error('Gemini Search Error:', searchError);
            }
        }

        // --- STEP 3: GENERATE ANSWER (Augmented Generation) ---
        let botMessage = buildDeterministicReply(analysis, items);
        let generationModel = null;
        let generationUsedDeterministicReply = true;

        const generationPrompt = analysis.isGeneralChat
            ? `
      You are "FoundIt AI", an assistant inside a university Lost & Found app.
      
      User Query: "${safeUserText}"

      INSTRUCTIONS:
      1. This is a general chat question. Answer it directly and helpfully.
      2. You ARE allowed to answer general-knowledge questions that are not about lost-and-found.
      3. Do not refuse only because the topic is outside lost-and-found.
      4. Keep it concise (2-6 sentences) unless the user asks for depth.
      5. Optionally add one short line that you can also help with lost/found reports.
      6. Output plain text only (no JSON).
    `
            : `
      You are "FoundIt AI", a helpful assistant for a university Lost & Found portal.
      
      User Query: "${safeUserText}"
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
      1. The user is looking for an item.
      2. Mention that the matches come from both lost and found reports.
      3. If text matches are found, summarize them naturally.
      4. If NO matches, apologize and suggest filing a report or checking back later.
      5. Keep the tone helpful, empathetic, and concise.
      6. Output plain text only (no JSON).
    `;

        try {
            const generationResponse = await generateContentWithFallback(
                generationPrompt,
                'Response generation',
                extractionModel
            );
            generationModel = generationResponse.modelName;
            botMessage = generationResponse.result.response.text();
            generationUsedDeterministicReply = false;
        } catch (e) {
            console.error("Gemini generation unavailable, using deterministic reply:", e.message);
        }

        return {
            message: botMessage,
            results: items, // Frontend might still want these to render cards
            debug: {
                analysis,
                searchPerformed,
                extractionModel,
                generationModel,
                extractionUsedHeuristicOnly,
                generationUsedDeterministicReply
            }
        };

    } catch (error) {
        console.error("Gemini Service Error:", error);
        return {
            message: "I hit an internal issue, but you can still use Search while I recover. Please try again in a moment.",
            results: [],
            error: error.message
        };
    }
};
