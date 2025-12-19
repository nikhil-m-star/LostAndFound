const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const aiService = require('./services/geminiService'); // We will mock this or use parts of it, but better to test the service file directly if possible, but it requires DB connection.
// Instead, let's just test the prompt concept via raw SDK call to see if model respects the instruction

async function run() {
  try {
    const modelName = "gemini-2.0-flash";
    console.log(`Testing Prompt with ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const userText = "What is the boiling point of water?";

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

      Do not include markdown code blocks. Return ONLY the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
run();
