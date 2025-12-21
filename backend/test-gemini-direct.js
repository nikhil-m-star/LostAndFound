require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Check both
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGenAI() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking API Key...");
    if (!key) {
        console.error("❌ GEMINI_API_KEY is missing from process.env");
        return;
    }
    console.log(`✅ Key found: ${key.substring(0, 10)}...`);

    const modelName = "gemini-2.0-flash-exp";
    console.log(`Testing model: ${modelName}`);

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`✅ Response received: ${response.text()}`);
    } catch (error) {
        console.error(`❌ Error with ${modelName}:`, error.message);

        console.log("--- Retrying with gemini-1.5-flash ---");
        try {
            const fallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result2 = await fallback.generateContent("Hello, are you working?");
            console.log(`✅ Fallback (1.5-flash) worked: ${result2.response.text()}`);
        } catch (e2) {
            console.error("❌ Fallback also failed:", e2.message);
        }
    }
}

testGenAI();
